import { iQuestionQQuestion, iQuestionQTipData, iQuestionQPlayerData } from "../models/GameModels" ;

export enum PlayerState {
    Launch = 0,
    Playing,
    Paused,
    Finished,
    Disqualified,
}

export class QuestionQPlayer {
    private _score: number;
    private _questions: [iQuestionQQuestion, string][]
    private _tips: iQuestionQTipData[]
    private _state: PlayerState;

    constructor(
        private _username: string
    ) {
        this._questions = [];
        this._score = 0;
        this._state = PlayerState.Launch;
    }

    public GetPlayerData(): iQuestionQPlayerData {
        return {
            "username": this.Username,
            "score": this.Score,
            "state": this.State,
            "questions": this.Questions,
            "tips": this.Tips
        }
    }

    get Username(): string {
        return this._username;
    }
    public get Score(): number {
        return this._score;
    }
    public set Score(value: number) {
        this._score = value;
    }
    public get State(): PlayerState {
        return this._state;
    }
    public set State(value: PlayerState) {
        this._state = value;
    }
    public get Questions(): [iQuestionQQuestion, string][] {
        return this._questions;
    }
    public set Questions(value: [iQuestionQQuestion, string][]) {
        this._questions = value;
    }
    public get Tips(): iQuestionQTipData[] {
        return this._tips;
    }
    public set Tips(value: iQuestionQTipData[]) {
        this._tips = value;
    }
}