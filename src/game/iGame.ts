import {
  iGeneralHostArguments,
  Gamemode,
  MessageType,
  iGeneralQuestion,
  iStartGame,
  iQuestionQTip,
  PlayerRole
} from "../models/GameModels";

export interface iGame {
  /**
   * Processes game actions received from users.
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
   * Adds a new player to the game.
   */
  AddPlayer: (username: string, socket: SocketIO.Socket, roles: PlayerRole[]) => any;
  /**
   * Disqualifies a player from the game.
   */
  RemovePlayer: (username: string) => any;
  /**
   * Starts the game.
   */
  StartGame: (username: string) => any;
  /**
   * The namespace socket
   */
  namespace: SocketIO.Namespace;
  /**
   * The general game arguments
   */
  readonly GeneralArguments: iGeneralHostArguments;
}
