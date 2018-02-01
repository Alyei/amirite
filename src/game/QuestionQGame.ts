import {
  MessageType,
  Gamemode,
  iGeneralHostArguments,
  iQuestionQHostArguments,
  iQuestionQGameData,
  iGeneralQuestion,
  iGeneralPlayerInputError,
  iQuestionQTip,
  GameAction
} from "../models/GameModels";
import { logger } from "../server/logging";
import { QuestionModel } from "../models/Schemas";

// game modes
import { QuestionQCore } from "./QuestionQCore";
import { iGame, IPlayerSocket } from "./iGame";

export class QuestionQGame implements iGame {
  private GameCore: QuestionQCore;
  public id: string;
  public gamemode: string;
  public owner: string;
  public players: IPlayerSocket[];
  public socket: SocketIO.Namespace;

  //_send function to send JSONs to a specific player
  //_gameEnded function to be executed, when the game ended
  //users list of usernames UNIQUE
  //questions list of questions UNIQUE
  public constructor(
    readonly GeneralArguments: iGeneralHostArguments,
    public Send: (
      gameId: string,
      username: string,
      msgType: MessageType,
      data: {}
    ) => void,
    public GameEnded: () => void,
    public namespace: SocketIO.Namespace,
    private _gameCoreArguments?: iQuestionQHostArguments
  ) {
    this.socket = namespace;
    this.GameCore = new QuestionQCore(
      this.LogInfo,
      this.LogSilly,
      this.SendToUser,
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
      this.players,
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
    }

    return result;
  }

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

  public ProcessUserInput(
    username: string,
    msgType: MessageType,
    data: string
  ): void {
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
        this.SendToUser(username, MessageType.PlayerInputError, errorMessage);
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
  public AddPlayer(username: string, socket: SocketIO.Socket): boolean {
    this.players.push({ username: username, socket: socket });
    return this.GameCore.AddUser(username);
  }

  public AddQuestion(question: iGeneralQuestion): boolean {
    return this.GameCore.AddQuestion(question);
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

  private SendToUser(username: string, msgType: MessageType, data: {}): void {
    this.Send(this.GeneralArguments.gameId, username, msgType, data);
  }

  private SendGameData(): void {
    const gameData = JSON.parse(this.GetGameData()[1]);
    for (let player of gameData.players) {
      this.SendToUser(player.username, MessageType.QuestionQGameData, gameData);
    }
    this.GameEnded();
  }
}
