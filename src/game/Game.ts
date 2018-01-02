//This is to be put in the /src/game folder

import { generateGameId } from "../server/helper";

interface IPlayerSocket {
  username: string;
  socket: SocketIO.Socket;
}

export class Game {
  readonly id: string;
  readonly players: IPlayerSocket[];

  /**
   * Assigns a random ID to the game.
   * @constructor
   */
  constructor() {
    this.id = generateGameId();
    this.players = new Array<IPlayerSocket>();
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
