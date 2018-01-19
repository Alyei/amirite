import { ArrayManager } from "./ArrayManager";

export class Question {
    constructor(
        private questionId: string,
        private difficulty: number,
        private timeLimit: number,
        private question: string,
        private answer: string,
        private otherOptions: string[]
    ) { }

    public GetPlayerQuestionJSON(): [PlayerQuestionJSON, string] {
        let am: ArrayManager = new ArrayManager();
        let answers: [string, string][] = [];
        am.item = "A B C D".split(" ");
        let letters: string[] = am.ShuffleArray() || [];
        answers.push([letters[0], this.answer]);
        for (let i: number = 1; i < letters.length; i++) {
            answers.push([letters[i], this.OtherOptions[i-1]]);
        }

        am.item = answers;
        return [{
            "questionId": this.questionId,
            "difficulty": this.difficulty,
            "timeLimit": this.timeLimit,
            "question": this.question,
            "answers": am.ShuffleArray() || [],
            "questionTime": new Date()
        }, letters[0]];
    }

    public get QuestionId(): string {
        return this.questionId;
    }
    public get Difficulty(): number {
        return this.difficulty;
    }
    public get TimeLimit(): number {
        return this.timeLimit;
    }
    public get Question(): string {
        return this.question;
    }
    public get Answer(): string {
        return this.answer;
    }
    public get OtherOptions(): string[] {
        return this.otherOptions;
    }
}

// interface for PlayerQuestionJSON (JSON)
export interface PlayerQuestionJSON {
    questionId: string;
    difficulty: number;
    timeLimit: number;
    question: string;
    answers: [string, string][];
    questionTime: Date;
}