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
    //   this.DuelConf();
    //this.MillionaireConf();
  }

  /**
   *Creates the game by giving it an ID and adding it to the running games.
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}username The player's username.
   */
  private HostGame(
    playerSocket: SocketIO.Socket,
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
      this.GameFactory.CreateGame(args, this.QuestionQ)
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
      if (item.GeneralArguments.gameId == opt.gameId) {
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
  private StartGame(playerSocket: SocketIO.Socket, optS: string) {
    const opt: iStartGame = JSON.parse(optS);
    for (let item of this.GameSessions.Sessions) {
      if (item.GeneralArguments.gameId == opt.gameId) {
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

  /**
   * Adds the player to the specified game's players-array.
   * @param {SocketIO.Socket}playerSocket The player's SocketIO.Socket.
   * @param {string}optS Options in the format of `iJoinGame`.
   */
  private JoinGame(playerSocket: SocketIO.Socket, optS: string): void {
    const opt: iJoinGame = JSON.parse(optS);
    for (let item of this.GameSessions.Sessions) {
      if (item.GeneralArguments.gameId == opt.gameId) {
        try {
          item
            .AddPlayer(opt.username, playerSocket, PlayerRole.Player)
            .then((res: any) => {
              playerSocket.join(item.GeneralArguments.gameId);
              logger.log(
                "info",
                "Player %s joing game %s.",
                opt.username,
                item.GeneralArguments.gameId
              );
            })
            .catch((err: any) => {
              logger.log("info", "Error: " + err.message);
              playerSocket.emit("err");
            });
        } catch (err) {
          logger.error(err.message);
        }
      }
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
      if (item.GeneralArguments.gameId == msg.gameId) {
        item.ProcessUserInput(
          msg.username,
          msg.msgType,
          JSON.stringify(msg.data)
        );
      }
    }
  }

  /**
   * Configures the events for QuestionQ.
   */
  private QuestionQConf(): void {
    this.QuestionQ.on("connection", (playerSocket: SocketIO.Socket) => {
      logger.log("info", "New user connected: %s", playerSocket.client.id);

      playerSocket.on("host game", (username: string) => {
        this.HostGame(playerSocket, username, GModels.Gamemode.QuestionQ);
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
   * Sets up the events for the determination game.
   */
  private DeterminationConf(): void {
    this.Determination.on("connection", (playerSocket: SocketIO.Socket) => {
      playerSocket.on("host game", (username: string) => {
        this.HostGame(playerSocket, username, GModels.Gamemode.Determination);
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

  //   private MillionaireConf(): void {
  //     this.Millionaire.on("connection", (playerSocket: SocketIO.Socket) => {
  //       playerSocket.on("host game", (username: string) => {
  //         let gameId: string = this.InitGame.HostGame(playerSocket, {
  //           mode: "millionaire",
  //           owner: "alyei" //change
  //         });
  //         logger.log(
  //           "info",
  //           "New Millionaire session hosted. ID: %s, Owner: %s",
  //           gameId,
  //           username
  //         );
  //       });

  //       playerSocket.on("join game", (opt: IEvents.IJoinGame) => {
  //         for (let item of this.GameSessions.Sessions) {
  //           if (item.id == opt.gameId) {
  //             item.AddPlayer(opt.username, playerSocket);
  //           }
  //         }
  //       });

  //       playerSocket.on("tip", (arg: any) => {
  //         //on tip
  //       });

  //       playerSocket.on("joker", (arg: any) => {
  //         //joker
  //       });

  //       playerSocket.on("clue", (arg: any) => {
  //         //clue
  //       });
  //     });

  //     //place
  //   }

  //   private DuelConf(): void {
  //     this.Duel.on("connection", (playerSocket: SocketIO.Socket) => {
  //       playerSocket.on("host game", (username: string) => {
  //         let gameId: string = this.InitGame.HostGame(playerSocket, {
  //           mode: "duel",
  //           owner: "alyei" //change
  //         });
  //         logger.log(
  //           "info",
  //           "New Duel session hosted. ID: %s, Owner: %s",
  //           gameId,
  //           username
  //         );
  //       });

  //       playerSocket.on("join game", (opt: IEvents.IJoinGame) => {
  //         for (let item of this.GameSessions.Sessions) {
  //           if (item.id == opt.gameId) {
  //             item.AddPlayer(opt.username, playerSocket);
  //           }
  //         }
  //       });

  //       playerSocket.on("tip", (arg: any) => {
  //         //on tip
  //       });

  //       playerSocket.on("category", (arg: any) => {
  //         //category
  //       });

  //       playerSocket.on("difficulty", (arg: any) => {
  //         //difficulty
  //       });
  //     });
  //   }
}
