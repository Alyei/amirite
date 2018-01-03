import { Player } from "./Player";
import { Question, PlayerQuestionJSON } from "./Question";
import { TipJSON } from "./Tip";
import { ArrayManager } from "./ArrayManager";

enum DeterminationGamePhase {
    Setup = 0,
    Running,
    Ended,
}

export class Determination {
    private _players: Player[];
    private _questions: [PlayerQuestionJSON, string][];
    private _gamePhase: DeterminationGamePhase;

    public constructor(
        private _send: (username: string, data: {}) => void,
        private _gameEnded: () => void,
        users?: { "username": string }[], questions?: Question[]
    ) {
        this._gamePhase = DeterminationGamePhase.Setup;
        this._questions = [];
        let qj: [PlayerQuestionJSON, string];
        for (let q of questions) {
            qj = q.GetPlayerQuestionJSON();
            qj[0].timeLimit *= 1.2; // 20% more time
            this._questions.push();
        }
        let am: ArrayManager = new ArrayManager(this._questions)
        this._questions = am.ShuffleArray() || [];
        this._players = [];
        if (users) {
            for (let user of users) {
                this._players.push(new Player(user.username));
            }
        }
    }

    // returns wether it was successful
    // only while running
    public AddUser(user: { "username": string }): boolean {
        if (this._gamePhase != DeterminationGamePhase.Ended) {
            this._players.push(new Player(user.username));
            return true;
        }
        return false;
    }
    // if no player finished yet
    public AddQuestion(question: Question): boolean {
        let finished: boolean = false;
        for (let p of this._players) {
            if (p.Finished)
                finished = true;
        }
        if (!finished) {
            let qj: [PlayerQuestionJSON, string] = question.GetPlayerQuestionJSON();
            qj[0].timeLimit *= 1.2; // 20% more time
            this._questions.push(qj);
            return true;
        }
        return false;
    }

    public Start(): void {
        //this._running = true;
        this._gamePhase = DeterminationGamePhase.Running;
        for (let player of this._players) {
            this.QuestionPlayer(player);
        }
    }

    public Endgame(): void {
        this._gamePhase = DeterminationGamePhase.Ended;

        this._gameEnded;
    }

    // only while running
    public CheckForEnd(): void { // to check whenever player leaves and whenever a tip is given
        if (this._gamePhase == DeterminationGamePhase.Running) {
            // check for whether everyone finished
            let allFinished: boolean = true;
            for (let item of this._players) {
                if (!item.Finished)
                    allFinished = false;
            }

            if (allFinished)
                this.Endgame();
        }
    }

    // only while running
    private QuestionPlayer(player: Player): void {
        if (this._gamePhase == DeterminationGamePhase.Running) {
            // if there are questions left
            if (player.Questions.length < this._questions.length) {
                // generate nextQuestion
                // this._questions.find(x => player.Questions.find(y => y[0].questionId == x[0].questionId) == undefined
                // L-> find a question you cannot find in player.questions
                let nextQuestion: [PlayerQuestionJSON, string] = this._questions.find(x => player.Questions.find(y => y[0].questionId == x[0].questionId) == undefined);
                nextQuestion[0].questionTime = new Date(); // change only for this player!!!
                // send nextQuestion to Username
                this._send(player.Username, {
                    "type": "DeterminationQuestion", data: {
                        "questionId": nextQuestion[0].questionId,
                        "question": nextQuestion[0].question,
                        "firstOption": nextQuestion[0].answers[0], //first option only
                        "timeLimit": nextQuestion[0].timeLimit,
                        "difficulty": nextQuestion[0].difficulty,
                        "questionTime": nextQuestion[0].questionTime
                    }
                });
                // add question to the player's questions
                player.Questions.push(nextQuestion);
            } else {
                // finished
                player.Finished = true;

                this.CheckForEnd();
            }
        }
    }

    // keine fragen doppelt beantworten
    public PlayerInput(username: string, json: { type: string, data: {} }): void {
        let player: Player = this._players.find(x => x.Username == username);
        switch (json.type) {
            // data {qid, answer, correct: true/false}
            case "DeterminationTip": {
                // mb Tip.fromJSON(json)
                // only while running
                //if (this._running) {
                if (this._gamePhase = DeterminationGamePhase.Running) {
                    let PlayerQuestionTuple: [PlayerQuestionJSON, string] = player.Questions.find(x => x[0].questionId == json.data.questionId);
                    let duration: number = (new Date()).getTime() - PlayerQuestionTuple[0].questionTime.getTime();
                    let points: number = 0;
                    if (duration < PlayerQuestionTuple[0].timeLimit) {
                        if (json.data.answer == PlayerQuestionTuple[1]) {
                            if (json.data.correct) { //score
                                points = Math.floor(PlayerQuestionTuple[0].difficulty * PlayerQuestionTuple[0].timeLimit / (1 + duration));
                                player.Score += points
                                this._send(player.Username, { "type": "feedback", "data": { "correct": true, "points": points, "message": "correct answer" } });
                                player.Tips.push({
                                    "questionId": json.data.questionId,
                                    "answer": [json.data.answer, PlayerQuestionTuple[0].answers.find(x => x[0] == json.data.answer)[1]],
                                    "duration": duration,
                                    "points": points
                                });
                                this.QuestionPlayer(player);
                            }
                            else { //wrong
                                this._send(player.Username, { "type": "feedback", "data": { "correct": false, "points": 0, "message": "wrong answer" } });
                                player.Tips.push({
                                    "questionId": json.data.questionId,
                                    "answer": [json.data.answer, PlayerQuestionTuple[0].answers.find(x => x[0] == json.data.answer)[1]],
                                    "duration": duration,
                                    "points": points
                                });
                                this.QuestionPlayer(player);
                            }
                        }
                        else {
                            if (!json.data.correct) { //next option
                                let nextOptioni: number = PlayerQuestionTuple[0].answers.findIndex(x => x[0] == json.data.answer);
                                if (nextOptioni < PlayerQuestionTuple[0].answers.length) {
                                    let nextOption: [string, string] = PlayerQuestionTuple[0].answers[];
                                    this._send(player.Username, { "type": "DeterminationNextOption", "data": { "id": nextOption[0], "answer": nextOption[1] } });
                                } else {
                                    this._send(player.Username, { "type": "DeterminationNextOption", "data": { "id": null, "answer": null, "error": "no further options" } });
                                }
                            }
                            else { //wrong
                                this._send(player.Username, { "type": "feedback", "data": { "correct": false, "points": 0, "message": "wrong answer" } });
                                player.Tips.push({
                                    "questionId": json.data.questionId,
                                    "answer": [json.data.answer, PlayerQuestionTuple[0].answers.find(x => x[0] == json.data.answer)[1]],
                                    "duration": duration,
                                    "points": points
                                });
                                this.QuestionPlayer(player);
                            }
                        }
                    } else {
                        this._send(player.Username, { "type": "feedback", "data": { "correct": false, "points": 0, "message": "too slow" } });
                        player.Tips.push({
                            "questionId": json.data.questionId,
                            "answer": [json.data.answer, PlayerQuestionTuple[0].answers.find(x => x[0] == json.data.answer)[1]],
                            "duration": duration,
                            "points": points
                        });
                        this.QuestionPlayer(player);
                    }
                }
                break;
            }
        }
    }
}