import { generateGameId } from "../../server/helper";
import { IGame, IPlayerSocket } from "./IGame";

export class Millionaire implements IGame {
  readonly id: string;
  readonly gamemode: string;
  readonly players: IPlayerSocket[];
  readonly owner: string;
  public Socket: SocketIO.Namespace;

  /**
   * Assigns a random ID to the game and sets the owner.
   * @constructor
   * @param {string} username - The game's owner.
   * @param {SocketIO.Namespace} socket - The gamemode's socket.
   */
  constructor(username: string, socket: SocketIO.Namespace) {
    this.id = generateGameId();
    this.gamemode = "trivialpursuit";
    this.players = new Array<IPlayerSocket>();
    this.owner = username;
    this.Socket = socket;
  }

  /**
   * Adds a user with their corresponding socket to the game's players array.
   * @function
   * @param username - The user's username.
   * @param socket - The user's socket. Access the id through `socket.id`
   * @returns The new players array.
   */
  public AddPlayer(username: string, socket: SocketIO.Socket): IPlayerSocket[] {
    this.players.push({ username: username, socket: socket });
    return this.players;
  }
}