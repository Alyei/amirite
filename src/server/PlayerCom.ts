import { Game, IPlayerSocket } from "../game/Game";
import { RunningGames } from "../game/RunningGames";

/**
 * Handles the Server-Player communication.
 * @class
 */

export class PlayerCommunication {
  private RunningGames: RunningGames;

  /**
   * @constructor
   * @param {RunningGames} RunningGames - The RunningGames instance.
   */
  constructor(RunningGames: RunningGames) {
    this.RunningGames = RunningGames;
  }

  /**
   * Sends a message to the player's socket.
   * @function
   * @param {string} gamemode - The case sensitive gamemode. `questionq, millionaire, determination, trivialpursuit`
   * @param {string} id - The game's id the player is in.
   * @param {string} username - The player's case sensitive username.
   * @param {string} msg - The message to be sent.
   * @public
   */
  public SendToPlayer(
    gamemode: string,
    id: string,
    username: string,
    msg: string
  ): void {
    //Can't assign the same var twice in the case blocks
    switch (gamemode) {
      case "questionq":
        const GameQQ = this.FindGameById(this.RunningGames.QuestionQ, id);
        const PlayerSocketQQ = this.FindPlayerSocketInGame(
          GameQQ.players,
          username
        );
        PlayerSocketQQ.emit("question", msg);
        break;
      case "millionaire":
        let GameMill = this.FindGameById(this.RunningGames.Millionaire, id);
        let PlayerSocketMill = this.FindPlayerSocketInGame(
          GameMill.players,
          username
        );
        PlayerSocketMill.emit("question", msg);
        break;
      case "determination":
        let GameDet = this.FindGameById(this.RunningGames.Determination, id);
        let PlayerSocketDet = this.FindPlayerSocketInGame(
          GameDet.players,
          username
        );
        PlayerSocketDet.emit("question", msg);
        break;
      case "trivialpursuit":
        let GameTP = this.FindGameById(this.RunningGames.TrivialPursuit, id);
        let PlayerSocketTP = this.FindPlayerSocketInGame(
          GameTP.players,
          username
        );
        PlayerSocketTP.emit("question", msg);
        break;
      default:
        throw new Error("Passed gamemode is invalid.");
    }
  }

  /**
   * Sends a message to whole room.
   * @function
   * @param {string} gamemode - The case sensitive gamemode. `questionq, millionaire, determination, trivialpursuit`
   * @param {string} id - The game's id the player is in.@param {string} msg - The message to be sent.
   * @public
   */
  public SendToRoom(gamemode: string, id: string, msg: string): void {
    switch (gamemode) {
      case "questionq":
        let GameQQSocket = this.FindGameById(this.RunningGames.QuestionQ, id)
          .Socket;
        GameQQSocket.emit("roomsend", msg); //possibly change this event
        break;
      case "millionaire":
        let GameMillSocket = this.FindGameById(
          this.RunningGames.Millionaire,
          id
        ).Socket;
        GameMillSocket.emit("roomsend", msg);
        break;
      case "determination":
        let GameDetSocket = this.FindGameById(
          this.RunningGames.Determination,
          id
        ).Socket;
        GameDetSocket.emit("roomsend", msg);
        break;
      case "trivialpursuit":
        let GameTPSocket = this.FindGameById(
          this.RunningGames.TrivialPursuit,
          id
        ).Socket;
        GameTPSocket.emit("roomsend", msg);
        break;
      default:
        throw new Error("Gamemode given is invalid.");
    }
  }

  /**
   * Searches for the game by id.
   * @param {Array<Game>} RunningGames - The game-array where the id is supposed to be located.
   * @param {string} id - The id of the game.
   * @returns The searched game.
   * @private
   */
  private FindGameById(RunningGames: Array<Game>, id: string): Game {
    for (let index = 0; index < RunningGames.length; index++) {
      const element = RunningGames[index];
      if (element.id === id) {
        return element;
      }
    }
    throw new Error("Could not find a game with that id.");
  }

  /**
   * Searches for the player in a given game.
   * @param {IPlayerSocket[]} Game - The player-socket array where the player is supposed to be located.
   * @param {string} Player - The player's username.
   * @returns The searched player's socket.
   * @private
   */
  private FindPlayerSocketInGame(
    Game: IPlayerSocket[],
    Player: string
  ): SocketIO.Socket {
    let PlayerLower = Player.toLowerCase();
    for (let index = 0; index < Game.length; index++) {
      const element = Game[index];
      if (element.username === PlayerLower) {
        return element.socket;
      }
    }
    throw new Error("Player not found.");
  }
}
