import * as socketio from "socket.io";
import { Server } from "http";
import { generateGameId } from "./Helper";
import { GameInit } from "./GameInit";
import { RunningGames } from "../game/RunningGames";
import { logger } from "./Logging";
import * as IEvents from "../models/IEvents";

export class io {
  public server: SocketIO.Server;
  public QuestionQ: SocketIO.Namespace;
  public Millionaire: SocketIO.Namespace;
  public Determination: SocketIO.Namespace;
  public TrivialPursuit: SocketIO.Namespace;
  public InitGame: GameInit;
  public GameSessions: RunningGames;

  constructor(app: any) {
    this.server = socketio.listen(app);
    //Setting up namespaces
    this.QuestionQ = this.server.of("/questionq");
    this.Millionaire = this.server.of("/millionaire");
    this.Determination = this.server.of("/determination");
    this.TrivialPursuit = this.server.of("/trivialpursuit");
    this.GameSessions = new RunningGames();
    this.InitGame = new GameInit(
      this.QuestionQ,
      this.Millionaire,
      this.Determination,
      this.TrivialPursuit,
      this.GameSessions
    );
    this.QuestionQConf();
    this.MillionaireConf();
  }

  //On connection wird der Socket übergeben => Socket+Username in array speichern
  private QuestionQConf(): void {
    this.QuestionQ.on("connection", (playerSocket: SocketIO.Socket) => {
      logger.log("info", "New user connected: %s", playerSocket.client.id);
      playerSocket.join("test room");

      playerSocket.on("host game", (username: string) => {
        let gameId: string = this.InitGame.HostGame(playerSocket, {
          mode: "questionq",
          owner: "alyei" //change to username
        });

        playerSocket.emit("gameid", gameId);
      });

      playerSocket.on("join game", (opt: IEvents.IJoinGame) => {});

      playerSocket.on("tip", (msg: object) => {});

      //Placeholder
    });
  }
  private MillionaireConf(): void {
    this.Millionaire.on("connection", (socket: SocketIO.Socket) => {
      socket.on("host game", (username: string) => {
        let gameId: string = this.InitGame.HostGame(socket, {
          mode: "millionaire",
          owner: "alyei" //change
        });
        logger.log(
          "info",
          "New Millionaire session hosted. ID: %s, Owner: %s",
          gameId,
          username
        );
      });
    });

    //place
  }
}
