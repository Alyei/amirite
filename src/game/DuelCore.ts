import { logger } from "../server/logging";
import { RunningGames } from "./RunningGames";
import { Gamemode, iDuelQuestionBase, iDuelHostArguments, MessageType, iSpectatingData, PlayerState, iDuelEndGameData, iDuelPlayerData, iDuelPlayerQuestionData, iDuelAnswerOption, iDuelTimeCorrection, iDuelStartGameData, iDuelTip, iDuelTipFeedback, iDuelTipData, iDuelScoringData, iDuelChooseChoiceReply, DuelChoice, iDuelChooseCategoryRequest, iDuelChooseDifficultyRequest, iDuelChooseDifficultyReply, iDuelChooseCategoryReply, iDuelSetReadyState } from "../models/GameModels";
import { DuelPlayer } from "./DuelPlayer";
import { PlayerBase } from "./PlayerBase";
import { QuestionModel, DuelGameDataModel } from "../models/Schemas";
import { ArrayManager } from "./ArrayManager";
import { Tryharder } from "./Tryharder";

export enum DuelGamePhase {
    Setup = 0,
    Running,
    Ended
}

export class DuelCore {
    readonly Gamemode: Gamemode = Gamemode.Duel;
    public players: DuelPlayer[];
    private questionBases: iDuelQuestionBase[];
    private questions: iDuelPlayerQuestionData[];
    private currentQuestion?: iDuelPlayerQuestionData;
    private gamePhase: DuelGamePhase;
    private timers: { [id: string]: NodeJS.Timer } = {};

    private difficultyChooser?: DuelPlayer;
    private categoryChooser?: DuelPlayer;
    private choiceChooser?: DuelPlayer;
    private difficultyRequest?: iDuelChooseDifficultyRequest;
    private difficultyReply?: iDuelChooseDifficultyReply;
    private categoryRequest?: iDuelChooseCategoryRequest;
    private categoryReply?: iDuelChooseCategoryReply;

    /**
     * Creates a new instance of the QuestionQCore-class
     * @param gameId - the game's id
     * @param questionIds - list of the questions' IDs
     * @param players - list of players that are here from the beginning
     * @param gameArguments - QuestionQ-specific game arguments
     */
    public constructor(
        readonly gameId: string,
        private runningGames: RunningGames,
        private gameArguments: iDuelHostArguments,
        questionIds: string[]
    ) {
        this.gamePhase = DuelGamePhase.Setup;
        this.questions = [];
        this.players = [];

        this.LoadQuestions(questionIds);
    }

    /**
     * Sends the passed data to the player and all spectators
     * @param player - the main target for the data
     * @param msgType - defines the data's type
     * @param data - the data that is to be sent
     * @returns - whether no error happened
     */
    private InformPlayer(
        player: DuelPlayer,
        msgType: MessageType,
        data: any
    ): boolean {
        const th: Tryharder = new Tryharder();
        const result: boolean = th.Tryhard(() =>
            {
                return player.Inform(
                    msgType,
                    data
                );
            },
            3000, // delay
            3 // tries
        );
        if (!result) {
            this.DisqualifyPlayer(player);
            this.CheckForEnd();
        }

        return result;
    }

    public GetSaveGameData(): iDuelEndGameData {
        return {
            gameId: this.gameId,
            gamemode: this.Gamemode,
            gameArguments: this.gameArguments,
            playerData: this.players.map(player => player.GetPlayerData()),
            questionBases: this.questionBases,
        } as iDuelEndGameData;
    }

    /**
     * Adds a new user to the game, if it did not end already.
     * @param player - the player to add
     * @returns - whether the user could be added
     */
    public AddUser(player: PlayerBase): boolean {
        if (this.players.find(p => p.username == player.username)) {
            return false; // player already joined
        }
        if (this.gamePhase == DuelGamePhase.Setup) {
            this.players.push(new DuelPlayer(player.GetArguments()));
            player.state = PlayerState.Launch;
            return true;
        }
        return false;
    }

    public SetReadyState(username: string, rs: iDuelSetReadyState) {
        const player: DuelPlayer | undefined = this.players.find(p => p.username == username);
        if (!player) {
            return; // player not found
        }
        player.ready = rs.ready;
        
        // do start when conditions are met
        /*if (this.players.length != 2)
            return;
        for (let p of this.players) {
            if (!p.ready)
                return;
        }*/

        this.Start();
    }

    /**
     * Saves the game's data into the DB
     */
    public Save(): void {
        const gameData: iDuelEndGameData = this.GetSaveGameData();
        const gameDataModel = new DuelGameDataModel(gameData);
        gameDataModel.save((err: any) => {
            if (err) {
                logger.log(
                    "info",
                    "failed to save game (%s); error: %s",
                    gameData,
                    err
                );
                return;
            }
            this.LogSilly("the game has been saved");
        });
    }

    /**
     * Loads the questions' data from the DB.
     * @param questionIds - list of IDs of the questions that are to load from the DB
     */
    private LoadQuestions(questionIds: string[]) {
        this.questionBases = [];
        QuestionModel.find({ id: { $in: questionIds } })
            .then((res: any) => {
                for (let question of res) {
                    try {
                        this.questionBases.push({
                            questionId: question.id,
                            question: question.question,
                            answer: question.answer,
                            otherOptions: question.otherOptions,
                            timeLimit: question.timeLimit,
                            difficulty: question.difficulty,
                            explanation: question.explanation,
                            pictureId: question.pictureId,
                            questionCounter: 0
                        });
                    } catch {
                        this.LogInfo("Failed to load question (" + JSON.stringify(question) + ")");
                    }
                }
                const am: ArrayManager = new ArrayManager(this.questionBases);
                this.questionBases = am.ShuffleArray();
                logger.log(
                    "silly",
                    "Questions (%s) loaded in game %s.",
                    JSON.stringify(this.questionBases),
                    this.gameId
                );
            })
            .catch((err: any) => {
                logger.log("info", "Could not load questions in %s.", this.gameId);
            });
    }

    /**
     * Returns an array of the players' data.
     * @returns - array of the players' data according to the iDuelPlayerData-interface
     */
    public GetPlayerData(): iDuelPlayerData[] {
        return this.players.map(player => player.GetPlayerData());
    }

    /**
     * Sends the game's data to all players.
     */
    private SendGameData(): void {
        const gameData = this.GetSaveGameData();
        const players: DuelPlayer[] = this.players;
        for (let player of players) {
            this.InformPlayer(
                player,
                MessageType.DuelEndGameData,
                gameData
            );
        }
        //this.SendToRoom(MessageType.QuestionQGameData, gameData);
    }

    /**
     * Checks whether a player is taking too much time for answering a question
     * @param player - the player
     * @param question - the questioning data
     */
    private CheckQuestionTime(
        player: DuelPlayer,
        question: iDuelPlayerQuestionData
    ): void {
        if (this.currentQuestion != question) {
            return; // question not current
        }
        if (question.tip) {
            return; // already answered
        }
        try {
            this.timers[
                player.username + ":" + question.question.questionId
            ] = global.setTimeout(() => {
                    if (this.currentQuestion != question) {
                        return; // question not current
                    }
                    if (question.tip) {
                        return; // already answered
                    }
                    this.PlayerGivesTip(player.username, {
                        questionId: question.question.questionId,
                        answerId: "none"
                    });
                },
                player.Ping / 2
            );
        } catch (err) {
            logger.log("info", "Error: %s", err.stack);
        }
    }

    /**
     * Generates a DuelPlayerQuestion out of a JSON implementing the iDuelQuestionBase-interface.
     * @param question - the question base's data
     * @returns - an iDuelPlayerQuestionData
     */
    public GetDuelPlayerQuestion(
        question: iDuelQuestionBase
    ): iDuelPlayerQuestionData {
        question.questionCounter++;

        const am: ArrayManager = new ArrayManager("A B C D".split(" "));
        const letters: string[] = am.ShuffleArray();
        const answers: iDuelAnswerOption[] = [];
        answers.push({
            answerId: letters[0],
            answer: question.answer
        });
        for (let i: number = 1; i < letters.length; i++) {
            answers.push({
                answerId: letters[i],
                answer: question.otherOptions[i - 1]
            });
        }
        answers.sort((a, b) => a.answerId.charCodeAt(0) - b.answerId.charCodeAt(0));

        try {
        return {
            question: {
                questionId: question.questionId,
                question: question.question,
                options: answers,
                timeLimit: question.timeLimit,
                difficulty: question.difficulty
            },
            correctAnswer: letters[0],
            questionTime: new Date(),
            timeCorrections: {}
        };
        } catch (err) {
            this.LogInfo("failed to generate question (" + JSON.stringify(err) + ")");
        }
        return undefined;
    }

    /**
     * Disqualifies a user by their name
     * @param username - user to disqualify
     * @returns - whether the user was found
     */
    public DisqualifyUser(username: string): boolean {
        const player: DuelPlayer | undefined = this.players.find(
            x => x.username == username
        );
        if (!player) {
            this.LogInfo("could not find player '" + username + "'");
            return false;
        }

        this.DisqualifyPlayer(player);
        return true;
    }

    /**
     * Disqualifies a player
     * @param player - player to disqualify
     */
    private DisqualifyPlayer(player: DuelPlayer): void {
        if (DuelGamePhase.Setup)
            this.players.splice(this.players.findIndex(p => p.username == player.username), 1);
        else {
            player.state = PlayerState.Disqualified;
            if (DuelGamePhase.Running) {
                player.StopPing();
                this.CheckForEnd();
            }
        }
    }

    /**
     * Starts the game, if all conditions are met.
     * @returns - whether the game has been started
     */
    public Start(): boolean {
        if (this.gamePhase != DuelGamePhase.Setup) {
            return false; // game not in setup phase
        }
        if (this.players.length != 2) {
            return false; // invalid player array
        }
        for (let p of this.players) {
            if (!p.ready) {
                return false; // player not ready
            }
        }

        this.gamePhase = DuelGamePhase.Running;
        const startGameData: iDuelStartGameData = this.GetStartGameData();
        for (let player of this.players) {
            this.InformPlayer(player, MessageType.DuelStartGameData, startGameData);
            player.state = PlayerState.Playing;
            player.StartPing();
            this.AskQuestion();
        }
        return true;
    }

    public GetStartGameData(): iDuelStartGameData {
        const startGameData: iDuelStartGameData = {
            gameId: this.gameId,
            players: this.players.map(player => player.username),
            gameArguments: this.gameArguments
        };
        return startGameData;
    }

    /**
     * Ends the game
     */
    public Stop(): void {
        this.gamePhase = DuelGamePhase.Ended;

        this.SendGameData();

        this.Save();

        this.runningGames.Sessions.splice(
            this.runningGames.Sessions.findIndex(
                x => x.GeneralArguments.gameId == this.gameId
            ),
            1
        );
    }

    /**
     * Checks whether the game end's conditions are met and, if so, ends the game.
     * This has to be executed whenever a player is disqualified and whenever a player finishes.
     */
    public CheckForEnd(): boolean {
        let result = false;
        if (this.gamePhase == DuelGamePhase.Running) {
            for (let player of this.players) {
                if (player.score >= this.gameArguments.scoreGoal)
                    player.state = PlayerState.Finished;
                else if (player.score <= this.gameArguments.scoreMin)
                    player.state = PlayerState.Disqualified;
            }
            if (this.players.find(player =>
                [PlayerState.Disqualified, PlayerState.Finished].find(state => state == player.state) != undefined
            )) {
                result = true;
                this.Stop();
            }
        }
        return result;
    }

    /**
     * Questions the passed player or processes that they finished.
     * @param player - the player to be questioned
     */
    private AskQuestion(): void {
        this.currentQuestion = undefined;
        this.CheckForEnd();

        if (!this.difficultyReply)
            this.difficultyReply = { difficulty: -1 }
        if (!this.categoryReply)
            this.categoryReply = { category: "none" }

        this.questionBases.sort((a, b) => a.questionCounter - b.questionCounter);

        let questionBase: iDuelQuestionBase | undefined = this.questionBases.find(q =>
            q.categories.find(c => c == this.categoryReply.category) != undefined // question has category
            && q.difficulty == this.difficultyReply.difficulty // question has difficulty
        );
        if (!questionBase && this.questionBases.length > 0)
            questionBase = this.questionBases[0];
        
        if (!questionBase) {
            this.Stop();
            return; // no valid questionBase found
        }
        this.currentQuestion = this.GetDuelPlayerQuestion(questionBase);
        if (!this.currentQuestion) {
            this.Stop();
            return; // failed question generation
        }

        for (let player of this.players) {
            // set time corrections
            this.currentQuestion.timeCorrections[player.username] = player.Ping / 2;

            // start timers
            this.timers[
                "questionTimeout;" +
                player.username +
                ";" +
                this.currentQuestion.question.questionId
            ] = global.setTimeout(
                () => {
                    this.CheckQuestionTime(player, this.currentQuestion);
                },
                this.currentQuestion.question.timeLimit + (this.currentQuestion.timeCorrections[player.username] || 0)
            );

            // send nextQuestion to Username
            this.InformPlayer(
                player,
                MessageType.DuelQuestion,
                this.currentQuestion.question
            );
        }
    }

    private ValidateTip(player: DuelPlayer, opponent: DuelPlayer) {
        if (!this.currentQuestion) {
            return; // no question
        }
        if (!this.currentQuestion.tip) {
            return; // no tip
        }

        this.currentQuestion.feedback = {
            questionId: this.currentQuestion.question.questionId,
            tip: this.currentQuestion.tip,
            scoring: {},
            correctAnswer: this.currentQuestion.correctAnswer,
            explanation: this.currentQuestion.explanation
        };
        this.currentQuestion.feedback.scoring[player.username] = {
            points: 0,
            score: player.score,
            state: player.state
        };
        this.currentQuestion.feedback.scoring[opponent.username] = {
            points: 0,
            score: opponent.score,
            state: opponent.state
        };

        // "none" may not be sent by player
        if (this.currentQuestion.tip.answerId == "none" || this.currentQuestion.tip.duration > this.currentQuestion.question.timeLimit) {
            // too late
            this.currentQuestion.tip.correct = false;
            this.currentQuestion.tip.message = "too slow";
            this.currentQuestion.feedback.scoring[player.username].points =  Math.floor(-this.gameArguments.pointDeductionWhenTooSlow);
            this.currentQuestion.feedback.scoring[opponent.username].points = this.currentQuestion.feedback.scoring[player.username].points;
        } else {
            if (this.currentQuestion.tip.answerId == this.currentQuestion.correctAnswer) {
                // correct
                this.currentQuestion.tip.correct = true;
                this.currentQuestion.tip.message = "correct answer";
                this.currentQuestion.feedback.scoring[player.username].points = Math.floor(
                    this.currentQuestion.question.difficulty * (
                        this.gameArguments.pointBase + (
                            this.currentQuestion.question.timeLimit / (
                                this.gameArguments.pointBase2 + this.currentQuestion.tip.duration
                            )
                        )
                    )
                );
            } else {
                // wrong
                this.currentQuestion.tip.correct = false;
                this.currentQuestion.tip.message = "wrong answer";
                this.currentQuestion.feedback.scoring[player.username].points = Math.floor(
                    -this.currentQuestion.question.difficulty * (
                        this.gameArguments.pointDeductionBase + (
                            this.currentQuestion.question.timeLimit / (
                                this.gameArguments.pointDeductionBase2 + this.currentQuestion.tip.duration
                            )
                        )
                    )
                );
            }
        }
        player.score += this.currentQuestion.feedback.scoring[player.username].points;
        opponent.score += this.currentQuestion.feedback.scoring[opponent.username].points;

        this.currentQuestion.feedback.scoring[player.username].score = player.score;
        this.currentQuestion.feedback.scoring[opponent.username].score = opponent.score;

        for (let p of this.players) {
            if (p.score >= this.gameArguments.scoreGoal)
                p.state = PlayerState.Finished;
            else if (p.score < this.gameArguments.scoreMin)
                p.state = PlayerState.Disqualified;
            if (this.currentQuestion.feedback.scoring[p.username])
                this.currentQuestion.feedback.scoring[p.username].state = p.state;
            else
                this.LogInfo("stranger things happened: " + JSON.stringify(this.players.map(x => x.GetPlayerData())));
            this.InformPlayer(
                p,
                MessageType.DuelTipFeedback,
                this.currentQuestion.feedback
            );
        }

        this.questions.push(this.currentQuestion);

        this.currentQuestion = undefined;

        
        if (this.CheckForEnd()) {
            return; // game over
        }

        // next question
        if (player.score != opponent.score) {
            const leadingScore: number = Math.max(...this.players.map(p => p.score));
            for (let p of this.players) {
                if (p.score == leadingScore) {
                    this.choiceChooser = p;
                    this.InformPlayer(
                        p,
                        MessageType.DuelChoiceRequest,
                        {}
                    );
                    this.timers[
                        "chooseChoice"
                    ] = global.setTimeout(
                        () => {
                            this.ChooseChoice(
                                p.username,
                                {
                                    choiceChoice: Math.floor(Math.random() * 3) // random choice DuelChoice
                                }
                            );
                        },
                        this.gameArguments.postFeedbackGap + this.gameArguments.choosingTime1
                    );
                }
            }
        } else {
            this.timers[
                "nextQuestion"
            ] = global.setTimeout(
                () => {
                    this.AskQuestion();
                },
                this.gameArguments.postFeedbackGap
            );
        }
    }

    public ChooseChoice(username: string, choiceChoice: iDuelChooseChoiceReply) {
        if (!this.choiceChooser) {
            return; // no choice chooser
        }
        if (this.choiceChooser.username != username) {
            return; // not the choice chooser
        }
        
        const opponent: DuelPlayer | undefined = this.players.find(p => p.username != username);
        if (!opponent) {
            return; // invalid player data
        }
        
        const choiceChooser: DuelPlayer = this.choiceChooser;
        this.choiceChooser = undefined;

        const am: ArrayManager = new ArrayManager(this.questionBases);
        this.questionBases = am.ShuffleArray();

        const categories: string[] = [];
        for (let i: number = 0; i < this.questionBases.length; i++) {
            for (let j: number = 0; j < this.questionBases[i].categories.length; j++) {
                if (!categories.find(dist => dist == this.questionBases[i].categories[j])) {
                    categories.push(this.questionBases[i].categories[j]);
                    if (categories.length >= this.gameArguments.maxCategoryChoiceRange) {
                        j = this.questionBases[i].categories.length;
                        i = this.questionBases.length;
                    }
                }
            }
        }
        const difficulties: number[] = [];
        for (let i: number = 0; i < this.questionBases.length; i++) {
            if (!difficulties.find(dist => dist == this.questionBases[i].difficulty)) {
                difficulties.push(this.questionBases[i].difficulty);
                if (difficulties.length >= this.gameArguments.maxDifficultyChoiceRange)
                    i = this.questionBases.length;
            }
        }

        this.categoryRequest = {
            categories: categories
        };
        this.difficultyRequest = {
            difficulties: difficulties
        };

        switch (choiceChoice.choiceChoice) {
            case DuelChoice.Category: {
                this.categoryChooser = choiceChooser;
                this.difficultyChooser = opponent;
                break;
            }
            case DuelChoice.Difficulty: {
                this.difficultyChooser = choiceChooser;
                this.categoryChooser = opponent;
                break;
            }
        }

        this.InformPlayer(
            this.categoryChooser,
            MessageType.DuelChooseCategoryRequest,
            this.categoryRequest
        );
        this.InformPlayer(
            this.categoryChooser,
            MessageType.DuelChooseDifficultyRequest,
            this.difficultyRequest
        );

        this.timers[
            "chooseDifficulty"
        ] = global.setTimeout(
            () => {
                if (this.difficultyChooser && this.difficultyRequest && this.difficultyRequest.difficulties.length > 0) {
                    this.ChooseDifficulty(
                        this.difficultyChooser.username,
                        {
                            difficulty: this.difficultyRequest.difficulties[Math.floor(Math.random() * this.difficultyRequest.difficulties.length)]
                        }
                    );
                }
            },
            this.gameArguments.choosingTime2
        );
        this.timers[
            "chooseCategory"
        ] = global.setTimeout(
            () => {
                if (this.categoryChooser && this.categoryRequest && this.categoryRequest.categories.length > 0) {
                    this.ChooseCategory(
                        this.categoryChooser.username,
                        {
                            category: this.categoryRequest.categories[Math.floor(Math.random() * this.categoryRequest.categories.length)]
                        }
                    );
                }
            },
            this.gameArguments.choosingTime2
        );
    }

    public ChooseDifficulty(username: string, choice: iDuelChooseDifficultyReply) {
        if (!this.difficultyChooser) {
            return; // no difficulty chooser
        }
        if (this.difficultyChooser.username != username) {
            return; // not the difficulty chooser
        }
        if (this.difficultyReply) {
            return; // already chosen
        }
        if (!this.difficultyRequest.difficulties.find(d => d == choice.difficulty)) {
            return; // not a valid option
        }

        const difficultyChooser: DuelPlayer = this.difficultyChooser;
        this.difficultyChooser = undefined;

        this.difficultyReply = choice;

        if (this.categoryReply)
            this.AskQuestion();
    }

    public ChooseCategory(username: string, choice: iDuelChooseCategoryReply) {
        if (!this.categoryChooser) {
            return; // no category chooser
        }
        if (this.categoryChooser.username != username) {
            return; // not the category chooser
        }
        if (this.categoryReply) {
            return; // already chosen
        }
        if (!this.categoryRequest.categories.find(c => c == choice.category)) {
            return; // not a valid option
        }

        const categoryChooser: DuelPlayer = this.categoryChooser;
        this.categoryChooser = undefined;

        this.categoryReply = choice;

        if (this.difficultyReply)
            this.AskQuestion();
    }

    /**
     * Processes a 'player that is giving a tip'-action.
     * @param username - the name of the user, who is giving the tip
     * @param tip - the tip that is given
     */
    public PlayerGivesTip(username: string, tip: iDuelTip): void {
        if (this.players.length != 2) {
            return; // invalid player count
        }
        const player: DuelPlayer | undefined = this.players.find(
            x => x.username == username
        );
        if (!player) {
            this.LogInfo("could not find player '" + username + "'");
            return; // player not found
        }
        if (this.gamePhase != DuelGamePhase.Running) {
            return; // not running
        }
        if (player.state != PlayerState.Playing) {
            return; // not playing
        }
        if (!this.currentQuestion) {
            return; // no question asked
        }
        if (this.currentQuestion.question.questionId != tip.questionId) {
            return; // different question
        }
        if (this.currentQuestion.feedback) {
            return; // tip already given
        }

        this.currentQuestion.timeCorrections[player.username] =
            (this.currentQuestion.timeCorrections[player.username] || 0)
            + player.Ping / 2;

        const tipData: iDuelTipData = {
            username: player.username,
            answerId: tip.answerId,
            correct: false,
            duration:
                new Date().getTime() -
                this.currentQuestion.questionTime.getTime() -
                (this.currentQuestion.timeCorrections[player.username] || 0),
            timeCorrection: this.currentQuestion.timeCorrections[player.username] || 0
        };

        if (tipData.duration < 0) {
            //return; // invalid duration
            this.LogSilly("negative time: " + JSON.stringify(tipData));
            tipData.duration = 0;
        }

        const opponent: DuelPlayer | undefined = this.players.find(o => o.username != player.username);
        if (!opponent) {
            return; // invalid player tuple
        }

        if (this.currentQuestion.tip) { // second tip
            if (this.currentQuestion.tip.duration > tipData.duration) {
                this.currentQuestion.tip = tipData;
                this.ValidateTip(player, opponent);
            } else {
                this.ValidateTip(opponent, player);
            }
        } else { // first tip
            this.currentQuestion.tip = tipData;
            this.CheckQuestionTime(opponent, this.currentQuestion);
        }
    }

    /**
     * Logs magnificient information.
     * @param toLog - information that is to log
     */
    private LogInfo(toLog: string) {
        logger.log("info", this.gameId + " - " + toLog);
    }

    /**
     * Logs less unique information.
     * @param toLog - information that is to log
     */
    private LogSilly(toLog: string) {
        logger.log("silly", this.gameId + " - " + toLog);
    }
}
