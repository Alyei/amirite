import { ArrayManager } from "./ArrayManager";
import {
  iDeterminationQuestion,
  iDeterminationQuestionData,
  iDeterminationOption,
  PlayerRole,
  PlayerState,
  iDeterminationTip,
  iDeterminationTipFeedback,
  iGeneralQuestion,
  iGeneralPlayerInputError,
  MessageType,
  iDeterminationHostArguments,
  iDeterminationPlayerData,
  Gamemode,
  iDeterminationGameData,
  iDeterminationTipData
} from "../models/GameModels";
import { PlayerBase } from "./PlayerBase";
import { DeterminationPlayer } from "./DeterminationPlayer";
import { Tryharder } from "./Tryharder";
import { platform } from "os";
import { QuestionModel } from "../models/Schemas";
import { logger } from "../server/logging";

enum DeterminationGamePhase {
    Setup = 0,
    Running,
    Ended,
}

export class DeterminationCore {
    readonly Gamemode: Gamemode.Determination;
    private _players: DeterminationPlayer[];
    private _questions: iDeterminationQuestionData[];
    private _gamePhase: DeterminationGamePhase;
    private _timers: { [id: string]: NodeJS.Timer };

    private readonly OptionIds: string[] = "A B C D".split(" ");

    /**
     * Getter for the game's players
     */
    get Players(): DeterminationPlayer[] {
      return this._players;
    }

    /**
     * Creates a new instance of the DeterminationCore-class
     * @param gameId - the game's id
     * @param questionIds - list of the questions' IDs
     * @param players - list of players that are here from the beginning
     * @param gameArguments - Determination-specific game arguments
     */
    public constructor(
        public gameId: string,
        questionIds: string[],
        players?: PlayerBase[],
        gameArguments?: iDeterminationHostArguments
    ) {
        this._gamePhase = DeterminationGamePhase.Setup;
        this._timers = {};

        this.LoadQuestions(questionIds);

        this._players = [];
        if (players) {
          for (let player of players) {
            this._players.push(new DeterminationPlayer(player.GetArguments()));
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
            this._questions.push(this.GetDeterminationQuestion({
              questionId: question.id,
              question: question.question,
              answer: question.answer,
              otherOptions: question.otherOptions, // check if undefined
              timeLimit: question.timeLimit,
              difficulty: question.difficulty,
              explanation: question.explanation,
              pictureId: question.pictureId
            }));
          }
          let am: ArrayManager = new ArrayManager(this._questions);
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
     * @returns - array of the players' data according to the iDeterminationPlayerData-interface
     */
    public GetPlayerData(): iDeterminationPlayerData[] {
      const result: iDeterminationPlayerData[] = [];
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
      player: DeterminationPlayer,
      question: iDeterminationQuestionData,
      lastCorrection?: number
    ): void {
      // has been questioned?
      if (player.LatestQuestion) {
        // is the question current?
        if (
          player.state == PlayerState.Playing &&
          player.LatestQuestion.question.questionId == question.question.questionId &&
          question.questionTime
        ) {
          if (!lastCorrection) {
            if (question.timeCorrection)
              question.timeCorrection += player.Ping / 2;
            else question.timeCorrection = player.Ping;
          }
          if (!question.timeCorrection) question.timeCorrection = 0;
  
          const deltaTime: number =
            question.questionTime.getTime() +
            question.question.timeLimit +
            question.timeCorrection -
            new Date().getTime();
          // time left?
          if (deltaTime > 0) {
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
                questionId: question.question.questionId,
                answerId: "none",
                correct: true
              }); // give empty tip to continue
            }
          }
        } else {
          // the question has already been answered
        }
      } else {
        logger.log("info",
        "this should not have happened... (" +
            JSON.stringify(player.GetPlayerData()) +
            "; " +
            JSON.stringify(question) +
            ")"
        );
      }
    }

    /**
     * Generates a DeterminationQuestion out of a JSON implementing the iGeneralQuestion-interface
     * @param question - the question base's data
     * @returns - a JSON implementing the iDeterminationQuestionData-interface
     */
    public GetDeterminationQuestion(question: iGeneralQuestion): iDeterminationQuestionData {
        let am: ArrayManager = new ArrayManager(this.OptionIds);
        const letters: string[] = am.ShuffleArray();

        let answers: [string, string][] = [];
        answers.push([letters[0], question.answer]);
        for (let i: number = 1; i < letters.length; i++) {
            answers.push([letters[i], question.otherOptions[i - 1]]);
        }
        answers.sort((a, b) => a[0].charCodeAt(0) - b[0].charCodeAt(0));

        let optionsd: { [id: string]: string } = {};
        for (let o of answers) {
            optionsd[o[0]] = o[1];
        }

        am.collection = answers;
        return {
            question: {
                questionId: question.questionId,
                difficulty: question.difficulty,
                timeLimit: question.timeLimit, // * 1.2, // 20% more time
                pictureId: question.pictureId,
                question: question.question,
            },
            options: optionsd,
            correct: letters[0]
        };
    }

    /**
     * Disqualifies a user by their name
     * @param username - user to disqualify
     * @returns - whether the user was found
     */
    public DisqualifyUser(username: string): boolean {
        let player: DeterminationPlayer | undefined = this._players.find(x => x.username == username);
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
  private DisqualifyPlayer(player: DeterminationPlayer): void {
    player.state = PlayerState.Disqualified;
    player.StopPing();
    const th: Tryharder = new Tryharder();
    th.Tryhard(
      () => {
        return player.Inform(
          MessageType.DeterminationPlayerData,
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
          if (this._gamePhase == DeterminationGamePhase.Setup) {
            this._players.push(new DeterminationPlayer(player.GetArguments()));
            return true;
          }
          if (this._gamePhase == DeterminationGamePhase.Running) {
            let newPlayer: DeterminationPlayer = new DeterminationPlayer(
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
      if (
        this._gamePhase == DeterminationGamePhase.Setup
        && this._players
        && this._players.length > 0
        && this._questions
        && this._questions.length > 0
      ) {
        this._gamePhase = DeterminationGamePhase.Running;
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
        this._gamePhase = DeterminationGamePhase.Ended;

        this.SendGameData();
    
        //!!! save game to database
    }

    /**
     * Returns the game's data
     * @returns - the game's data according to the iDeterminationGameData-interface
     */
    public GetGameData(): iDeterminationGameData {
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
        if (this._gamePhase == DeterminationGamePhase.Running) {
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
    private QuestionPlayer(player: DeterminationPlayer): void {
        if (this._gamePhase == DeterminationGamePhase.Running) {
            // if there are questions left
            if (player.questions.length < this._questions.length) {
                // generate nextQuestion
                const nextQuestionBase:
                | iDeterminationQuestionData
                | undefined = this._questions.find(
                x => !player.questions.find(y => y.question.questionId == x.question.questionId)
                );
                // L-> find a question you cannot find in player.questions
                if (!nextQuestionBase) {
                    logger.log(
                        "info",
                        this.gameId +
                        " - could not find next question in '" +
                        this._questions.toString() +
                        "''" +
                        player.questions.toString() +
                        "'"
                    );
                    return;
                }

                const nextQuestion: iDeterminationQuestionData = {
                    question: {
                        questionId: nextQuestionBase.question.questionId,
                        question: nextQuestionBase.question.question,
                        pictureId: nextQuestionBase.question.pictureId,
                        timeLimit: nextQuestionBase.question.timeLimit,
                        difficulty: nextQuestionBase.question.difficulty,
                    },
                    options: nextQuestionBase.options,
                    correct: nextQuestionBase.correct,
                    explanation: nextQuestionBase.explanation,
                    questionTime: new Date(),
                    timeCorrection: player.Ping / 2
                };

                // send nextQuestion to Username
                const th: Tryharder = new Tryharder();
                if (
                  !th.Tryhard(
                    () => {
                      return player.Inform(
                        MessageType.DeterminationQuestion,
                        nextQuestion.question
                      );
                    },
                    3000, // delay
                    3 // tries
                  )
                ) {
                  this.DisqualifyPlayer(player);
                  return;
                }

                // send first option to the player
                if (
                  !th.Tryhard(
                    () => {
                      return player.Inform(
                        MessageType.DeterminationOption,
                        nextQuestion.options[0] // or "A"
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
            } else {
                // finished
                player.state = PlayerState.Finished;
                player.StopPing();

                const th: Tryharder = new Tryharder();
                if (
                  !th.Tryhard(
                    () => {
                      return player.Inform(
                        MessageType.DeterminationPlayerData,
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
    public PlayerGivesTip(username: string, tip: iDeterminationTip): void {
        const player: DeterminationPlayer | undefined = this._players.find(
          x => x.username == username
        );
        if (!player) {
          this.LogInfo("could not find user '" + username + "'");
          return;
        }

        // only while running and if the player is ingame
        if (
          this._gamePhase != DeterminationGamePhase.Running ||
          player.state != PlayerState.Playing
        ) {
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

        const playerQuestion: iDeterminationQuestionData | undefined = player.LatestQuestion;
        // if the player has not been asked this question
        if (!playerQuestion || !playerQuestion.questionTime) {
            // process error
            const errorMessage: iGeneralPlayerInputError = {
                message: "You were not asked this question >:c",
                data: {
                    currentQuestionId: (player.LatestQuestion || { question: { questionId: "none" }}).question.questionId,
                    tip: tip
                }
            };
            this.ProcessPlayerInputError(player, errorMessage);
            return;
        }

        const givenTip: iDeterminationTipData | undefined = player.tips.find(x => x.tip.questionId == tip.questionId && x.tip.answerId == tip.answerId);
        // if the player already gave a tip for this answer of this question
        if (givenTip) {
            // process error
            const errorMessage: iGeneralPlayerInputError = {
                message: "You already gave a tip for this answer of this question",
                data: {
                    givenTip: givenTip,
                    currentTip: tip
                }
            };
            this.ProcessPlayerInputError(player, errorMessage);
            return;
        }

        // if no valid answerId
        if (tip.answerId != "none" && !this.OptionIds.find(x => x == tip.answerId)) {
            // process error
            const errorMessage: iGeneralPlayerInputError = {
                message: "Invalid answer id",
                data: {
                    validIds: this.OptionIds,
                    currentTip: tip
                }
            };
            this.ProcessPlayerInputError(player, errorMessage);
            return;
        }

        let duration: number = 
            (new Date()).getTime() -
            playerQuestion.questionTime.getTime() -
            (playerQuestion.timeCorrection || 0);

        let points: number = 0;
        let questionPlayer: boolean = true;
        const feedback: iDeterminationTipFeedback = {
            tip: tip,
            correct: false,
            duration: duration,
            timeCorrection: 0,
            points: points,
            score: player.score,
            message: "invalid"
        };

        // if the question was not answered in time
        if (duration > playerQuestion.question.timeLimit) {
            feedback.message = "too slow";
        }
        // answer correct & tip correct
        else if (tip.answerId == playerQuestion.correct && tip.correct) {
            feedback.correct = true;
            feedback.message = "q:correct/t:correct";

            points = Math.floor(playerQuestion.question.difficulty * (playerQuestion.question.timeLimit / (1 + duration) + 100));
        }
        // answer correct & tip not correct
        else if (tip.answerId == playerQuestion.correct && !tip.correct) {
            feedback.message = "q:correct/t:wrong";
        }
        // answer not correct & tip correct
        else if (tip.correct) {
            feedback.message = "q:wrong/t:correct";
        }
        // answer not correct & tip not correct
        else {
            questionPlayer = false; // do not ask next question yet

            feedback.correct = true;
            feedback.message = "q:wrong/t:wrong";

            // add ping to timeCorrection /2 before /2 after point calculation & feedback actualization
            duration -= player.Ping / 2;
            points = Math.floor(playerQuestion.question.difficulty * (playerQuestion.question.timeLimit / (1 + duration) + 25));

            if (!playerQuestion.timeCorrection) playerQuestion.timeCorrection = 0;
            playerQuestion.timeCorrection += feedback.duration - duration;

            feedback.duration = duration;
            feedback.timeCorrection = playerQuestion.timeCorrection;

            playerQuestion.timeCorrection += player.Ping / 2;

            // index of the next option
            const index: number = this.OptionIds.findIndex(x => tip.answerId == x) + 1;
            if (index > 0 && index < this.OptionIds.length) {
                feedback.nextOption = {
                    questionId: playerQuestion.question.questionId,
                    option: [this.OptionIds[index], playerQuestion.options[this.OptionIds[index]]]
                };
            } else {
                // process error
                const errorMessage: iGeneralPlayerInputError = {
                    message: "Something went wrong with your answering options...",
                    data: {
                        optionIds: JSON.stringify(this.OptionIds),
                        tip: tip
                    }
                };

                this.ProcessPlayerInputError(player, errorMessage);
                
                player.tips.push({tip: tip});

                this.DisqualifyPlayer(player); // suspicious input

                return;
            }
        }

        player.score += points;

        feedback.points = points;
        feedback.score = player.score;

        const tipData: iDeterminationTipData = {
            feedback: feedback,
            tip: tip
        }
        player.tips.push(tipData);
        
        const th: Tryharder = new Tryharder();
        if (
            !th.Tryhard(
                () => {
                    return player.Inform(
                        MessageType.DeterminationTipFeedback,
                        feedback
                    );
                },
                3000, // delay
                3 // tries
            )
        ) {
            this.DisqualifyPlayer(player);
        }

        // ask next question, if not q:wrong/t:wrong
        if (questionPlayer) this.QuestionPlayer(player);
    }

    /**
     * Processes a player caused error.
     * @param player - the player who caused the error
     * @param errorMessage - error data implementing the iGeneralPlayerInputError-interface
     */
    private ProcessPlayerInputError(player: DeterminationPlayer, errorMessage: iGeneralPlayerInputError) {
        const th: Tryharder = new Tryharder();
        if (!th.Tryhard(() => {
            return player.Inform(MessageType.PlayerInputError, errorMessage);
        }, 3000, // delay
            3 // tries
        )) {
            //this.DisqualifyPlayer(player);
        }
        this.LogSilly(JSON.stringify(errorMessage));
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