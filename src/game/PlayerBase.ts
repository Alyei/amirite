import { PlayerState, PlayerRole, MessageType, iQuestionQPlayerData } from "../models/GameModels";
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
  private ping: number;

  get Ping(): number { return this.ping; }

  /**
   * Initializes PlayerBase with the passed arguments.
   * @param username - defines the player's username
   * @param socket - the socket that is used to communicate with the player
   * @param role - optional
   */
  constructor(
    public username: string,
    protected socket: SocketIO.Socket,
    role?: PlayerRole[]
  ) {
    this.ping = 0;
    this.roles = role || [];

    this.state = PlayerState.Disqualified;
    if (this.roles.find(x => x == PlayerRole.Player))
      this.state = PlayerState.Launch;
  }

  /**
   * Uses the object's socket to emit the passed data with the message type as socket event.
   * @param messageType - socket event / data format
   * @param data - data
   * @returns - whether no error happened
   */
  public Inform(messageType: MessageType, data: {}): boolean {
    try {
      logger.log("silly", JSON.stringify(data));
      this.socket.emit(
        //MessageType[messageType]
        messageType.toString()
        /*.toLowerCase()*/,
        JSON.stringify(data)
      );

      return true;
    } catch (err) {
      logger.log("info", err.message); //Converting circular structure to JSONa
      return false;
    }
  }

  /**
   * Returns the arguments that have been passed to the object's constructor so it can be used to initialize inheriting objects.
   */
  public GetArguments(): iPlayerBaseArguments {
    return {
      username: this.username,
      socket: this.socket,
      roles: this.roles,
      state: this.state
    };
  }

  /**
   * Returns the current latency?
   */
  public GetPing(): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      this.socket.emit("click");
      let t0: number = performance.now();
      this.socket.on("clack", (res: any) => {
        let t1: number = performance.now();
        logger.log("silly", "Latency of %s: %s", this.username, t1 - t0);
        try {
          this.ping = t1 - t0;
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
