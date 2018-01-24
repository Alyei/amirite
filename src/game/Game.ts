import { MessageType, Gamemode, iGeneralHostArguments, iQuestionQHostArguments, iQuestionQGameData } from "../models/GameModels";
import { logger } from "../server/logging";

// game modes
import { QuestionQ } from "./QuestionQ";

export class Game {
    private GameQuestionQ: QuestionQ;

    //_send function to send JSONs to a specific player
    //_gameEnded function to be executed, when the game ended
    //users list of usernames UNIQUE
    //questions list of questions UNIQUE
    public constructor(
        readonly GeneralArguments: iGeneralHostArguments,
        private _questionQArguments?: iQuestionQHostArguments
    ) {
        switch(this.GeneralArguments.gamemode) {
            case Gamemode.QuestionQ: {
                if (!_questionQArguments)
                    _questionQArguments = {

                    };
                if (!_questionQArguments.usernames)
                    _questionQArguments.usernames = GeneralArguments.usernames;
                if (!_questionQArguments.questions)
                    _questionQArguments.questions = GeneralArguments.questions;
                _questionQArguments.send = this.SendToUser;
                _questionQArguments.gameEnded = this.SendGameData;
                _questionQArguments.logInfo = this.LogInfo;
                _questionQArguments.logSilly = this.LogSilly;
                this.GameQuestionQ = new QuestionQ(_questionQArguments);
                break;
            }
            default: {
                //throw exception
                break;
            }
        }
        
    }

    private LogInfo(toLog: string) {
        logger.LogInfo((new Date()).toString() + " - Game: " + this.GeneralArguments.gameId + " - " + toLog);
    }

    private LogSilly(toLog: string) {
        logger.LogSilly((new Date()).toString() + " - Game: " + this.GeneralArguments.gameId + " - " + toLog);
    }

    private SendToUser(username: string, msgType: MessageType, data: {}): void {
        this.GeneralArguments.send(this.GeneralArguments.gameId, username, msgType, data);
    }

    private SendGameData(): void {
        switch (this.GeneralArguments.gamemode)
        {
            case Gamemode.QuestionQ: {
                const gameData: iQuestionQGameData = {
                    "gameId": this.GeneralArguments.gameId,
                    "players": this.GameQuestionQ.GetPlayerData()
                };
                for (let player of gameData.players) {
                    this.SendToUser(player.username, MessageType.GameData, gameData);
                }
                break;
            }
        }
    }
}