import { QuestionQPlayer, PlayerState } from "./QuestionQPlayer";
import { ArrayManager } from "./ArrayManager";
import { iQuestionQQuestion, iQuestionQTip, iQuestionQTipFeedback, iGeneralQuestion, iGeneralPlayerInputError, MessageType, iQuestionQHostArguments, iQuestionQPlayerData } from "../models/GameModels";

export enum QuestionQGamePhase {
    Setup = 0,
    Running,
    Ended,
}

/*export interface User {
    username: string;
}*/

export class QuestionQ {
    private _players: QuestionQPlayer[];
    private _questions: iGeneralQuestion[];
    private _gamePhase: QuestionQGamePhase;
    private _send: (username: string, msgType: MessageType, data: {}) => void;
    private _gameEnded: () => void;
    private _logSilly?: (toLog: string) => void;
    private _logInfo?: (toLog: string) => void;

    //constructor of QuestionQ
    //_send function to send JSONs to a specific player
    //_gameEnded function to be executed, when the game ended
    //users list of usernames UNIQUE
    //questions list of questions UNIQUE
    public constructor(gameArguments: iQuestionQHostArguments) {
        this._gamePhase = QuestionQGamePhase.Setup;

        if (gameArguments.logInfo)
            this._logInfo = gameArguments.logInfo;
        if (gameArguments.logSilly)
            this._logSilly = gameArguments.logSilly;

        if (gameArguments.send)
            this._send = gameArguments.send;
        if (gameArguments.gameEnded)
            this._gameEnded = gameArguments.gameEnded;

        if (gameArguments.questions) {
            let am: ArrayManager = new ArrayManager(gameArguments.questions)
            this._questions = am.ShuffleArray();
        }
        this._questions = [];

        this._players = [];
        if (gameArguments.usernames) {
            for (let user of gameArguments.usernames) {
                this._players.push(new QuestionQPlayer(user));
            }
        }
    }

    public GetPlayerData(): iQuestionQPlayerData[] {
        let result: iQuestionQPlayerData[] = [];
        for (let player of this._players) {
            result.push(player.GetPlayerData());
        }
        return result;
    }

    //returns the json that is sent to a player + the key for the correct answer
    public GetQuestionQQuestion(question: iGeneralQuestion): [iQuestionQQuestion, string] {
        let am: ArrayManager = new ArrayManager("A B C D".split(" "));
        const letters: string[] = am.ShuffleArray();
        let answers: [string, string][] = [];
        answers.push([letters[0], question.answer]);
        for (let i: number = 1; i < letters.length; i++) {
            answers.push([letters[i], question.otherOptions[i-1]]);
        }
        answers.sort((a, b) => a[0].charCodeAt(0) - b[0].charCodeAt(0));

        am.collection = answers;
        return [{
            "questionId": question.questionId,
            "difficulty": question.difficulty,
            "timeLimit": question.timeLimit,
            "pictureId": question.pictureId,
            "question": question.question,
            "options": answers,
            "questionTime": new Date()
        }, letters[0]];
    }

    // returns whether there was an error or not
    public DisqualifyUser(username: string): boolean {
        let player: QuestionQPlayer | undefined = this._players.find(x => x.Username == username);
        if (!player) {
            if (this._logInfo)
                this._logInfo("could not find player '" + username + "'");
            return false;
        }

        player.State = PlayerState.Disqualified;
        this.CheckForEnd();
        return true;
    }
    // returns wether it was successful
    // - only before the game has ended
    // - only new users
    public AddUser(username: string): boolean {
        if (this._gamePhase != QuestionQGamePhase.Ended) {
            this._players.push(new QuestionQPlayer(username));
            return true;
        }
        return false;
    }
    // returns wether it was successful
    // - if no player finished yet
    // - only new questions
    public AddQuestion(question: iGeneralQuestion): boolean {
        let finished: boolean = false;
        for (let p of this._players) {
            if (p.State != PlayerState.Finished)
                finished = true;
        }
        if (!finished) {
            this._questions.push(question);
            return true;
        }
        return false;
    }

    // starts the game
    // if _send, _endGame, _players & _questions are set
    // returns whether it was successful
    public Start(): boolean {
        if (this._send && this._gameEnded && this._players && this._questions)
        {
            this._gamePhase = QuestionQGamePhase.Running;
            for (let player of this._players) {
                if (player.State = PlayerState.Launch) {
                    player.State = PlayerState.Playing;
                    this.QuestionPlayer(player);
                }
            }
            return true;
        } else
            return false
    }

    // forces the game's end
    public Endgame(): void {
        this._gamePhase = QuestionQGamePhase.Ended;

        this._gameEnded();
    }

    // ends the game when specific conditions are current 
    // - only while running
    // to check whenever player leaves, is disqualified and whenever a tip is given
    public CheckForEnd(): void { 
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
    
    // questions the player
    // only while running
    private QuestionPlayer(player: QuestionQPlayer): void {
        if (this._gamePhase == QuestionQGamePhase.Running) {
            // if there are questions left
            if (player.Questions.length < this._questions.length) {
                // generate nextQuestion
                const nextQuestionBase: iGeneralQuestion | undefined = this._questions.find(x => player.Questions.find(y => y[0].questionId == x.questionId) == undefined);
                // L-> find a question you cannot find in player.questions
                if (!nextQuestionBase) {
                    if (this._logInfo)
                        this._logInfo("could not find next question in '" + this._questions.toString() + "''" + player.Questions.toString() + "'");
                    return;
                }
                const nextQuestion: [iQuestionQQuestion, string] = this.GetQuestionQQuestion(nextQuestionBase);

                // send nextQuestion to Username
                this._send(player.Username, MessageType.Question, nextQuestion[0]);
                // add question to the player's questions
                player.Questions.push(nextQuestion);
            } else {
                // finished
                player.State = PlayerState.Finished;
                this._send(player.Username, MessageType.PlayerData, player.GetPlayerData())

                this.CheckForEnd();
            }
        }
    }

    // to be called whenever a player gives a tip
    public PlayerGivesTip(username: string, tip: iQuestionQTip): void {
        let player: QuestionQPlayer | undefined = this._players.find(x => x.Username == username);
        if (!player) {
            if (this._logInfo)
                this._logInfo("could not find player '" + username + "'");
            return;
        }
        // only while running and if the player is ingame
        if (this._gamePhase == QuestionQGamePhase.Running && player.State == PlayerState.Playing) {
            // only the player did not give a tip for this question before
            if (!player.Tips.find(x => x.tip.questionId == tip.questionId)) {
                const PlayerQuestionTuple: [iQuestionQQuestion, string] | undefined = player.Questions.find(x => x[0].questionId == tip.questionId);
                // if the player has not been asked this question
                if (!PlayerQuestionTuple) {
                    this._send(player.Username, MessageType.Error, "You were not asked this question >:c");
                    return;
                }

                const duration: number = (new Date()).getTime() - PlayerQuestionTuple[0].questionTime.getTime();
                let points: number = 0;
                let feedback: iQuestionQTipFeedback = {
                    "questionId": tip.questionId,
                    "correct": false,
                    "duration": 0,
                    "points": 0,
                    "score": 0,
                    "message": "unset"
                };
                // if the in time
                if (duration < PlayerQuestionTuple[0].timeLimit) {
                    // if correct
                    if (tip.answerId == PlayerQuestionTuple[1]) {
                        points = Math.floor(PlayerQuestionTuple[0].difficulty * PlayerQuestionTuple[0].timeLimit / (1 + duration));
                        player.Score += points;
                        feedback.correct = true;
                        feedback.duration = duration;
                        feedback.points = points;
                        feedback.score = player.Score;
                        feedback.message = "correct answer";
                    } else {
                        feedback.duration = duration;
                        feedback.points = points;
                        feedback.score = player.Score;
                        feedback.message = "wrong answer";
                    }
                } else {
                    feedback.duration = duration;
                    feedback.points = points;
                    feedback.score = player.Score;
                    feedback.message = "too slow";
                }
                this._send(player.Username, MessageType.TipFeedback, feedback);

                //add to playertipdata
                this.QuestionPlayer(player);
            } else {
                const message: iGeneralPlayerInputError = {
                    "message": "You already gave a tip for this question",
                    "data": { "QuestionId": tip.questionId }
                }
                this._send(player.Username, MessageType.Error, message);
            }
        } else {
            const message: iGeneralPlayerInputError = {
                "message": "You are not allowed to give a tip",
                "data": { "GamePhase": this._gamePhase, "PlayerState": player.State }
            }
            this._send(player.Username, MessageType.Error, message);
        }
    }
}