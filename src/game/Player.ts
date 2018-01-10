import { PlayerQuestionJSON } from "./Question" ;
import { TipJSON } from "./Tip";

export enum PlayerState {
    Launch = 0,
    Playing,
    Paused,
    Finished,
    Disqualified,
}

export class Player {
    private _score: number;
    private _questions: [PlayerQuestionJSON, string][]
    private _tips: TipJSON[]
    private _state: PlayerState;

    constructor(
        private _username: string
    ) {
        this._questions = [];
        this._score = 0;
        this._state = PlayerState.Launch;
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
    public get Questions(): [PlayerQuestionJSON, string][] {
        return this._questions;
    }
    public set Questions(value: [PlayerQuestionJSON, string][]) {
        this._questions = value;
    }
    public get Tips(): TipJSON[] {
        return this._tips;
    }
    public set Tips(value: TipJSON[]) {
        this._tips = value;
    }
}