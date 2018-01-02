import { IRunningGame } from "./IRunningGame";
import { Game } from "./Game";
import { logger } from "../server/Logging";

//Interface probably unnecessary
/**
 * All the running games for the different gamemodes.
 * @class
 */
export class RunningGames {
  readonly QuestionQ: Game[];
  readonly Millionaire: Game[];
  readonly Determination: Game[];
  readonly TrivialPursuit: Game[];

  /**
   * Initializes all Game arrays.
   * @constructor
   */
  constructor() {
    this.QuestionQ = new Array<Game>();
    this.Millionaire = new Array<Game>();
    this.Determination = new Array<Game>();
    this.TrivialPursuit = new Array<Game>();
  }

  /**
   * Adds a running game to the specified gamemode-array.
   * @function
   * @param {string} mode - The case sensitive gamemode. `questionq, millionaire, determination, trivialpursuit`
   * @param {Game} game - The game that should be added to the list of running games.
   * @returns The updated list for the specified gamemode.
   */
  public addRunningGame(mode: string, game: Game): Game[] {
    switch (mode) {
      case "questionq":
        this.QuestionQ.push(game);
        logger.log("info", "Added running Question Q.");
        return this.QuestionQ;

      case "millionaire":
        this.Millionaire.push(game);
        logger.log("info", "Added running Millionaire.");
        return this.Millionaire;

      case "determination":
        this.Determination.push(game);
        logger.log("info", "Added running Determination.");
        return this.Determination;

      case "trivialpursuit":
        this.TrivialPursuit.push(game);
        logger.log("info", "Added running Trivial Pursuit.");
        return this.TrivialPursuit;

      //Possibly extend on this (Error usage/Own errors)
      default:
        throw new Error("Invalid gametype");
    }
  }
}
