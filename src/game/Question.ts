export class Question {
    constructor(
        private questionId: string,
        private difficulty: number,
        private timeLimit: number,
        private question: string,
        private answer: string,
        private otherOptions: string[]
    ) { }

    public GetPlayerQuestionJSON(): PlayerQuestionJSON {
        let answers: string[] = this.otherOptions;
        answers.push(this.answer);
        return {
            "questionId": this.questionId,
            "difficulty": this.difficulty,
            "timeLimit": this.timeLimit,
            "question": this.question,
            "answers": answers,
            "questionTime": new Date()
        };
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
    answers: string[];
    questionTime: Date;
}