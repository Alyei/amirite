import { iMillionairePlayerData, PlayerRole, PlayerState, JokerType, iMillionairePlayerQuestionData } from "../models/GameModels";
import { PlayerBase, iPlayerBaseArguments } from "./PlayerBase";

export class MillionairePlayer extends PlayerBase implements iMillionairePlayerData {
    //username: string;
    //state: PlayerState;
    //role: PlayerRole;
    checkpoint: number;
    jokers: JokerType[];
    currentQuestion?: iMillionairePlayerQuestionData;
    questionData: iMillionairePlayerQuestionData[];
    karmaScore: number;
    score: number;
    totalScore: number;
    millionaireCounter: number;

    /**
     * Creates an instance of the QuestionQPlayer class.
     * @param baseArguments - the arguments that have been returned by the parent's class GetArguments-method
     */
    constructor(baseArguments: iPlayerBaseArguments, jokers?: JokerType[]) {
        super(baseArguments.username, baseArguments.socket, baseArguments.role);
        //Object.setPrototypeOf(this, new.target.prototype);
        this.state = baseArguments.state;

        this.score = 0;
        this.karmaScore = 0;
        this.millionaireCounter = 0;
        this.checkpoint = 0;
        this.totalScore = 0;
        this.questionData = [];
        this.jokers = [];
    }

    public ApplyData(playerData: iMillionairePlayerData): void {
        //this.username = playerData.username;
        this.state = playerData.state;
        this.role = playerData.role;
        //this.checkpoint = playerData.checkpoint;
        this.jokers = playerData.jokers;
        this.questionData = playerData.questionData;
        this.karmaScore = playerData.karmaScore;
        this.totalScore = playerData.totalScore;
        this.millionaireCounter = playerData.millionaireCounter;
        //this.score = playerData.score;
    }

    /**
     * Returns the player's data as a new JSON.
     * @returns - player data according to the iQuestionQPlayerData-interface
     */
    public GetPlayerData(): iMillionairePlayerData {
        return {
            username: this.username,
            role: this.role,
            state: this.state,
            score: this.score,
            questionData: this.questionData,
            jokers: this.jokers,
            karmaScore: this.karmaScore,
            checkpoint: this.checkpoint,
            millionaireCounter: this.millionaireCounter,
            totalScore: this.totalScore
        }
    }
}