import { iGame, IPlayerSocket } from "../game/iGame";
import { RunningGames } from "../game/RunningGames";
import * as GModels from "../models/GameModels";
import { PlayerNotFoundError, GameNotFoundError } from "./Errors";

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
   * @param {string} event - The event to be sent to the client.
   * @param {string} msg - The message to be sent.
   * @public
   */
  public SendToPlayer(
    id: string,
    username: string,
    event: GModels.MessageType,
    msg: object
  ): void {
    for (let item of this.RunningGames.Sessions) {
      if (item.GeneralArguments.gameId === id) {
        for (let player of item.players) {
          if (player.username === username) {
            player.socket.emit(event.toString(), JSON.stringify(msg));
          } else {
            throw new PlayerNotFoundError(username);
          }
        }
      } else {
        throw new GameNotFoundError(id);
      }
    }
  }

  /**
   * Sends a message to the everyone in the room.
   * @function@param {string} id - The game's id the player is in.
   * @param {string} event - The event to be sent to the client.
   * @param {string} msg - The message to be sent.
   * @public
   */
  public SendToRoom(id: string, event: GModels.MessageType, msg: object): void {
    for (let item of this.RunningGames.Sessions) {
      if (item.GeneralArguments.gameId === id) {
        item.socket.to(id).emit(event.toString(), JSON.stringify(msg));
      } else {
        throw new PlayerNotFoundError("id");
      }
    }
  }
}

//#region possiblyneeded
/*switch (gamemode) {
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
}*/

/* ROOM


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
    }*/

/* */
