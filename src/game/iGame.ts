import {
  iGeneralHostArguments,
  Gamemode,
  MessageType,
  iGeneralQuestion
} from "../models/GameModels";

export interface IPlayerSocket {
  username: string;
  socket: SocketIO.Socket;
}

export interface iGame {
  //-id: string;
  //-gamemode: string;
  //-owner: string;
  //-players: IPlayerSocket[];
  //-socket: SocketIO.Namespace;

  //players
  //
  GetGameData: () => [Gamemode, string];
  ProcessUserInput: (
    username: string,
    msgType: MessageType,
    data: {}
  ) => void;
  PerformAction: (actionArguments: any) => any;
  AddPlayer: (username: string, socket: SocketIO.Socket) => any;
}
