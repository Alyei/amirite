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
  iQuestionQGameData,
  iQuestionQTipData
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
   * @param questionIds - list of the questions' IDs
   * @param players - list of players that are here from the beginning
   * @param gameArguments - QuestionQ-specific game arguments
   */
  public constructor(
    public gameId: string,
    questionIds: string[],
    players?: PlayerBase[],
    gameArguments?: iQuestionQHostArguments
  ) {
    this._gamePhase = QuestionQGamePhase.Setup;

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
        const am: ArrayManager = new ArrayManager(this._questions);
        this._questions = am.ShuffleArray();
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

  /**
   * Checks whether a player is taking too much time for answering a question
   * @param player - the player
   * @param question - the questioning data
   * @param lastCorrection - Due notte iuse ciise
   */
  private CheckQuestionTime(
    player: QuestionQPlayer,
    question: iQuestionQQuestion,
    lastCorrection?: number
  ): void {
    if (player.LatestQuestion) {
      // has been questioned?
      if (
        player.state == PlayerState.Playing &&
        player.LatestQuestion[0].questionId == question.questionId
      ) {
        // is the question current?
        if (!lastCorrection) {
          if (question.timeCorrection)
            question.timeCorrection += player.Ping / 2;
          else question.timeCorrection = player.Ping;
        }
        if (!question.timeCorrection) question.timeCorrection = 0;

        const deltaTime: number =
          question.questionTime.getTime() +
          question.timeLimit +
          question.timeCorrection -
          new Date().getTime();
        if (deltaTime > 0) {
          // time left?
          try {
            this._timers[
              player.username + ":" + question.question
            ] = global.setTimeout(
              () => {
                this.CheckQuestionTime(player, question, deltaTime);
              },
              question.timeCorrection // current ping / 2
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
      this.LogInfo(
        "this should not have happened... has a question been removed? (" +
        JSON.stringify(player.GetPlayerData()) +
        "; " +
        JSON.stringify(question) +
        ")"
      );
    }
  }

  /**
   * Generates a QuestionQQuestion out of a JSON implementing the iGeneralQuestion-interface.
   * @param question - the question base's data
   * @returns - a [iQuestionQQuestion, string]-tuple combinig the questioning data with the correct answer's ID
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
    let player: QuestionQPlayer | undefined = this._players.find(
      x => x.username == username
    );
    if (!player) {
      this.LogInfo("could not find player '" + username + "'");
      return false;
    }

    this.DisqualifyPlayer(player);
    return true;
  }

  /**
   * Disqualifies a player
   * @param player - player to disqualify
   */
  private DisqualifyPlayer(player: QuestionQPlayer): void {
    player.state = PlayerState.Disqualified;
    player.StopPing();
    const th: Tryharder = new Tryharder();
    th.Tryhard(
      () => {
        return player.Inform(
          MessageType.QuestionQPlayerData,
          player.GetPlayerData()
        );
      },
      3000, // delay
      3 // tries
    );
    this.CheckForEnd();
  }

  /**
   * Adds a new user to the game, if it did not end already.
   * @param player - the player to add
   * @returns - whether the user could be added
   */
  public AddUser(player: PlayerBase): boolean {
    if (this._players && !this._players.find(x => x.username == player.username)) {
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
    }
    return false;
  }

  /**
   * Starts the game, if all conditions are met.
   * @returns - whether the game has been started
   */
  public Start(): boolean {
    if (this._gamePhase == QuestionQGamePhase.Setup && this._players && this._players.length > 0 && this._questions && this._questions.length > 0) {
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
    const explanations: {questionId: string, explanation: string}[] = [];
    for (let q of this._questions) {
      if (q.explanation)
        explanations.push({questionId: q.questionId, explanation: q.explanation});
    }
    return {
      gameId: this.gameId,
      players: this.GetPlayerData(),
      explanations: explanations
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
          this.LogInfo(
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

        // set time correction
        nextQuestion[0].timeCorrection = player.Ping / 2;

        // add question to the player's questions
        player.questions.push(nextQuestion);

        // start timer
        this._timers[
          player.username + ":" + nextQuestion[0].questionId
        ] = global.setTimeout(() => {
          this.CheckQuestionTime(player, nextQuestion[0]);
        }, nextQuestion[0].timeLimit);
      } else {
        // finished
        player.state = PlayerState.Finished;
        player.StopPing();

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
   * Processes a 'player that is giving a tip'-action.
   * @param username - the name of the user, who is giving the tip
   * @param tip - the tip that is given
   */
  public PlayerGivesTip(username: string, tip: iQuestionQTip): void {
    const player: QuestionQPlayer | undefined = this._players.find(
      x => x.username == username
    );
    if (!player) {
      this.LogInfo("could not find player '" + username + "'");
      return;
    }
    // only while running and if the player is ingame
    if (
      this._gamePhase == QuestionQGamePhase.Running &&
      player.state == PlayerState.Playing
    ) {
      const givenTip: iQuestionQTipData | undefined = player.tips.find(x => x.tip.questionId == tip.questionId);
      // only the player did not give a tip for this question before
      if (!givenTip) {
        const PlayerQuestionTuple:
          | [iQuestionQQuestion, string]
          | undefined = player.questions.find(
          x => x[0].questionId == tip.questionId
        );
        // if the player has not been asked this question
        if (!PlayerQuestionTuple) {
          // process error
          const errorMessage: iGeneralPlayerInputError = {
              message: "You were not asked this question >:c",
              data: {
                  currentQuestionId: (player.LatestQuestion || [{ questionId: "none" }])[0].questionId,
                  tip: tip
              }
          };
          this.ProcessPlayerInputError(player, errorMessage);
          return;
        }

        const duration: number =
          (new Date()).getTime() -
          PlayerQuestionTuple[0].questionTime.getTime() -
          (PlayerQuestionTuple[0].timeCorrection || 0);
        let points: number = 0;
        let feedback: iQuestionQTipFeedback = {
          questionId: tip.questionId,
          correct: false,
          duration: duration,
          timeCorrection: PlayerQuestionTuple[0].timeCorrection || 0,
          points: 0,
          score: 0,
          message: "unset",
          correctAnswer: PlayerQuestionTuple[1]
        };

        if (duration < 0) return; //!!! duration = PlayerQuestionTuple[0].timeLimit

        // if the in time
        if (duration < PlayerQuestionTuple[0].timeLimit) {
          // if correct
          if (tip.answerId == PlayerQuestionTuple[1]) {
            points = Math.floor(
              PlayerQuestionTuple[0].difficulty *
                (PlayerQuestionTuple[0].timeLimit / (1 + duration) + 100)
            ); // points = difficulty * (timeLimit / (1 + answerDuration) + 100)
            player.score += points;

            feedback.correct = true;
            feedback.message = "correct answer";
          } else {
            feedback.message = "wrong answer";
          }
        } else {
          feedback.message = "too slow";
        }
        feedback.points = points;
        feedback.score = player.score;
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
        // process error
        const errorMessage: iGeneralPlayerInputError = {
            message: "You already gave a tip for this answer of this question",
            data: {
                givenTip: givenTip,
                currentTip: tip
            }
        };
        this.ProcessPlayerInputError(player, errorMessage);
      }
    } else {
      // process error
      const errorMessage: iGeneralPlayerInputError = {
          message: "You are not allowed to give a tip",
          data: {
              playerState: player.state,
              gamePhase: this._gamePhase
          }
      };
      this.ProcessPlayerInputError(player, errorMessage);
      return;
    }
  }

  /**
   * Processes a player caused error.
   * @param player - the player who caused the error
   * @param errorMessage - error data implementing the iGeneralPlayerInputError-interface
   */
  private ProcessPlayerInputError(player: QuestionQPlayer, errorMessage: iGeneralPlayerInputError) {
      const th: Tryharder = new Tryharder();
      if (!th.Tryhard(() => {
          return player.Inform(MessageType.PlayerInputError, errorMessage);
      }, 3000, // delay
          3 // tries
      )) {
          //this.DisqualifyPlayer(player);
      }
      this.LogInfo(JSON.stringify(errorMessage));
  }

  /**
   * Logs magnificient information.
   * @param toLog - information that is to log
   */
  private LogInfo(toLog: string) {
      logger.log("info", this.gameId + " - " + toLog);
  }

  /**
   * Logs less unique information.
   * @param toLog - information that is to log
   */
  private LogSilly(toLog: string) {
      logger.log("silly", this.gameId + " - " + toLog);
  }
}
