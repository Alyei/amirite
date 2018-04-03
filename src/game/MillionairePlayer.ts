//#region imports
import { iMillionairePlayerData, PlayerRole, PlayerState, JokerType, iMillionairePlayerQuestionData, iMillionaireScoreEntry } from "../models/GameModels";
import { PlayerBase, iPlayerBaseArguments } from "./PlayerBase";
//#endregion

//#region classes
/**
 * The MillionairePlayer-class provides all data for a player in a Millionaire-game by implementing the iMillionairePlayerData-interface and extending the PlayerBase-class.
 * @author Georg Schubbauer
 */
export class MillionairePlayer extends PlayerBase implements iMillionairePlayerData {
    //#region properties
    /**
     * - indicates the player's current score
     */
    public score: number;
    
    /**
     * - indicates the player's most recent checkpoint
     */
    public checkpoint: number;
    
    /**
     * - contains the ID of every joker the player has left
     */
    public jokers: JokerType[];
    
    /**
     * - represents the summarized data of the current question of the player
     */
    public currentQuestion?: iMillionairePlayerQuestionData;
    
    /**
     * - contains summarized data of every question the player has been asked this round
     */
    public questionData: iMillionairePlayerQuestionData[];
    
    /**
     * - indicates the player's current karma-score
     */
    public karmaScore: number;
    
    /**
     * - contains the end score for every round of the player
     */
    public scoreArchive: iMillionaireScoreEntry[];
    
    /**
     * - indicates how often the player was millionaire
     */
    public millionaireCounter: number;
    //#endregion

    //#region constructors
    /**
     * Creates an instance of the MillionairePlayer-class
     * @param baseArguments - the arguments that have been returned by the parent class' GetArguments-method
     */
    constructor(baseArguments: iPlayerBaseArguments, jokers?: JokerType[]) {
        super(baseArguments.username, baseArguments.socket, baseArguments.roles);
        //Object.setPrototypeOf(this, new.target.prototype);
        this.state = baseArguments.state;

        this.score = 0;
        this.karmaScore = 0;
        this.millionaireCounter = 0;
        this.checkpoint = 0;
        this.scoreArchive = [];
        this.questionData = [];
        this.jokers = jokers || [];
    }
    //#endregion

    //#region publicFunctions
    /**
     * Applies the data of a JSON impementing the iMillionairePlayerData-interface to the player
     * @param playerData - JSON implementing the iMillionairePlayerData-interface
     */
    public ApplyData(playerData: iMillionairePlayerData): void {
        //this.username = playerData.username;
        this.state = playerData.state;
        this.roles = playerData.roles;
        //this.checkpoint = playerData.checkpoint;
        this.jokers = playerData.jokers;
        this.questionData = playerData.questionData;
        this.karmaScore = playerData.karmaScore;
        this.scoreArchive = playerData.scoreArchive;
        this.millionaireCounter = playerData.millionaireCounter;
        //this.score = playerData.score;
    }

    /**
     * Returns the player's data as a new JSON
     * @returns - player data according to the iMillionairePlayerData-interface
     */
    public GetPlayerData(): iMillionairePlayerData {
        return {
            username: this.username,
            roles: this.roles,
            state: this.state,
            score: this.score,
            questionData: this.questionData,
            jokers: this.jokers,
            karmaScore: this.karmaScore,
            checkpoint: this.checkpoint,
            millionaireCounter: this.millionaireCounter,
            scoreArchive: this.scoreArchive
        }
    }
    //#endregion
}
//#endregion