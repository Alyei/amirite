import { iGame } from "./iGame";
import { logger } from "../server/Logging";

//Interface probably unnecessary
/**
 * All the running games for the different gamemodes.
 * @class
 */
export class RunningGames {
  readonly Sessions: iGame[];

  /**
   * Initializes all Game arrays.
   * @constructor
   */
  constructor() {
    this.Sessions = new Array<iGame>();
  }

  /**
   * Adds a running game to the specified gamemode-array.
   * @function
   * @param {IGame} game - The game that should be added to the list of running games.
   * @returns The updated list for the specified gamemode.
   */
  public addRunningGame(game: iGame): iGame[] {
    this.Sessions.push(game);

    logger.log(
      "info",
      "New QuestionQ session hosted. ID: %s, Owner: %s",

      game.GeneralArguments.owner,
      game.GeneralArguments.gamemode
    );
    return this.Sessions;
  }
}

//in case this is needed
/*switch (mode) {
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
  }*/
