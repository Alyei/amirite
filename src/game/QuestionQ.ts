import { User } from "./User";
import { Player } from "./Player";
import { Question, PlayerQuestionJSON } from "./Question";
import { TipJSON } from "./Tip";
import { ArrayManager } from "./ArrayManager";

enum QuestionQGamePhase {
    Setup = 0,
    Running,
    Ended,
}

export class QuestionQ {
    private _players: Player[];
    private _questions: Question[];
    //private _running: boolean;
    private _gamePhase: QuestionQGamePhase;

    public constructor(
        private _send: (username: string, data: {}) => void,
        private _gameEnded: () => void,
        users?: User[], questions?: Question[]
    ) {
        this._gamePhase = QuestionQGamePhase.Setup;

        let am: ArrayManager = new ArrayManager(questions)
        this._questions = am.ShuffleArray() || [];
        this._players = [];
        if (users) {
            for (let user of users) {
                this._players.push(new Player(user.Username, user.Icon));
            }
        }
    }

    // returns wether it was successful
    // only while running
    public AddUser(user: User): boolean {
        if (this._gamePhase != QuestionQGamePhase.Ended) {
            this._players.push(new Player(user.Username, user.Icon));
            return true;
        }
        return false;
    }
    public AddQuestion(question: Question): boolean {
        if (this._gamePhase != QuestionQGamePhase.Ended) {
            this._questions.push(question);
            return true;
        }
        return false;
    }

    public Start(): void {
        //this._running = true;
        this._gamePhase = QuestionQGamePhase.Running;
        for (let player of this._players) {
            this.QuestionPlayer(player);
        }
    }

    public Endgame(): void { // wird callback
        //this._running = false;
        this._gamePhase = QuestionQGamePhase.Ended;

        this._gameEnded;
    }

    // only while running
    public CheckForEnd(): void { // to check whenever player leaves and whenever a tip is given
        if (this._gamePhase == QuestionQGamePhase.Running) {
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
        //if (this._running) {
        if (this._gamePhase == QuestionQGamePhase.Running) {
            // if there are questions left
            if (player.Questions.length < this._questions.length) {
                // generate nextQuestion
                // this._questions.find(x => player.Questions.find(y => y[0].questionId == x.QuestionId) == undefined)
                // L-> find a question you cannot find in player.questions
                let nextQuestion: [PlayerQuestionJSON, string] = this._questions.find(x => player.Questions.find(y => y[0].questionId == x.QuestionId) == undefined).GetPlayerQuestionJSON();
                // send nextQuestion to Username
                this._send(player.Username, nextQuestion[0]);
                // add question to the player's questions
                player.Questions.push(nextQuestion);
            } else {
                // finished
                player.Finished = true;

                this.CheckForEnd();
            }
        }
    }

    public PlayerInput(username: string, json: { type: string, data: {} }): void {
        let player: Player = this._players.find(x => x.Username == username);
        switch (json.type) {
            case "tip": {
                // mb Tip.fromJSON(json)
                // only while running
                //if (this._running) {
                if (this._gamePhase = QuestionQGamePhase.Running) {
                    let PlayerQuestionTuple: [PlayerQuestionJSON, string] = player.Questions.find(x => x[0].questionId == json.data.questionId);
                    let duration: number = (new Date()).getTime() - PlayerQuestionTuple[0].questionTime.getTime();
                    let points: number = 0;
                    if (duration < PlayerQuestionTuple[0].timeLimit) {
                        if (json.data.answer == PlayerQuestionTuple[1]) {
                            points = Math.floor(PlayerQuestionTuple[0].difficulty * PlayerQuestionTuple[0].timeLimit / (1 + duration));
                            player.Score += points
                            this._send(player.Username, { "type": "feedback", "data": { "correct": true, "points": points, "message": "correct answer" } });
                        } else {
                            this._send(player.Username, { "type": "feedback", "data": { "correct": false, "points": 0, "message": "wrong answer" } });
                        }
                    } else {
                        this._send(player.Username, { "type": "feedback", "data": { "correct": false, "points": 0, "message": "too slow" } });
                    }
                    player.Tips.push({
                        "questionId": json.data.questionId,
                        "answer": [json.data.answer, PlayerQuestionTuple[0].answers.find(x => x[0] == json.data.answer)[1]],
                        "duration": duration,
                        "points": points
                    });
                    this.QuestionPlayer(player);
                }
                break;
            }
        }
    }
}