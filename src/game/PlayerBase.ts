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
  private ping: number;
  public performPing: boolean = false;
  private pingArray: number[] = [];
  private pingIntervalTimer: any;
  private startTime: [number, number];
  private endTime: [number, number];
  private socketListener: any;

  get Ping(): number {
    this.GetPingAverage();
    return this.ping;
  }

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
        messageType.toString(),
        /*.toLowerCase()*/ JSON.stringify(data)
      );

      return true;
    } catch (err) {
      logger.log("info", err.message);
      return false;
    }
  }

  /**
   * @return The arguments that have been passed to the object's constructor so it can be used to initialize inheriting objects.
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
   * Starts the pingcheck to the client by reading the interval from `server.conf`, and creating
   * an intervalTimer for `this.PingLogic()` for the specified inter
   */
  private GetPing(): void {
    const interval: number = 2000; //Move to conf

    this.pingIntervalTimer = global.setInterval(
      this.PingLogic.bind(this),
      interval
    );
  }

  /**
   * Checks if `this.performPing` is true. If yes, it sends the `click` event to the client
   * and starts the timer. If not, it clears the intervalTimer at `this.pingIntervalTimer`.
   * @param obj Binds `this` to `this.Pinglogic` so it can access the field variables.
   */
  private PingLogic(obj: any): void {
    if (this.performPing) {
      this.socket.emit("click");
      this.startTime = process.hrtime();
    } else {
      global.clearInterval(this.pingIntervalTimer);
    }
  }

  /**
   * Takes the second timestamp, calculates `this.endTime-this.startTime` in nanoseconds
   * and pushes it to this.pingArray.
   */
  private OnClack(): void {
    this.endTime = process.hrtime(this.startTime);
    this.RefreshPingArray(this.endTime[1]);
  }

  /**
   *Pushes the new time to `this.pingArray`, which holds a maximum of 5 times.
   * @param newTime The new time to add to the array in nanoseconds.
   */
  private RefreshPingArray(newTime: number): any {
    if (this.pingArray.length < 5) {
      this.pingArray.push(newTime);
    } else {
      this.pingArray.shift();
      this.pingArray.push(newTime);
    }
  }

  /**
   * Sets `this.ping` to the average of the last 5 pings in milliseconds.
   */
  private GetPingAverage(): any {
    let sum: number = 0;
    for (let i = 0; i < this.pingArray.length; i++) {
      sum += this.pingArray[i];
    }
    if (this.pingArray.length > 0) {
      this.ping = Math.floor(sum / this.pingArray.length / 1000000);
    } else {
      this.ping = 0;
    }
  }

  /**
   * Starts the process of calculating the latency by adding the listener
   * for the `clack` event, setting `this.performPing` to true, and running
   * `this.GetPing()`.
   */
  public StartPing(): void {
    this.socketListener = this.socket.on("clack", (res: any) => {
      this.OnClack();
    });
    this.performPing = true;
    this.GetPing();
  }

  /**
   * Stops the process of calculating the latency by removing removing
   * the listener at `this.socketListener` and setting `this.performPing` to false.
   */
  public StopPing(): void {
    this.socket.removeListener("listener removed", this.socketListener);
    this.performPing = false;
  }
}
