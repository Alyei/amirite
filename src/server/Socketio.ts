import * as socketio from "socket.io";
import { Server } from "http";
import { generateGameId } from "./Helper";
import { Game } from "../game/Game";
import { RunningQuestionQ } from "../game/rg_questionq";

export class io {
  public server: SocketIO.Server;
  public QuestionQ: SocketIO.Namespace;
  public QQInSess: RunningQuestionQ;

  constructor(app: any) {
    this.server = socketio.listen(app);
    this.QuestionQConf();
  }

  //On connection wird der Socket übergeben => Socket+Username in array speichern
  private QuestionQConf(): void {
    //Setting up QuestionQ namespace
    this.QuestionQ = this.server.of("/questionq");

    this.QuestionQ.on("connection", (socket: SocketIO.Socket) => {
      socket.on("host game", (args: string) => {
        let GameId: string = this.InitQQ(args, socket);
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
