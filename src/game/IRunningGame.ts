import { Game } from "./Game";

export interface IRunningGame {
  readonly games: Game[];
  addRunningGame(game: Game): Game[];
}
