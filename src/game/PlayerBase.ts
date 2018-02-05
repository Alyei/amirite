import { PlayerState, PlayerRole, MessageType } from "../models/GameModels";

export interface iPlayerBaseArguments {
    username: string;
    socket: SocketIO.Socket;
    roles: PlayerRole[];
    state: PlayerState;
}

export class PlayerBase {
    public roles:   PlayerRole[];
    public state:   PlayerState;

    constructor(
        public username:    string,
        protected socket:   SocketIO.Socket,
        role?: PlayerRole[]
    ) {
        this.roles = role || [];
        
        this.state = PlayerState.Disqualified;
        if (this.roles.find(x => x == PlayerRole.Player))
            this.state = PlayerState.Launch;
    }

    public Inform(messageType: MessageType, data: {}): void {
        this.socket.emit(MessageType[messageType]/*.toLowerCase()*/, JSON.stringify(data));
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