import { Player, PlayerState } from "./Player";
import { Question, PlayerQuestionJSON } from "./Question";
import { TipJSON } from "./Tip";
import { ArrayManager } from "./ArrayManager";
import { PlayerInputError } from "./PlayerInputError";
import { QuestionQTipFeedback } from "./QuestionQTipFeedback";

enum DeterminationGamePhase {
    Setup = 0,
    Running,
    Ended,
}

export enum MessageType {
    Error = 0,
    Question,
    TipFeedback,
    NextOption,
}

export interface User {
    Username: string;
}

export class Determination {
    private _players: Player[];
    private _questions: [PlayerQuestionJSON, string][];
    private _gamePhase: DeterminationGamePhase;

    public constructor(
        private _gameId: string,
        private _send: (gameId: string, username: string, msgType: MessageType, data: {}) => void,
        private _gameEnded: () => void,
        users?: User[], questions?: Question[]
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
                this._players.push(new Player(user.Username));
            }
        }
    }

    // returns whether a change was necessary
    public DisqualifyUser(username: string): boolean {
        let player: Player = this._players.find(x => x.Username == username);
        if (player.State == PlayerState.Disqualified)
            return false;
        player.State = PlayerState.Disqualified;
        this.CheckForEnd();
        return true;
    }
    // returns wether it was successful
    // only while running
    public AddUser(user: User): boolean {
        if (this._gamePhase != DeterminationGamePhase.Ended) {
            this._players.push(new Player(user.Username));
            return true;
        }
        return false;
    }
    // if no player finished yet
    public AddQuestion(question: Question): boolean {
        let finished: boolean = false;
        for (let p of this._players) {
            if (p.State != PlayerState.Finished)
                finished = true;
        }
        if (!finished) {
            this._questions.push(question.GetPlayerQuestionJSON());
            return true;
        }
        return false;
    }


    public Start(): void {
        this._gamePhase = DeterminationGamePhase.Running;
        for (let player of this._players) {
            if (player.State == PlayerState.Launch) {
                player.State = PlayerState.Playing;
                this.QuestionPlayer(player);
            }
        }
    }

    public Endgame(): void {
        this._gamePhase = DeterminationGamePhase.Ended;

        this._gameEnded();
    }

    // only while running
    public CheckForEnd(): void { // to check whenever player leaves and whenever a tip is given
        if (this._gamePhase == DeterminationGamePhase.Running) {
            // check for whether everyone finished
            let allFinished: boolean = true;
            for (let item of this._players) {
                if (item.State != PlayerState.Finished && item.State != PlayerState.Disqualified)
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
                this._send(this._gameId, player.Username, MessageType.Question, {
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
                player.State = PlayerState.Finished;

                this.CheckForEnd();
            }
        }
    }

    public PlayerGivesTip(username: string, tip: PlayerTip): void {
        let player: Player = this._players.find(x => x.Username == username);
        if (this._gamePhase == DeterminationGamePhase.Running && player.State == PlayerState.Playing) {
            if (!player.Tips.find(x => x.questionId == tip.QuestionId)) {
                let PlayerQuestionTuple: [PlayerQuestionJSON, string] = player.Questions.find(x => x[0].questionId == tip.QuestionId);
                let duration: number = (new Date()).getTime() - PlayerQuestionTuple[0].questionTime.getTime();
                let points: number = 0;
                if (duration < PlayerQuestionTuple[0].timeLimit) {
                    if (tip.Answer == PlayerQuestionTuple[1]) {
                        if (tip.Correct) { //score
                            points = Math.floor(PlayerQuestionTuple[0].difficulty * PlayerQuestionTuple[0].timeLimit / (1 + duration));
                            player.Score += points;
                            this._send(this._gameId, player.Username, MessageType.TipFeedback, new QuestionQTipFeedback(true, player.Score, "correct answer"));
                        }
                        else { //wrong
                            this._send(this._gameId, player.Username, MessageType.TipFeedback, new QuestionQTipFeedback(false, player.Score, "wrong answer"));
                        }
                            player.Tips.push({
                                "questionId": tip.QuestionId,
                                "answer": [tip.Answer, PlayerQuestionTuple[0].answers.find(x => x[0] == tip.Answer)[1]],
                                "duration": duration,
                                "points": points
                            });
                            this.QuestionPlayer(player);
                    }
                    else {
                        if (!tip.Correct) { //next option + little score
                            points = Math.floor(PlayerQuestionTuple[0].difficulty * PlayerQuestionTuple[0].timeLimit / (1 + duration) / 10);
                            player.Score += points;
                            this._send(this._gameId, player.Username, MessageType.TipFeedback, new QuestionQTipFeedback(true, player.Score, "wrong option"));

                            let nextOptioni: number = PlayerQuestionTuple[0].answers.findIndex(x => x[0] == tip.Answer) + 1;
                            if (nextOptioni < PlayerQuestionTuple[0].answers.length) {
                                let nextOption: [string, string] = PlayerQuestionTuple[0].answers[nextOptioni];
                                this._send(this._gameId, player.Username, MessageType.NextOption, { "option": nextOption });
                            } else {
                                this._send(this._gameId, player.Username, MessageType.Error, new PlayerInputError("no further options", { "answerId": tip.Answer, "nextIndex": nextOptioni }));
                            }
                        }
                        else { //wrong
                            this._send(this._gameId, player.Username, MessageType.TipFeedback, new QuestionQTipFeedback(false, player.Score, "wrong answer"));
                            player.Tips.push({
                                "questionId": tip.QuestionId,
                                "answer": [tip.Answer, PlayerQuestionTuple[0].answers.find(x => x[0] == tip.Answer)[1]],
                                "duration": duration,
                                "points": points
                            });
                            this.QuestionPlayer(player);
                        }
                    }
                } else {
                    this._send(this._gameId, player.Username, MessageType.TipFeedback, new QuestionQTipFeedback(false, player.Score, "too slow"));
                    player.Tips.push({
                        "questionId": tip.QuestionId,
                        "answer": [tip.Answer, PlayerQuestionTuple[0].answers.find(x => x[0] == tip.Answer)[1]],
                        "duration": duration,
                        "points": points
                    });
                    this.QuestionPlayer(player);
                }
            } else {
                this._send(this._gameId, player.Username, MessageType.Error, new PlayerInputError("You already gave a tip for this question", { "QuestionId": tip.QuestionId }));
            }
        } else {
            this._send(this._gameId, player.Username, MessageType.Error, new PlayerInputError("You are not allowed to give a tip", { "GamePhase": this._gamePhase, "PlayerState": player.State }));
        }
    }
}

//input interfaces
interface PlayerTip {
    QuestionId: string;
    Answer: string;
    Correct: boolean;
}