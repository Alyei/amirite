export interface IGame {
  id: string;
  gamemode: string;
  owner: string;
  players: IPlayerSocket[];
  Socket: SocketIO.Namespace;
}

export interface IPlayerSocket {
  username: string;
  socket: SocketIO.Socket;
}
