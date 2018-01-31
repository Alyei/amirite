import { ArrayManager } from "./ArrayManager";
import { PlayerState, iGeneralQuestion, iGeneralPlayerInputError, MessageType, Gamemode, iMillionaireHostArguments, iMillionairePlayer, JokerType, iMillionaireQuestionData, iMillionaireSpectateData, iMillionaireTip, iMillionaireTipFeedback, iMillionairePassRequest, iMillionairePlayerClue } from "../models/GameModels";

export enum MillionaireGamePhase {
    Setup = 0,
    Running,
    Paused,
    Ended,
}

export class MillionaireCore {
    readonly Gamemode: Gamemode = Gamemode.Millionaire;
    private _currentPlayer: iMillionairePlayer;
    private _players: iMillionairePlayer[];
    private _questions: iGeneralQuestion[];
    private _gamePhase: MillionaireGamePhase;
    private _send: (username: string, msgType: MessageType, data: {}) => void;
    private _gameEnded: () => void;
    private _logSilly?: (toLog: string) => void;
    private _logInfo?: (toLog: string) => void;
    private _gameArguments: iMillionaireHostArguments;

    //_send function to send JSONs to a specific player
    //_gameEnded function to be executed, when the game ended
    //users list of usernames UNIQUE
    //questions list of questions UNIQUE
    public constructor(
        logInfo: (toLog: string) => void,
        logSilly: (toLog: string) => void,
        send: (username: string, msgType: MessageType, data: {}) => void,
        gameEnded: () => void,
        questions: iGeneralQuestion[],
        usernames: string[],
        gameArguments?: iMillionaireHostArguments
    ) {
        this._gamePhase = MillionaireGamePhase.Setup;

        this._gameArguments = {
            maxQuestions: 10,
            questionsPerDifficulty: 1,
            checkpoints: [500, 1000, 2000, 5000, 10000, 20000, 50000]
        };
        if (gameArguments)
            this._gameArguments = gameArguments;

        this._logInfo = logInfo;
        this._logSilly = logSilly;
        this._send = send;
        this._gameEnded = gameEnded;

        this._questions = [];
        if (questions) {
            let am: ArrayManager = new ArrayManager(questions)
            this._questions = am.ShuffleArray();
        }

        this._players = [];
        if (usernames) {
            for (let username of usernames) {
                this.AddUser(username);
            }
        }
    }

    private AddUser(username: string): boolean {
        if (this._gamePhase != MillionaireGamePhase.Ended) {
            if (!this._players.find(x => x.username == username)) {
                this._players.push({
                    username: username,
                    state: PlayerState.Launch,
                    score: 0,
                    checkpoint: 0,
                    karmaScore: 0,
                    jokers: [JokerType.Audience, JokerType.Call, JokerType.FiftyFifty],
                    activeJokers: [],
                    questionData: []
                });
                return true;
            }
            // user already in game
            return false;
        }
        // game ended
        return false;
    }

    public GetPlayerData(): iMillionairePlayer[] {
        return this._players;
    }
    public GetStartablePlayers(): iMillionairePlayer[] {
        return this._players.filter(x => x.state == PlayerState.Launch);
    }

    public UseFiftyFiftyJoker(username: string, ): boolean {
        
    }

    public UseAudienceJoker(username: string, ): boolean {
        
    }

    public UseCallJoker(username: string, ): boolean {
        
    }

    public PlayerGivesClue(username: string, tip: iMillionairePlayerClue): void {

    }

    //returns the json that is sent to a player + the key for the correct answer
    public GetMillionaireQuestion(question: iGeneralQuestion): iMillionaireQuestionData {
        let am: ArrayManager = new ArrayManager("A B C D".split(" "));
        const letters: string[] = am.ShuffleArray();
        let answers: [string, string][] = [];
        answers.push([letters[0], question.answer]);
        for (let i: number = 1; i < letters.length; i++) {
            answers.push([letters[i], question.otherOptions[i - 1]]);
        }
        answers.sort((a, b) => a[0].charCodeAt(0) - b[0].charCodeAt(0));

        am.collection = answers;
        return {
            question: {
                questionId: question.questionId,
                difficulty: question.difficulty,
                pictureId: question.pictureId,
                question: question.question,
                options: answers
            },
            correctAnswer: letters[0]
        };
    }

    // returns whether there was an error or not
    public DisqualifyUser(username: string): boolean {
        let player: iMillionairePlayer | undefined = this._players.find(x => x.username == username);
        if (!player) {
            if (this._logInfo)
                this._logInfo("could not find player '" + username + "'");
            return false;
        }

        player.state = PlayerState.Disqualified;
        this.CheckForEnd();
        return true;
    }

    // returns wether it was successful
    // - if no player finished yet
    // - only new questions
    public AddQuestion(question: iGeneralQuestion): boolean {
        if (!this._questions.find(x => x.questionId == question.questionId)) {
            this._questions.push(question);
            return true;
        }
        // question already in game
        return false;
    }

    // starts the game
    // if _send, _endGame, _players & _questions are set
    // returns whether it was successful
    public Start(username: string): boolean {
        if (this._send && this._gameEnded && this._players && this._questions) {
            if (this._currentPlayer && this._currentPlayer.state == PlayerState.Playing)
                this._currentPlayer.state = PlayerState.Paused;
            let player: iMillionairePlayer | undefined = this._players.find(x => x.username == username);
            if (!player) {
                if (this._logInfo)
                    this._logInfo("could not find player '" + username + "'");
                return false;
            }
            // TYPESCRIPT SOLLTE VERSTEHEN
            if (![PlayerState.Launch, PlayerState.Paused].find(x => player.state == x)) {
                // player not in a launchable state
                return false;
            }
            player.state = PlayerState.Playing;
            this._currentPlayer = player;
            this._gamePhase = MillionaireGamePhase.Running;
            this.QuestionPlayer();
            return true;
        } else
            return false // not enaugh parameters
    }

    public Continue(): boolean {
        if (this._gamePhase != MillionaireGamePhase.Paused)
            return false; // nothin to continue
        return this.QuestionPlayer(); // whether it continues
    }

    // forces the game's end
    public Stop(): void {
        this._gamePhase = MillionaireGamePhase.Ended;

        this._gameEnded();
    }

    private SendDataForCurrentPlayer(msgType: MessageType, data: {}): boolean {
        if (this._currentPlayer) {
            this._send(this._currentPlayer.username, msgType, data);
            const spectateData: iMillionaireSpectateData = {
                type: msgType,
                data: data
            }
            for (let player of this._players) {
                if (player.username != this._currentPlayer.username)
                    this._send(player.username, MessageType.MillionaireSpectateData, spectateData);
            }
            return true;
        }
        // no current player
        return false;
    }

    // ends the game when specific conditions are current 
    // - only while running
    // to check whenever player leaves, is disqualified and whenever a tip is given
    public CheckForEnd(): void {
        if (this._gamePhase == MillionaireGamePhase.Running) {
            // check for whether everyone finished
            let allFinished: boolean = true;
            for (let player of this._players) {
                if (player.state != PlayerState.Finished && player.state != PlayerState.Disqualified)
                    allFinished = false;
            }

            if (allFinished)
                this.Stop();
        }
    }

    PauseGame(): void { // paused
        this._gamePhase = MillionaireGamePhase.Paused;
    }

    // questions the player
    // only while running
    private QuestionPlayer(): boolean {
        if (this._gamePhase == MillionaireGamePhase.Running && this._currentPlayer) {
            // if the player has to answer more questions
            if (this._currentPlayer.questionData.length < this._gameArguments.maxQuestions) {
                // find next question
                const nextQuestionBase: iGeneralQuestion | undefined = this._questions.find(x =>
                    x.difficulty == this._currentPlayer.questionData.length / this._gameArguments.questionsPerDifficulty
                );
                if (!nextQuestionBase) {
                    if (this._logInfo)
                        this._logInfo("could not find next question in '" + JSON.stringify(this._questions) + "' for '" + JSON.stringify(this._currentPlayer.questionData) + "'");
                    this.PauseGame();
                    return false;
                }
                // generate nextQuestion
                const nextQuestion: iMillionaireQuestionData = this.GetMillionaireQuestion(nextQuestionBase);

                // send nextQuestion to Username
                this.SendDataForCurrentPlayer(MessageType.MillionaireQuestion, nextQuestion.question);
                // add question to the player's questions
                this._currentPlayer.questionData.push(nextQuestion);
                this._currentPlayer.currentQuestion = nextQuestion;
                return true;
            } else {
                // player finished
                this._currentPlayer.state = PlayerState.Finished;
                this._gamePhase = MillionaireGamePhase.Ended; // end game?
            }
        }
        return false;
    }

    // to be called whenever a player gives a tip
    public PlayerGivesTip(username: string, tip: iMillionaireTip): void {
        // only while running
        if (this._gamePhase == MillionaireGamePhase.Running && this._currentPlayer && this._currentPlayer.currentQuestion) {
            // only if it is the players turn
            if (username == this._currentPlayer.username) {
                // only the player did not give a tip for this question before
                if (!this._currentPlayer.currentQuestion.tip) {
                    let points: number = 0;
                    let feedback: iMillionaireTipFeedback = {
                        questionId: tip.questionId,
                        correct: false,
                        points: points,
                        score: this._currentPlayer.score,
                        message: "invalid"
                    };
                    // if correct
                    if (tip.answerId == this._currentPlayer.currentQuestion.correctAnswer) {
                        points = Math.floor(this._currentPlayer.currentQuestion.question.difficulty * 100); // make it look tremendous
                        this._currentPlayer.score += points;
                        this.CheckpointCheck();

                        feedback.correct = true;
                        feedback.message = "correct";
                    } else {
                        // game over
                        points = this._currentPlayer.checkpoint - this._currentPlayer.score;
                        this._currentPlayer.score = this._currentPlayer.checkpoint;

                        feedback.message = "wrong";

                        this._currentPlayer.state = PlayerState.Finished;
                    }
                    feedback.points = points;
                    feedback.score = this._currentPlayer.score;

                    this._currentPlayer.currentQuestion.tip = tip;
                    this._currentPlayer.currentQuestion.feedback = feedback;

                    this.SendDataForCurrentPlayer(MessageType.QuestionQTipFeedback, feedback);
                    this.QuestionPlayer();
                } else {
                    const message: iGeneralPlayerInputError = {
                        "message": "You already gave a tip for this question",
                        "data": { "QuestionId": tip.questionId }
                    }
                    this.SendDataForCurrentPlayer(MessageType.PlayerInputError, message);
                }
            } else {
                const message: iGeneralPlayerInputError = {
                    "message": "It is not your turn, dude",
                    "data": {
                        you: username,
                        activePlayer: this._currentPlayer.username
                    }
                }
                this._send(username, MessageType.PlayerInputError, message);
            }
        } else {
            const message: iGeneralPlayerInputError = {
                "message": "You are not allowed to give a tip",
                "data": {
                    gamePhase: this._gamePhase,
                    activePlayer: this._currentPlayer.username
                }
            }
            this._send(username, MessageType.PlayerInputError, message);
        }
    }

    // return whether no error happened
    private CheckpointCheck(): boolean {
        if (!this._currentPlayer || this._currentPlayer.state == PlayerState.Playing)
            return false; // not the right situation
        const passRequest: iMillionairePassRequest = {
            currentCheckpoint: Math.max(...this._gameArguments.checkpoints.filter(x => x <= this._currentPlayer.score)),
            possibleCheckpoints: this._gameArguments.checkpoints
        } 
        if (passRequest.currentCheckpoint > this._currentPlayer.checkpoint)
            this.SendDataForCurrentPlayer(MessageType.MillionairePassRequest, passRequest);
        this._currentPlayer.checkpoint = passRequest.currentCheckpoint;
        return true;
    }
}