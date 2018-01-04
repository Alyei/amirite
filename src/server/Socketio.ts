import * as socketio from "socket.io";
import { Server } from "http";
import { generateGameId } from "./Helper";
import { GameInit } from "./GameInit";
import { RunningGames } from "../game/RunningGames";
import { logger } from "./Logging";

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
    //Setting up QuestionQ namespace
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
    this.QuestionQ.on("connection", (socket: SocketIO.Socket) => {
      socket.on("host game", (username: string) => {
        let gameId: string = this.InitGame.HostQuestionQ(socket, username);
        logger.log(
          "info",
          "New QuestionQ session hosted. ID: %s, Owner: %s",
          gameId,
          username
        );
      });

      socket.on("join game", (username: string) => {});

      //Placeholder
    });
  }
  private MillionaireConf(): void {
    this.Millionaire.on("connection", (socket: SocketIO.Socket) => {
      socket.on("host game", (username: string) => {
        let gameId: string = this.InitGame.HostMillionaire(socket, username);
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
