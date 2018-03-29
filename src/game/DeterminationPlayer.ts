//#region imports
import { iDeterminationPlayerData, PlayerRole, PlayerState, iDeterminationQuestionData, iDeterminationTipData } from "../models/GameModels";
import { PlayerBase, iPlayerBaseArguments } from "./PlayerBase";
//#endregion

//#region classes
/**
 * The DeterminationPlayer-class provides all data for a player in a Determination-game by implementing the iDeterminationPlayerData-interface and extending the PlayerBase-class.
 */
export class DeterminationPlayer extends PlayerBase implements iDeterminationPlayerData {
    //#region properties
    /**
     * - indicates the player's current score
     */
    public score: number;

    /**
     * - contains every question the player has been asked
     */
    public questions: iDeterminationQuestionData[];

    /**
     * - contains every feedback the player got including its corresponding tip
     */
    public tipData: iDeterminationTipData[];

    /**
     * Getter for the last question added to the player's questions
     * @returns - either the latest question or undefined
     */
    get LatestQuestion(): iDeterminationQuestionData | undefined {
        if (this.questions.length > 0)
            return this.questions[this.questions.length - 1];
    }
    //#endregion

    //#region constructors
    /**
     * Creates an instance of the QuestionQPlayer class
     * @param baseArguments - the arguments that have been returned by the parent class' GetArguments-method
     */
    constructor(baseArguments: iPlayerBaseArguments) {
        super(baseArguments.username, baseArguments.socket, baseArguments.roles);
        //Object.setPrototypeOf(this, new.target.prototype);
        this.state = baseArguments.state;

        this.score = 0;
        this.questions = [];
        this.tipData = [];
    }
    //#endregion

    //#region publicFunctions
    /**
     * Returns the player's data as a new JSON
     * @returns - player data according to the iQuestionQPlayerData-interface
     */
    public GetPlayerData(): iDeterminationPlayerData {
      return {
        username: this.username,
        roles: this.roles,
        state: this.state,
        score: this.score,
        questions: this.questions,
        tipData: this.tipData
      }
    }
    //#endregion
}
//#endregion