//#region imports
import {
  MessageType,
  Gamemode,
  iGeneralHostArguments,
  iMillionaireHostArguments,
  iGeneralQuestion,
  iGeneralPlayerInputError,
  GameAction,
  iMillionaireGameData,
  iMillionaireTip,
  PlayerRole
} from "../models/GameModels";
import { logger } from "../server/logging";
import { MillionaireCore } from "./MillionaireCore";
import { iGame } from "./iGame";
import { PlayerBase } from "./PlayerBase";
import { Socket } from "net";
import {
  PlayerCouldNotBeAddedError,
  QuestionCouldNotBeAddedError
} from "../server/Errors";
import { Tryharder } from "./Tryharder";
import { RunningGames } from "./RunningGames";
//#endregion

//#region classes
/**
 * The MillionaireGame-class manages a single Millionaire-game.
 * @author Georg Schubbauer
 */
export class MillionaireGame implements iGame {
  //#region fields
  /**
   * - provides the game's data and mechanics
   */
  private gameCore: MillionaireCore;
  //#endregion

  //#region properties
  /**
   * - indicates the game's gamemode
   */
  readonly gamemode: Gamemode = Gamemode.Millionaire;
  //#endregion

  //#region constructors
  /**
   * Creates an instance of a Millionaire-Game
   * @param generalArguments - general game arguments
   * @param namespace - the namespace socket (unused)
   * @param runningGames - list of every game instance currently running
   * @param gameCoreArguments - game specific arguments for Millionaire
   */
  public constructor(
    readonly generalArguments: iGeneralHostArguments,
    public namespace: SocketIO.Namespace,
    runningGames: RunningGames,
    private gameCoreArguments?: iMillionaireHostArguments
  ) {
    this.gameCore = new MillionaireCore(
      this.generalArguments.gameId,
      runningGames,
      this.gameCoreArguments,
      this.generalArguments.questionIds
    );
  }
  //#endregion

  //#region publicFunctions
  /**
   * Processes game actions received from users
   * @param username - the user who performs the action
   * @param msgType - the type of the action
   * @param data - the action's data
   */
  public ProcessUserInput(
    username: string,
    messageType: MessageType,
    data: string
  ): void {
    let msgType: MessageType | undefined;
    try {
      msgType = +messageType;
    } catch (err) {
      let errorMessage: iGeneralPlayerInputError = {
        message: "invalid message type",
        data: { username: username, msgType: messageType }
      };
      this.ProcessUserError(username, errorMessage);
    }

    switch (msgType) {
      case MessageType.MillionaireTip: {
        try {
          this.gameCore.MillionaireGivesTip(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.MillionaireAddQuestionsRequest: {
        try {
          this.gameCore.AddQuestions(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.MillionaireChooseMillionaireResponse: {
        try {
          this.gameCore.ChooseMillionaire(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.MillionaireChooseQuestionResponse: {
        try {
          this.gameCore.ChooseQuestion(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.MillionairePassRequest: {
        try {
          this.gameCore.MillionairePasses(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.MillionaireAudienceJokerRequest: {
        try {
          this.gameCore.UseAudienceJoker(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.MillionaireAudienceJokerClue: {
        try {
          this.gameCore.GiveAudienceClue(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.MillionaireFiftyFiftyJokerRequest: {
        try {
          this.gameCore.UseFiftyFiftyJoker(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.MillionaireCallJokerRequest: {
        try {
          this.gameCore.UseCallJoker(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.MillionaireCallJokerCallRequest: {
        try {
          this.gameCore.ChooseCall(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.MillionaireCallJokerClue: {
        try {
          this.gameCore.PlayerGivesCallClue(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.ChangePlayerRolesRequest: {
          try {
              this.gameCore.ChangePlayerRoles(username, JSON.parse(data));
          } catch (err) {
              this.ProcessUserError(username, { message: err.message, data: err });
          }
          break;
      }
      default: {
        const errorMessage: iGeneralPlayerInputError = {
          message: "invalid message type",
          data: { username: username, msgType: msgType }
        };
        this.ProcessUserError(username, errorMessage);
        break;
      }
    }
  }

  /**
   * Adds a user with their corresponding socket to the game's players array
   * @param username - the user's username
   * @param socket - the user's socket. Access the id through `socket.id`
   * @returns promise with the new players-array
   */
  public AddPlayer(
    username: string,
    socket: SocketIO.Socket,
    roles: PlayerRole[]
  ): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        resolve(this.gameCore.AddUser(new PlayerBase(username, socket, roles)));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Disqualifies the player from the game
   * @param username - the username of the player to be disqualified
   * @returns - promise
   */
  public RemovePlayer(username: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        resolve(this.gameCore.DisqualifyUser(username));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Starts the game
   * @param username - the user who orders the game start
   * @returns - promise
   */
  public StartGame(username: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        const player: PlayerBase | undefined = this.gameCore.players.find(
          x => x.username == username
        );
        if (
          username == this.generalArguments.owner ||
          (player &&
            undefined !=
              [PlayerRole.Mod, PlayerRole.Host].find(x => player.roles.find(pr => pr == x) != undefined))
        ) {
          resolve(this.gameCore.Start());
        } else {
          reject(-1);
        }
      } catch (err) {
        reject(err);
      }
    });
  }
  //#endregion

  //#region privateFunction
  /**
   * Processes an user caused error
   * @param username - the user who caused the error
   * @param errorMessage - the error's error message
   */
  private ProcessUserError(
    username: string,
    errorMessage: iGeneralPlayerInputError
  ): void {
    this.LogInfo(JSON.stringify(errorMessage));
    const user: PlayerBase | undefined = this.gameCore.players.find(
      x => x.username == username
    );
    if (user) {
      const th: Tryharder = new Tryharder();
      th.Tryhard(
        () => {
          return user.Inform(MessageType.PlayerInputError, errorMessage);
        },
        3000,
        3
      );
    }
  }

  /**
   * Logs important game information
   * @param toLog - the information to log
   */
  private LogInfo(toLog: string) {
    logger.log("info", "Game: " + this.generalArguments.gameId + " - " + toLog);
  }

  /**
   * Logs silly game information
   * @param toLog - the information to log
   */
  private LogSilly(toLog: string) {
    logger.log(
      "silly",
      "Game: " + this.generalArguments.gameId + " - " + toLog
    );
  }
  //#endregion
}
//#endregion