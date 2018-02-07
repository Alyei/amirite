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
  private pingArray: number[];

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

    this.StartPing();
    this.state = PlayerState.Disqualified;
    if (this.roles.find(x => x == PlayerRole.Player))
      this.state = PlayerState.Launch;
  }

  /**
   * Uses the object's socket to emit the passed data with the message type as socket event.
   * @param messageType - socket event / data format
   * @param data - data
   * @returns - Whether an error has happened.
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
      logger.log("info", err.message); //Converting circular structure to JSONa
      return false;
    }
  }

  /**
   * @returns The arguments that have been passed to the object's constructor so it can be used to initialize inheriting objects.
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
   * Starts the pingcheck to the client, based on parameters in the server.conf.
   * `PingInitialPings, PingInitialInterval, PingStandardInterval`
   */
  private GetPing(): void {
    const initialPings: number = 5;
    const initialInterval: number = 2000; //Move to conf
    const standardInterval: number = 5000;
    let currentPing: number = 0;

    if (currentPing <= initialPings) {
      global.setInterval(this.CheckPingRun(currentPing), initialInterval);
    } else {
      global.setInterval(this.CheckPingRun(currentPing), standardInterval);
    }
  }

  private CheckPingRun(currentPing: number): any {
    if (this.performPing) {
      this.PingLogic(currentPing);
    }

    currentPing++;
  }

  private PingLogic(currentPing: number): void {
    let startTime: [number, number];
    let endTime: [number, number];
    this.socket.emit("click");
    startTime = process.hrtime();

    logger.log("silly", "Starting latency of %s: %s", this.username, startTime);

    this.socket.on("clack", (res: any) => {
      endTime = process.hrtime(startTime);
      logger.log("silly", "Ending latency of %s: %s", this.username, endTime);
      this.RefreshPingArray(endTime[1]);
    });
  }

  private RefreshPingArray(newTime: number): any {
    this.pingArray = [];

    if (this.pingArray.length <= 5) {
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
    this.ping = sum / this.pingArray.length;
  }

  public StartPing(): void {
    this.performPing = true;
    this.GetPing();
  }

  public StopPing(): void {
    this.performPing = false;
  }
}
