import { iGeneralHostArguments, MessageType, iQuestionQHostArguments, Gamemode } from "../models/GameModels";
import { QuestionQGame } from "./QuestionQGame";

export class GameFactory {
    public CreateGame(
        generalArguments: iGeneralHostArguments,
        send: (gameId: string, username: string, msgType: MessageType, data: {}) => void,
        gameEnded: () => void,
        gameArguments?: iQuestionQHostArguments
    ) {
        switch (generalArguments.gamemode) {
            case Gamemode.QuestionQ: {
                return new QuestionQGame(generalArguments, send, gameEnded, gameArguments);
            }
        }
    }
}