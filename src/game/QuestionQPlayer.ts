import { iQuestionQPlayerData, PlayerRole, PlayerState, iQuestionQQuestion, iQuestionQTipData } from "../models/GameModels";
import { PlayerBase, iPlayerBaseArguments } from "./PlayerBase";

export class QuestionQPlayer extends PlayerBase implements iQuestionQPlayerData {
    score: number;
    questions: [iQuestionQQuestion, string][];
    tips: iQuestionQTipData[];

    constructor(baseArguments: iPlayerBaseArguments) {
        super(baseArguments.username, baseArguments.socket, baseArguments.roles);
        //Object.setPrototypeOf(this, new.target.prototype);
        this.state = baseArguments.state;

        this.score = 0;
        this.questions = [];
        this.tips = [];
    }
}