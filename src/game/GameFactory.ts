import {
  iGeneralHostArguments,
  MessageType,
  iQuestionQHostArguments,
  Gamemode,
  iDeterminationHostArguments
} from "../models/GameModels";
import { QuestionQGame } from "./QuestionQGame";
//import { DeterminationGame } from "./DeterminationGame";
import { RunningGames } from "../game/RunningGames";
import { logger } from "../server/logging";
import { generateGameId } from "../server/helper";

export class GameFactory {
  public Sessions: RunningGames;
  constructor(Sessions: RunningGames) {
    this.Sessions = Sessions;
  }
  public CreateGame(
    generalArguments: iGeneralHostArguments,
    send: (
      gameId: string,
      username: string,
      msgType: MessageType,
      data: {}
    ) => void,
    gameEnded: () => void,
    namespaceSocket: SocketIO.Namespace,
    gameArguments?: iQuestionQHostArguments | iDeterminationHostArguments
  ) {
    switch (generalArguments.gamemode) {
      case Gamemode.QuestionQ: {
        const newGame: QuestionQGame = new QuestionQGame(
          generalArguments,
          send,
          gameEnded,
          namespaceSocket,
          gameArguments
        );
        this.Sessions.addRunningGame(newGame);
        logger.log(
          "info",
          "New QuestionQ game: %s hosted.",
          generalArguments.owner
        );
        break;
      }
      /*case Gamemode.Determination: {
        return new DeterminationGame(
          generalArguments,
          send,
          gameEnded,
          gameArguments
        );
      }*/
      default:
        throw new Error(
          Gamemode[Gamemode.QuestionQ] + " SPACE " + Gamemode[generalArguments.gamemode]
        );
    }
  }
}
