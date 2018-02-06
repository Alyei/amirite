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

  //_send function to send JSONs to a specific player
  //_gameEnded function to be executed, when the game ended
  //users list of usernames UNIQUE
  //questions list of questions UNIQUE
  public constructor(
    readonly GeneralArguments: iGeneralHostArguments,
    public namespace: SocketIO.Namespace,
    private _gameCoreArguments?: iQuestionQHostArguments
  ) {
    this.GameCore = new QuestionQCore(
      this.LogInfo,
      this.LogSilly,
      this.SendGameData,
      this.LoadQuestions(),
      [],
      this._gameCoreArguments
    );
  }

  private LoadQuestions(): iGeneralQuestion[] {
    // get from mongodb with this.GeneralArguments.questionIds;
    let result: iGeneralQuestion[] = [];
    for (let qid of this.GeneralArguments.questionIds) {
      QuestionModel.findOne({ id: qid }, (err: any, question: any) => {
        if (err) return err;
        if (!question) return question;
        result.push({
          questionId: question.id,
          question: question.question,
          answer: question.answer,
          otherOptions: question.otherOptions,
          timeLimit: question.timeLimit,
          difficulty: question.difficulty
          //explanation: question.explanation,
          //pictureId: question.pictureId
        });
      });
    } // go git merge and love yaself

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
    data: iQuestionQTip
  ): void {
    const msgType: MessageType = (<any>MessageType)[messageType];
    switch (msgType) {
      case MessageType.QuestionQTip: {
        try {
          console.log(data.questionId);
          console.log(data.answerId);
          this.GameCore.PlayerGivesTip(username, data);
        } catch (err) {
          let errorMessage: iGeneralPlayerInputError = {
            message: "Giving tip failed.",
            data: { username: username, msgType: msgType }
          };
          this.LogInfo(err.message);
          //this.SendToUser(username, MessageType.PlayerInputError, errorMessage);
        }
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

  private LogInfo(toLog: string) {
    logger.log(
      "info",
        "Game: " +
        this.GeneralArguments.gameId +
        " - " +
        toLog
    );
  }

  private LogSilly(toLog: string) {
    logger.log(
      "silly",
        "Game: " +
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
    const th: Tryharder = new Tryharder();
    for (let player of players) {
      if (
        !th.Tryhard(
          () => {
            return player.Inform(MessageType.QuestionQGameData, gameData);
          },
          3000, // delay
          3 // tries
        )
      ) {
        this.GameCore.DisqualifyPlayer(player);
        return;
      }
    }
    //this.SendToRoom(MessageType.QuestionQGameData, gameData);
  }
}
