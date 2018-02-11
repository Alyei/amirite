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

    get LatestQuestion(): [iQuestionQQuestion, string] | undefined {
        if (this.questions.length > 0)
            return this.questions[this.questions.length - 1];
    }

    public GetPlayerData(): iQuestionQPlayerData {
      return {
        username: this.username,
        roles: this.roles,
        state: this.state,
        score: this.score,
        questions: this.questions,
        tips: this.tips
      }
    }
}