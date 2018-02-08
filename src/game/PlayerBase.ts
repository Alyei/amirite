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
<<<<<<< HEAD
  public performPing: boolean = false;
  private pingArray: number[] = [];
  private pingIntervalTimer: any;
  private startTime: [number, number];
  private endTime: [number, number];
=======
>>>>>>> origin/gs_pingCheck

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
      logger.log("info", err.message);
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
   * Starts the pingcheck to the client, settings in server.conf.
   * `PingInterval`
   */
  private GetPing(): void {
    console.log("GetPing()");
    const interval: number = 2000; //Move to conf

    this.pingIntervalTimer = global.setInterval(
      this.PingLogic.bind(this),
      interval
    );
  }

  private PingLogic(obj: any): void {
    if (this.performPing) {
      this.socket.emit("click");
      this.startTime = process.hrtime();
    } else {
      global.clearInterval(this.pingIntervalTimer);
    }
  }

  private OnClack(): void {
    console.log("Starttime: " + this.startTime);
    this.endTime = process.hrtime(this.startTime);
    logger.log(
      "silly",
      "Ending latency of %s: %s",
      this.username,
      this.endTime
    );
    this.RefreshPingArray(this.endTime[1]);
    this.GetPingAverage();
    console.log("Average: " + this.ping);
  }

  private RefreshPingArray(newTime: number): any {
    if (this.pingArray.length < 5) {
      this.pingArray.push(newTime);
    } else {
      this.pingArray.shift();
      this.pingArray.push(newTime);
    }
  }

  private GetPingAverage(): any {
    let sum: number = 0;
    for (let i = 0; i < this.pingArray.length; i++) {
      sum += this.pingArray[i];
    }
    console.log("Array length: " + this.pingArray.length);
    this.ping = Math.floor(sum / this.pingArray.length);
  }

  private listener: any;
  public StartPing(): void {
    this.listener = this.socket.on("clack", (res: any) => {
      this.OnClack();
    });
    this.performPing = true;
    this.GetPing();
  }

  public StopPing(): void {
    this.socket.removeListener("listener removed", this.listener);
    this.performPing = false;
  }
}
