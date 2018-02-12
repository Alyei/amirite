import { iDeterminationPlayerData, PlayerRole, PlayerState, iDeterminationQuestionData, iDeterminationTipData } from "../models/GameModels";
import { PlayerBase, iPlayerBaseArguments } from "./PlayerBase";

export class DeterminationPlayer extends PlayerBase implements iDeterminationPlayerData {
    score: number;
    questions: iDeterminationQuestionData[];
    tips: iDeterminationTipData[];

    /**
     * Creates an instance of the QuestionQPlayer class.
     * @param baseArguments - the arguments that have been returned by the parent's class GetArguments-method
     */
    constructor(baseArguments: iPlayerBaseArguments) {
        super(baseArguments.username, baseArguments.socket, baseArguments.role);
        //Object.setPrototypeOf(this, new.target.prototype);
        this.state = baseArguments.state;

        this.score = 0;
        this.questions = [];
        this.tips = [];
    }

    /**
     * Returns the question the player has been asked most recently.
     * @returns - either an [(question) iQuestionQQuestion, (id of the correct answer) string]-tuple or undefined
     */
    get LatestQuestion(): iDeterminationQuestionData | undefined {
        if (this.questions.length > 0)
            return this.questions[this.questions.length - 1];
    }

    /**
     * Returns the player's data as a new JSON.
     * @returns - player data according to the iQuestionQPlayerData-interface
     */
    public GetPlayerData(): iDeterminationPlayerData {
      return {
        username: this.username,
        role: this.role,
        state: this.state,
        score: this.score,
        questions: this.questions,
        tips: this.tips
      }
    }
}