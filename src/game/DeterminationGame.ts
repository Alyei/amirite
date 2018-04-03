//#region imports
import {
  MessageType,
  Gamemode,
  iGeneralHostArguments,
  iDeterminationHostArguments,
  iGeneralQuestion,
  iGeneralPlayerInputError,
  GameAction,
  iDeterminationGameData,
  iDeterminationTip,
  PlayerRole
} from "../models/GameModels";
import { logger } from "../server/logging";

// game modes
import { DeterminationCore } from "./DeterminationCore";
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
 * The DeterminationGame-class manages a single Determination-game.
 * @author Georg Schubbauer
 */
export class DeterminationGame implements iGame {
  //#region fields
  /**
   * - provides the game's data and mechanics
   */
  private gameCore: DeterminationCore;
  //#endregion
  
  //#region properties
  /**
   * - indicates the game's gamemode
   */
  readonly gamemode: Gamemode = Gamemode.Determination;
  //#endregion

  //#region constructors
  /**
   * Creates an instance of a Determination-game
   * @param generalArguments - general game arguments
   * @param namespace - the namespace socket (unused)
   * @param gameCoreArguments - game specific arguments for Determination
   * @param runningGames - list of every game instance currently running
   */
  public constructor(
    readonly generalArguments: iGeneralHostArguments,
    public namespace: SocketIO.Namespace,
    private gameCoreArguments: iDeterminationHostArguments,
    runningGames: RunningGames
  ) {
    this.gameCore = new DeterminationCore(
      this.generalArguments.gameId,
      this.generalArguments.questionIds,
      [],
      this.gameCoreArguments/* || {
        pointBase: 100,
        pointBaseWrongAnswerIdentified: 33,
        interQuestionGap: 3000
      }*/,
      runningGames
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
    let msgType: number | undefined;
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
      case MessageType.DeterminationTip: {
        try {
          this.gameCore.PlayerGivesTip(username, JSON.parse(data));
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
        let errorMessage: iGeneralPlayerInputError = {
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
   * @param socket - the user's socket (access the id through `socket.id`)
   * @returns - promise
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
        const player: PlayerBase | undefined = this.gameCore.Players.find(
          x => x.username == username
        );
        if (
          username == this.generalArguments.owner ||
          (player && [PlayerRole.Mod, PlayerRole.Host].find(x => undefined != player.roles.find(r => r == x)) != undefined)
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

  //#region privateFunctionsgameCore
  /**
   * Logs magnificient game information
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
    const user: PlayerBase | undefined = this.gameCore.Players.find(
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
  //#endregion
}
//#endregion