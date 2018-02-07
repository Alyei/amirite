import { ArrayManager } from "./ArrayManager";
import {
  iQuestionQQuestion,
  PlayerRole,
  PlayerState,
  iQuestionQTip,
  iQuestionQTipFeedback,
  iGeneralQuestion,
  iGeneralPlayerInputError,
  MessageType,
  iQuestionQHostArguments,
  iQuestionQPlayerData,
  Gamemode,
  iQuestionQGameData
} from "../models/GameModels";
import { PlayerBase } from "./PlayerBase";
import { QuestionQPlayer } from "./QuestionQPlayer";
import { Tryharder } from "./Tryharder";
import { platform } from "os";
import { QuestionModel } from "../models/Schemas";
import { logger } from "../server/logging";

export enum QuestionQGamePhase {
  Setup = 0,
  Running,
  Ended
}

export class QuestionQCore {
  readonly Gamemode: Gamemode = Gamemode.QuestionQ;
  private _players: QuestionQPlayer[];
  private _questions: iGeneralQuestion[];
  private _gamePhase: QuestionQGamePhase;
  private _logSilly?: (game: QuestionQCore, toLog: string) => void;
  private _logInfo?: (game: QuestionQCore, toLog: string) => void;
  private _timers: { [id: string]: NodeJS.Timer } = {};

  /**
   * Getter for the game's players
   */
  get Players(): QuestionQPlayer[] {
    return this._players;
  }

  /**
   * Creates a new instance of the QuestionQCore-class
   * @param gameId - the game's id
   * @param logInfo - method to log magnificient information
   * @param logSilly - method to log silly information
   * @param questionIds - list of the questions' IDs
   * @param players - list of players that are here from the beginning
   * @param gameArguments - QuestionQ-specific game arguments
   */
  public constructor(
    public gameId: string,
    logInfo: (game: QuestionQCore, toLog: string) => void,
    logSilly: (game: QuestionQCore, toLog: string) => void,
    questionIds: string[],
    players?: PlayerBase[],
    gameArguments?: iQuestionQHostArguments
  ) {
    this._gamePhase = QuestionQGamePhase.Setup;

    this._logInfo = logInfo;
    this._logSilly = logSilly;

    this.LoadQuestions(questionIds);

    this._players = [];
    if (players) {
      for (let player of players) {
        this._players.push(new QuestionQPlayer(player.GetArguments()));
      }
    }
  }

  /**
   * Loads the questions' data from the DB.
   * @param questionIds - list of IDs of the questions that are to load from the DB
   */
  private LoadQuestions(questionIds: string[]) {
    this._questions = [];
    QuestionModel.find({ id: { $in: questionIds } })
      .then((res: any) => {
        for (let question of res) {
          this._questions.push({
            questionId: question.id,
            question: question.question,
            answer: question.answer,
            otherOptions: question.otherOptions, // check if undefined
            timeLimit: question.timeLimit,
            difficulty: question.difficulty,
            explanation: question.explanation,
            pictureId: question.pictureId
          });
        }
        logger.log(
          "silly",
          "Questions (%s) loaded in game %s.",
          JSON.stringify(this._questions),
          this.gameId
        );
      })
      .catch((err: any) => {
        logger.log("info", "Could not load questions in %s.", this.gameId);
      });
    let am: ArrayManager = new ArrayManager(this._questions);
    this._questions = am.ShuffleArray();
  }

  /**
   * Returns an array of the players' data.
   * @returns - array of the players' data according to the iQuestionQPlayerData-interface
   */
  public GetPlayerData(): iQuestionQPlayerData[] {
    const result: iQuestionQPlayerData[] = [];
    for (let player of this._players) {
      result.push(player.GetPlayerData());
    }
    return result;
  }

  /**
   * Sends the game's data to all players.
   */
  private SendGameData(): void {
    const gameData = this.GetGameData();
    const players: PlayerBase[] = this.Players;
    const th: Tryharder = new Tryharder();
    for (let player of players) {
      if (
        !th.Tryhard(
          () => {
            return player.Inform(MessageType.QuestionQGameData, gameData);
          },
          3000, // delay
          3 // tries
        )
      ) {
        // player not reachable
      }
    }
    //this.SendToRoom(MessageType.QuestionQGameData, gameData);
  }

  //!!! beim player time correction eintragen
  /**
   * Checks whether a player is taking too much time for answering a question
   * @param player - the player
   * @param question - the questioning data
   * @param lastPing - Due notte iuse ciise
   */
  private CheckQuestionTime(
    player: QuestionQPlayer,
    question: iQuestionQQuestion,
    lastPing?: number
  ): void {
    if (player.LatestQuestion) {
      // has been questioned?
      if (
        player.state == PlayerState.Playing &&
        player.LatestQuestion[0].questionId == question.questionId
      ) {
        // is the question current?

        player.GetPing();

        if (lastPing && question.timeCorrection)
          question.timeCorrection += player.Ping;
        else question.timeCorrection = player.Ping;

        if (
          question.questionTime.getTime() +
            question.timeLimit +
            (lastPing || player.Ping) >
          new Date().getTime()
        ) {
          // time left?
          try {
            this._timers[
              player.username + ":" + question.question
            ] = global.setTimeout(
              () => {
                this.CheckQuestionTime(player, question, player.Ping / 2);
              },
              player.Ping / 2 // current ping / 2
            );
          } catch (err) {
            logger.log("info", "Error: %s", err.stack);
          }
        } else {
          if (player.state == PlayerState.Playing) {
            this.PlayerGivesTip(player.username, {
              questionId: question.questionId,
              answerId: "none"
            }); // give empty tip to continue
          }
        }
      } else {
        // the question has already been answered
      }
    } else {
      if (this._logSilly)
        this._logSilly(
          this,
          "this should not have happened... (" +
            JSON.stringify(player) +
            "; " +
            JSON.stringify(question) +
            ")"
        );
    }
  }

  /**
   * Returns a [iQuestionQQuestion, string]-tuple combinig the questioning data with the correct answer's ID.
   * @param question - the question base's data
   */
  public GetQuestionQQuestion(
    question: iGeneralQuestion
  ): [iQuestionQQuestion, string] {
    let am: ArrayManager = new ArrayManager("A B C D".split(" "));
    const letters: string[] = am.ShuffleArray();
    let answers: [string, string][] = [];
    answers.push([letters[0], question.answer]);
    for (let i: number = 1; i < letters.length; i++) {
      answers.push([letters[i], question.otherOptions[i - 1]]);
    }
    answers.sort((a, b) => a[0].charCodeAt(0) - b[0].charCodeAt(0));

    return [
      {
        questionId: question.questionId,
        difficulty: question.difficulty,
        timeLimit: question.timeLimit,
        pictureId: question.pictureId,
        question: question.question,
        options: answers,
        questionTime: new Date()
      },
      letters[0]
    ];
  }

  /**
   * Disqualifies a user by their name
   * @param username - user to disqualify
   * @returns - whether the user was found
   */
  public DisqualifyUser(username: string): boolean {
    let player: iQuestionQPlayerData | undefined = this._players.find(
      x => x.username == username
    );
    if (!player) {
      if (this._logInfo)
        this._logInfo(this, "could not find player '" + username + "'");
      return false;
    }

    player.state = PlayerState.Disqualified;
    this.CheckForEnd();
    return true;
  }

  /**
   * Disqualifies a player
   * @param player - player to disqualify
   */
  public DisqualifyPlayer(player: PlayerBase): void {
    player.state = PlayerState.Disqualified;
    this.CheckForEnd();
  }

  /**
   * Adds a new user to the game when it did not end already.
   * @param player - the player to add
   * @returns - whether the user could be added
   */
  public AddUser(player: PlayerBase): boolean {
    if (this._gamePhase == QuestionQGamePhase.Setup) {
      this._players.push(new QuestionQPlayer(player.GetArguments()));
      return true;
    }
    if (this._gamePhase == QuestionQGamePhase.Running) {
      let newPlayer: QuestionQPlayer = new QuestionQPlayer(
        player.GetArguments()
      );
      this._players.push(newPlayer);
      if (newPlayer.state == PlayerState.Launch) this.QuestionPlayer(newPlayer);
      return true;
    }
    return false;
  }

  /**
   * Starts the game, if all confitions are met.
   * @returns - whether the game has been started
   */
  public Start(): boolean {
    if (this._players && this._questions) {
      this._gamePhase = QuestionQGamePhase.Running;
      for (let player of this._players) {
        if (player.state == PlayerState.Launch) {
          player.state = PlayerState.Playing;
          player.StartPing();
          this.QuestionPlayer(player);
        }
      }
      return true;
    } else return false;
  }

  /**
   * Ends the game
   */
  public Stop(): void {
    this._gamePhase = QuestionQGamePhase.Ended;

    this.SendGameData();

    //!!! save game to database
  }

  /**
   * Returns the game's data
   * @returns - the game's data according to the iQuestionQGameData-interface
   */
  public GetGameData(): iQuestionQGameData {
    return {
      gameId: this.gameId,
      players: this.GetPlayerData()
    };
  }

  /**
   * Checks whether the game end's conditions are met and, if so, ends the game.
   * This has to be executed whenever a player is disqualified and whenever a player finishes.
   */
  public CheckForEnd(): void {
    if (this._gamePhase == QuestionQGamePhase.Running) {
      // check for whether everyone finished
      let allFinished: boolean = true;
      for (let player of this._players) {
        if (
          player.state != PlayerState.Finished &&
          player.state != PlayerState.Disqualified
        )
          allFinished = false;
      }

      if (allFinished) this.Stop();
    }
  }

  /**
   * Questions the passed player or processes that they finished.
   * @param player - the player to be questioned
   */
  private QuestionPlayer(player: QuestionQPlayer): void {
    if (this._gamePhase == QuestionQGamePhase.Running) {
      // if there are questions left
      if (player.questions.length < this._questions.length) {
        // generate nextQuestion
        const nextQuestionBase:
          | iGeneralQuestion
          | undefined = this._questions.find(
          x => !player.questions.find(y => y[0].questionId == x.questionId)
        );
        // L-> find a question you cannot find in player.questions
        if (!nextQuestionBase) {
          if (this._logInfo)
            this._logInfo(
              this,
              "could not find next question in '" +
                this._questions.toString() +
                "''" +
                player.questions.toString() +
                "'"
            );
          return;
        }
        const nextQuestion: [
          iQuestionQQuestion,
          string
        ] = this.GetQuestionQQuestion(nextQuestionBase);

        // send nextQuestion to Username
        const th: Tryharder = new Tryharder();
        if (
          !th.Tryhard(
            () => {
              return player.Inform(
                MessageType.QuestionQQuestion,
                nextQuestion[0]
              );
            },
            3000, // delay
            3 // tries
          )
        ) {
          this.DisqualifyPlayer(player);
          return;
        }

        // add question to the player's questions
        player.questions.push(nextQuestion);

        // start timer
        this._timers[
          player.username + ":" + nextQuestion[0].questionId
        ] = global.setTimeout(
          () => {
            this.CheckQuestionTime(player, nextQuestion[0]);
          },
          nextQuestion[0].timeLimit // + current ping / 2
        );
      } else {
        // finished
        player.state = PlayerState.Finished;
        const th: Tryharder = new Tryharder();
        if (
          !th.Tryhard(
            () => {
              return player.Inform(
                MessageType.QuestionQPlayerData,
                player.GetPlayerData()
              );
            },
            3000, // delay
            3 // tries
          )
        ) {
        }

        this.CheckForEnd();
      }
    }
  }

  /**
   * Processes a player that is giving a tip.
   * @param username - the name of the user, who is giving the tip
   * @param tip - the tip that is given
   */
  public PlayerGivesTip(username: string, tip: iQuestionQTip): void {
    const player: QuestionQPlayer | undefined = this._players.find(
      x => x.username == username
    );
    if (!player) {
      if (this._logInfo)
        this._logInfo(this, "could not find player '" + username + "'");
      return;
    }
    // only while running and if the player is ingame
    if (
      this._gamePhase == QuestionQGamePhase.Running &&
      player.state == PlayerState.Playing
    ) {
      // only the player did not give a tip for this question before
      if (!player.tips.find(x => x.tip.questionId == tip.questionId)) {
        const PlayerQuestionTuple:
          | [iQuestionQQuestion, string]
          | undefined = player.questions.find(
          x => x[0].questionId == tip.questionId
        );
        // if the player has not been asked this question
        if (!PlayerQuestionTuple) {
          const th: Tryharder = new Tryharder();
          if (
            !th.Tryhard(
              () => {
                return player.Inform(
                  MessageType.PlayerInputError,
                  "You were not asked this question >:c"
                );
              },
              3000, // delay
              3 // tries
            )
          ) {
            //this.DisqualifyPlayer(player);
          }
          return;
        }

        const duration: number =
          new Date().getTime() - PlayerQuestionTuple[0].questionTime.getTime();
        let points: number = 0;
        let feedback: iQuestionQTipFeedback = {
          questionId: tip.questionId,
          correct: false,
          duration: 0,
          points: 0,
          score: 0,
          message: "unset"
        };
        // if the in time
        if (duration < PlayerQuestionTuple[0].timeLimit) {
          // if correct
          if (tip.answerId == PlayerQuestionTuple[1]) {
            points = Math.floor(
              PlayerQuestionTuple[0].difficulty *
                PlayerQuestionTuple[0].timeLimit /
                (1 + duration)
            );
            player.score += points;

            feedback.correct = true;
            feedback.duration = duration;
            feedback.points = points;
            feedback.score = player.score;
            feedback.message = "correct answer";
          } else {
            feedback.duration = duration;
            feedback.points = points;
            feedback.score = player.score;
            feedback.message = "wrong answer";
          }
        } else {
          feedback.duration = duration;
          feedback.points = points;
          feedback.score = player.score;
          feedback.message = "too slow";
        }
        const th: Tryharder = new Tryharder();
        if (
          !th.Tryhard(
            () => {
              return player.Inform(MessageType.QuestionQTipFeedback, feedback);
            },
            3000, // delay
            3 // tries
          )
        ) {
          //this.DisqualifyPlayer(player);
          //return;
        }

        player.tips.push({
          tip: tip,
          feedback: feedback
        });

        //add to playertipdata
        this.QuestionPlayer(player);
      } else {
        const message: iGeneralPlayerInputError = {
          message: "You already gave a tip for this question",
          data: { QuestionId: tip.questionId }
        };

        const th: Tryharder = new Tryharder();
        if (
          !th.Tryhard(
            () => {
              return player.Inform(MessageType.PlayerInputError, message);
            },
            3000, // delay
            3 // tries
          )
        ) {
          //this.DisqualifyPlayer(player);
          return;
        }
      }
    } else {
      const message: iGeneralPlayerInputError = {
        message: "You are not allowed to give a tip",
        data: { GamePhase: this._gamePhase, PlayerState: player.state }
      };
      const th: Tryharder = new Tryharder();
      if (
        !th.Tryhard(
          () => {
            return player.Inform(MessageType.PlayerInputError, message);
          },
          3000, // delay
          3 // tries
        )
      ) {
        //this.DisqualifyPlayer(player);
        return;
      }
    }
  }
}
