export class MillionaireTipFeedback {
    constructor(
        public Correct: boolean,
        public Score: number,
        public Message: string,
        public Time: number,
        public JokersUsed: string[]
    ) { }
}