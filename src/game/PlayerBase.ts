import { PlayerState, PlayerRole, MessageType } from "../models/GameModels";
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
      this.socket.emit(
        MessageType[messageType] /*.toLowerCase()*/,
        JSON.stringify(data)
      );
      logger.log("info", JSON.stringify(data));
      return true;
    } catch (err) {
      logger.log("info", err.message);
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
}