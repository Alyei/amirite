// import {
//   MessageType,
//   Gamemode,
//   iGeneralHostArguments,
//   iDeterminationHostArguments,
//   iGeneralQuestion,
//   iGeneralPlayerInputError,
//   GameAction,
//   iDeterminationGameData,
//   iDeterminationTip
// } from "../models/GameModels";
// import { logger } from "../server/logging";

// // game modes
// import { DeterminationCore } from "./DeterminationCore";
// import { iGame } from "./iGame";

// export class DeterminationGame implements iGame {
//   private GameCore: DeterminationCore;

//   //_send function to send JSONs to a specific player
//   //_gameEnded function to be executed, when the game ended
//   //users list of usernames UNIQUE
//   //questions list of questions UNIQUE
//   public constructor(
//     readonly GeneralArguments: iGeneralHostArguments,
//     public Send: (
//       gameId: string,
//       username: string,
//       msgType: MessageType,
//       data: {}
//     ) => void,
//     public GameEnded: () => void,
//     private _gameCoreArguments?: iDeterminationHostArguments
//   ) {
//     this.GameCore = new DeterminationCore(
//       this.LogInfo,
//       this.LogSilly,
//       this.SendToUser,
//       this.SendGameData,
//       [
//         {
//           questionId: "1",
//           question: "hi",
//           pictureId: "123",
//           answer: "hi",
//           otherOptions: ["1", "2", "3", "4"],
//           timeLimit: 21,
//           difficulty: 4
//         }
//       ],
//       //this.LoadQuestions(),
//       this.GeneralArguments.usernames,
//       this._gameCoreArguments
//     );
//   }

//   // private LoadQuestions(): iGeneralQuestion[] {
//   //     //get from mongodb with this.GeneralArguments.questionIds;
//   // }

//   public PerformAction(actionArguments: any): any {
//     if ("gameAction" in actionArguments)
//       switch (actionArguments.gameAction) {
//         case GameAction.Start: {
//           return this.GameCore.Start();
//         }
//         case GameAction.Stop: {
//           return this.GameCore.Stop();
//         }
//         default: {
//           return {
//             message: "action not available for this gamemode",
//             data: actionArguments
//           };
//         }
//       }
//     return { message: "invalid parameter", actionArguments };
//   }

//   public ProcessUserInput(
//     username: string,
//     msgType: MessageType,
//     data: string
//   ): void {
//     switch (msgType) {
//       case MessageType.DeterminationTip: {
//         // try & catch !!!
//         const tip: iDeterminationTip = JSON.parse(data);
//         this.GameCore.PlayerGivesTip(username, tip);
//         break;
//       }
//       default: {
//         let errorMessage: iGeneralPlayerInputError = {
//           message: "invalid message type",
//           data: { username: username, msgType: msgType }
//         };
//         this.LogInfo(JSON.stringify(errorMessage));
//         this.SendToUser(username, MessageType.PlayerInputError, errorMessage);
//         break;
//       }
//     }
//   }

//   public GetGameData(): [Gamemode, string] {
//     const gameData: iDeterminationGameData = {
//       gameId: this.GeneralArguments.gameId,
//       players: this.GameCore.GetPlayerData()
//     };

//     return [this.GameCore.Gamemode, JSON.stringify(gameData)];
//   }

//   public AddUser(username: string): boolean {
//     return this.GameCore.AddUser(username);
//   }

//   public AddQuestion(question: iGeneralQuestion): boolean {
//     return this.GameCore.AddQuestion(question);
//   }

//   private LogInfo(toLog: string) {
//     logger.log(
//       "info",
//       new Date().toString() +
//         " - Game: " +
//         this.GeneralArguments.gameId +
//         " - " +
//         toLog
//     );
//   }

//   private LogSilly(toLog: string) {
//     logger.log(
//       "silly",
//       new Date().toString() +
//         " - Game: " +
//         this.GeneralArguments.gameId +
//         " - " +
//         toLog
//     );
//   }

//   private SendToUser(username: string, msgType: MessageType, data: {}): void {
//     this.Send(this.GeneralArguments.gameId, username, msgType, data);
//   }

//   private SendGameData(): void {
//     const gameData = JSON.parse(this.GetGameData()[1]);
//     for (let player of gameData.players) {
//       this.SendToUser(player.username, MessageType.QuestionQGameData, gameData);
//     }
//     this.GameEnded();
//   }
// }
