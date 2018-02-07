import {
  PlayerState,
  PlayerRole,
  MessageType,
  iQuestionQPlayerData
} from "../models/GameModels";
import { logger } from "../server/logging";

export interface iPlayerBaseArguments {
  username: string;
  socket: SocketIO.Socket;
  roles: PlayerRole[];
  state: PlayerState;
}

export class PlayerBase {
  public roles: PlayerRole[];
  public state: PlayerState;

  constructor(
    public username: string,
    protected socket: SocketIO.Socket,
    role?: PlayerRole[]
  ) {
    this.roles = role || [];

    this.state = PlayerState.Disqualified;
    if (this.roles.find(x => x == PlayerRole.Player))
      this.state = PlayerState.Launch;
  }

  public Inform(messageType: MessageType, data: {}): boolean {
    try {
      logger.log("silly", JSON.stringify(data));
      this.socket.emit(
        MessageType[messageType] /*.toLowerCase()*/,
        JSON.stringify(data)
      );

      return true;
    } catch (err) {
      logger.log("info", err.message); //Converting circular structure to JSONa
      return false;
    }
  }

  public GetArguments(): iPlayerBaseArguments {
    return {
      username: this.username,
      socket: this.socket,
      roles: this.roles,
      state: this.state
    };
  }

  public GetPing(): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this.socket.emit("click");
      let t0: number = performance.now();
      this.socket.on("clack", (res: any) => {
        let t1: number = performance.now();
        logger.log("silly", "Latency of %s: %s", this.username, t1 - t0);
        try {
          resolve(t1 - t0);
        } catch (err) {
          logger.log(
            "info",
            "Something went wrong during the latencycheck: %s",
            err.message
          );
        }
      });
    });
  }
}
