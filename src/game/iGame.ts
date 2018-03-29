//#region imports
import {
  iGeneralHostArguments,
  Gamemode,
  MessageType,
  iGeneralQuestion,
  iStartGame,
  iQuestionQTip,
  PlayerRole
} from "../models/GameModels";
//#endregion

//#region interfaces
/**
 * The purpose of the iGame-interface is to enable the runningGames-list to contain games only.
 */
export interface iGame {
  //#region properties
  /**
   * - general game arguments
   */
  readonly generalArguments: iGeneralHostArguments;

  /**
   * - indicates the game's gamemode
   */
  readonly gamemode: Gamemode;
  //#endregion

  //#region publicFunctions
  /**
   * Processes game actions received from users
   * @param username - the user who performs the action
   * @param msgType - the type of the action
   * @param data - the action's data
   */
  ProcessUserInput: (
    username: string,
    msgType: MessageType,
    data: string
  ) => any;

  /**
   * Adds a user with their corresponding socket to the game's players array
   * @param username - the user's username
   * @param socket - the user's socket. Access the id through `socket.id`
   * @returns promise with the new players-array
   */
  AddPlayer: (
    username: string,
    socket: SocketIO.Socket,
    roles: PlayerRole[]
  ) => any;

  /**
   * Disqualifies the player from the game
   * @param username - the username of the player to be disqualified
   * @returns - promise.
   */
  RemovePlayer: (
    username: string
  ) => any;

  /**
   * Starts the game
   * @param username - the user who orders the game start
   * @returns - promise
   */
  StartGame: (
    username: string
  ) => any;
  //#endregion
}
//#endregion
