import {
  MessageType,
  Gamemode,
  iGeneralHostArguments,
  iQuestionQHostArguments,
  iQuestionQGameData,
  iGeneralQuestion,
  iGeneralPlayerInputError,
  iQuestionQTip,
  GameAction,
  PlayerRole
} from "../models/GameModels";
import { logger } from "../server/logging";
import { QuestionModel } from "../models/Schemas";

// game modes
import { QuestionQCore } from "./QuestionQCore";
<<<<<<< HEAD
import { iGame } from "./iGame";
import { PlayerBase } from "./PlayerBase";
import { Socket } from "net";
=======
import { iGame, IPlayerSocket } from "./iGame";
import {
  PlayerCouldNotBeAddedError,
  QuestionCouldNotBeAddedError
} from "../server/Errors";
>>>>>>> 5ca87c38b72a3009ae48b2987a89e4ffb3d7a853

export class QuestionQGame implements iGame {
  private GameCore: QuestionQCore;

  //_send function to send JSONs to a specific player
  //_gameEnded function to be executed, when the game ended
  //users list of usernames UNIQUE
  //questions list of questions UNIQUE
  public constructor(
    readonly GeneralArguments:    iGeneralHostArguments,
    public namespace:             SocketIO.Namespace,
    private _gameCoreArguments?:  iQuestionQHostArguments
  ) {

    this.GameCore = new QuestionQCore(
      this.LogInfo,
      this.LogSilly,
      this.SendGameData,
      /*[
        {
          questionId: "1",
          question: "hi",
          pictureId: "123",
          answer: "hi",
          otherOptions: ["1", "2", "3", "4"],
          timeLimit: 21,
          difficulty: 4
        }
      ]*/
      this.LoadQuestions(),
      [],
      this._gameCoreArguments
    ); //this.LoadQuestions(), instead of object array
  }

  private LoadQuestions(): iGeneralQuestion[] {
    // get from mongodb with this.GeneralArguments.questionIds;
    let result: iGeneralQuestion[] = [];
    for (let qid of this.GeneralArguments.questionIds) {
      QuestionModel.findOne({ id: qid }, (err: any, question: any) => {
        if (err)
          return err;
        if (!question)
          return question;
        result.push({
          questionId: question.id,
          question: question.question,
          answer: question.answer,
          otherOptions: question.otherOptions,
          timeLimit: question.timeLimit,
          difficulty: question.difficulty,
          //explanation: question.explanation,
          //pictureId: question.pictureId
        });
      });;
    }// go git merge and love yaself

    return result;
  }

  /*
  public PerformAction(actionArguments: any): any {
    if ("gameAction" in actionArguments)
      switch (actionArguments.gameAction) {
        case GameAction.Start: {
          return this.GameCore.Start();
        }
        case GameAction.Stop: {
          return this.GameCore.Stop();
        }
        default: {
          return {
            message: "action not available for this gamemode",
            data: actionArguments
          };
        }
      }
    return { message: "invalid parameter", actionArguments };
  }
  */

  public ProcessUserInput(
    username: string,
    messageType: string /*msgType: MessageType*/,
    data: string
  ): void {
    const msgType: MessageType = (<any>MessageType)[messageType];
    switch (msgType) {
      case MessageType.QuestionQTip: {
        // try & catch !!!
        const tip: iQuestionQTip = JSON.parse(data);
        this.GameCore.PlayerGivesTip(username, tip);
        break;
      }
      default: {
        let errorMessage: iGeneralPlayerInputError = {
          message: "invalid message type",
          data: { username: username, msgType: msgType }
        };
        this.LogInfo(JSON.stringify(errorMessage));
        //this.SendToUser(username, MessageType.PlayerInputError, errorMessage);
        break;
      }
    }
  }

  public GetGameData(): [Gamemode, string] {
    const gameData: iQuestionQGameData = {
      gameId: this.GeneralArguments.gameId,
      players: this.GameCore.GetPlayerData()
    };

    return [this.GameCore.Gamemode, JSON.stringify(gameData)];
  }

  /**
   * Adds a user with their corresponding socket to the game's players array.
   * @function
   * @param username - The user's username.
   * @param socket - The user's socket. Access the id through `socket.id`
   * @returns The new players array.
   */
<<<<<<< HEAD
  public AddPlayer(username: string, socket: SocketIO.Socket, roles?: PlayerRole[]): boolean {
    return this.GameCore.AddUser(new PlayerBase(username, socket, roles));
=======
  public AddPlayer(username: string, socket: SocketIO.Socket): boolean {
    try {
      this.players.push({ username: username, socket: socket });
    } catch (e) {
      throw new PlayerCouldNotBeAddedError(username);
    } finally {
      return this.GameCore.AddUser(username);
    }
>>>>>>> 5ca87c38b72a3009ae48b2987a89e4ffb3d7a853
  }

  public AddQuestion(question: iGeneralQuestion): boolean {
    //return this.GameCore.AddQuestion(question);
    return false;
  }

  private LogInfo(toLog: string) {
    logger.log(
      "info",
      new Date().toString() +
        " - Game: " +
        this.GeneralArguments.gameId +
        " - " +
        toLog
    );
  }

  private LogSilly(toLog: string) {
    logger.log(
      "silly",
      new Date().toString() +
        " - Game: " +
        this.GeneralArguments.gameId +
        " - " +
        toLog
    );
  }

  /*
  private SendToRoom(messageType: MessageType, data: {}): void {
    this.namespace.to(this.GeneralArguments.gameId).emit(MessageType[messageType], JSON.stringify(data))
  }
  */
  // end (add save to DB)
  private SendGameData(): void {
    const gameData = JSON.parse(this.GetGameData()[1]);

    const players: PlayerBase[] = this.GameCore.Players;
    for (let player of players) {
      player.Inform(MessageType.QuestionQGameData, gameData);
    }
    //this.SendToRoom(MessageType.QuestionQGameData, gameData);
  }
}
