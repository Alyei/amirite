//#region imports
import {
  iGeneralHostArguments,
  MessageType,
  iQuestionQHostArguments,
  Gamemode,
  iDeterminationHostArguments,
  iMillionaireHostArguments,
  PlayerRole,
  iDuelHostArguments,
  JokerType
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
import { DuelGame } from "./DuelGame";
//#endregion

//#region classes
/**
 * The GameFactory-class' purpose is to instantiate games, so those can be played.
 * @author Andrej Resanovic, Georg Schubbauer
 */
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
            x => x.generalArguments.owner == generalArguments.owner
          )
        ) {
          switch (generalArguments.gamemode) {
            case Gamemode.QuestionQ: {
              const newGame: iGame = new QuestionQGame(
                generalArguments,
                namespaceSocket,
                questionqArguments || {
                  pointBase: 100,
                  interQuestionGap: 1000
                },
                this.Sessions
              );
              this.Initialize(newGame)
                .then((res: any) => {
                  resolve(res);
                })
                .catch((err: any) => {
                  logger.log(
                    "warning",
                    "Game could not be initialized: %s",
                    err
                  );
                  reject(err);
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
                  checkpoints: [1000, 5000, 10000, 100000],
                  jokers: [
                    JokerType.Audience,
                    JokerType.Call,
                    JokerType.FiftyFifty
                  ],
                  scoreCalcA: 100,
                  scoreCalcB: 1
                }
              );
              this.Initialize(newGame)
                .then((res: any) => {
                  resolve(res);
                })
                .catch((err: any) => {
                  logger.log(
                    "warning",
                    "Game could not be initialized: %s",
                    err
                  );
                  reject(err);
                });
              break;
            }
            case Gamemode.Determination: {
              const newGame: iGame = new DeterminationGame(
                generalArguments,
                namespaceSocket,
                determinationArguments || {
                  pointBase: 100,
                  pointBaseWrongAnswerIdentified: 25,
                  interQuestionGap: 1000
                },
                this.Sessions
              );
              this.Initialize(newGame)
                .then((res: any) => {
                  resolve(res);
                })
                .catch(err => {
                  logger.log(
                    "warning",
                    "Game could not be initialized: %s",
                    err
                  );
                  reject(err);
                });
            }
            case Gamemode.Duel: {
              const newGame: iGame = new DuelGame(
                generalArguments,
                namespaceSocket,
                this.Sessions,
                duelArguments || {
                  scoreGoal: 100000,
                  scoreMin: -10000,
                  pointBase: 100,
                  pointBase2: 100,
                  pointDeductionBase: 50,
                  pointDeductionBase2: 50,
                  pointDeductionWhenTooSlow: 10,
                  postfeedbackGap: 3000,
                  choosingTime1: 10000,
                  choosingTime2: 10000,
                  maxCategoryChoiceRange: 3,
                  maxDifficultyChoiceRange: 3
                }
              );
              this.Initialize(newGame)
                .then((res: any) => {
                  resolve(res);
                })
                .catch(err => {
                  logger.log(
                    "warning",
                    "Game could not be initialized: %s",
                    err
                  );
                  reject(err);
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

  /**
   * Initializes a new game by adding the host as owner and adding it to the running games.
   * @param game - Game that should be started.
   */
  private Initialize(game: iGame): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      game
        .AddPlayer(
          game.generalArguments.owner,
          game.generalArguments.ownerSocket,
          [PlayerRole.Host]
        )
        .then((res: any) => {
          logger.log(
            "info",
            "Added owner %s as player to game %s.",
            game.generalArguments.owner,
            game.generalArguments.gameId
          );
        })
        .catch((err: any) => {
          logger.log(
            "info",
            "Adding of player %s to game %s was unsuccessful.",
            game.generalArguments.owner,
            game.generalArguments.gameId
          );
          logger.log("silly", err);
          reject(err);
        });
      this.Sessions.addRunningGame(game)
        .then((res: any) => {
          logger.log(
            "info",
            "New Millionaire game: %s hosted.",
            game.generalArguments.gameId
          );
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  }
}
//#endregion
