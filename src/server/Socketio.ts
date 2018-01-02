import * as socketio from "socket.io";
import { Server } from "http";
import { generateGameId } from "./Helper";
import { Game } from "../game/Game";

export class io {
  public server: SocketIO.Server;
  public QuestionQ: SocketIO.Namespace;
  public QQInSess: any;

  constructor(app: any) {
    this.server = socketio.listen(app);
    //Setting up QuestionQ namespace
    this.QuestionQ = this.server.of("/questionq");
    this.QuestionQConf();
  }

  //On connection wird der Socket übergeben => Socket+Username in array speichern
  private QuestionQConf(): void {
    this.QuestionQ.on("connection", (socket: SocketIO.Socket) => {
      socket.on("host game", (args: string) => {
        //Initialize game
        let GameId: string = this.InitQQ(args, socket);
        //Send back the new gameId (Probably only for testing purposes?)
        socket.emit("gameId", GameId);
      });
    });
  }

  private InitQQ(username: string, socket: SocketIO.Socket): string {
    let newGame: Game = new Game();
    newGame.AddPlayer(username, socket);
    this.QQInSess = new RunningQuestionQ(newGame);
    return newGame.id;
  }
}
