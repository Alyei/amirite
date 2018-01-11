﻿import { Player, PlayerState } from "./Player";
import { Question, PlayerQuestionJSON } from "./Question";
import { TipJSON } from "./Tip";
import { ArrayManager } from "./ArrayManager";
import { PlayerInputError } from "./PlayerInputError";

// speichern, wann fragen beantwortet wurden (datum)?

export enum QuestionQGamePhase { //
    Setup = 0,
    Running,
    Ended,
}

export enum MessageType {
    Error = 0,
    Question,
    TipFeedback,
}

export interface User {
    Username: string;
}

export class QuestionQ {
    private _players: [Player, number][];
    private _questions: Question[];
    private _usedQuestions: Question[];
    private _gamePhase: QuestionQGamePhase;

    public constructor(
        private _gameId: string,
        private _send: (gameId: string, username: string, msgType: MessageType, data: {}) => void,
        private _gameEnded: () => void,
        users?: User[], questions?: Question[]
    ) {
        this._gamePhase = QuestionQGamePhase.Setup;

        let am: ArrayManager = new ArrayManager(questions)
        this._questions = am.ShuffleArray() || [];
        this._players = [];
        if (users) {
            for (let user of users) {
                this._players.push([new Player(user.Username), 0]);
            }
        }
    }

    // returns whether a change was necessary
    public DisqualifyUser(username: string): boolean {
        let player: Player = this._players.find(x => x[0].Username == username)[0];
        if (player.State == PlayerState.Disqualified)
            return false;
        player.State = PlayerState.Disqualified;
        this.CheckForEnd();
        return true;
    }
    // returns wether it was successful
    // only while running
    public AddUser(user: User): boolean {
        if (this._gamePhase != QuestionQGamePhase.Ended) {
            this._players.push([new Player(user.Username), 0]);
            return true;
        }
        return false;
    }
    // if no player finished yet
    public AddQuestion(question: Question): boolean {
        let finished: boolean = false;
        for (let p of this._players) {
            if (p[0].State != PlayerState.Finished)
                finished = true;
        }
        if (!finished) {
            this._questions.push(question);
            return true;
        }
        return false;
    }

    //find next question by difficulty and remove it from the pile
    private PickNextQuestion(difficulty: number): Question {
        let index: number = this._questions.findIndex(x => x.Difficulty == difficulty);
        if (index) {
            let question: Question = this._questions[index];
            this._questions.splice(index, 1);
            this._usedQuestions.push(question);
            return question;
        }
        //
        return null;
    }

    public Start(): void {
        this._gamePhase = QuestionQGamePhase.Running;
        let player: [Player, number] = this._players[0];
        player[0].State = PlayerState.Playing;
        this.QuestionPlayer(player);
    }

    public Endgame(): void {
        this._gamePhase = QuestionQGamePhase.Ended;

        this._gameEnded();
    }

    // only while running
    public CheckForEnd(): void { // to check whenever player leaves and whenever a tip is given
        if (this._gamePhase == QuestionQGamePhase.Running) {
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

    // wait for additional question?
    // only while running
    private QuestionPlayer(player: [Player, number]): void {
        //if (this._running) {
        if (this._gamePhase == QuestionQGamePhase.Running) {
            // if there are questions left
            let nextQuestion: Question = this.PickNextQuestion(player[1]);

            //if (player[0].Questions.length < this._questions.length) {
                // generate nextQuestion
                // this._questions.find(x => player.Questions.find(y => y[0].questionId == x.QuestionId) == undefined)
                // L-> find a question you cannot find in player.questions
                let nextQuestion: [PlayerQuestionJSON, string] = this._questions.find(x => player.Questions.find(y => y[0].questionId == x.QuestionId) == undefined).GetPlayerQuestionJSON();
                // send nextQuestion to Username
                this._send(player.Username, MessageType.Question, nextQuestion[0]);
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
        // only while running and if the player is ingame
        if (this._gamePhase == QuestionQGamePhase.Running && player.State == PlayerState.Playing) {
            if (!player.Tips.find(x => x.questionId == tip.QuestionId)) {
                let PlayerQuestionTuple: [PlayerQuestionJSON, string] = player.Questions.find(x => x[0].questionId == tip.QuestionId);
                let duration: number = (new Date()).getTime() - PlayerQuestionTuple[0].questionTime.getTime();
                let points: number = 0;
                if (duration < PlayerQuestionTuple[0].timeLimit) {
                    if (tip.Answer == PlayerQuestionTuple[1]) {
                        points = Math.floor(PlayerQuestionTuple[0].difficulty * PlayerQuestionTuple[0].timeLimit / (1 + duration));
                        player.Score += points
                        this._send(player.Username, MessageType.TipFeedback, new QuestionQTipFeedback(true, player.Score, "correct answer"));
                    } else {
                        this._send(player.Username, MessageType.TipFeedback, new QuestionQTipFeedback(false, player.Score, "wrong answer"));
                    }
                } else {
                    this._send(player.Username, MessageType.TipFeedback, new QuestionQTipFeedback(false, player.Score, "too slow"));
                }
                player.Tips.push({
                    "questionId": tip.QuestionId,
                    "answer": [tip.Answer, PlayerQuestionTuple[0].answers.find(x => x[0] == tip.Answer)[1]],
                    "duration": duration,
                    "points": points
                });
                this.QuestionPlayer(player);
            } else {
                this._send(player.Username, MessageType.Error, new PlayerInputError("You already gave a tip for this question", { "QuestionId": tip.QuestionId }));
            }
        } else {
            this._send(player.Username, MessageType.Error, new PlayerInputError("You are not allowed to give a tip", { "GamePhase": this._gamePhase, "PlayerState": player.State }));
        }
    }
}

//input interfaces
interface PlayerTip {
    QuestionId: string;
    Answer: string;
}
interface JokerUse {
    JokerId: string;
}