import { iGeneralHostArguments, Gamemode, MessageType, iGeneralQuestion } from "../models/GameModels";

export interface iGame {
    GetGameData: () => [Gamemode, string];
    ProcessUserInput: (username: string, msgType: MessageType, data: string) => void;
    PerformAction: (actionArguments: any) => any;
}