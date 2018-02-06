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
import { iGame } from "./iGame";
import { PlayerBase } from "./PlayerBase";
import { Socket } from "net";
import {
  PlayerCouldNotBeAddedError,
  QuestionCouldNotBeAddedError
} from "../server/Errors";
import { Tryharder } from "./Tryharder";

export class QuestionQGame implements iGame {
  private GameCore: QuestionQCore;
  private Questions: iGeneralQuestion[];

  //_send function to send JSONs to a specific player
  //_gameEnded function to be executed, when the game ended
  //users list of usernames UNIQUE
  //questions list of questions UNIQUE
  public constructor(
    readonly GeneralArguments: iGeneralHostArguments,
    public namespace: SocketIO.Namespace,
    private _gameCoreArguments?: iQuestionQHostArguments
  ) {
    this.Questions = new Array<iGeneralQuestion>();
    this.LoadQuestions();
    this.GameCore = new QuestionQCore(
      this.GeneralArguments.gameId,
      this.LogInfo,
      this.LogSilly,
      this.Questions,
      [],
      this._gameCoreArguments
    );
  }

  private LoadQuestions(): iGeneralQuestion[] {
    // get from mongodb with this.GeneralArguments.questionIds;
    const result: iGeneralQuestion[] = [];
    for (let qid of this.GeneralArguments.questionIds) {
      QuestionModel.findOne({ id: qid }, (err: any, question: any) => {
        if (err) return err;
        if (!question) return question;
        this.Questions.push({
          questionId: question.id,
          question: question.question,
          answer: question.answer,
          otherOptions: question.otherOptions,
          timeLimit: question.timeLimit,
          difficulty: question.difficulty
          //explanation: question.explanation
          //pictureId: question.pictureId
        });
        console.log(this.Questions);
      });
    } // go git merge and love yaself
    console.log(this.Questions);
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
        try {
          this.GameCore.PlayerGivesTip(username, JSON.parse(data));
        } catch (err) {
          logger.log("info", err.message);
          //this.SendToUser(username, MessageType.PlayerInputError, errorMessage);
        }
        break;
      }
      default: {
        let errorMessage: iGeneralPlayerInputError = {
          message: "invalid message type",
          data: { username: username, msgType: msgType }
        };
        this.LogInfo(this.GameCore, JSON.stringify(errorMessage));
        //this.SendToUser(username, MessageType.PlayerInputError, errorMessage);
        break;
      }
    }
  }

  /**
   * Adds a user with their corresponding socket to the game's players array.
   * @param username - The user's username.
   * @param socket - The user's socket. Access the id through `socket.id`.
   * @returns Promise with the new players-array.
   */
  public AddPlayer(
    username: string,
    socket: SocketIO.Socket,
    roles?: PlayerRole[]
  ): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        resolve(this.GameCore.AddUser(new PlayerBase(username, socket, roles)));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Disqualifies the player from the game.
   * @param username The username of the player to be disqualified.
   * @returns Promise.
   */
  public RemovePlayer(username: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        resolve(this.GameCore.DisqualifyUser(username));
      } catch (err) {
        reject(err);
      }
    });
  }

  public StartGame(username: string): Promise<any> {
    return new Promise((resolve: any, reject: any) => {
      try {
        if (username == this.GeneralArguments.owner) {
          resolve(this.GameCore.Start());
        } else {
          reject(-1);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  public AddQuestion(question: iGeneralQuestion): boolean {
    //return this.GameCore.AddQuestion(question);
    return false;
  }

  private LogInfo(game: QuestionQCore, toLog: string) {
    logger.log("info", "Game: " + game.gameId + " - " + toLog);
  }

  private LogSilly(game: QuestionQCore, toLog: string) {
    logger.log("silly", "Game: " + game.gameId + " - " + toLog);
  }
}
