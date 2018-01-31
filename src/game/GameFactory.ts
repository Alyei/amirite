import { iGeneralHostArguments, MessageType, iQuestionQHostArguments, Gamemode, iDeterminationHostArguments } from "../models/GameModels";
import { QuestionQGame } from "./QuestionQGame";
import { DeterminationGame } from "./DeterminationGame";

export class GameFactory {
    public CreateGame(
        generalArguments: iGeneralHostArguments,
        send: (gameId: string, username: string, msgType: MessageType, data: {}) => void,
        gameEnded: () => void,
        gameArguments?: iQuestionQHostArguments | iDeterminationHostArguments
    ) {
        switch (generalArguments.gamemode) {
            case Gamemode.QuestionQ: {
                return new QuestionQGame(generalArguments, send, gameEnded, gameArguments);
            }
            case Gamemode.Determination: {
                return new DeterminationGame(generalArguments, send, gameEnded, gameArguments);
            }
        }
    }
}