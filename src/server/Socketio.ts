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
  iQuestionQTip
} from "../models/GameModels";
import * as GModels from "../models/GameModels";

export class io {
  public server: SocketIO.Server;
  public QuestionQ: SocketIO.Namespace;
  public Millionaire: SocketIO.Namespace;
  public Determination: SocketIO.Namespace;
  public TrivialPursuit: SocketIO.Namespace;
  public Duel: SocketIO.Namespace;
  public GameSessions: RunningGames;
  public GameFactory: GameFactory;
  public PlayerComm: PlayerCommunication;

  constructor(app: any) {
    this.server = socketio.listen(app);
    //Setting up namespaces
    this.QuestionQ = this.server.of("/questionq");
    this.Millionaire = this.server.of("/millionaire");
    this.Determination = this.server.of("/determination");
    this.TrivialPursuit = this.server.of("/trivialpursuit");
    this.Duel = this.server.of("/duel");

    this.GameSessions = new RunningGames();
    this.GameFactory = new GameFactory(this.GameSessions);
    this.PlayerComm = new PlayerCommunication(this.GameSessions);
    //   this.InitGame = new GameInit(
    //     this.QuestionQ,
    //     this.Millionaire,
    //     this.Determination,
    //     this.TrivialPursuit,
    //     this.Duel,
    //     this.GameSessions
    //   );
    this.QuestionQConf();
    //   this.MillionaireConf();
    //   this.DuelConf();
    //   this.DeterminationConf();
    //   this.TrivialPursuitConf();
    // }
  }

  //On connection wird der Socket übergeben => Socket+Username in array speichern
  private QuestionQConf(): void {
    this.QuestionQ.on("connection", (playerSocket: SocketIO.Socket) => {
      logger.log("info", "New user connected: %s", playerSocket.client.id);
      playerSocket.join("test room");

      playerSocket.on("host game", (username: string) => {
        const args: iGeneralHostArguments = {
          gameId: generateGameId(),
          gamemode: GModels.Gamemode.QuestionQ,
          owner: username,
          questionIds: ["1234567890"]
        };

        this.GameFactory.CreateGame(args, this.QuestionQ);

        playerSocket.emit("gameid", args.gameId);
      });

      playerSocket.on("leave game", (opt: iLeaveGame) => {
        for (let item of this.GameSessions.Sessions) {
          if (item.GeneralArguments.gameId == opt.gameId) {
            item
              .RemovePlayer(opt.username)
              .then((res: any) => {
                playerSocket.emit("success");
              })
              .catch((err: any) => {
                logger.log("info", err.message);
                playerSocket.emit("error");
              });
          }
        }
      });

      playerSocket.on("start game", (optS: string) => {
        const opt: iStartGame = JSON.parse(optS);
        for (let item of this.GameSessions.Sessions) {
          if (item.GeneralArguments.gameId == opt.gameId) {
            item
              .StartGame(opt.username)
              .then((res: any) => {
                logger.log("info", "Game %s started.", opt.gameId);
                playerSocket.emit("success");
              })
              .catch((err: any) => {
                if (err == -1) {
                  logger.log("info", "Non-owner tried to launch a game");
                  playerSocket.emit("error", "permission denied");
                } else {
                  logger.log(
                    "info",
                    "Something went wrong while starting game %s: " +
                      err.message,
                    opt.gameId
                  );
                  playerSocket.emit("error");
                }
              });
          } else {
            logger.log("info", "Can't start game %s. It doesn't exist.");
            playerSocket.emit("error");
          }
        }
      });

      playerSocket.on("join game", (opt: iJoinGame) => {
        for (let item of this.GameSessions.Sessions) {
          if (item.GeneralArguments.gameId == opt.gameId) {
            try {
              item
                .AddPlayer(opt.username, playerSocket)
                .then((res: any) => {
                  playerSocket.join(item.GeneralArguments.gameId);
                })
                .catch((err: any) => {
                  logger.log("info", "Error: " + err.message);
                  playerSocket.emit("error");
                });
            } catch (err) {
              logger.error(err.message);
              playerSocket.emit("error");
            }
          }
        }
      });

      playerSocket.on("action", (msgS: string) => {
        const msg: iPlayerAction = JSON.parse(msgS);
        for (let item of this.GameSessions.Sessions) {
          if (item.GeneralArguments.gameId == msg.gameId) {
            item.ProcessUserInput(msg.username, msg.msgType, msg.data);
          }
        }
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

  //   private DeterminationConf(): void {
  //     this.Determination.on("connection", (playerSocket: SocketIO.Socket) => {
  //       playerSocket.on("host game", (username: string) => {
  //         let gameId: string = this.InitGame.HostGame(playerSocket, {
  //           mode: "determination",
  //           owner: "alyei" //change
  //         });
  //         logger.log(
  //           "info",
  //           "New Determination session hosted. ID: %s, Owner: %s",
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
  //     });
  //   }

  //   private TrivialPursuitConf(): void {
  //     this.TrivialPursuit.on("connection", (playerSocket: SocketIO.Socket) => {
  //       playerSocket.on("host game", (username: string) => {
  //         let gameId: string = this.InitGame.HostGame(playerSocket, {
  //           mode: "trivial pursuit",
  //           owner: "alyei" //change
  //         });
  //         logger.log(
  //           "info",
  //           "New Trivial Pursuit session hosted. ID: %s, Owner: %s",
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
  //     });
  //   }
}
