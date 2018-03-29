//#region imports
import {
  Gamemode,
  iMillionairePlayerData,
  iGeneralQuestion,
  iMillionaireHostArguments,
  iMillionaireQuestionData,
  MessageType,
  iSpectatingData,
  PlayerState,
  iMillionaireGameData,
  iMillionairePlayerQuestionData,
  iMillionaireAnswerOption,
  PlayerRole,
  iMillionaireStartGameData,
  iMillionaireChooseMillionaireRequest,
  iMillionaireChooseMillionaireResponse,
  iMillionaireActionFeedback,
  iMillionaireChooseQuestionRequest,
  iMillionaireTip,
  iMillionaireTipFeedback,
  JokerType,
  iMillionaireFiftyFiftyJokerResponse,
  iMillionaireAudienceJokerResponse,
  iMillionaireAudienceJokerRequest,
  iMillionaireFiftyFiftyJokerRequest,
  iMillionaireAudienceJokerPlayerClue,
  iMillionaireCallJokerRequest,
  iMillionaireCallJokerResponse,
  iMillionaireCallJokerCallRequest,
  iMillionaireCallJokerClue,
  iMillionaireChooseQuestionResponse,
  iMillionairePassRequest,
  iChangePlayerRolesRequest,
  iMillionaireAddQuestionsRequest,
  iMillionaireAddQuestionsResponse
} from "../models/GameModels";
import { PlayerBase } from "./PlayerBase";
import { RunningGames } from "./RunningGames";
import { QuestionModel, MillionaireGameDataModel } from "../models/Schemas";
import { logger } from "../server/logging";
import { MillionairePlayer } from "./MillionairePlayer";
import { Tryharder } from "./Tryharder";
import { ArrayManager } from "./ArrayManager";
import { PlayerAlreadyHostsGame } from "../server/Errors";
import { timingSafeEqual } from "crypto";
import { platform } from "os";
//#endregion

//#region enums
/**
 * The MillionaireGamePhase-enum contains all possible states of a Millionaire-game.
 */
export enum MillionaireGamePhase {
  Setup = 0,
  Running
}
//#endregion

//#region classes
/**
 * The MillionaireCore-class combines the Millionaire-game's mechanics with user input.
 * It is used to run a Millionaire-game.
 */
export class MillionaireCore {
  //#region fields
  /**
   * - represents the current Millionaire
   */
  private millionaire: MillionairePlayer;

  /**
   * - contains the data of every player in the game
   */
  private playerData: iMillionairePlayerData[];

  /**
   * - contains the data of every question that has been asked this round
   */
  private questions: iMillionaireQuestionData[];

  /**
   * - indicates the current state of the game
   */
  private gamePhase: MillionaireGamePhase;
  //#endregion

  //#region properties
  /**
   * - indicates the gamemode of the game
   */
  readonly gamemode: Gamemode = Gamemode.Millionaire;

  /**
   * - contains the data of every player of the game
   */
  public players: MillionairePlayer[];
  //#endregion

  //#region constructors
  /**
   * Creates a new instance of the DuelCore-class
   * @param gameId - the game's id
   * @param runningGames - list of every game instance currently running
   * @param gameArguments - Duel-specific game arguments
   * @param questionIds - list of the questions' IDs
   */
  public constructor(
    readonly gameId: string,
    private runningGames: RunningGames,
    private gameArguments?: iMillionaireHostArguments,
    questionIds?: string[]
  ) {
    this.players = [];
    this.playerData = [];

    if (!this.gameArguments) {
      this.LoadGame(this.gameId);
    } else {
      this.gamePhase = MillionaireGamePhase.Setup;

      if (questionIds) this.LoadQuestions(questionIds);
    }

    this.Start();
  }
  //#endregion
  
  //#region gameMechanics
  //#region privateFunctions
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
              difficulty: question.difficulty,
              explanation: question.explanation,
              pictureId: question.pictureId,
              categories: question.categories,
              questionCounter: 0
            });
          } catch {
            this.LogInfo(
              "Failed to load question (" + JSON.stringify(question) + ")"
            );
          }
        }
        this.LogSilly("Questions (" + JSON.stringify(this.questions) + ")");
      })
      .catch((err: any) => {
        logger.log("info", "Could not load questions in %s.", this.gameId);
      });
  }

  /**
   * Notifies every player of the new data for a player
   * @param player - the player whose data us updated
   */
  private UpdatePlayerData(player: MillionairePlayer) {
    for(let p of this.players) {
      p.Inform(MessageType.MillionairePlayerData, p.GetPlayerData());
    }
  }

  /**
   * Loads a saved game from the database
   * @param gameId - the ID of the game that is to load
   */
  private LoadGame(gameId: string) {
    MillionaireGameDataModel.find({ id: gameId })
      .then((res: any) => {
        let game: any;
        try {
          game = res[0];
          this.gamePhase = game.gamePhase;
          this.gameArguments = game.gameArguments;
          this.questions = game.questions;
          this.playerData = game.players;
          this.ApplyPlayerData();
        } catch {
          this.LogInfo("Failed to load game (" + JSON.stringify(game) + ")");
        }
        this.LogSilly("Questions (" + JSON.stringify(this.questions) + ")");
      })
      .catch((err: any) => {
        this.LogInfo("Could not load game");
      });
  }

  /**
   * Applies every player's saved date to them
   */
  private ApplyPlayerData() {
    for (let playerData of this.playerData) {
      const player: undefined | MillionairePlayer = this.players.find(
        x => x.username == playerData.username
      );
      if (player) player.ApplyData(playerData); // also apply to new users
    }
  }

  /**
   * Sends the passed data to the player and all spectators
   * @param player - the main target for the data
   * @param msgType - defines the data's type
   * @param data - the data that is to be sent
   * @returns - whether no error happened
   */
  private InformPlayer(
    player: PlayerBase,
    msgType: MessageType,
    data: any
  ): boolean {
    const result: boolean = player.Inform(msgType, data);

    const specData: iSpectatingData = {
      targetUsername: player.username,
      msgType: msgType,
      data: data
    };

    const spectators: PlayerBase[] = this.players.filter(
      x => x.state == PlayerState.Spectating && x.username != player.username
    );
    for (let spec of spectators) {
      spec.Inform(MessageType.SpectatingData, specData);
    }

    return result;
  }

  public GetGameData(): iMillionaireGameData {
    return {
      gameId: this.gameId,
      gamemode: this.gamemode,
      gameArguments: this.gameArguments,
      players: this.GetPlayerData(this.players),
      questions: this.questions
    };
  }

  /**
   * Sends the game's data to all players
   */
  private SendGameData(): void {
    const gameData = this.GetGameData();
    const players: PlayerBase[] = this.players;
    const th: Tryharder = new Tryharder();
    for (let player of players) {
      if (
        !th.Tryhard(
          () => {
            return this.InformPlayer(
              player,
              MessageType.MillionaireGameData,
              gameData
            );
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
   * Generates MillionairePlayerQuestion-data out of a JSON implementing the iMillionaireQuestionData-interface
   * @param question - the question base's data
   * @returns - a new JSON implementing the iMillionairePlayerQuestion-interface
   */
  private GetMillionairePlayerQuestion(
    question: iMillionaireQuestionData
  ): iMillionairePlayerQuestionData {
    if (question.otherOptions.length < 3) {
      return; // invalid count of other options (at least 3)
    }

    question.questionCounter++;

    const am: ArrayManager = new ArrayManager("A B C D".split(" "));
    const letters: string[] = am.ShuffleArray();
    am.collection = question.otherOptions;
    const otherOptions: string[] = am.ShuffleArray();

    const answers: iMillionaireAnswerOption[] = [];
    answers.push({
      answerId: letters[0],
      answer: question.answer
    });
    for (let i: number = 1; i < letters.length; i++) {
      answers.push({
        answerId: letters[i],
        answer: otherOptions[i - 1]
      });
    }
    answers.sort((a, b) => a.answerId.charCodeAt(0) - b.answerId.charCodeAt(0));

    return {
      question: {
        questionId: question.questionId,
        question: question.question,
        pictureId: question.pictureId,
        options: answers,
        difficulty: question.difficulty,
        categories: question.categories
      },
      correctAnswer: letters[0],
      questionTime: new Date(),
      explanation: question.explanation
    };
  }

  /**
   * Disqualifies a player
   * @param player - player to disqualify
   */
  private DisqualifyPlayer(player: MillionairePlayer): void {
    player.state = PlayerState.Disqualified;
    // player.StopPing();

    if (player == this.millionaire) {
      this.EndOfMillionaire();
    }

    const data: iMillionairePlayerData = player.GetPlayerData();

    const th: Tryharder = new Tryharder();
    th.Tryhard(
      () => {
        return this.InformPlayer(
          player,
          MessageType.MillionairePlayerData,
          data
        );
      },
      3000, // delay
      3 // tries
    );

    this.UpdatePlayerData(player);
  }

  /**
   * Asks every moderator and the host to choose the next millionaire
   */
  private GetNextMillionaire() {
    const cmr: iMillionaireChooseMillionaireRequest = {
      players: this.GetPlayerData(
        this.players.filter(
          player =>
            player.state == PlayerState.Launch
        ) || []
      )
    };
    this.InformMods(MessageType.MillionaireChooseMillionaireRequest, cmr);
  }

  /**
   * Asks every moderator and the host to choose the next question
   */
  private GetNextQuestion() {
    const questionRange: iMillionaireChooseQuestionRequest = {
      questions: this.questions
    };
    this.InformMods(
      MessageType.MillionaireChooseQuestionRequest,
      questionRange
    );
  }

  /**
   * Sends a message to every moderator and the host
   * @param msgType - the type of the data that is to be sent
   * @param data - the data that is to be sent
   */
  private InformMods(msgType: MessageType, data: any) {
    const mods: PlayerBase[] = this.players.filter(
      player =>
        undefined ==
        [PlayerRole.Host, PlayerRole.Mod].find(
          modRole => player.roles.find(pr => pr == modRole) != undefined
        )
    );
    for (let mod of mods) {
      mod.Inform(msgType, data);
    }
  }

  /**
   * Ends the tenure of the current millionaire
   */
  private EndOfMillionaire() {
    if (!this.millionaire) {
      return; // no millionaire
    }

    for (let player of this.players.filter(
      p => p.roles.find(pr => pr == PlayerRole.Player) != undefined && p.state != PlayerState.Disqualified
    )) {
      player.state = PlayerState.Launch;
    }
    this.millionaire.scoreArchive.push({
      score: this.millionaire.score,
      date: new Date()
    });
    this.millionaire.score = 0;
    this.millionaire.checkpoint = 0;
    this.millionaire.currentQuestion = undefined;
    this.millionaire = undefined;
    this.Save();
    this.GetNextMillionaire();
  }
  //#endregion

  //#region publicFunctions
  /**
   * Saves the game's data into the database
   */
  public Save(): void {
    const gameData: iMillionaireGameData = this.GetGameData();

    gameData.players = this.playerData
      .filter(x => !gameData.players.find(y => x.username == y.username))
      .concat(gameData.players);

    const gameDataModel = new MillionaireGameDataModel(gameData);
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
   * Returns an array of the players' data
   * @returns - array of the players' data according to the iMillionairePlayerData-interface
   */
  public GetPlayerData(players: MillionairePlayer[]): iMillionairePlayerData[] {
    const result: iMillionairePlayerData[] = [];
    for (let player of players) {
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
    let player: MillionairePlayer | undefined = this.players.find(
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
    if (
      this.players &&
      !this.players.find(x => x.username == player.username)
    ) {
      const newPlayer: MillionairePlayer = new MillionairePlayer(
        player.GetArguments(),
        this.gameArguments.jokers
      );
      this.players.push(newPlayer);

      const playerData:
        | undefined
        | iMillionairePlayerData = this.playerData.find(
        x => x.username == newPlayer.username
      );
      if (playerData) newPlayer.ApplyData(playerData);

      if (player.state != PlayerState.Disqualified) {
        const startGameData: iMillionaireStartGameData = {
          gameArguments: this.gameArguments,
          players: this.GetPlayerData(this.players)
        };
        if (this.millionaire)
          startGameData.millionaire = this.millionaire.GetPlayerData();
        this.InformPlayer(
          newPlayer,
          MessageType.MillionaireGameData,
          startGameData
        );

        if (player.roles.find(r => r == PlayerRole.Player) != undefined) {
          player.state = PlayerState.Launch;
          if (this.millionaire) player.state = PlayerState.Spectating;
        }

        this.UpdatePlayerData(newPlayer);

        return true;
      }
    }
    return false; // user already exists or is disqualified
  }

  /**
   * Starts the game, if all conditions are met
   * @returns - whether the game has been started
   */
  public Start(): boolean {
    if (this.gamePhase == MillionaireGamePhase.Setup) {
      this.gamePhase = MillionaireGamePhase.Running;

      this.GetNextMillionaire();

      return true;
    }

    this.GetNextMillionaire();

    return false;
  }

  /**
   * Deinitializes the game by removing itself from the global list of game instances
   */
  public DeinitializeGame() {
    this.runningGames.Sessions.splice(
      this.runningGames.Sessions.findIndex(
        x => x.generalArguments.gameId == this.gameId
      ),
      1
    );
  }
  //#endregion
  //#endregion

  //#region userActions
  /**
   * Adds new questions to the game.
   * @param username - the name of the user who ordered the new questions
   * @param questionIds - list of IDs of the questions that are to load from the database
   */
  public AddQuestions(username: string, aqr: iMillionaireAddQuestionsRequest) {
    QuestionModel.find({ id: { $in: aqr.questionIds } })
      .then((res: any) => {
        const mod: MillionairePlayer | undefined = this.players.find(p => p.username == username);
        if (!mod) {
          return; // player not found
        }
        if (undefined == [PlayerRole.Host, PlayerRole.Mod].find(mr => mod.roles.find(r => r == mr) != undefined)) {
          return; // no permission
        }
        if (!this.questions)
          this.questions = [];
        
        const response: iMillionaireAddQuestionsResponse = {
          questionIds: []
        };
        for (let question of res) {
          try {
            if (!this.questions.find(q => q.questionId == question.id)) {
              this.questions.push({
                questionId: question.id,
                question: question.question,
                answer: question.answer,
                otherOptions: question.otherOptions,
                difficulty: question.difficulty,
                explanation: question.explanation,
                pictureId: question.pictureId,
                categories: question.categories,
                questionCounter: 0
              });
              response.questionIds.push(question.id);
            }
            else
              this.LogSilly("The question '" + question.id + "' is already in the game");
          } catch {
            this.LogInfo(
              "Failed to load question (" + JSON.stringify(question) + ")"
            );
          }
        }
        this.LogSilly("Current questions (" + JSON.stringify(this.questions) + ")");
        mod.Inform(MessageType.MillionaireAddQuestionsResponse, response);
      })
      .catch((err: any) => {
        logger.log("info", "Could not load questions in %s.", this.gameId);
      });
  }

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

    const player: MillionairePlayer | undefined = this.players.find(p => p.username == changes.username);
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
    }

    this.UpdatePlayerData(player);
  }

  /**
   * Processes a player's request to choose the next millionaire
   * @param username - the name of the player who sent the request
   * @param choice - the request containing the name of the next millionaire
   */
  public ChooseMillionaire(
    username: string,
    choice: iMillionaireChooseMillionaireResponse
  ) {
    const mod: PlayerBase = this.players.find(mod => mod.username == username);
    if (!mod) {
      return; // user not found
    }
    if (
      undefined ==
      [PlayerRole.Host, PlayerRole.Mod].find(role => mod.roles.find(mr => mr == role) != undefined)
    ) {
      return; // not permitted
    }

    this.millionaire = this.players.find(
      player => player.username == choice.username
    );
    if (
      !this.millionaire ||
      this.millionaire.roles.find(mr => mr == PlayerRole.Player) != undefined ||
      this.millionaire.state == PlayerState.Disqualified
    ) {
      this.millionaire = undefined;
      const reply: iMillionaireActionFeedback = {
        requestType: MessageType.MillionaireChooseMillionaireResponse,
        response: {
          errorMsg: "millionaire did not match the conditions",
          username: choice.username,
          playerData: this.GetPlayerData(this.players)
        }
      };
      this.InformMods(MessageType.MillionaireActionFeedback, reply);
      return;
    }

    for (let player of this.players.filter(x => x.roles.find(xr => xr == PlayerRole.Player) != undefined)) {
      player.state = PlayerState.Spectating;
    }
    this.millionaire.state = PlayerState.Playing;

    this.millionaire.score = 0;
    this.millionaire.checkpoint = 0;
    this.millionaire.jokers = [];
    for (let j of this.gameArguments.jokers) {
      this.millionaire.jokers.push(j);
    }
    this.millionaire.millionaireCounter++;

    this.UpdatePlayerData(this.millionaire);

    this.GetNextQuestion();
  }

  /**
   * Processes a player's request to choose the next question
   * @param username - the name of the player who sent the request
   * @param choice - the request containing the ID of the next question
   */
  public ChooseQuestion(
    username: string,
    choice: iMillionaireChooseQuestionResponse
  ) {
    const mod: PlayerBase = this.players.find(mod => mod.username == username);
    if (!mod) {
      return; // user not found
    }
    if (
      undefined ==
      [PlayerRole.Host, PlayerRole.Mod].find(role => mod.roles.find(mr => mr == role) != undefined)
    ) {
      return; // not permitted
    }

    if (!this.millionaire) {
      return; // no millionaire
    }

    if (
      this.millionaire.currentQuestion &&
      !this.millionaire.currentQuestion.tip
    ) {
      //return; // unanswered question remaining
    }

    const questionBase:
      | undefined
      | iMillionaireQuestionData = this.questions.find(
      q => q.questionId == choice.questionId
    );
    if (!questionBase) {
      return; // question not found
    }

    this.millionaire.currentQuestion = this.GetMillionairePlayerQuestion(
      questionBase
    );

    if (!this.millionaire.currentQuestion) {
      this.questions = this.questions.filter(q => q != questionBase); // remove invalid question
      this.GetNextQuestion();
      return; // failed to generate question
    }

    const th: Tryharder = new Tryharder();
    if (
      !th.Tryhard(
        () => {
          return this.InformPlayer(
            this.millionaire,
            MessageType.MillionaireQuestion,
            this.millionaire.currentQuestion.question
          );
        },
        3000, // delay
        3 // tries
      )
    ) {
      this.DisqualifyPlayer(this.millionaire);
      //return; // unreachable
    }
  }

  /**
   * Processes a player's request to end the millionaire's tenure
   * @param username - the name of the player who sent the request
   * @param passRequest - the request bearing no data
   */
  public MillionairePasses(
    username: string,
    passRequest: iMillionairePassRequest
  ) {
    if (!this.millionaire) {
      return; // no millionaire
    }
    if (username != this.millionaire.username) {
      return; // not the millionaire
    }
    if (this.millionaire.currentQuestion) {
      return; // question to answer
    }

    this.EndOfMillionaire();
  }

  /**
   * Processes a player's request to give the millionaire's tip
   * @param username - the player who sent the tip
   * @param tip - the tip the player gave
   */
  public MillionaireGivesTip(username: string, tip: iMillionaireTip) {
    if (!this.millionaire) {
      logger.log("silly", "No millionaire was chosen in game %s.", this.gameId);
      return; // no millionaire
    }
    if (username != this.millionaire.username) {
      logger.log(
        "silly",
        "Player %s tried to answer the question, though he is not the millionaire.",
        username
      );
      return; // not the millionaire
    }
    if (!this.millionaire.currentQuestion) {
      logger.log("silly", "There is no question in game %s.", this.gameId);
      return; // no question asked
    }
    if (
      this.millionaire.currentQuestion.question.questionId != tip.questionId
    ) {
      logger.log(
        "silly",
        "Player %s tried to answer the wrong question.",
        username
      );
      return; // wrong question
    }
    if (this.millionaire.currentQuestion.tip) {
      logger.log(
        "silly",
        "Question %s was already answered.",
        this.millionaire.currentQuestion.question
      );
      return; // already answered
    }

    this.millionaire.currentQuestion.tip = tip;

    const feedback: iMillionaireTipFeedback = {
      questionId: this.millionaire.currentQuestion.question.questionId,
      correct: false,
      points: 0,
      score: this.millionaire.score,
      checkpoint: this.millionaire.checkpoint,
      message: "invalid",
      correctAnswer: this.millionaire.currentQuestion.correctAnswer,
      explanation: this.millionaire.currentQuestion.explanation
    };

    if (tip.answerId == this.millionaire.currentQuestion.correctAnswer) {
      feedback.correct = true;
      feedback.message = "correct";
      // score formula
      feedback.points =
        (this.millionaire.score + this.gameArguments.scoreCalcA) *
        this.gameArguments.scoreCalcB;

      this.millionaire.score += feedback.points;
      feedback.score = this.millionaire.score;

      this.millionaire.checkpoint = Math.max(
        ...this.gameArguments.checkpoints.filter(
          c => c <= this.millionaire.score
        )
      );
      if (this.millionaire.checkpoint == NaN) this.millionaire.checkpoint = 0;
      feedback.checkpoint = this.millionaire.checkpoint;
    } else {
      feedback.message = "wrong";
      feedback.points = this.millionaire.checkpoint - this.millionaire.score;

      this.millionaire.score = this.millionaire.checkpoint;
      feedback.score = this.millionaire.score;
    }

    this.millionaire.currentQuestion.feedback = feedback;

    this.millionaire.questionData.push(this.millionaire.currentQuestion);

    const th: Tryharder = new Tryharder();
    if (
      !th.Tryhard(
        () => {
          return this.InformPlayer(
            this.millionaire,
            MessageType.MillionaireTipFeedback,
            feedback
          );
        },
        3000, // delay
        3 // tries
      )
    ) {
      this.DisqualifyPlayer(this.millionaire);
      return; // unreachable
    }

    let player: undefined | MillionairePlayer;
    let multiplier: number = 1; //!!!
    if (this.millionaire.currentQuestion.audienceJokerData) {
      for (let clue of this.millionaire.currentQuestion.audienceJokerData
        .playerClues) {
        if (clue.clue.answerId == tip.answerId)
          multiplier = 2; //!!!
        else multiplier = 1; //!!!

        if (
          clue.clue.answerId == this.millionaire.currentQuestion.correctAnswer
        )
          clue.karmaPoints = multiplier * 10; //!!!
        else clue.karmaPoints = multiplier * -10; //!!!

        player = this.players.find(p => p.username == clue.username);
        if (player) {
          player.karmaScore += clue.karmaPoints;
          player.Inform(MessageType.MillionaireAudienceJokerClueFeedback, clue);
        } else clue.karmaPoints = 0;
      }
    }

    this.millionaire.currentQuestion = undefined;

    if (feedback.correct) {
      this.GetNextQuestion();
    } else {
      this.EndOfMillionaire();
    }
  }

  /**
   * Processes a player's request to use the millionaire's fifty/fifty-joker
   * @param username - the name of the user who sent the request
   * @param request - the request bearing no data
   */
  public UseFiftyFiftyJoker(
    username: string,
    request: iMillionaireFiftyFiftyJokerRequest
  ) {
    if (!this.millionaire) {
      return; // no millionaire
    }
    if (username != this.millionaire.username) {
      return; // not the millionaire
    }
    if (!this.millionaire.currentQuestion) {
      return; // no question asked
    }
    if (
      this.millionaire.currentQuestion.question.questionId != request.questionId
    ) {
      return; // wrong question
    }
    if (!this.millionaire.currentQuestion.tip) {
      return; // already answered
    }

    const ji: number = this.millionaire.jokers.findIndex(
      j => j == JokerType.FiftyFifty
    );
    if (ji != -1) {
      return; // no fifty-fifty joker
    }
    this.millionaire.jokers.splice(ji, 1);

    const wrongOptions: iMillionaireAnswerOption[] = this.millionaire.currentQuestion.question.options.filter(
      o => o.answerId != this.millionaire.currentQuestion.correctAnswer
    );

    const am: ArrayManager = new ArrayManager([
      wrongOptions[Math.floor(Math.random() * wrongOptions.length)].answerId,
      this.millionaire.currentQuestion.correctAnswer
    ]);

    const reply: iMillionaireFiftyFiftyJokerResponse = {
      questionId: request.questionId,
      remainingOptions: am.ShuffleArray()
    };

    this.millionaire.currentQuestion.fiftyFiftyJokerData = {
      response: reply
    };

    const th: Tryharder = new Tryharder();
    if (
      !th.Tryhard(
        () => {
          return this.InformPlayer(
            this.millionaire,
            MessageType.MillionaireFiftyFiftyJokerResponse,
            reply
          );
        },
        3000, // delay
        3 // tries
      )
    ) {
      this.DisqualifyPlayer(this.millionaire);
      return; // unreachable
    }
  }

  /**
   * Processes a player's request to use the millionaire's audience-joker
   * @param username - the name of the user who sent the request
   * @param request - the request bearing no data
   */
  public UseAudienceJoker(
    username: string,
    request: iMillionaireAudienceJokerRequest
  ): boolean {
    if (!this.millionaire) {
      return; // no millionaire
    }
    if (username != this.millionaire.username) {
      return; // not the millionaire
    }
    if (!this.millionaire.currentQuestion) {
      return; // no question asked
    }
    if (
      this.millionaire.currentQuestion.question.questionId != request.questionId
    ) {
      return; // wrong question
    }
    if (!this.millionaire.currentQuestion.tip) {
      return; // already answered
    }

    const ji: number = this.millionaire.jokers.findIndex(
      j => j == JokerType.Audience
    );
    if (ji != -1) {
      return; // no audience joker
    }
    this.millionaire.jokers.splice(ji, 1);

    const reply: iMillionaireAudienceJokerResponse = {
      questionId: request.questionId,
      possibleResponses: this.players.filter(
        p =>
          p.roles.find(pr => pr == PlayerRole.Spectator) != undefined ||
          (p.roles.find(pr => pr == PlayerRole.Player) != undefined && p.state == PlayerState.Spectating)
      ).length
    };

    this.millionaire.currentQuestion.audienceJokerData = {
      playerClues: [],
      response: reply
    };

    const th: Tryharder = new Tryharder();
    if (
      !th.Tryhard(
        () => {
          return this.InformPlayer(
            this.millionaire,
            MessageType.MillionaireAudienceJokerResponse,
            reply
          );
        },
        3000, // delay
        3 // tries
      )
    ) {
      this.DisqualifyPlayer(this.millionaire);
      return; // unreachable
    }
  }

  /**
   * Processes a player's clue for the millionaire's audience-joker
   * @param username - the name of the user who sent the clue
   * @param clue - the clue the player gave
   */
  public GiveAudienceClue(
    username: string,
    clue: iMillionaireAudienceJokerPlayerClue
  ) {
    //!!! KARMA ins GivesTip
    if (!this.millionaire) {
      return; // no millionaire
    }
    if (!this.millionaire.currentQuestion) {
      return; // no question asked
    }
    if (
      this.millionaire.currentQuestion.question.questionId != clue.questionId
    ) {
      return; // wrong question
    }
    if (!this.millionaire.currentQuestion.audienceJokerData) {
      return; // no audience joker active
    }
    if (!this.millionaire.currentQuestion.tip) {
      return; // already answered
    }

    const player: MillionairePlayer | undefined = this.players.find(player => player.username == username);
    if (!player) {
      return; // player not found
    }
    if (
      player.roles.find(pr => pr == PlayerRole.Spectator) != undefined ||
      (player.roles.find(pr => pr == PlayerRole.Player) != undefined && player.state == PlayerState.Spectating)
    ) {
      return; // not permitted
    }

    this.millionaire.currentQuestion.audienceJokerData.playerClues.push({
      username: player.username,
      clue: clue
    });

    const th: Tryharder = new Tryharder();
    if (
      !th.Tryhard(
        () => {
          return this.InformPlayer(
            this.millionaire,
            MessageType.MillionaireAudienceJokerClue,
            clue
          );
        },
        3000, // delay
        3 // tries
      )
    ) {
      // this.DisqualifyPlayer(this.millionaire);
      return; // unreachable
    }
  }

  /**
   * Processes a player's request to use the millionaire's call-joker
   * @param username - the name of the user who sent the request
   * @param request - the request bearing no data
   */
  public UseCallJoker(username: string, request: iMillionaireCallJokerRequest) {
    if (!this.millionaire) {
      return; // no millionaire
    }
    if (username != this.millionaire.username) {
      return; // not the millionaire
    }
    if (!this.millionaire.currentQuestion) {
      return; // no question asked
    }
    if (
      this.millionaire.currentQuestion.question.questionId != request.questionId
    ) {
      return; // wrong question
    }
    if (!this.millionaire.currentQuestion.tip) {
      return; // already answered
    }

    const ji: number = this.millionaire.jokers.findIndex(
      j => j == JokerType.Call
    );
    if (ji != -1) {
      return; // no call joker
    }
    this.millionaire.jokers.splice(ji, 1);

    const reply: iMillionaireCallJokerResponse = {
      questionId: this.millionaire.currentQuestion.question.questionId,
      callOptions: this.players.filter(
        player =>
        player.roles.find(pr => pr == PlayerRole.Spectator) != undefined ||
        (player.roles.find(pr => pr == PlayerRole.Player) != undefined && player.state == PlayerState.Spectating)
      ) //!!! who can you call?
    };

    this.millionaire.currentQuestion.callJokerData = {
      callOptions: reply.callOptions.map(player => player.username) //!!! works?
    };

    const th: Tryharder = new Tryharder();
    if (
      !th.Tryhard(
        () => {
          return this.InformPlayer(
            this.millionaire,
            MessageType.MillionaireCallJokerResponse,
            reply
          );
        },
        3000, // delay
        3 // tries
      )
    ) {
      this.DisqualifyPlayer(this.millionaire);
      return; // unreachable
    }
  }

  /**
   * Processes a player's request to choose the target of the millionaire's call-joker
   * @param username - the name of the user who sent the request
   * @param request - the request containing the name of the call-joker-target
   */
  public ChooseCall(
    username: string,
    request: iMillionaireCallJokerCallRequest
  ) {
    if (!this.millionaire) {
      return; // no millionaire
    }
    if (username != this.millionaire.username) {
      return; // not the millionaire
    }
    if (!this.millionaire.currentQuestion) {
      return; // no question asked
    }
    if (
      this.millionaire.currentQuestion.question.questionId != request.questionId
    ) {
      return; // wrong question
    }
    if (!this.millionaire.currentQuestion.callJokerData) {
      return; // no call joker active
    }
    if (!this.millionaire.currentQuestion.tip) {
      return; // already answered
    }
    if (!this.millionaire.currentQuestion.callJokerData.call) {
      return; // already called
    }
    if (
      !this.millionaire.currentQuestion.callJokerData.callOptions.find(
        u => u == request.username
      )
    ) {
      return; // chosen user was no option
    }

    const calledPlayer: undefined | MillionairePlayer = this.players.find(
      p => p.username == request.username
    );
    if (!calledPlayer) {
      return; // player not found
    }

    const callRequest: iMillionaireCallJokerCallRequest = {
      questionId: request.questionId,
      username: calledPlayer.username
    };

    this.millionaire.currentQuestion.callJokerData.call = request.username;

    for (let p of this.players)
      p.Inform(MessageType.MillionaireCallJokerCallRequest, callRequest);
  }

  /**
   * Processes a player's clue for the millionaire's call-joker
   * @param username - the name of the user who sent the clue
   * @param clue - the clue the player gave
   */
  public PlayerGivesCallClue(
    username: string,
    clue: iMillionaireCallJokerClue
  ) {
    if (!this.millionaire) {
      return; // no millionaire
    }
    if (username != this.millionaire.username) {
      return; // not the millionaire
    }
    if (!this.millionaire.currentQuestion) {
      return; // no question asked
    }
    if (
      this.millionaire.currentQuestion.question.questionId != clue.questionId
    ) {
      return; // wrong question
    }
    if (!this.millionaire.currentQuestion.callJokerData) {
      return; // no call joker active
    }
    if (!this.millionaire.currentQuestion.tip) {
      return; // already answered
    }
    if (!this.millionaire.currentQuestion.callJokerData.call) {
      return; // nobody has been called
    }
    if (this.millionaire.currentQuestion.callJokerData.call != username) {
      return; // different user has been called
    }

    this.millionaire.currentQuestion.callJokerData.clue = clue;

    const th: Tryharder = new Tryharder();
    if (
      !th.Tryhard(
        () => {
          return this.InformPlayer(
            this.millionaire,
            MessageType.MillionaireCallJokerClue,
            clue
          );
        },
        3000, // delay
        3 // tries
      )
    ) {
      //this.DisqualifyPlayer(this.millionaire);
      return; // unreachable
    }
  }
  //#endregion
}
//#endregion