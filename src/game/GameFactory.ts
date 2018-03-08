import {
  iGeneralHostArguments,
  MessageType,
  iQuestionQHostArguments,
  Gamemode,
  iDeterminationHostArguments,
  iMillionaireHostArguments,
  PlayerRole
} from "../models/GameModels";
import { QuestionQGame } from "./QuestionQGame";
import { MillionaireGame } from "./MillionaireGame";
//import { DeterminationGame } from "./DeterminationGame";
import { RunningGames } from "../game/RunningGames";
import { logger } from "../server/logging";
import { generateGameId } from "../server/helper";
import {
  GameCreationError,
  PlayerAlreadyHostsGame,
  PlayerCouldNotBeAddedError
} from "../server/Errors";
import { iGame } from "./iGame";
import { MillionaireGameDataModel } from "../models/Schemas";

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
    gameArguments?: iQuestionQHostArguments | iDeterminationHostArguments,
    millionaireArguments?: iMillionaireHostArguments
  ): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        if (
          !this.Sessions.Sessions.find(
            x => x.GeneralArguments.owner == generalArguments.owner
          )
        ) {
          switch (generalArguments.gamemode) {
            case Gamemode.QuestionQ: {
              const newGame: iGame = new QuestionQGame(
                generalArguments,
                namespaceSocket,
                gameArguments || { pointBase: 100, interQuestionGap: 3000 },
                this.Sessions
              );
              try {
                newGame
                  .AddPlayer(
                    generalArguments.owner,
                    generalArguments.ownerSocket,
                    PlayerRole.Host
                  )
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
                this.Sessions.addRunningGame(newGame)
                  .then((res: any) => {
                    logger.log(
                      "info",
                      "New QuestionQ game: %s hosted.",
                      generalArguments.gameId
                    );
                    resolve(res);
                  })
                  .catch((err: any) => {
                    logger.log("info", err);
                    reject(err);
                  });
              } catch (e) {
                logger.log("error", e.message);
              }
              break;
            }
            case Gamemode.Millionaire: {
              const newGame: iGame = new MillionaireGame(
                generalArguments,
                namespaceSocket,
                this.Sessions,
                millionaireArguments || {
                  maxQuestions: 14,
                  checkpoints: [2, 4, 8],
                  jokers: [],
                  scoreCalcA: 200,
                  scoreCalcB: 2
                }
              );
              try {
                newGame
                  .AddPlayer(
                    generalArguments.owner,
                    generalArguments.ownerSocket,
                    PlayerRole.Host
                  )
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
                this.Sessions.addRunningGame(newGame)
                  .then((res: any) => {
                    logger.log(
                      "info",
                      "New Millionaire game: %s hosted.",
                      generalArguments.gameId
                    );
                    resolve(res);
                  })
                  .catch((err: any) => {
                    logger.log("info", err);
                    reject(err);
                  });
              } catch (e) {
                logger.log("error", e.message);
              }
              break;
            }
            /*case Gamemode.Determination: {
        return new DeterminationGame(
          generalArguments,
          namespaceSocket,
          gameArguments
        );
      }*/
            default:
              throw new GameCreationError("Invalid gamemode passed.");
          }
        } else {
          reject("Player already hosts a game");
        }
      } catch (err) {
        throw new Error(err.stack);
      }
    });
  }
}
