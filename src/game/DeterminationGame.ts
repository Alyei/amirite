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

export class DeterminationGame implements iGame {
  private GameCore: DeterminationCore;

  /**
   * Creates an instance of a Determination-Game.
   * @param GeneralArguments - general game arguments
   * @param namespace - the namespace socket (unused)
   * @param _gameCoreArguments - game specific arguments for Determination
   */
  public constructor(
    readonly GeneralArguments: iGeneralHostArguments,
    public namespace: SocketIO.Namespace,
    private _gameCoreArguments: iDeterminationHostArguments,
    runningGames: RunningGames
  ) {
    this.GameCore = new DeterminationCore(
      this.GeneralArguments.gameId,
      this.GeneralArguments.questionIds,
      [],
      this._gameCoreArguments/* || {
        pointBase: 100,
        pointBaseWrongAnswerIdentified: 33,
        interQuestionGap: 3000
      }*/,
      runningGames
    );
  }

  /**
   * Processes game actions received from users.
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
          this.GameCore.PlayerGivesTip(username, JSON.parse(data));
        } catch (err) {
          this.ProcessUserError(username, { message: err.message, data: err });
        }
        break;
      }
      case MessageType.ChangePlayerRolesRequest: {
          try {
              this.GameCore.ChangePlayerRoles(username, JSON.parse(data));
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
   * Processes an user caused error.
   * @param username - the user who caused the error
   * @param errorMessage - the error's error message
   */
  private ProcessUserError(
    username: string,
    errorMessage: iGeneralPlayerInputError
  ): void {
    this.LogInfo(JSON.stringify(errorMessage));
    const user: PlayerBase | undefined = this.GameCore.Players.find(
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
   * Adds a user with their corresponding socket to the game's players array.
   * @param username - The user's username.
   * @param socket - The user's socket. Access the id through `socket.id`.
   * @returns Promise with the new players-array.
   */
  public AddPlayer(
    username: string,
    socket: SocketIO.Socket,
    roles: PlayerRole[]
  ): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        resolve(this.GameCore.AddUser(new PlayerBase(username, socket, roles)));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Disqualifies the player from the game.
   * @param username The username of the player to be disqualified.
   * @returns Promise.
   */
  public RemovePlayer(username: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        resolve(this.GameCore.DisqualifyUser(username));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Starts the game.
   * @param username - The user who ordered the game start
   */
  public StartGame(username: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        const player: PlayerBase | undefined = this.GameCore.Players.find(
          x => x.username == username
        );
        if (
          username == this.GeneralArguments.owner ||
          (player && [PlayerRole.Mod, PlayerRole.Host].find(x => undefined != player.roles.find(r => r == x)) != undefined)
        ) {
          resolve(this.GameCore.Start());
        } else {
          reject(-1);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Logs magnificient game information.
   * @param toLog - the information to log
   */
  private LogInfo(toLog: string) {
    logger.log("info", "Game: " + this.GeneralArguments.gameId + " - " + toLog);
  }

  /**
   * Logs silly game information.
   * @param toLog - the information to log
   */
  private LogSilly(toLog: string) {
    logger.log(
      "silly",
      "Game: " + this.GeneralArguments.gameId + " - " + toLog
    );
  }
}
