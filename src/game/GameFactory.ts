import {
  iGeneralHostArguments,
  MessageType,
  iQuestionQHostArguments,
  Gamemode,
  iDeterminationHostArguments,
  iMillionaireHostArguments,
  PlayerRole,
  iDuelHostArguments
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
    questionqArguments?: iQuestionQHostArguments,
    millionaireArguments?: iMillionaireHostArguments,
    determinationArguments?: iDeterminationHostArguments,
    duelArguments?: iDuelHostArguments
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
                questionqArguments || {
                  pointBase: 100,
                  interQuestionGap: 3000
                },
                this.Sessions
              );
              this.Initialize(newGame).catch(err => {
                logger.log("warning", "Game could not be initialized: %s", err);
              });
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
              this.Initialize(newGame);
              break;
            }
            case Gamemode.Determination: {
              const newGame: iGame = new DeterminationGame(
                generalArguments,
                namespaceSocket,
                determinationArguments || {
                  pointBase: 100,
                  pointBaseWrongAnswerIdentified: 100,
                  interQuestionGap: 1000
                }
              );
              this.Initialize(newGame)
                .then(res => {
                  console.log("GAME INITIALIZED");
                  console.log(this.Sessions.Sessions);
                })
                .catch(err => {
                  logger.log(
                    "warning",
                    "Game could not be initialized: %s",
                    err
                  );
                });
            }
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

  private Initialize(game: iGame): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        game
          .AddPlayer(
            game.GeneralArguments.owner,
            game.GeneralArguments.ownerSocket,
            PlayerRole.Host
          )
          .then((res: any) => {
            logger.log(
              "info",
              "Added owner %s as player to game %s.",
              game.GeneralArguments.owner,
              game.GeneralArguments.gameId
            );
          })
          .catch((err: any) => {
            logger.log(
              "info",
              "Adding of player %s to game %s was unsuccessful.",
              game.GeneralArguments.owner,
              game.GeneralArguments.gameId
            );
            logger.log("silly", err);
            reject(err);
          });
        this.Sessions.addRunningGame(game)
          .then((res: any) => {
            logger.log(
              "info",
              "New Millionaire game: %s hosted.",
              game.GeneralArguments.gameId
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
    });
  }
}
