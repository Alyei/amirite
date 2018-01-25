import { Gamemode, iDeterminationPlayerData, iDeterminationQuestion, MessageType, iDeterminationHostArguments, iGeneralQuestion, PlayerState, iDeterminationOption, iDeterminationQuestionData, iDeterminationTip, iGeneralPlayerInputError, iDeterminationTipFeedback, iDeterminationTipData } from "../models/GameModels";
import { ArrayManager } from "./ArrayManager";
import { iGame } from "./iGame";

enum DeterminationGamePhase {
    Setup = 0,
    Running,
    Ended,
}

export interface User {
    Username: string;
}

export class DeterminationCore {
    readonly Gamemode: Gamemode.Determination;
    private _players: iDeterminationPlayerData[];
    private _questions: iDeterminationQuestionData[];
    private _gamePhase: DeterminationGamePhase;

    private readonly OptionIds: string[] = "A B C D".split(" ");

    public constructor(
        private _logInfo: (toLog: string) => void,
        private _logSilly: (toLog: string) => void,
        private _send: (username: string, msgType: MessageType, data: {}) => void,
        private _gameEnded: () => void,
        questions: iGeneralQuestion[],
        usernames: string[],
        gameArguments?: iDeterminationHostArguments
    ) {
        this._gamePhase = DeterminationGamePhase.Setup;

        this._questions = [];
        let determinationQuestions: [iDeterminationQuestion, string];
        for (let q of questions) {
            this._questions.push(this.GetDeterminationQuestion(q));
        }
        let am: ArrayManager = new ArrayManager(this._questions)
        this._questions = am.ShuffleArray();

        this._players = [];
        if (usernames) {
            for (let user of usernames) {
                this._players.push({
                    username: user,
                    state: PlayerState.Launch,
                    score: 0,
                    questions: [],
                    tips: []
                });
            }
        }
    }

    public GetDeterminationQuestion(question: iGeneralQuestion): iDeterminationQuestionData {
        let am: ArrayManager = new ArrayManager(this.OptionIds);
        const letters: string[] = am.ShuffleArray();

        let answers: [string, string][] = [];
        answers.push([letters[0], question.answer]);
        for (let i: number = 1; i < letters.length; i++) {
            answers.push([letters[i], question.otherOptions[i - 1]]);
        }
        answers.sort((a, b) => a[0].charCodeAt(0) - b[0].charCodeAt(0));

        let optionsd: { [id: string]: string } = {};
        for (let o of answers) {
            optionsd[o[0]] = o[1];
        }

        am.collection = answers;
        return {
            question: {
                questionId: question.questionId,
                difficulty: question.difficulty,
                timeLimit: question.timeLimit * 1.2, // 20% more time
                pictureId: question.pictureId,
                question: question.question,
                questionTime: new Date()
            },
            options: optionsd,
            correct: letters[0]
        };
    }

    public GetPlayerData(): iDeterminationPlayerData[] {
        return this._players;
    }

    // returns whether there was an error or not
    public DisqualifyUser(username: string): boolean {
        let player: iDeterminationPlayerData | undefined = this._players.find(x => x.username == username);
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
    // - only before the game has ended
    // - only new users
    public AddUser(username: string): boolean {
        if (this._gamePhase == DeterminationGamePhase.Setup) {
            this._players.push({
                "username": username,
                "state": PlayerState.Launch,
                "score": 0,
                "questions": [],
                "tips": []
            });
            return true;
        }
        if (this._gamePhase == DeterminationGamePhase.Running) {
            let newPlayer: iDeterminationPlayerData = {
                "username": username,
                "state": PlayerState.Playing,
                "score": 0,
                "questions": [],
                "tips": []
            };
            this._players.push(newPlayer);
            this.QuestionPlayer(newPlayer);
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
            if (p.state != PlayerState.Finished)
                finished = true;
        }
        if (!finished) {
            this._questions.push(this.GetDeterminationQuestion(question));
            return true;
        }
        return false;
    }

    // starts the game
    // if _send, _endGame, _players & _questions are set
    // returns whether it was successful
    public Start(): boolean {
        if (this._send && this._gameEnded && this._players && this._questions) {
            this._gamePhase = DeterminationGamePhase.Running;
            for (let player of this._players) {
                if (player.state = PlayerState.Launch) {
                    player.state = PlayerState.Playing;
                    this.QuestionPlayer(player);
                }
            }
            return true;
        } else
            return false
    }

    // forces the game's end
    public Stop(): void {
        this._gamePhase = DeterminationGamePhase.Ended;

        this._gameEnded();
    }

    // ends the game when specific conditions are current 
    // - only while running
    // to check whenever player leaves, is disqualified and whenever a tip is given
    public CheckForEnd(): void {
        if (this._gamePhase == DeterminationGamePhase.Running) {
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

    // questions the player
    // only while running
    private QuestionPlayer(player: iDeterminationPlayerData): void {
        if (this._gamePhase == DeterminationGamePhase.Running) {
            // if there are questions left
            if (player.questions.length < this._questions.length) {
                // generate nextQuestion
                const nextQuestionBase: iDeterminationQuestionData | undefined = this._questions.find(x => player.questions.find(y => y.question.questionId == x.question.questionId) == undefined);
                // L-> find a question you cannot find in player.questions
                if (!nextQuestionBase) {
                    if (this._logInfo)
                        this._logInfo("could not find next question in '" + this._questions.toString() + "' for '" + player.questions.toString() + "'");
                    return;
                }
                const nextQuestion: iDeterminationQuestion = {
                    questionId: nextQuestionBase.question.questionId,
                    question: nextQuestionBase.question.question,
                    pictureId: nextQuestionBase.question.pictureId,
                    timeLimit: nextQuestionBase.question.timeLimit,
                    difficulty: nextQuestionBase.question.difficulty,
                    questionTime: new Date(),
                };

                // send nextQuestion to Username
                this._send(player.username, MessageType.DeterminationQuestion, nextQuestion);
                this._send(player.username, MessageType.DeterminationOption, nextQuestionBase.options[0]); // or ["A"]
                // add question to the player's questions
                player.questions.push(nextQuestionBase);
            } else {
                // finished
                player.state = PlayerState.Finished;
                this._send(player.username, MessageType.DeterminationPlayerData, player)

                this.CheckForEnd();
            }
        }
    }

    public PlayerGivesTip(username: string, tip: iDeterminationTip): void {
        let player: iDeterminationPlayerData | undefined = this._players.find(x => x.username == username);
        if (!player) {
            if (this._logInfo)
                this._logInfo("could not find player '" + username + "'");
            return;
        }

        if (this._gamePhase == DeterminationGamePhase.Running && player.state == PlayerState.Playing) {
            // only if the player has not had this answer yet
            if (!player.tips.find(x => x.tip.questionId == tip.questionId && x.tip.answerId == tip.answerId)) {
                const playerQuestion: iDeterminationQuestionData | undefined = player.questions.find(x => x.question.questionId == tip.questionId);
                if (!playerQuestion) {
                    // process error
                    const errorMessage: iGeneralPlayerInputError = {
                        message: "You were not asked this question >:c",
                        data: {
                            player: player,
                            tip: tip
                        }
                    };
                    if (this._logSilly)
                        this._logSilly(JSON.stringify(errorMessage));
                    this._send(player.username, MessageType.PlayerInputError, errorMessage);
                    return;
                }

                const duration: number = (new Date()).getTime() - playerQuestion.question.questionTime.getTime();

                let points: number = 0;
                let feedback: iDeterminationTipFeedback = {
                    tip: tip,
                    correct: false,
                    duration: duration,
                    points: points,
                    score: player.score,
                    message: "invalid"
                };
                // if the question was answered in time
                if (duration < playerQuestion.question.timeLimit) {
                    // if it is about the correct answer
                    if (tip.answerId == playerQuestion.correct) {
                        // if the player's guess was correct
                        if (tip.correct) {
                            points = Math.floor(playerQuestion.question.difficulty * playerQuestion.question.timeLimit / (1 + duration));
                            player.score += points;

                            feedback.correct = true;
                            feedback.points = points;
                            feedback.score = player.score;
                            feedback.message = "correct"

                            let tipData: iDeterminationTipData = {
                                feedback: feedback,
                                tip: tip
                            }
                            player.tips.push(tipData);

                            this._send(player.username, MessageType.DeterminationTipFeedback, feedback);
                        }
                        else {
                            feedback.message = "wrong"

                            let tipData: iDeterminationTipData = {
                                feedback: feedback,
                                tip: tip
                            }
                            player.tips.push(tipData);

                            this._send(player.username, MessageType.DeterminationTipFeedback, feedback);

                            this.QuestionPlayer(player);
                        }
                    }
                    else {
                        if (!tip.correct) { //check for multiple tries (determinationPLayer)  next option + little score
                            points = Math.floor(playerQuestion.question.difficulty * playerQuestion.question.timeLimit / (1 + duration) / 10);
                            player.score += points;

                            feedback.correct = true;
                            feedback.points = points;
                            feedback.score = player.score;
                            feedback.message = "correct"

                            let tipData: iDeterminationTipData = {
                                feedback: feedback,
                                tip: tip
                            }
                            player.tips.push(tipData);

                            this._send(player.username, MessageType.DeterminationTipFeedback, feedback);

                            const index: number = this.OptionIds.findIndex(x => tip.answerId == x) + 1;
                            if (index > 0 && index < this.OptionIds.length) {
                                const nextOption: iDeterminationOption = {
                                    questionId: playerQuestion.question.questionId,
                                    option: [this.OptionIds[index], playerQuestion.options[this.OptionIds[index]]]
                                };
                                this._send(username, MessageType.DeterminationOption, nextOption);
                            } else {
                                // process error
                                const errorMessage: iGeneralPlayerInputError = {
                                    message: "Something went wrong with your answering options...",
                                    data: {
                                        player: player,
                                        tip: tip/*,
                                        questionData:   playerQuestion*/
                                    }
                                };
                                if (this._logSilly)
                                    this._logSilly(JSON.stringify(errorMessage));
                                this._send(player.username, MessageType.PlayerInputError, errorMessage);
                                return;
                            }
                        }
                        else {
                            feedback.message = "wrong"

                            let tipData: iDeterminationTipData = {
                                feedback: feedback,
                                tip: tip
                            }
                            player.tips.push(tipData);

                            this._send(player.username, MessageType.DeterminationTipFeedback, feedback);

                            this.QuestionPlayer(player);
                        }
                    }
                } else {
                    feedback.message = "too slow";

                    let tipData: iDeterminationTipData = {
                        feedback: feedback,
                        tip: tip
                    }
                    player.tips.push(tipData);

                    this._send(username, MessageType.DeterminationTipFeedback, feedback);

                    this.QuestionPlayer(player);
                }
            } else {
                // process error
                const errorMessage: iGeneralPlayerInputError = {
                    message: "You already gave a tip for this question",
                    data: {
                        player: player,
                        tip: tip/*,
                        questionData:   playerQuestion*/
                    }
                };
                if (this._logSilly)
                    this._logSilly(JSON.stringify(errorMessage));
                this._send(username, MessageType.PlayerInputError, errorMessage);
            }
        } else {
            // process error
            const errorMessage: iGeneralPlayerInputError = {
                message: "You are not allowed to give a tip",
                data: {
                    player: player,
                    tip: tip/*,
                    questionData:   playerQuestion*/
                }
            };
            if (this._logSilly)
                this._logSilly(JSON.stringify(errorMessage));
            this._send(username, MessageType.PlayerInputError, errorMessage);
        }
    }
}