import { IGame } from "../game/modes/IGame";
import { QuestionQ } from "../game/modes/QuestionQ";
import * as Determination from "../game/modes/WIP_Determination";
import * as Millionaire from "../game/modes/WIP_Millionaire";
import * as TrivialPursuit from "../game/modes/WIP_TrivialPursuit";
import { RunningGames } from "../game/RunningGames";

/**
 * Handles the initialization of games.
 * @class
 */
export class GameInit {
  private QuestionQ: SocketIO.Namespace;
  private Millionaire: SocketIO.Namespace;
  private Determination: SocketIO.Namespace;
  private TrivialPursuit: SocketIO.Namespace;
  private Duel: SocketIO.Namespace;
  private RunningSessions: RunningGames;

  /**
   * Applies the namespaces for the gamemodes.
   * @constructor
   * @param {SocketIO.Namespace} QuestionQ - The QuestionQ-namespace.
   * @param {SocketIO.Namespace} Millionaire - The Millionaire-namespace.
   * @param {SocketIO.Namespace} Determination - The Determination-namespace.
   * @param {SocketIO.Namespace} TrivialPursuit - The TrivialPursuit-namespace.
   * @param {SocketIO.Namespace} Duel - The Duel-namespace.
   * @param {RunningGames} GameSessions - The RunningGames instance.
   */
  constructor(
    QuestionQ: SocketIO.Namespace,
    Millionaire: SocketIO.Namespace,
    Determination: SocketIO.Namespace,
    TrivialPursuit: SocketIO.Namespace,
    Duel: SocketIO.Namespace,
    GameSessions: RunningGames
  ) {
    this.QuestionQ = QuestionQ;
    this.Millionaire = Millionaire;
    this.Determination = Determination;
    this.TrivialPursuit = TrivialPursuit;
    this.Duel = Duel;
    this.RunningSessions = GameSessions;
  }

  public HostGame(
    socket: SocketIO.Socket,
    config: { mode: string; owner: string }
  ): string {
    switch (config.mode) {
      case "questionq":
        let newQQ: QuestionQ = new QuestionQ(config.owner, this.QuestionQ);
        newQQ.AddPlayer(config.owner, socket);
        this.RunningSessions.addRunningGame(newQQ);
        return newQQ.id;
      default:
        throw new Error("GameInit.ts - HostGame(): Gamemode doesn't exist.");
    }
  }
}

//IN CASE NEEDED
// /**
//    * Initializes a new QuestionQ Session.
//    * @function
//    * @param {SocketIO.Socket} socket - The player's socket.
//    * @param {string} username - The player's username.
//    */
//   public HostQuestionQ(socket: SocketIO.Socket, username: string): string {
//     let newGame: Game = new Game(username, this.QuestionQ);
//     newGame.AddPlayer(username, socket);
//     this.RunningSessions.addRunningGame("questionq", newGame);
//     return newGame.id;
//   }

//   /**
//    * Initializes a new Millionaire Session.
//    * @function
//    * @param {SocketIO.Socket} socket - The player's socket.
//    * @param {string} username - The player's username.
//    */
//   public HostMillionaire(socket: SocketIO.Socket, username: string): string {
//     let newGame: Game = new Game(username, this.Millionaire);
//     newGame.AddPlayer(username, socket);
//     this.RunningSessions.addRunningGame("millionaire", newGame);
//     return newGame.id;
//   }

//   /**
//    * Initializes a new Determination Session.
//    * @function
//    * @param {SocketIO.Socket} socket - The player's socket.
//    * @param {string} username - The player's username.
//    */
//   public HostDetermination(socket: SocketIO.Socket, username: string): string {
//     let newGame: Game = new Game(username, this.Determination);
//     newGame.AddPlayer(username, socket);
//     this.RunningSessions.addRunningGame("determination", newGame);
//     return newGame.id;
//   }

//   /**
//    * Initializes a new Trivial Pursuit Session.
//    * @function
//    * @param {SocketIO.Socket} socket - The player's socket.
//    * @param {string} username - The player's username.
//    */
//   public HostTrivialPursuit(socket: SocketIO.Socket, username: string): string {
//     let newGame: Game = new Game(username, this.TrivialPursuit);
//     newGame.AddPlayer(username, socket);
//     this.RunningSessions.addRunningGame("trivialpursuit", newGame);
//     return newGame.id;
//   }
