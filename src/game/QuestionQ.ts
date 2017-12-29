import { User } from "./User";
import { Player } from "./Player";
import { Question, PlayerQuestionJSON } from "./Question";
import { TipJSON } from "./Tip";

export class QuestionQ {
    private _players: Player[];
    private _questions: Question[];
    private _running: boolean;

    public constructor(
        private _send: (username: string, data: {}) => void,
        users?: User[], questions?: Question[]
    ) {
        this._questions = this.ShuffleArray(questions) || [];
        this._players = [];
        if (users) {
            let newPlayer: Player;
            for (let user of users) {
                newPlayer = Object.create(Player.prototype);
                newPlayer = Object.assign(newPlayer, user, {
                    Score: 0,
                });
                this._players.push(newPlayer);
            }
        }
    }

    private ShuffleArray(toShuffle: any[]): any[] { // assuming that any[] works
        let shuffled: any[] = [];

        let index: number;
        while (toShuffle.length > 0) {
            index = Math.floor(Math.random() * toShuffle.length);
            shuffled.push(toShuffle[index]);
            toShuffle.splice(index, 1)
        }

        return shuffled;
    }

    public Start(): void {
        this._running = true;
        for (let player of this._players) {
            this.QuestionPlayer(player);
        }
    }

    public Endgame(): void {
        for (let item of this._players) {
            this._send(item.Username
        }
    }

    private QuestionPlayer(player: Player): void {
        // if there are questions left
        if (player.Questions.length < this._questions.length) {
            // generate nextQuestion
            let nextQuestion: PlayerQuestionJSON = this._questions[player.Questions.length].GetPlayerQuestionJSON();
            // shuffle answers
            nextQuestion.answers = this.ShuffleArray(nextQuestion.answers);
            // send nextQuestion to Username
            this._send(player.Username, nextQuestion);
            // add question to the player's questions
            player.Questions.push(nextQuestion);
        } else {
            // finished
            player.Finished = true;
            
            // check for whether everyone finished
            let allFinished: boolean = true;
            for (let item of this._players) {
                if (!item.Finished)
                    allFinished = false;
            }
            this._running = !allFinished; // also to check when player leaves
        }
    }

    public PlayerInput(username: string, json: { type: string, data: {} }): void {
        let player: Player = this._players.find(x => x.Username == username);
        switch (json.type) {
            case "tip": {
                // mb Tip.fromJSON(json)
                let question: Question = this._questions.find(x => x.questionId == json.data.questionId);
                let PlayerQuestionJSON: PlayerQuestionJSON = player.Questions.find(x => x.questionId == json.data.questionId);
                let duration: number = (new Date()).getTime() - PlayerQuestionJSON.questionTime.getTime();
                let points: number = 0;
                if (duration < PlayerQuestionJSON.timeLimit) {
                    if (json.data.answer == question.Answer) {
                        points = Math.floor(PlayerQuestionJSON.difficulty * PlayerQuestionJSON.timeLimit / (1 + duration));
                        player.Score += points
                        this._send(player.Username, { "type": "feedback", "data": { "correct": true, "points": points, "message": "wrong answer" } });
                    } else {
                        this._send(player.Username, { "type": "feedback", "data": { "correct": false, "points": 0, "message": "wrong answer" } });
                    }
                } else {
                    this._send(player.Username, { "type": "feedback", "data": { "correct": false, "points": 0, "message": "too slow" } });
                }
                player.Tips.push({ "questionId": question.QuestionId, "answer": json.data.answer, "duration": duration, "points": points });
                this.QuestionPlayer(player);
                break;
            }
        }
    }
}