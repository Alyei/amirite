import { Game } from "../game/Game";
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
  private RunningSessions: RunningGames;

  /**
   * Applies the namespaces for the gamemodes.
   * @constructor
   * @param {SocketIO.Namespace} QuestionQ - The QuestionQ-namespace.
   * @param {SocketIO.Namespace} Millionaire - The Millionaire-namespace.
   * @param {SocketIO.Namespace} Determination - The Determination-namespace.
   * @param {SocketIO.Namespace} TrivialPursuit - The TrivialPursuit-namespace.
   * @param {RunningGames} GameSessions - The RunningGames instance.
   */
  constructor(
    QuestionQ: SocketIO.Namespace,
    Millionaire: SocketIO.Namespace,
    Determination: SocketIO.Namespace,
    TrivialPursuit: SocketIO.Namespace,
    GameSessions: RunningGames
  ) {
    this.QuestionQ = QuestionQ;
    this.Millionaire = Millionaire;
    this.Determination = Determination;
    this.TrivialPursuit = TrivialPursuit;
    this.RunningSessions = GameSessions;
  }

  /**
   * Initializes a new QuestionQ Session.
   * @function
   * @param {SocketIO.Socket} socket - The player's socket.
   * @param {string} username - The player's username.
   */
  public HostQuestionQ(socket: SocketIO.Socket, username: string): string {
    let newGame: Game = new Game(username, this.QuestionQ);
    newGame.AddPlayer(username, socket);
    this.RunningSessions.addRunningGame("questionq", newGame);
    return newGame.id;
  }

  /**
   * Initializes a new Millionaire Session.
   * @function
   * @param {SocketIO.Socket} socket - The player's socket.
   * @param {string} username - The player's username.
   */
  public HostMillionaire(socket: SocketIO.Socket, username: string): string {
    let newGame: Game = new Game(username, this.Millionaire);
    newGame.AddPlayer(username, socket);
    this.RunningSessions.addRunningGame("millionaire", newGame);
    return newGame.id;
  }

  /**
   * Initializes a new Determination Session.
   * @function
   * @param {SocketIO.Socket} socket - The player's socket.
   * @param {string} username - The player's username.
   */
  public HostDetermination(socket: SocketIO.Socket, username: string): string {
    let newGame: Game = new Game(username, this.Determination);
    newGame.AddPlayer(username, socket);
    this.RunningSessions.addRunningGame("determination", newGame);
    return newGame.id;
  }

  /**
   * Initializes a new Trivial Pursuit Session.
   * @function
   * @param {SocketIO.Socket} socket - The player's socket.
   * @param {string} username - The player's username.
   */
  public HostTrivialPursuit(socket: SocketIO.Socket, username: string): string {
    let newGame: Game = new Game(username, this.TrivialPursuit);
    newGame.AddPlayer(username, socket);
    this.RunningSessions.addRunningGame("trivialpursuit", newGame);
    return newGame.id;
  }
}
