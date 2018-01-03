import { PlayerQuestionJSON } from "./Question" ;
import { TipJSON } from "./Tip";

export class Player {
    private _score: number;
    private _questions: [PlayerQuestionJSON, string][]
    private _tips: TipJSON[]
    private _finished: boolean;

    constructor(
        private _username: string
    ) {
        this._questions = [];
        this._score = 0;
        this._finished = false;
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
    public get Finished(): boolean {
        return this._finished;
    }
    public set Finished(value: boolean) {
        this._finished = value;
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