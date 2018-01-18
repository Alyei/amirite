export interface IGame {
  id: string;
  gamemode: string;
  owner: string;
  players: IPlayerSocket[];
  socket: SocketIO.Namespace;

  AddPlayer(username: string, socket: SocketIO.Socket): IPlayerSocket[];
}

export interface IPlayerSocket {
  username: string;
  socket: SocketIO.Socket;
}
