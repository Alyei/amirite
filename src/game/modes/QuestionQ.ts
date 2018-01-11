//This is to be put in the /src/game folder

import { generateGameId } from "../../server/helper";
import { IGame, IPlayerSocket } from "./IGame";

export class QuestionQ implements IGame {
  readonly id: string;
  readonly gamemode: string;
  readonly players: IPlayerSocket[];
  readonly owner: string;
  public Socket: SocketIO.Namespace;

  /**
   * Assigns a random ID to the game and sets the owner.
   * @constructor
   * @param {string} owner - The game's owner.
   * @param {SocketIO.Socket} socket - The gamemode's namespace-socket.
   */
  constructor(owner: string, socket: SocketIO.Namespace) {
    this.id = generateGameId();
    this.gamemode = "questionq";
    this.players = new Array<IPlayerSocket>();
    this.owner = owner;
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
