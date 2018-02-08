import {
  MessageType,
  Gamemode,
  iGeneralHostArguments,
  iQuestionQHostArguments,
  iQuestionQGameData,
  iGeneralQuestion,
  iGeneralPlayerInputError,
  iQuestionQTip,
  GameAction,
  PlayerRole
} from "../models/GameModels";
import { logger } from "../server/logging";
import { QuestionModel } from "../models/Schemas";

// game modes
import { QuestionQCore } from "./QuestionQCore";
import { iGame } from "./iGame";
import { PlayerBase } from "./PlayerBase";
import { Socket } from "net";
import {
  PlayerCouldNotBeAddedError,
  QuestionCouldNotBeAddedError
} from "../server/Errors";
import { Tryharder } from "./Tryharder";
import { QuestionQPlayer } from "./QuestionQPlayer";

export class QuestionQGame implements iGame {
  private GameCore: QuestionQCore;

  /**
   * Creates an instance of a QuestionQ-Game.
   * @param GeneralArguments - general game arguments
   * @param namespace - the namespace socket (unused)
   * @param _gameCoreArguments - game specific arguments for QuestionQ
   */
  public constructor(
    readonly GeneralArguments: iGeneralHostArguments,
    public namespace: SocketIO.Namespace,
    private _gameCoreArguments?: iQuestionQHostArguments
  ) {
    this.GameCore = new QuestionQCore(
      this.GeneralArguments.gameId,
      this.LogInfo,
      this.LogSilly,
      this.GeneralArguments.questionIds,
      [],
      this._gameCoreArguments
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
    messageType: string /*msgType: MessageType*/,
    data: string
  ): void {
    const msgType: MessageType = (<any>MessageType)[messageType];
    switch (msgType) {
      case MessageType.QuestionQTip: {
        try {
          this.GameCore.PlayerGivesTip(username, JSON.parse(data));
        } catch (err) {
          logger.log("info", err.message);
          //this.SendToUser(username, MessageType.PlayerInputError, errorMessage);
        }
        break;
      }
      default: {
        let errorMessage: iGeneralPlayerInputError = {
          message: "invalid message type",
          data: { username: username, msgType: msgType }
        };
        this.LogInfo(this.GameCore, JSON.stringify(errorMessage));
        //this.SendToUser(username, MessageType.PlayerInputError, errorMessage);
        break;
      }
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
    roles?: PlayerRole[]
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
        const player: QuestionQPlayer | undefined = this.GameCore.Players.find(
          x => x.username == username
        );
        if (
          username == this.GeneralArguments.owner ||
          (player &&
            player.roles.find(x => x == PlayerRole.Mod || x == PlayerRole.Host))
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
   * DEACTIVATED
   */
  public AddQuestion(question: iGeneralQuestion): boolean {
    //return this.GameCore.AddQuestion(question);
    return false;
  }

  /**
   * Logs magnificient game information.
   * @param game - the game instance
   * @param toLog - the information to log
   */
  private LogInfo(game: QuestionQCore, toLog: string) {
    logger.log("info", "Game: " + game.gameId + " - " + toLog);
  }

  /**
   * Logs silly game information.
   * @param game - the game instance
   * @param toLog - the information to log
   */
  private LogSilly(game: QuestionQCore, toLog: string) {
    logger.log("silly", "Game: " + game.gameId + " - " + toLog);
  }
}
