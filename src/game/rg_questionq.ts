import { IRunningGame } from "./IRunningGame";
import { Game } from "./Game";

//Probably setting this static or saving in db
export class RunningQuestionQ implements IRunningGame {
  readonly games: Game[];

  constructor(firstGame: Game) {
    this.games = new Array<Game>();
    this.games.push(firstGame);
  }

  public addRunningGame(game: Game): Game[] {
    this.games.push(game);
    return this.games;
  }
}
