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
import { GameCreationError } from "../server/Errors";

export class GameFactory {
  public Sessions: RunningGames;
  constructor(Sessions: RunningGames) {
    this.Sessions = Sessions;
  }
  public CreateGame(
    generalArguments: iGeneralHostArguments,
    namespaceSocket: SocketIO.Namespace,
    gameArguments?: iQuestionQHostArguments | iDeterminationHostArguments
  ) {
    switch (generalArguments.gamemode) {
      case Gamemode.QuestionQ: {
        const newGame: QuestionQGame = new QuestionQGame(
          generalArguments,
          namespaceSocket,
          gameArguments
        );
        try {
          this.Sessions.addRunningGame(newGame);
          logger.log(
            "info",
            "New QuestionQ game: %s hosted.",
            generalArguments.owner
          );
        } catch (e) {
          logger.log("error", e.message);
        }
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
<<<<<<< HEAD
        throw new Error(
          Gamemode[Gamemode.QuestionQ] + " SPACE " + Gamemode[generalArguments.gamemode]
        );
=======
        throw new GameCreationError("Invalid gamemode passed.");
>>>>>>> 5ca87c38b72a3009ae48b2987a89e4ffb3d7a853
    }
  }
}
