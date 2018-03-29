import * as socketio from "socket.io";
import { Server } from "http";
import { generateGameId } from "./Helper";
import { RunningGames } from "../game/RunningGames";
import { logger } from "./Logging";
import { GameFactory } from "../game/GameFactory";
import { PlayerCommunication } from "./PlayerCom";
import {
  iGeneralHostArguments,
  iPlayerAction,
  iJoinGame,
  iLeaveGame,
  iStartGame,
  iQuestionQTip,
  PlayerRole
} from "../models/GameModels";
import * as GModels from "../models/GameModels";
import { iGame } from "../game/iGame";
import { ENOSTR } from "constants";

export class io {
  public server: SocketIO.Server;
  public QuestionQ: SocketIO.Namespace;
  public Millionaire: SocketIO.Namespace;
  public Determination: SocketIO.Namespace;
  public Duel: SocketIO.Namespace;
  public GameSessions: RunningGames;
  public GameFactory: GameFactory;
  public PlayerComm: PlayerCommunication;

  constructor(
    app: any,
    sessions: RunningGames,
    factory: GameFactory,
    playercom: PlayerCommunication
  ) {
    this.server = socketio.listen(app);
    //Setting up namespaces
    this.QuestionQ = this.server.of("/questionq");
    this.Millionaire = this.server.of("/millionaire");
    this.Determination = this.server.of("/determination");
    this.Duel = this.server.of("/duel");

    this.GameSessions = sessions;
    this.GameFactory = factory;
    this.PlayerComm = playercom;
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
    username: string,
    gamemode: GModels.Gamemode
  ): void {
    let args: iGeneralHostArguments = {
      gameId: generateGameId(),
      gamemode: gamemode,
      owner: username,
      ownerSocket: playerSocket,
      questionIds: ["1234567890", "YxUy07SElM"]
    };
    try {
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
      logger.log("info", err);
      playerSocket.emit("err");
    }
  }

  /**
   * Disqualifies the user from the specified game.
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}optS Options in the format of `iLeaveGame`.
   */
  private LeaveGame(playerSocket: SocketIO.Socket, optS: string) {
    const opt: iLeaveGame = JSON.parse(optS);
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
  }

  /**
   * Starts the specified game by changing it's status to running (Phase 1).
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}optS Options in the format of `iStartGame`.
   */
  private StartGame(playerSocket: SocketIO.Socket, optS: any) {
    let opt: iStartGame;
    console.log(optS);
    if (typeof optS === "string") {
      opt = JSON.parse(optS);
    } else {
      opt = optS;
    }
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
  }

  private ParseOptions(optS: any): iJoinGame {
    let options: iJoinGame;
    if (typeof optS === "string") {
      try {
        options = JSON.parse(optS);
      } catch (e) {
        throw new Error("Could not parse options.");
      }
    } else {
      options = optS;
    }

    return options;
  }

  /**
   * Adds the player to the specified game's players-array.
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}optS Options in the format of `iJoinGame`.
   */
  private JoinGame(playerSocket: SocketIO.Socket, optS: any): void {
    let opt: iJoinGame = this.ParseOptions(optS);

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
  }

  /**
   * Handles the player's game action.
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}optS Options in the format of `iPlayerAction`.
   */
  private PlayerAction(playerSocket: SocketIO.Socket, msgS: string): void {
    const msg: iPlayerAction = JSON.parse(msgS);
    console.log(msgS);
    for (let item of this.GameSessions.Sessions) {
      if (item.generalArguments.gameId == msg.gameId) {
        item.ProcessUserInput(
          msg.username,
          msg.msgType,
          JSON.stringify(msg.data)
        );
      }
    }
  }

  /**
   * Configures the events for the QuestionQ gamemode.
   */
  private QuestionQConf(): void {
    this.QuestionQ.on("connection of", (playerSocket: SocketIO.Socket) => {
      logger.log("info", "New user connected: %s", playerSocket.client.id);

      playerSocket.on("host game", (username: string) => {
        this.HostGame(
          playerSocket,
          this.QuestionQ,
          username,
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
      playerSocket.on("host game", (username: string) => {
        this.HostGame(
          playerSocket,
          this.Determination,
          username,
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
        const opt: any = JSON.parse(optS);
        this.HostGame(
          playerSocket,
          this.Millionaire,
          opt.GeneralArgs.username,
          GModels.Gamemode.Millionaire
        );
      });

      playerSocket.on("join game", (optS: string) => {
        const opt: any = JSON.parse(optS);
        this.JoinGame(playerSocket, opt);
      });

      playerSocket.on("start game", (optS: string) => {
        console.log(optS);
        const opt: any = JSON.parse(optS);
        this.StartGame(playerSocket, opt);
      });

      playerSocket.on("leave game", (optS: string) => {
        const opt: any = JSON.parse(optS);
        this.LeaveGame(playerSocket, opt);
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
        const opt: any = JSON.parse(optS);
        this.HostGame(
          playerSocket,
          this.Duel,
          opt.GeneralArgs.username,
          GModels.Gamemode.Duel
        );
      });

      playerSocket.on("join game", (optS: string) => {
        console.log(optS);
        const opt: any = JSON.parse(optS);
        this.JoinGame(playerSocket, opt);
      });

      playerSocket.on("start game", (optS: string) => {
        const opt: any = JSON.parse(optS);
        this.StartGame(playerSocket, opt);
      });

      playerSocket.on("leave game", (optS: string) => {
        const opt: any = JSON.parse(optS);
        this.LeaveGame(playerSocket, opt);
      });

      playerSocket.on("action", (optS: string) => {
        this.PlayerAction(playerSocket, optS);
      });
    });
  }
}
