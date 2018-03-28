//#region imports
import { iQuestionQPlayerData, PlayerRole, PlayerState, iQuestionQQuestion, iQuestionQTipData } from "../models/GameModels";
import { PlayerBase, iPlayerBaseArguments } from "./PlayerBase";
//#endregion

//#region classes
/**
 * The QuestionQPlayer-class provides all data for a player in a Determination-game by implementing the iQuestionQPlayerData-interface and extending the PlayerBase-class.
 */
export class QuestionQPlayer extends PlayerBase implements iQuestionQPlayerData {
    //#region properties
    /**
     * - indicates the player's current score
     */
    public score: number;

    /**
     * - contains every question the player has been asked
     */
    questions: [iQuestionQQuestion, string][];

    /**
     * - contains every tip the player has given
     */
    tips: iQuestionQTipData[];

    /**
     * Getter for the question the player has been asked most recently
     * @returns - either an [(question) iQuestionQQuestion, (id of the correct answer) string]-tuple or undefined
     */
    get LatestQuestion(): [iQuestionQQuestion, string] | undefined {
        if (this.questions.length > 0)
            return this.questions[this.questions.length - 1];
    }
    //#endregion

    //#region constructors
    /**
     * Creates an instance of the QuestionQPlayer class
     * @param baseArguments - the arguments that have been returned by the parent's class GetArguments-method
     */
    constructor(baseArguments: iPlayerBaseArguments) {
        super(baseArguments.username, baseArguments.socket, baseArguments.roles);
        //Object.setPrototypeOf(this, new.target.prototype);
        this.state = baseArguments.state;

        this.score = 0;
        this.questions = [];
        this.tips = [];
    }
    //#endregion

    //#region publicFunctions
    /**
     * Returns the player's data as a new JSON
     * @returns - player data according to the iQuestionQPlayerData-interface
     */
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
    //#endregion
}
//#endregion