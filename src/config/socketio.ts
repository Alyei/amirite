import * as socketio from "socket.io";
import { Server } from "http";

export class io {
  private socket: SocketIO.Server;

  constructor(app: any) {
    this.socket = socketio(app);
    this.Setup();
  }

  Setup(): void {
    this.socket.on("connection", (socket: SocketIO.Client) => {
      console.log("%s has connected: %s", socket.id, socket.request);
    });
  }
}
