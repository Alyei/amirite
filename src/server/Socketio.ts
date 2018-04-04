import * as socketio from "socket.io";
import { Server } from "http";
import { generateGameId } from "./Helper";
import { RunningGames } from "../game/RunningGames";
import { logger } from "./Logging";
import { GameFactory } from "../game/GameFactory";
import {
  iGeneralHostArguments,
  iPlayerAction,
  iHostGame,
  iJoinGame,
  iLeaveGame,
  iStartGame,
  iQuestionQTip,
  PlayerRole
} from "../models/GameModels";
import * as GModels from "../models/GameModels";
import { iGame } from "../game/iGame";
import { ENOSTR } from "constants";

/**
 * Handles the various socket.io-namespaces for the gamemodes.
 * @class
 * @author Andrej Resanovic
 */
export class io {
  public server: SocketIO.Server;
  public QuestionQ: SocketIO.Namespace;
  public Millionaire: SocketIO.Namespace;
  public Determination: SocketIO.Namespace;
  public Duel: SocketIO.Namespace;
  public GameSessions: RunningGames;
  public GameFactory: GameFactory;

  /**
   * Initializes the io class.
   * @param app - The express app.
   * @param sessions - The RunningGames object.
   * @param factory - The GameFactory object.
   * @param playercom -
   */
  constructor(app: any, sessions: RunningGames, factory: GameFactory) {
    this.server = socketio.listen(app);
    //Setting up namespaces
    this.QuestionQ = this.server.of("/questionq");
    this.Millionaire = this.server.of("/millionaire");
    this.Determination = this.server.of("/determination");
    this.Duel = this.server.of("/duel");

    this.GameSessions = sessions;
    this.GameFactory = factory;
    this.QuestionQConf();
    this.DeterminationConf();
    this.MillionaireConf();
    this.DuelConf();
  }

  /**
   *Creates the game by giving it an ID and adding it to the running games.
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}username The player's username.
   */
  private HostGame(
    playerSocket: SocketIO.Socket,
    gameSocket: SocketIO.Namespace,
    optS: string,
    gamemode: GModels.Gamemode
  ): void {
    let opt: iHostGame = undefined;

    try {
      opt = JSON.parse(optS);

      let args: iGeneralHostArguments = {
        gameId: generateGameId(),
        gamemode: gamemode,
        owner: opt.GeneralArgs.username,
        ownerSocket: playerSocket,
        questionIds: ["1234567890", "YxUy07SElM"]
      };

      this.GameFactory.CreateGame(args, gameSocket)
        .then((res: any) => {
          playerSocket.join(args.gameId);
          playerSocket.emit("gameid", args.gameId);
        })
        .catch((err: any) => {
          logger.log("info", err);
          playerSocket.emit("err", err);
        });
    } catch (err) {
      logger.log(
        "warn",
        "Error while parsing a 'host game' request: " + err.toString()
      );
      console.error(optS);
      playerSocket.emit(
        "err",
        JSON.stringify({
          event: "host game",
          error: "parse"
        })
      );
    }
  }

  /**
   * Disqualifies the user from the specified game.
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}optS Options in the format of `iLeaveGame`.
   */
  private LeaveGame(playerSocket: SocketIO.Socket, optS: string) {
    let opt: iLeaveGame = undefined;

    try {
      opt = JSON.parse(optS);

      for (let item of this.GameSessions.Sessions) {
        if (item.generalArguments.gameId == opt.gameId) {
          item
            .RemovePlayer(opt.username)
            .then((res: any) => {
              playerSocket.emit("success");
            })
            .catch((err: any) => {
              logger.log("info", err.message);
              playerSocket.emit("err");
            });
        }
      }
    } catch (err) {
      logger.log(
        "warn",
        "Error while parsing a 'leave game' request: " + err.toString()
      );
      console.error(optS);
      playerSocket.emit(
        "err",
        JSON.stringify({
          event: "leave game",
          error: "parse"
        })
      );
    }
  }

  /**
   * Starts the specified game by changing it's status to running (Phase 1).
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}optS Options in the format of `iStartGame`.
   */
  private StartGame(playerSocket: SocketIO.Socket, optS: string) {
    let opt: iStartGame = undefined;

    try {
      opt = JSON.parse(optS);

      for (let item of this.GameSessions.Sessions) {
        if (item.generalArguments.gameId == opt.gameId) {
          item
            .StartGame(opt.username)
            .then((res: any) => {
              if (res) {
                logger.log("info", "Game %s started.", opt.gameId);
                playerSocket.emit("success");
              } else {
                logger.log("info", "Game %s is already running.", opt.gameId);
              }
            })
            .catch((err: any) => {
              if (err == -1) {
                logger.log("info", "Non-owner tried to launch a game");
                playerSocket.emit("err", "permission denied");
              } else {
                logger.log(
                  "info",
                  "Something went wrong while starting game %s: " + err.stack,
                  opt.gameId
                );
                playerSocket.emit("err");
              }
            });
        } else {
          logger.log("info", "Can't start game %s. It doesn't exist.");
          playerSocket.emit("err");
        }
      }
    } catch (err) {
      logger.log(
        "warn",
        "Error while parsing a 'start game' request: " + err.message
      );

      console.error(optS);

      logger.log("warn", optS);

      playerSocket.emit(
        "err",
        JSON.stringify({
          event: "start game",
          error: "parse"
        })
      );
    }
  }

  /**
   * Adds the player to the specified game's players-array.
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}optS Options in the format of `iJoinGame`.
   */
  private JoinGame(playerSocket: SocketIO.Socket, optS: string): void {
    let opt: iJoinGame = undefined;

    try {
      opt = JSON.parse(optS);

      const game: iGame | undefined = this.GameSessions.Sessions.find(
        x => x.generalArguments.gameId == opt.gameId
      );

      if (game) {
        game
          .AddPlayer(opt.username, playerSocket, [PlayerRole.Player])
          .then((res: any) => {
            playerSocket.join(game.generalArguments.gameId);
            logger.log(
              "info",
              "Player %s joined game %s.",
              opt.username,
              game.generalArguments.gameId
            );
          })
          .catch((err: any) => {
            logger.log("info", "Error: " + err.message);
            playerSocket.emit("err");
          });
      } else {
        logger.log("info", "Game could not be found.");
      }
    } catch (err) {
      logger.log(
        "warn",
        "Error while parsing a 'join game' request: " + err.message
      );

      console.error(optS);

      playerSocket.emit(
        "err",
        JSON.stringify({
          event: "join game",
          error: "parse"
        })
      );
    }
  }

  /**
   * Handles the player's game action.
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}optS Options in the format of `iPlayerAction`.
   */
  private PlayerAction(playerSocket: SocketIO.Socket, optS: string): void {
    let opt: iPlayerAction = undefined;

    try {
      opt = JSON.parse(optS);

      for (let item of this.GameSessions.Sessions) {
        if (item.generalArguments.gameId == opt.gameId) {
          item.ProcessUserInput(
            opt.username,
            opt.msgType,
            JSON.stringify(opt.data)
          );
        }
      }
    } catch (err) {
      logger.log(
        "warn",
        "Error while parsing a 'player action' request: " + err.message
      );

      console.error(optS);

      playerSocket.emit(
        "error",
        JSON.stringify({
          event: "playeraction",
          error: "parse"
        })
      );
    }
  }

  /**
   * Configures the events for the QuestionQ gamemode.
   */
  private QuestionQConf(): void {
    this.QuestionQ.on("connection", (playerSocket: SocketIO.Socket) => {
      logger.log("info", "New user connected: %s", playerSocket.client.id);

      playerSocket.on("host game", (optS: string) => {
        this.HostGame(
          playerSocket,
          this.QuestionQ,
          optS,
          GModels.Gamemode.QuestionQ
        );
      });

      playerSocket.on("leave game", (optS: string) => {
        this.LeaveGame(playerSocket, optS);
      });

      playerSocket.on("start game", (optS: string) => {
        this.StartGame(playerSocket, optS);
      });

      playerSocket.on("join game", (optS: string) => {
        this.JoinGame(playerSocket, optS);
      });

      playerSocket.on("action", (optS: string) => {
        this.PlayerAction(playerSocket, optS);
      });
    });
  }

  /**
   * Configures the events for the determination gamemode.
   */
  private DeterminationConf(): void {
    this.Determination.on("connection", (playerSocket: SocketIO.Socket) => {
      logger.log("info", "New user connected: %s", playerSocket.client.id);
      playerSocket.on("host game", (optS: string) => {
        this.HostGame(
          playerSocket,
          this.Determination,
          optS,
          GModels.Gamemode.Determination
        );
      });

      playerSocket.on("join game", (optS: string) => {
        this.JoinGame(playerSocket, optS);
      });

      playerSocket.on("start game", (optS: string) => {
        this.StartGame(playerSocket, optS);
      });

      playerSocket.on("leave game", (optS: string) => {
        this.LeaveGame(playerSocket, optS);
      });

      playerSocket.on("action", (optS: string) => {
        this.PlayerAction(playerSocket, optS);
      });
    });
  }

  /**
   * Configures the events for the millionaire gamemode.
   */
  private MillionaireConf(): void {
    this.Millionaire.on("connection", (playerSocket: SocketIO.Socket) => {
      logger.log("info", "New user connected: %s", playerSocket.client.id);

      playerSocket.on("host game", (optS: string) => {
        this.HostGame(
          playerSocket,
          this.Millionaire,
          optS,
          GModels.Gamemode.Millionaire
        );
      });

      playerSocket.on("join game", (optS: string) => {
        this.JoinGame(playerSocket, optS);
      });

      playerSocket.on("start game", (optS: string) => {
        this.StartGame(playerSocket, optS);
      });

      playerSocket.on("leave game", (optS: string) => {
        this.LeaveGame(playerSocket, optS);
      });

      playerSocket.on("action", (optS: string) => {
        this.PlayerAction(playerSocket, optS);
      });
    });
  }

  /**
   * Configures the events for the duel gamemode.
   */
  private DuelConf(): void {
    this.Duel.on("connection", (playerSocket: SocketIO.Socket) => {
      logger.log("info", "New user connected: %s", playerSocket.client.id);

      playerSocket.on("host game", (optS: string) => {
        this.HostGame(playerSocket, this.Duel, optS, GModels.Gamemode.Duel);
      });

      playerSocket.on("join game", (optS: string) => {
        this.JoinGame(playerSocket, optS);
      });

      playerSocket.on("start game", (optS: string) => {
        this.StartGame(playerSocket, optS);
      });

      playerSocket.on("leave game", (optS: string) => {
        this.LeaveGame(playerSocket, optS);
      });

      playerSocket.on("action", (optS: string) => {
        this.PlayerAction(playerSocket, optS);
      });
    });
  }
}
