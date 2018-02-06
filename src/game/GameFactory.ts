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
          newGame
            .AddPlayer(generalArguments.owner, generalArguments.ownerSocket)
            .then((res: any) => {
              logger.log(
                "info",
                "Added owner %s as player to game %s.",
                generalArguments.owner,
                generalArguments.gameId
              );
            })
            .catch((err: any) => {
              logger.log(
                "info",
                "Adding of player %s to game %s was unsuccessful.",
                generalArguments.owner,
                generalArguments.gameId
              );
            });
          this.Sessions.addRunningGame(newGame);
          console.log("ADDEDRUNNINGGAME");
          console.log(newGame.GeneralArguments);
          logger.log(
            "info",
            "New QuestionQ game: %s hosted.",
            generalArguments.gameId
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
        throw new GameCreationError("Invalid gamemode passed.");
    }
  }
}
