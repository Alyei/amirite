import { iGame } from "../game/iGame";
import { PlayerBase } from "../game/PlayerBase";
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
}
