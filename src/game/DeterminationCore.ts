//#region imports
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
  iSpectatingData,
  iDeterminationPlayerStatistic,
  iChangePlayerRolesRequest,
  iDeterminationEndGameData,
  iDeterminationStartGameData
} from "../models/GameModels";
import { PlayerBase } from "./PlayerBase";
import { DeterminationPlayer } from "./DeterminationPlayer";
import { Tryharder } from "./Tryharder";
import { platform } from "os";
import { QuestionModel, DeterminationGameDataModel } from "../models/Schemas";
import { logger } from "../server/logging";
import { RunningGames } from "./RunningGames";
//#endregion

//#region enums
/**
 * The DeterminationGamePhase-enum contains all possible states of a Determination-game.
 */
enum DeterminationGamePhase {
  Setup = 0,
  Running,
  Ended,
}
//#endregion

//#region classes
/**
 * The DeterminationCore-class combines the user input with the gamemode mechanics.
 * It runs the game and eventually saves the results to the database.
 */
export class DeterminationCore {
  //#region fields
  /**
   * - contains all users of the game
   */
  private players: DeterminationPlayer[];

  /**
   * - contains all questions of the game
   */
  private questions: iDeterminationQuestionData[];

  /**
   * - indicates the game's current state
   */
  private gamePhase: DeterminationGamePhase;

  /**
   * - contains the current timed events of the game
   */
  private timers: { [id: string]: NodeJS.Timer };

  /**
   * - represents the four option ids that answer-options can be tagged with
   */
  private readonly optionIds: string[] = "A B C D".split(" ");
  //#endregion

  //#region properties
  /**
   * - indicates the game's gamemode
   */
  readonly gamemode: Gamemode.Determination;

  /**
   * Getter for the game's players
   */
  get Players(): DeterminationPlayer[] {
    return this.players;
  }
  //#endregion

  //#region constructors
  /**
   * Creates a new instance of the DeterminationCore-class
   * @param gameId - the game's ID
   * @param questionIds - list of the questions' IDs
   * @param players - list of players that already joined
   * @param gameArguments - Determination-specific game arguments
   * @param runningGames - list of every game instance currently running
   */
  public constructor(
    public gameId: string,
    questionIds: string[],
    players: PlayerBase[],
    readonly gameArguments: iDeterminationHostArguments,
    private runningGames: RunningGames
  ) {
    this.gamePhase = DeterminationGamePhase.Setup;
    this.timers = {};
    this.players = [];

    this.LoadQuestions(questionIds);

    if (players) {
      for (let player of players) {
        this.AddUser(player);
      }
    }
  }
  //#endregion

  //#region gameMechanics
  //#region privateFunctions
  /**
   * Sends detailed data of the player to priviledged spectators (host & mods)
   * and statistics of the player to usual spectators
   * @param player - player to be spectated
   */
  private SpectatePlayer(player: DeterminationPlayer) {
    const playerStats: iDeterminationPlayerStatistic = this.GetPlayerStats(player);

    /*const privilegedSpectators: DeterminationPlayer[] = this.players.filter(p => p.roles.find(r => r == PlayerRole.Mod || r == PlayerRole.Host) != undefined);
    for (let ps of privilegedSpectators) {
      ps.Inform(MessageType.DeterminationPlayerData, player.GetPlayerData());
    }*/

    const spectators: PlayerBase[] = this.Players // no filter .filter(x => x.state == PlayerState.Spectating);
    for (let spec of spectators) {
      spec.Inform(MessageType.DeterminationPlayerStatistic, playerStats);
    }
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
            this.questions.push(this.GetDeterminationQuestion({
              questionId: question.id,
              question: question.question,
              answer: question.answer,
              otherOptions: question.otherOptions,
              timeLimit: question.timeLimit,
              difficulty: question.difficulty,
              explanation: question.explanation,
              pictureId: question.pictureId,
              categories: question.categories
            }));
          } catch (err) {
            this.LogInfo(
              "Failed to load question " + JSON.stringify(question)
              + "\r\nError:" + JSON.stringify(err)
            );
          }
        }
        this.questions = this.questions.filter(q => q);
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
   * Sends the game's data to all users of the game
   */
  private SendGameData(): void {
    const gameDataFP: iDeterminationEndGameData = {
      playerStatistics: this.GetPlayerStatistics()
    };
    const gameData: iDeterminationGameData = this.GetGameData();

    const privileged: PlayerBase[] = this.Players.filter(p => p.roles.find(r => [PlayerRole.Host, PlayerRole.Mod].find(permitted => r == permitted) != undefined) != undefined);
    const players: PlayerBase[] = this.Players;

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
      th.Tryhard(
        () => {
          return player.Inform(MessageType.DeterminationGameDataForPlayers, gameDataFP);
        },
        3000, // delay
        3 // tries
      );
    }
  }

  /**
   * Returns the statistics of every player of the game
   * @returns - an array containing the statistics of each player of the game
   */
  private GetPlayerStatistics(): iDeterminationPlayerStatistic[] {
    const result: iDeterminationPlayerStatistic[] = [];
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
  private GetPlayerStats(player: DeterminationPlayer): iDeterminationPlayerStatistic {
    return {
      username: player.username,
      score: player.score,
      roles: player.roles,
      state: player.state,
      tips: player.tipData.length,
      correctTips: player.tipData.filter(td => td.correct).length,
      totalValuedTime: this.GetSum(player.tipData.map(td => td.duration)),
      totalTimeCorrection: this.GetSum(player.tipData.map(td => td.timeCorrection))
    };
  }

  /**
   * Calculates and returns the sum of the numbers of the passed array
   * @param numberArray - array of numbers that are to sum up
   * @returns - number that equals the sum of the passed numbers
   */
  private GetSum(numberArray: number[]): number {
    let result: number = 0;
    for (let j of numberArray) {
      result += j;
    }
    return result;
  }

  /**
   * Triggers the event for when a player took too long for answering a question
   * @param player - the player that is to observe
   * @param question - the questioning data
   */
  private CheckQuestionTime(
    player: DeterminationPlayer,
    question: iDeterminationQuestionData
  ): void {
    if (this.gamePhase != DeterminationGamePhase.Running) {
      return; // game not running
    }
    if (player.state != PlayerState.Playing) {
      return; // player not playing
    }
    if (!player.LatestQuestion) {
      return; // no question asked
    }
    if (question != player.LatestQuestion) {
      return; // question not current
    }
    if (question.questionTime == undefined) {
      return; // no question time
    }
    if (player.tipData.find(tip => tip.questionId == question.question.questionId && tip.correctAnswer != undefined)) {
      return; // question answered
    }
    try {
      const correction: number = player.Ping / 2;
      this.timers[
        "questionTimeout2:" + player.username + ":" + question.question.questionId
      ] = global.setTimeout(() => {
        if (player.LatestQuestion != question) {
          return; // question not current
        }
        if (player.tipData.find(tip => tip.questionId == question.question.questionId && tip.correctAnswer != undefined)) {
          return; // question answered
        }

        this.PlayerGivesTip(
          player.username,
          {
            questionId: question.question.questionId,
            answerId: "none",
            correct: false
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
   * Questions the passed player or processes that they finished
   * @param player - the player to be questioned
   */
  private QuestionPlayer(player: DeterminationPlayer): void {
    if (this.gamePhase != DeterminationGamePhase.Running) {
      return; // game not running
    }
    if (player.state == PlayerState.Playing) {
      return; // player not playing
    }

    const nextQuestionBase:
      | iDeterminationQuestionData
      | undefined = this.questions.find(
        x => !player.questions.find(y => y.question.questionId == x.question.questionId)
      );
    // L-> find a question you cannot find in player.questions

    if (!nextQuestionBase) {
      // player finished
      player.state = PlayerState.Finished;
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
      return;
    }

    const nextQuestion: iDeterminationQuestionData = {
      question: {
        questionId: nextQuestionBase.question.questionId,
        question: nextQuestionBase.question.question,
        pictureId: nextQuestionBase.question.pictureId,
        timeLimit: nextQuestionBase.question.timeLimit,
        difficulty: nextQuestionBase.question.difficulty,
        categories: nextQuestionBase.question.categories
      },
      options: nextQuestionBase.options,
      correct: nextQuestionBase.correct,
      explanation: nextQuestionBase.explanation,
      questionTime: new Date(),
      timeCorrection: player.Ping / 2,
    };

    nextQuestion.question.firstOption = nextQuestion.options[0]; // or "A"

    // add question to the player's questions
    player.questions.push(nextQuestion);

    // send nextQuestion to player
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

    // start timer
    this.timers[
      "questionTimeout1:" + player.username + ":" + nextQuestion.question.questionId
    ] = global.setTimeout(
      () => { this.CheckQuestionTime(player, nextQuestion); },
      nextQuestion.question.timeLimit + (nextQuestion.timeCorrection || 0)
    );
  }

  /**
   * Generates and returns a new JSON containing the data that players need to begin the game
   * @returns - new JSON implementing the iQuestionQStartGameData-interface
   */
  private GetStartGameData(): iDeterminationStartGameData {
    const startGameData: iDeterminationStartGameData = {
      questionAmount: this.questions.length,
      gameArguments: this.gameArguments
    };
    return startGameData;
  }

  /**
   * Generates a DeterminationQuestion out of a JSON implementing the iGeneralQuestion-interface
   * @param question - the question base's data
   * @returns - a JSON implementing the iDeterminationQuestionData-interface
   */
  private GetDeterminationQuestion(question: iGeneralQuestion): iDeterminationQuestionData {
    if (question.otherOptions.length < 3) {
      return; // invalid count of other options (at least 3)
    }

    let am: ArrayManager = new ArrayManager(this.optionIds);
    const letters: string[] = am.ShuffleArray();
    am.collection = question.otherOptions;
    const otherOptions: string[] = am.ShuffleArray();

    let answers: iDeterminationOption[] = [];
    answers.push({
      answerId: letters[0],
      answer: question.answer
    });
    for (let i: number = 1; i < letters.length; i++) {
      answers.push({
        answerId: letters[i],
        answer: question.otherOptions[i - 1] // other options goes from 0 to 2 (letters from 0 to 3)
      });
    }
    answers.sort((a, b) => a.answerId.charCodeAt(0) - b.answerId.charCodeAt(0));

    am.collection = answers;
    return {
      question: {
        questionId: question.questionId,
        difficulty: question.difficulty,
        timeLimit: question.timeLimit * 1.2, // 20% more time
        pictureId: question.pictureId,
        question: question.question,
        categories: question.categories
      },
      options: answers,
      correct: letters[0]
    };
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

    this.SpectatePlayer(player);

    this.CheckForEnd();
  }

  /**
   * Checks whether the game-end-conditions are met and, if so, ends the game
   * This has to be executed whenever a player is disqualified and whenever a player finishes.
   */
  private CheckForEnd(): void {
    if (this.gamePhase == DeterminationGamePhase.Running) {
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
   * Processes a player caused error
   * @param player - the player who caused the error
   * @param errorMessage - error data implementing the iGeneralPlayerInputError-interface
   */
  private ProcessPlayerInputError(player: DeterminationPlayer, errorMessage: iGeneralPlayerInputError) {
    const th: Tryharder = new Tryharder();
    th.Tryhard(
      () => {
        return player.Inform(MessageType.PlayerInputError, errorMessage);
      },
      3000, // delay
      3 // tries
    );
    this.LogSilly(JSON.stringify(errorMessage));
  }

  /**
   * Logs important information
   * @param toLog - information that is to log
   */
  private LogInfo(toLog: string) {
    logger.log("info", this.gameId + " - " + toLog);
  }

  /**
   * Logs less unique information
   * @param toLog - information that is to log
   */
  private LogSilly(toLog: string) {
    logger.log("silly", this.gameId + " - " + toLog);
  }
  //#endregion

  //#region publicFunctions
  /**
   * Returns an array of the players' data
   * @returns - array of the players' data according to the iDeterminationPlayerData-interface
   */
  public GetPlayerData(): iDeterminationPlayerData[] {
    const result: iDeterminationPlayerData[] = [];
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
    let player: DeterminationPlayer | undefined = this.players.find(x => x.username == username);
    if (!player) {
      this.LogInfo("could not find player '" + username + "'");
      return false;
    }

    this.DisqualifyPlayer(player);
    return true;
  }

  /**
   * Adds a new user to the game, if it did not end already
   * @param player - the player to add
   * @returns - whether the user could be added
   */
  public AddUser(player: PlayerBase): boolean {
    if (this.gamePhase == DeterminationGamePhase.Ended) {
      return false; // game ended
    }
    if (!this.players) {
      return false; // no player array
    }
    if (this.players.find(x => x.username == player.username)) {
      return false; // player already joined
    }

    const newPlayer: DeterminationPlayer = new DeterminationPlayer(
      player.GetArguments()
    );

    newPlayer.Inform(MessageType.DeterminationStartGameData, this.GetStartGameData());

    if (this.gamePhase == DeterminationGamePhase.Setup) {
      this.players.push(newPlayer);
    }
    if (this.gamePhase == DeterminationGamePhase.Running) {
      this.players.push(newPlayer);
      this.LaunchPlayer(newPlayer);
    }

    this.LogSilly("player " + JSON.stringify(newPlayer.GetPlayerData()) + " has joined the game.");

    this.SpectatePlayer(newPlayer);

    return true;
  }

  /**
   * Starts the game, if all conditions are met and otherwise returns false
   * @returns - whether the game has been started
   */
  public Start(): boolean {
    if (
      this.gamePhase == DeterminationGamePhase.Setup
      && this.players
      && this.players.length > 0
      && this.questions
      && this.questions.length > 0
    ) {
      this.gamePhase = DeterminationGamePhase.Running;
      for (let player of this.players) {
        this.LaunchPlayer(player);
      }
      return true;
    } else return false;
  }

  /**
   * Starts the game for a player, if the conditions are met
   * @param player - player to launch
   * @returns - whether the player has been launched
   */
  private LaunchPlayer(player: DeterminationPlayer): boolean {
    if (this.gamePhase == DeterminationGamePhase.Ended) {
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
   * Ends the game, saves it to the database and removes it from the list of game-instances
   */
  public Stop(): void {
    this.gamePhase = DeterminationGamePhase.Ended;

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
   * Saves the game's data into the database
   */
  public Save(): void {
    const gameData: iDeterminationGameData = this.GetGameData();
    const gameDataModel = new DeterminationGameDataModel(gameData);
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
      this.LogSilly("The game has been saved");
    });
  }

  /**
   * Returns the game's data
   * @returns - the game's data according to the iDeterminationGameData-interface
   */
  public GetGameData(): iDeterminationGameData {
    return {
      gameId: this.gameId,
      gamemode: Gamemode.Determination,
      gameArguments: this.gameArguments,
      players: this.GetPlayerData()
    };
  }
  //#endregion
  //#endregion

  //#region userActions
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

    const player: DeterminationPlayer | undefined = this.players.find(p => p.username == changes.username);
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
      if (DeterminationGamePhase.Running == this.gamePhase)
        this.LaunchPlayer(player); // startEndPing??!
    }

    this.SpectatePlayer(player);
  }

  /**
   * Processes a 'player that is giving a tip'-action.
   * @param username - the name of the user, who is giving the tip
   * @param tip - the tip that is given
   */
  public PlayerGivesTip(username: string, tip: iDeterminationTip, timeCorrection?: number): void {
    const player: DeterminationPlayer | undefined = this.players.find(
      x => x.username == username
    );
    if (!player) {
      this.LogInfo("could not find user '" + username + "'");
      return;
    }

    // only while running and if the player is ingame
    if (
      this.gamePhase != DeterminationGamePhase.Running ||
      player.state != PlayerState.Playing
    ) {
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

    const playerQuestion: iDeterminationQuestionData | undefined = player.LatestQuestion;
    // if the player has not been asked this question
    if (!playerQuestion || !playerQuestion.questionTime) {
      // process error
      const errorMessage: iGeneralPlayerInputError = {
        message: "You were not asked this question >:c",
        data: {
          currentQuestionId: (player.LatestQuestion || { question: { questionId: "none" } }).question.questionId,
          tip: tip
        }
      };
      this.ProcessPlayerInputError(player, errorMessage);
      return;
    }

    const givenTip: iDeterminationTipFeedback | undefined = player.tipData.find(x => x.tip.questionId == tip.questionId && x.tip.answerId == tip.answerId);
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
    if (tip.answerId != "none" && !this.optionIds.find(x => x == tip.answerId)) {
      // process error
      const errorMessage: iGeneralPlayerInputError = {
        message: "Invalid answer id",
        data: {
          validIds: this.optionIds,
          currentTip: tip
        }
      };
      this.ProcessPlayerInputError(player, errorMessage);
      return;
    }

    if (timeCorrection)
      playerQuestion.timeCorrection = (playerQuestion.timeCorrection || 0) + timeCorrection;
    else
      playerQuestion.timeCorrection = (playerQuestion.timeCorrection || 0) + (player.Ping / 2);

    let duration: number =
      (new Date()).getTime() -
      playerQuestion.questionTime.getTime() -
      playerQuestion.timeCorrection;

    if (duration < 0) {
      duration = 0;
      logger.log("info", "duration < 0 (%s, %s, %s)", JSON.stringify(player), JSON.stringify(playerQuestion), JSON.stringify(tip));
    }

    let points: number = 0;
    let questionPlayer: boolean = true;
    const feedback: iDeterminationTipFeedback = {
      questionId: player.LatestQuestion.question.questionId, // undefined?
      tip: tip,
      correct: false,
      duration: duration,
      timeCorrection: 0,
      points: points,
      score: player.score,
      message: "invalid"
    };

    // if the question was not answered in time
    if (duration > playerQuestion.question.timeLimit || tip.answerId == "none") {
      feedback.message = "too slow";
    }
    // answer correct & tip correct
    else if (tip.answerId == playerQuestion.correct && tip.correct) {
      feedback.correct = true;
      feedback.message = "q:correct/t:correct";

      points = Math.floor(playerQuestion.question.difficulty * (playerQuestion.question.timeLimit / (1 + duration) + this.gameArguments.pointBase));
    }
    // answer correct & tip not correct
    else if (tip.answerId == playerQuestion.correct && !tip.correct) {
      feedback.message = "q:correct/t:wrong";
    }
    // answer not correct & tip correct
    else if (tip.correct) {
      feedback.message = "q:wrong/t:correct";
      feedback.correctAnswer = playerQuestion.options.find(x => x.answerId == playerQuestion.correct);
    }
    // answer not correct & tip not correct
    else {
      questionPlayer = false; // do not ask next question yet

      feedback.correct = true;
      feedback.message = "q:wrong/t:wrong";

      // add ping to timeCorrection /2 before /2 after point calculation & feedback actualization
      duration -= player.Ping / 2;

      if (duration < 0) { //!!!
        duration = 0;
        logger.log("info", "duration < 0 (%s, %s, %s)", JSON.stringify(player), JSON.stringify(playerQuestion), JSON.stringify(tip));
      }

      points = Math.floor(playerQuestion.question.difficulty * (playerQuestion.question.timeLimit / (1 + duration) + this.gameArguments.pointBaseWrongAnswerIdentified));

      if (!playerQuestion.timeCorrection) playerQuestion.timeCorrection = 0;
      playerQuestion.timeCorrection += feedback.duration - duration;

      feedback.duration = duration;
      feedback.timeCorrection = playerQuestion.timeCorrection;

      playerQuestion.timeCorrection += player.Ping / 2;

      // index of the next option
      const index: number = playerQuestion.options.findIndex(x => tip.answerId == x.answerId) + 1;
      if (index > 0 && index < playerQuestion.options.length) {
        feedback.nextOption = playerQuestion.options[index];
      } else {
        // process error
        const errorMessage: iGeneralPlayerInputError = {
          message: "Something went wrong with your answering options...",
          data: {
            optionIds: JSON.stringify(playerQuestion.options),
            tip: tip
          }
        };

        this.ProcessPlayerInputError(player, errorMessage);

        player.tipData.push(feedback);

        this.DisqualifyPlayer(player); // suspicious input

        return;
      }
    }

    player.score += points;

    feedback.points = points;
    feedback.score = player.score;
    
    player.tipData.push(feedback);

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

    this.SpectatePlayer(player);

    // ask next question, if not q:wrong/t:wrong
    if (questionPlayer) {
      // ask next question (delayed)
      this.timers[
        "nextQuestion;" + player.username + ";" + playerQuestion.question.questionId
      ] = global.setTimeout(
        () => { this.QuestionPlayer(player) },
        Math.max(this.gameArguments.interQuestionGap - (player.Ping / 2), 0)
      );
    }
  }
  //#endregion
}
//#endregion