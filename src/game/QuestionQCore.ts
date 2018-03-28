//#region import
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
  iQuestionQTipData,
  iSpectatingData,
  iQuestionQPlayerDataAndExplanations,
  iQuestionQPlayerStatistic,
  iQuestionQSaveGameData,
  iQuestionQStartGameData,
  iChangePlayerRolesRequest
} from "../models/GameModels";
import { PlayerBase } from "./PlayerBase";
import { QuestionQPlayer } from "./QuestionQPlayer";
import { Tryharder } from "./Tryharder";
import { platform } from "os";
import {
  QuestionModel,
  QuestionQGameDataModel /* , PlayerDataModel */
} from "../models/Schemas";
import { logger } from "../server/logging";
import { RunningGames } from "./RunningGames";
//#endregion

//#region enums
/**
 * The QuestionQGamePhase-enum contains all possible states of a QuestionQ-game.
 */
export enum QuestionQGamePhase {
  Setup = 0,
  Running,
  Ended
}
//#endregion

//#region classes
/**
 * The QuestionQCore-class combines the user input with the gamemode mechanics.
 * It runs the game and eventually saves the results to the database.
 */
export class QuestionQCore {
  //#region fields
  /**
   * - contains all users of the game
   */
  private players: QuestionQPlayer[];

  /**
   * - contains all questions of the game
   */
  private questions: iGeneralQuestion[];

  /**
   * - indicates the game's current state
   */
  private gamePhase: QuestionQGamePhase;

  /**
   * - contains the current timed events of the game
   */
  private timers: { [id: string]: NodeJS.Timer } = {};
  //#endregion

  //#region properties
  /**
   * - indicates the game's gamemode
   */
  readonly gamemode: Gamemode = Gamemode.QuestionQ;

  /**
   * Getter for the game's players
   */
  get Players(): QuestionQPlayer[] {
    return this.players;
  }
  //#endregion

  //#region constructors
  /**
   * Creates a new instance of the QuestionQCore-class
   * @param gameId - the game's id
   * @param questionIds - list of the questions' IDs
   * @param players - list of players that are here from the beginning
   * @param gameArguments - QuestionQ-specific game arguments
   * @param runningGames - list of every game instance currently running
   */
  public constructor(
    public gameId: string,
    questionIds: string[],
    players: PlayerBase[],
    readonly gameArguments: iQuestionQHostArguments,
    private runningGames: RunningGames
  ) {
    this.gamePhase = QuestionQGamePhase.Setup;

    this.LoadQuestions(questionIds);

    this.players = [];
    if (players) {
      for (let player of players) {
        this.players.push(new QuestionQPlayer(player.GetArguments()));
      }
    }
  }
  //#endregion

  //#region gameMechanics
  //#region publicFunctions
  /**
   * Returns the game's data
   * @returns - the game's data according to the iQuestionQSaveGameData-interface
   */
  public GetSaveGameData(): iQuestionQSaveGameData {
    const result: iQuestionQSaveGameData = {
      gameId: this.gameId,
      gamemode: this.gamemode,
      gameArguments: this.gameArguments,
      players: this.GetPlayerData(),
      explanations: this.GetExplanations()
    };
    return result;
  }

  /**
   * Saves the game's data into the database
   */
  public Save(): void {
    const gameData: iQuestionQSaveGameData = this.GetSaveGameData();
    const gameDataModel = new QuestionQGameDataModel(gameData);
    gameDataModel.save((err: any) => {
      if (err) {
        logger.log(
          "info",
          "failed to save game (%s); error: %s",
          gameData,
          err
        );
        return;
      }
      this.LogSilly("the game has been saved");
    });
  }

  /**
   * Returns an array containing each players' data
   * @returns - array of the players' data according to the iQuestionQPlayerData-interface
   */
  public GetPlayerData(): iQuestionQPlayerData[] {
    const result: iQuestionQPlayerData[] = [];
    for (let player of this.players) {
      result.push(player.GetPlayerData());
    }
    return result;
  }

  /**
   * Disqualifies a user by their name
   * @param username - user to disqualify
   * @returns - whether the user was found
   */
  public DisqualifyUser(username: string): boolean {
    let player: QuestionQPlayer | undefined = this.players.find(
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
   * Adds a new user to the game
   * @param player - the player to add
   * @returns - whether the user could be added
   */
  public AddUser(player: PlayerBase): boolean {
    if (this.gamePhase == QuestionQGamePhase.Ended) {
      return false; // game ended
    }
    if (this.players && !this.players.find(x => x.username == player.username)) {
      const newPlayer: QuestionQPlayer = new QuestionQPlayer(
        player.GetArguments()
      );
      if (this.gamePhase == QuestionQGamePhase.Setup) {
        this.players.push(newPlayer);
      }
      if (this.gamePhase == QuestionQGamePhase.Running) {
        this.players.push(newPlayer);
        if (newPlayer.state == PlayerState.Launch) {
          newPlayer.state = PlayerState.Playing;
          newPlayer.StartPing();
          this.QuestionPlayer(newPlayer);
        }
      }
      this.LogSilly("player (" + JSON.stringify(newPlayer.GetPlayerData()) + ") has joined the game.");

      this.SpectatePlayer(newPlayer);

      return true;
    }
    return false;
  }

  /**
   * Starts the game, if all conditions are met
   * @returns - whether the game has been started
   */
  public Start(): boolean {
    if (
      this.gamePhase == QuestionQGamePhase.Setup &&
      this.players &&
      this.players.length > 0 &&
      this.questions &&
      this.questions.length > 0
    ) {
      this.gamePhase = QuestionQGamePhase.Running;
      const startGameData: iQuestionQStartGameData = this.GetStartGameData();
      for (let player of this.players) {
        player.Inform(MessageType.QuestionQStartGameData, startGameData)
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
   * Generates and returns a new JSON containing the data that players need to begin the game
   * @returns - new JSON implementing the iQuestionQStartGameData-interface
   */
  public GetStartGameData(): iQuestionQStartGameData {
    const startGameData: iQuestionQStartGameData = {
      questionAmount: this.questions.length,
      gameArguments: this.gameArguments
    };
    return startGameData;
  }

  /**
   * Ends the game
   */
  public Stop(): void {
    this.gamePhase = QuestionQGamePhase.Ended;

    this.SendGameData();

    this.Save();

    this.runningGames.Sessions.splice(
      this.runningGames.Sessions.findIndex(
        x => x.generalArguments.gameId == this.gameId
      ),
      1
    );
  }

  /**
   * Returns the game's data
   * @returns - the game's data according to the iQuestionQGameData-interface
   */
  public GetGameData(): iQuestionQGameData {
    return {
      gameId: this.gameId,
      gamemode: Gamemode.QuestionQ,
      gameArguments: this.gameArguments,
      playerStatistics: this.GetPlayerStatistics(),
    };
  }
  //#endregion

  //#region privateFunctions
  /**
   * Sends detailed data of the player to priviledged spectators (host & mods)
   * and statistics of the player to usual spectators
   * @param player - player to be spectated
   */
  private SpectatePlayer(player: QuestionQPlayer) {
    const playerStats: iQuestionQPlayerStatistic = this.GetPlayerStats(player);

    const privilegedSpectators: QuestionQPlayer[] = this.players.filter(p => p.roles.find(r => r == PlayerRole.Mod || r == PlayerRole.Host) != undefined);
    for (let ps of privilegedSpectators) {
      ps.Inform(MessageType.DeterminationPlayerData, player.GetPlayerData());
    }

    const spectators: PlayerBase[] = this.Players // no filter .filter(x => x.state == PlayerState.Spectating);
    for (let spec of spectators) {
      spec.Inform(MessageType.DeterminationPlayerStatistic, playerStats);
    }
  }

  /**
   * Returns the statistics of every player of the game
   * @returns - an array containing the statistics of each player of the game
   */
  private GetPlayerStatistics(): iQuestionQPlayerStatistic[] {
    const result: iQuestionQPlayerStatistic[] = [];
    for (let player of this.players) {
      result.push(this.GetPlayerStats(player));
    }
    return result;
  }

  /**
   * Returns the players statistics
   * @param player - the player who's statistics are to return
   * @returns - the player's statistics
   */
  private GetPlayerStats(player: QuestionQPlayer): iQuestionQPlayerStatistic {
    return {
      username: player.username,
      score: player.score,
      roles: player.roles,
      state: player.state,
      questionIds: player.questions.map(qd => qd[0].questionId),
      correctAnswers: player.tips.filter(td => td.feedback.correct).length,
      totalValuedTime: this.GetSum(player.tips.map(td => td.feedback.duration)),
      totalTimeCorrection: this.GetSum(player.tips.map(td => td.feedback.timeCorrection))
    };
  }

  /**
   * Starts the game for a player, if the conditions are met
   * @param player - player to launch
   * @returns - whether the player has been launched
   */
  private LaunchPlayer(player: QuestionQPlayer): boolean {
    if (this.gamePhase == QuestionQGamePhase.Ended) {
      return false; // game ended
    }
    if (player.state != PlayerState.Launch) {
      return false; // player not launchable
    }

    player.state = PlayerState.Playing;
    player.StartPing();
    this.QuestionPlayer(player);

    return true;
  }

  /**
   * Loads the questions' data from the database
   * @param questionIds - list of IDs of the questions that are to load from the database
   */
  private LoadQuestions(questionIds: string[]) {
    this.questions = [];
    QuestionModel.find({ id: { $in: questionIds } })
      .then((res: any) => {
        for (let question of res) {
          try {
            this.questions.push({
              questionId: question.id,
              question: question.question,
              answer: question.answer,
              otherOptions: question.otherOptions,
              timeLimit: question.timeLimit,
              difficulty: question.difficulty,
              explanation: question.explanation,
              pictureId: question.pictureId
            });
          } catch (err) {
            this.LogInfo(
              "Failed to load question " + JSON.stringify(question)
              + "\r\nError:" + JSON.stringify(err)
            );
          }
        }
        let am: ArrayManager = new ArrayManager(this.questions);
        this.questions = am.ShuffleArray();
        this.LogSilly(
          "Questions (" + JSON.stringify(this.questions) + ") loaded in game " + this.gameId
        );
      })
      .catch((err: any) => {
        this.LogInfo(
          "Could not load questions in game " + this.gameId
          + "\r\nError:" + JSON.stringify(err)
        );
      });
  }

  /**
   * Sends the game's data to all players
   */
  private SendGameData(): void {
    const gameDataFP = this.GetPlayerStatistics();
    const gameData = this.GetGameData();

    const privileged: PlayerBase[] = this.Players.filter(p => p.roles.find(r => [PlayerRole.Host, PlayerRole.Mod].find(permitted => r == permitted) != undefined) != undefined);
    const players: PlayerBase[] = this.Players.filter(p => privileged.find(priv => priv.username == p.username) == undefined);

    const th: Tryharder = new Tryharder();
    for (let priv of privileged) {
      th.Tryhard(
        () => {
          return priv.Inform(MessageType.DeterminationGameDataForHost, gameData);
        },
        3000,
        3
      );
    }
    for (let player of players) {
      if (
        !th.Tryhard(
          () => {
            return player.Inform(MessageType.DeterminationGameDataForPlayers, gameDataFP);
          },
          3000, // delay
          3 // tries
        )
      ) {
        // player not reachable
      }
    }
  }

  /**
   * Triggers the event for when a player took too long for answering a question
   * @param player - the player that is to observe
   * @param question - the questioning data
   */
  private CheckQuestionTime(
    player: QuestionQPlayer,
    question: iQuestionQQuestion
  ): void {
    if (this.gamePhase != QuestionQGamePhase.Running) {
      return; // game not running
    }
    if (player.state != PlayerState.Playing) {
      return; // player not playing
    }
    if (!player.LatestQuestion) {
      return; // no question asked
    }
    if (question != player.LatestQuestion[0]) {
      return; // question not current
    }
    if (question.questionTime == undefined) {
      return; // no question time
    }
    if (player.tips.find(tip => tip.feedback.questionId == question.questionId)) {
      return; // question answered
    }
    try {
      const correction: number = player.Ping / 2;
      this.timers[
        "questionTimeout2:" + player.username + ":" + question.questionId
      ] = global.setTimeout(() => {
        if (player.LatestQuestion[0] != question) {
          return; // question not current
        }
        if (player.tips.find(tip => tip.feedback.questionId == question.questionId && tip.feedback.correctAnswer != undefined)) {
          return; // question answered
        }

        this.PlayerGivesTip(
          player.username,
          {
            questionId: question.questionId,
            answerId: "none"
          },
          correction
        );
      },
        correction
      );
    } catch (err) {
      this.LogInfo(JSON.stringify(err));
    }
  }

  /**
   * Generates a QuestionQQuestion out of a JSON implementing the iGeneralQuestion-interface
   * @param question - the question base's data
   * @returns - a [iQuestionQQuestion, string]-tuple combinig the questioning data with the correct answer's ID
   */
  private GetQuestionQQuestion(
    question: iGeneralQuestion
  ): [iQuestionQQuestion, string] | undefined {
    if (question.otherOptions.length < 3) {
      return; // invalid count of other options (at least 3)
    }

    let am: ArrayManager = new ArrayManager("A B C D".split(" "));
    const letters: string[] = am.ShuffleArray();
    am.collection = question.otherOptions;
    const otherOptions: string[] = am.ShuffleArray();

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
   * Disqualifies a player
   * @param player - player to disqualify
   */
  private DisqualifyPlayer(player: QuestionQPlayer): void {
    player.state = PlayerState.Disqualified;
    player.StopPing();

    const data: iQuestionQPlayerDataAndExplanations = {
      player: player.GetPlayerData(),
      explanations: this.GetExplanations()
    }
    const th: Tryharder = new Tryharder();
    th.Tryhard(
      () => {
        return player.Inform(
          MessageType.QuestionQPlayerDataAndExplanations,
          data
        );
      },
      3000, // delay
      3 // tries
    );

    this.SpectatePlayer(player);

    this.CheckForEnd();
  }

  /**
   * Calculates and returns the sum of the numbers of the passed array
   * @param numberArray - array of numbers that are to sum up
   * @returns - number that equals the sum of the passed numbers
   */
  private GetSum(numberArray: number[]): number {
    let result: number = 0;
    for (let j of numberArray)
    {
      result += j;
    }
    return result;
  }

  /**
   * Returns an array of tuples that combine a question-ID with an explanation each
   * @returns - an array of tuples that combine a question-ID with an explanation each
   */
  private GetExplanations() {
    const explanations: {
      questionId: string;
      explanation: string;
    }[] = [];
    for (let q of this.questions) {
      if (q.explanation)
        explanations.push({
          questionId: q.questionId,
          explanation: q.explanation
        });
    }
    return explanations;
  }

  /**
   * Checks whether the game end's conditions are met and, if so, ends the game
   * (has to be executed whenever a player is disqualified and whenever a player finishes)
   */
  private CheckForEnd(): void {
    if (this.gamePhase == QuestionQGamePhase.Running) {
      // check for whether everyone finished
      let allFinished: boolean = true;
      for (let player of this.players) {
        if (
          player.state != PlayerState.Finished &&
          player.state != PlayerState.Disqualified &&
          player.state != PlayerState.Spectating
        )
          allFinished = false;
      }

      if (allFinished) this.Stop();
    }
  }

  /**
   * Questions the passed player or processes that they finished
   * @param player - the player to be questioned
   */
  private QuestionPlayer(player: QuestionQPlayer): void {
    if (this.gamePhase == QuestionQGamePhase.Running) {
      // if there are questions left
      if (player.questions.length < this.questions.length) {
        // generate nextQuestion
        const nextQuestionBase:
          | iGeneralQuestion
          | undefined = this.questions.find(
          x => !player.questions.find(y => y[0].questionId == x.questionId)
        );
        // L-> find a question you cannot find in player.questions
        if (!nextQuestionBase) {
          this.LogInfo(
            "could not find next question in '" +
              this.questions.toString() +
              "''" +
              player.questions.toString() +
              "'"
          );
          return;
        }
        const nextQuestion: [
          iQuestionQQuestion,
          string
        ] | undefined = this.GetQuestionQQuestion(nextQuestionBase);

        if (nextQuestion) {
          this.questions = this.questions.filter(q => q != nextQuestionBase);
          this.QuestionPlayer(player);
          return; // error when generating question
        }

        // set time correction
        nextQuestion[0].timeCorrection = player.Ping / 2;

        // start timer
        this.timers[
          "questionTimeout;" +
            player.username +
            ";" +
            nextQuestion[0].questionId
        ] = global.setTimeout(() => {
          this.CheckQuestionTime(player, nextQuestion[0]);
        }, nextQuestion[0].timeLimit + (nextQuestion[0].timeCorrection || 0));

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
      } else {
        // finished
        player.state = PlayerState.Finished;
        player.StopPing();

        const data: iQuestionQPlayerDataAndExplanations = {
          player: player.GetPlayerData(),
          explanations: this.GetExplanations()
        }
        const th: Tryharder = new Tryharder();
        th.Tryhard(
          () => {
            return player.Inform(
              MessageType.QuestionQPlayerDataAndExplanations,
              data
            );
          },
          3000, // delay
          3 // tries
        );

        this.CheckForEnd();
      }
    }
  }

  /**
   * Processes a player caused error
   * @param player - the player who caused the error
   * @param errorMessage - error data implementing the iGeneralPlayerInputError-interface
   */
  private ProcessPlayerInputError(
    player: QuestionQPlayer,
    errorMessage: iGeneralPlayerInputError
  ) {
    const th: Tryharder = new Tryharder();
    if (
      !th.Tryhard(
        () => {
          return player.Inform(
            MessageType.PlayerInputError,
            errorMessage
          );
        },
        3000, // delay
        3 // tries
      )
    ) {
      //this.DisqualifyPlayer(player);
    }
    this.LogInfo(JSON.stringify(errorMessage));
  }

  /**
   * Logs important information
   * @param toLog - information that is to log
   */
  private LogInfo(toLog: string) {
    logger.log("info", "Game: " + this.gameId + " - " + toLog);
  }

  /**
   * Logs less unique information
   * @param toLog - information that is to log
   */
  private LogSilly(toLog: string) {
    logger.log("silly", "Game: " + this.gameId + " - " + toLog);
  }
  //#endregion
  //#endregion

  //#region playerActions
  /**
   * Changes a user's roles if the conditions are met
   * @param username - username of the responsible player
   * @param changes - role-modifications
   */
  public ChangePlayerRoles(username: string, changes: iChangePlayerRolesRequest) {
    const host: PlayerBase | undefined = this.players.find(p => p.username == username);
    if (!host) {
      return; // player not found
    }
    if (host.roles.find(r => r == PlayerRole.Host) == undefined) {
      return; // not the host
    }

    const player: QuestionQPlayer | undefined = this.players.find(p => p.username == changes.username);
    if (!player) {
      return; // player not found
    }
    if (changes.toAdd) {
      for (let role of changes.toAdd) {
        if (player.roles.find(r => r == role) == undefined)
          player.roles.push(role);
      }
    }
    if (changes.toRemove) {
      player.roles = player.roles.filter(r => changes.toRemove.find(rem => rem == r) == undefined || r == PlayerRole.Host);
    }

    player.state = PlayerState.Disqualified;

    if (player.roles.find(r => [PlayerRole.Spectator, PlayerRole.Host, PlayerRole.Mod].find(pr => pr == r) != undefined) != undefined) {
      player.state = PlayerState.Spectating;
    }
    if (player.roles.find(r => r == PlayerRole.Player) != undefined) {
      player.state = PlayerState.Launch;
      if (QuestionQGamePhase.Running == this.gamePhase)
        this.LaunchPlayer(player);
    }

    this.SpectatePlayer(player);
  }

  /**
   * Processes a player's tip
   * @param username - the name of the user, who is giving the tip
   * @param tip - the tip that is given
   */
  public PlayerGivesTip(username: string, tip: iQuestionQTip, correction?: number): void {
    const player: QuestionQPlayer | undefined = this.players.find(
      x => x.username == username
    );
    if (!player) {
      this.LogInfo("could not find player '" + username + "'");
      return;
    }
    // only while running and if the player is ingame
    if (
      this.gamePhase == QuestionQGamePhase.Running &&
      player.state == PlayerState.Playing
    ) {
      const givenTip: iQuestionQTipData | undefined = player.tips.find(
        x => x.tip.questionId == tip.questionId
      );
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
              currentQuestionId: (player.LatestQuestion || [
                { questionId: "none" }
              ])[0].questionId,
              tip: tip
            }
          };
          this.ProcessPlayerInputError(player, errorMessage);
          return;
        }

        if (correction)
          PlayerQuestionTuple[0].timeCorrection = (PlayerQuestionTuple[0].timeCorrection || 0) + correction;
        else
          PlayerQuestionTuple[0].timeCorrection = (PlayerQuestionTuple[0].timeCorrection || 0) + (player.Ping / 2);

        let duration: number =
          new Date().getTime() -
          PlayerQuestionTuple[0].questionTime.getTime() -
          PlayerQuestionTuple[0].timeCorrection;
        
        if (duration < 0) {
          duration = 0;
          logger.log("info", "duration < 0 (%s, %s, %s)", JSON.stringify(player), JSON.stringify(PlayerQuestionTuple), JSON.stringify(tip));
        }
        
        let points: number = 0;
        const feedback: iQuestionQTipFeedback = {
          questionId: tip.questionId,
          correct: false,
          duration: duration,
          timeCorrection: PlayerQuestionTuple[0].timeCorrection || 0,
          points: 0,
          score: 0,
          message: "unset",
          correctAnswer: PlayerQuestionTuple[1]
        };

        // if the in time
        if (duration < PlayerQuestionTuple[0].timeLimit && tip.answerId != "none") {
          // if correct
          if (tip.answerId == PlayerQuestionTuple[1]) {
            points = Math.floor(
              PlayerQuestionTuple[0].difficulty *
                (PlayerQuestionTuple[0].timeLimit / (1 + duration) +
                  this.gameArguments.pointBase)
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

        //add to playertipdata
        player.tips.push({
          tip: tip,
          feedback: feedback
        });
        
        const th: Tryharder = new Tryharder();
        if (
          !th.Tryhard(
            () => {
              return player.Inform(
                MessageType.QuestionQTipFeedback,
                feedback
              );
            },
            3000, // delay
            3 // tries
          )
        ) {
          //this.DisqualifyPlayer(player);
          //return;
        }

        this.SpectatePlayer(player);

        // ask next question (delayed)
        this.timers[
          "nextQuestion;" +
            player.username +
            ";" +
            PlayerQuestionTuple[0].questionId
        ] = global.setTimeout(() => {
          this.QuestionPlayer(player);
        }, Math.max(this.gameArguments.interQuestionGap - player.Ping / 2, 0));
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
          gamePhase: this.gamePhase
        }
      };
      this.ProcessPlayerInputError(player, errorMessage);
      return;
    }
  }
  //#endregion
}
//#endregion