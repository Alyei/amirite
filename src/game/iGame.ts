import {
  iGeneralHostArguments,
  Gamemode,
  MessageType,
  iGeneralQuestion
} from "../models/GameModels";

export interface iGame {
  //-id: string;
  //-gamemode: string;
  //-owner: string;
  //-players: IPlayerSocket[];
  //-socket: SocketIO.Namespace;

  //(+)players
  GetGameData: () => [Gamemode, string];
  ProcessUserInput: (
    username: string,
    msgType: string,
    data: string
  ) => any;
  //(-)PerformAction: (actionArguments: any) => any;
  AddPlayer: (username: string, socket: SocketIO.Socket) => any;
  namespace: SocketIO.Namespace;
  readonly GeneralArguments: iGeneralHostArguments;
}
