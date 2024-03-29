//#region imports
import {
  PlayerState,
  PlayerRole,
  MessageType,
  iQuestionQPlayerData,
  iQuestionQSaveGameData,
  iDeterminationGameData,
  iMillionaireGameData,
  iDuelEndGameData
} from "../models/GameModels";
import { logger } from "../server/logging";
import { UserModel, QuestionQGameDataModel, DeterminationGameDataModel, MillionaireGameDataModel, DuelGameDataModel } from "../models/Schemas";
import { GameDataManager } from "./GameDataManager";


//#endregion

//#region interfaces
/**
 * The iPlayerBaseArguments-interface contains all properties that are essential for each player.
 * @property username: string - the player's username
 * @property socket: SocketIO.Socket - the socket that is used to communicate with the player
 * @property roles: PlayerRole[] - the player's roles
 * @property state: PlayerState - the player's state
 */
export interface iPlayerBaseArguments {
  username: string;
  socket: SocketIO.Socket;
  roles: PlayerRole[];
  state: PlayerState;
}
//#endregion

//#region classes
/**
 * The PlayerBase-class provides provides all essential functions of a player.
 * @author Andrej Resanovic, Georg Schubbauer
 */
export class PlayerBase {
  //#region fields
  private ping: number;
  private pingArray: number[] = [];
  private pingIntervalTimer: any;
  private startTime: [number, number];
  private endTime: [number, number];
  private socketListener: any;
  //#endregion

  //#region properties
  /**
   * Getter for the current latency of the player in milliseconds
   */
  get Ping(): number {
    this.GetPingAverage();
    return this.ping;
  }

  /**
   * - indicates the player's state
   */
  public state: PlayerState;

  public performPing: boolean = false;
  //#endregion

  //#region constructors
  /**
   * Initializes a PlayerBase using the passed arguments
   * @param username - defines the player's username
   * @param socket - the socket that is used to communicate with the player
   * @param roles - roles the player has
   */
  constructor(
    public username: string,
    protected socket: SocketIO.Socket,
    public roles: PlayerRole[]
  ) {
    this.state = PlayerState.Spectating;

    // player
    if (this.roles.find(x => x == PlayerRole.Player) != undefined)
      this.state = PlayerState.Launch;
  }
  //#endregion

  //#region publicFunctions
  /**XXX
   * Saves the ID of a game the user participated in with the user's data in the database
   * @param gameId - the ID of the game the user participated in
   */
  public SaveGameId(gameId: string) {
    UserModel.find({ username: this.username }).
      then((res: any) => {
        if (res == undefined)
          return;
        let user: any;
        try { user = res[0] } catch {}
        if (user == undefined)
          return;

        let gameIds: string[];
        try { gameIds = user.gameIds; } catch {}
        if (gameIds == undefined)
          gameIds = [];

        if (gameIds.find(gId => gId == gameId) != undefined)
          return;
        
        gameIds.push(gameId);

        try { UserModel.remove({ username: this.username }); } catch {}

        user.gameIds = gameIds;
        const userModel: any = new UserModel(user);
        try { userModel.save()} catch {}
      });
  }

  /**
   * Loads the IDs of the games the user participated in and passes them to a callback
   * @param callback - the function that will be executed when the IDs are loaded
   */
  public GetGameIds(callback: (gameIds: string[]) => void) {
    UserModel.find({ username: this.username }).
      then((res: any) => {
        if (res == undefined)
          return;
        let user: any;
        try { user = res[0] } catch {}
        if (user == undefined)
          return;

        let gameIds: string[];
        try { gameIds = user.gameIds; } catch {}
        if (gameIds == undefined)
          gameIds = [];

        callback(gameIds);
      });
  }

  /**
   * Loads all the game data the user is permitted to receive and passes it to a callback
   * @param callback - the function that will be executed when the data has been loaded
   */
  public GetPermittedGameData(callback: (gameDataList: any[]) => void) {
    this.GetGameIds((gameIds: string[]) => {
      QuestionQGameDataModel.find({ gameId: { $in: gameIds }}).
      then((qRes: any) => {
        const gdm: GameDataManager = new GameDataManager();
        const permittedGameData: { gameData: any, playerData: any }[] = [];

        for (let qd of qRes) {
          try { permittedGameData.push(gdm.QQGetPermittedGameData(qd, this.username)); } catch {}
        }

        DeterminationGameDataModel.find({ gameId: { $in: gameIds }}).
        then((deRes: any) => {
          for (let qd of qRes) {
            try { permittedGameData.push(gdm.DeGetPermittedGameData(qd, this.username)); } catch {}
          }

          MillionaireGameDataModel.find({ gameId: { $in: gameIds }}).
          then((mRes: any) => {
            for (let qd of qRes) {
              try { permittedGameData.push(gdm.MiGetPermittedGameData(qd, this.username)); } catch {}
            }

            DuelGameDataModel.find({ gameId: { $in: gameIds }}).
            then((duRes: any) => {
              for (let qd of qRes) {
                try { permittedGameData.push(gdm.DuGetPermittedGameData(qd, this.username)); } catch {}
              }

              callback(permittedGameData);
            });
          });
        });
      });
    })
  }

  /**
   * Uses the object's socket to emit the passed data with the message type as socket event
   * @param messageType - socket event / data format
   * @param data - to be sent
   * @returns - whether no error happened
   */
  public Inform(messageType: MessageType, data: any): boolean {
    try {
      logger.log("silly", messageType.toString());
      logger.log("silly", JSON.stringify(data, null, 0));
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
   * Returns a new JSON containing the data essential for creating a subtype of PlayerBase
   * @returns - the arguments that have been passed to the object's constructor so it can be used to initialize inheriting objects
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
   * Starts the process of calculating the latency by adding the listener
   * for the `clack` event, setting `this.performPing` to true, and running
   * `this.GetPing()`.
   */
  public StartPing(): void {
    this.performPing = true;
    this.GetPing();
  }

  /**
   * Stops the process of calculating the latency by removing removing
   * the listener at `this.socketListener` and setting `this.performPing` to false.
   */
  public StopPing(): void {
    this.performPing = false;
  }
  //#endregion

  //#region privateFunctions
  /**
   * Starts the pingcheck to the client by reading the interval from `server.conf`, and creating
   * an intervalTimer for `this.PingLogic()` for the specified inter
   */
  private GetPing(): void {
    const interval: number = 2000; //Move to conf

    this.socket.on("clack", (res: any) => {
      this.OnClack();
    });
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
      console.log("click");
      this.startTime = process.hrtime();
    } else {
      global.clearInterval(this.pingIntervalTimer);
    }
  }

  /**
   * Takes the second timestamp, calculates `this.endTime-this.startTime` in nanoseconds
   * and pushes it to this.pingArray.
   */
  private OnClack(): any {
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
  //#endregion
}
//#endregion
