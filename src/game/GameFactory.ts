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
import { DeterminationGame } from "./DeterminationGame";

export class GameFactory {
  public Sessions: RunningGames;

  /**
   * Creates a new instance of the GameFactory-class
   * @param Sessions 
   */
  constructor(Sessions: RunningGames) {
    this.Sessions = Sessions;
  }

  /**
   * Creates a new instance of iGame according to the arguments
   * @param generalArguments - general game arguments
   * @param namespaceSocket - the namespace socket (unused)
   * @param gameArguments - gamemode-specific arguments
   */
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
            .AddPlayer(generalArguments.owner, generalArguments.ownerSocket, [
              2
            ])
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
      case Gamemode.Determination: {
        const newGame: DeterminationGame = new DeterminationGame(
          generalArguments,
          namespaceSocket,
          gameArguments
        );
        try {
          newGame
            .AddPlayer(generalArguments.owner, generalArguments.ownerSocket, [
              2
            ])
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
      default:
        throw new GameCreationError("Invalid gamemode passed.");
    }
  }
}
