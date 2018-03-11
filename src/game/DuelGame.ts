import {
    MessageType,
    Gamemode,
    iGeneralHostArguments,
    iDuelHostArguments,
    iGeneralQuestion,
    iGeneralPlayerInputError,
    PlayerRole
} from "../models/GameModels";
import { logger } from "../server/logging";

// game modes
import { DuelCore } from "./DuelCore";
import { iGame } from "./iGame";
import { PlayerBase } from "./PlayerBase";
import { Socket } from "net";
import {
    PlayerCouldNotBeAddedError,
    QuestionCouldNotBeAddedError
} from "../server/Errors";
import { Tryharder } from "./Tryharder";
import { RunningGames } from "./RunningGames";

export class DuelGame implements iGame {
    private GameCore: DuelCore;

    /**
     * Creates an instance of a Duel-Game.
     * @param GeneralArguments - general game arguments
     * @param namespace - the namespace socket (unused)
     * @param _gameCoreArguments - game specific arguments for Duel
     */
    public constructor(
        readonly GeneralArguments: iGeneralHostArguments,
        public namespace: SocketIO.Namespace,
        runningGames: RunningGames,
        private _gameCoreArguments?: iDuelHostArguments
    ) {
        this.GameCore = new DuelCore(
            this.GeneralArguments.gameId,
            runningGames,
            this._gameCoreArguments || {
                scoreGoal: 100000,
                scoreMin: -10000,
                pointBase: 100,
                pointBase2: 100,
                pointDeductionBase: 50,
                pointDeductionBase2: 50,
                poindDetuctionWhenTooSlow: 10,
                postfeedbackGap: 3000,
                choosingTime1: 5000,
                choosingTime2: 7000,
                maxCategoryChoiceRange: 3,
                maxDifficultyChoiceRange: 3
            },
            this.GeneralArguments.questionIds
        );
    }

    /**
     * Processes game actions received from users.
     * @param username - the user who performs the action
     * @param msgType - the type of the action
     * @param data - the action's data
     */
    public ProcessUserInput(
        username: string,
        messageType: MessageType,
        data: string
    ): void {
        let msgType: MessageType | undefined;
        try { msgType = +messageType; }
        catch (err) {
            let errorMessage: iGeneralPlayerInputError = {
                message: "invalid message type",
                data: { username: username, msgType: messageType }
            };
            this.ProcessUserError(username, errorMessage);
        }

        switch (msgType) {
            case MessageType.DuelTip: {
                try {
                    this.GameCore.PlayerGivesTip(username, JSON.parse(data));
                } catch (err) {
                    this.ProcessUserError(username, { message: err.message, data: err });
                }
                break;
            }
            case MessageType.DuelChoiceReply: {
                try {
                    this.GameCore.ChooseChoice(username, JSON.parse(data));
                } catch (err) {
                    this.ProcessUserError(username, { message: err.message, data: err });
                }
                break;
            }
            case MessageType.DuelChooseDifficultyReply: {
                try {
                    this.GameCore.ChooseDifficulty(username, JSON.parse(data));
                } catch (err) {
                    this.ProcessUserError(username, { message: err.message, data: err });
                }
                break;
            }
            case MessageType.DuelChooseCategoryReply: {
                try {
                    this.GameCore.ChooseCategory(username, JSON.parse(data));
                } catch (err) {
                    this.ProcessUserError(username, { message: err.message, data: err });
                }
                break;
            }
            case MessageType.DuelSetReadyState: {
                try {
                    this.GameCore.SetReadyState(username, JSON.parse(data));
                } catch (err) {
                    this.ProcessUserError(username, { message: err.message, data: err });
                }
                break;
            }
            default: {
                const errorMessage: iGeneralPlayerInputError = {
                    message: "invalid message type",
                    data: { username: username, msgType: msgType }
                };
                this.ProcessUserError(username, errorMessage);
                break;
            }
        }
    }

    /**
     * Processes an user caused error.
     * @param username - the user who caused the error
     * @param errorMessage - the error's error message
     */
    private ProcessUserError(username: string, errorMessage: iGeneralPlayerInputError): void {
        this.LogInfo(JSON.stringify(errorMessage));
        const user: PlayerBase | undefined = this.GameCore.players.find(x => x.username == username);
        if (user) {
            const th: Tryharder = new Tryharder();
            th.Tryhard(
                () => {
                    return user.Inform(MessageType.PlayerInputError, errorMessage);
                },
                3000,
                3
            );
        }
    }

    /**
     * Adds a user with their corresponding socket to the game's players array.
     * @param username - The user's username.
     * @param socket - The user's socket. Access the id through `socket.id`.
     * @returns Promise with the new players-array.
     */
    public AddPlayer(
        username: string,
        socket: SocketIO.Socket,
        role: PlayerRole
    ): Promise<any> {
        return new Promise((resolve: any, reject: any) => {
            try {
                resolve(this.GameCore.AddUser(new PlayerBase(username, socket, role)));
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Disqualifies the player from the game.
     * @param username The username of the player to be disqualified.
     * @returns Promise.
     */
    public RemovePlayer(username: string): Promise<any> {
        return new Promise((resolve: any, reject: any) => {
            try {
                resolve(this.GameCore.DisqualifyUser(username));
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Starts the game.
     * @param username - The user who ordered the game start
     */
    public StartGame(username: string): Promise<any> {
        return new Promise((resolve: any, reject: any) => {
            try {
                const player: PlayerBase | undefined = this.GameCore.players.find(x =>
                    x.username == username
                );
                if (
                    username == this.GeneralArguments.owner ||
                    (player && [PlayerRole.Mod, PlayerRole.Host].find(x => x == player.role))
                ) {
                    resolve(this.GameCore.Start());
                } else {
                    reject(-1);
                }
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Logs magnificient game information.
     * @param toLog - the information to log
     */
    private LogInfo(toLog: string) {
        logger.log(
            "info",
            "Game: " +
            this.GeneralArguments.gameId +
            " - " +
            toLog
        );
    }

    /**
     * Logs silly game information.
     * @param toLog - the information to log
     */
    private LogSilly(toLog: string) {
        logger.log(
            "silly",
            "Game: " +
            this.GeneralArguments.gameId +
            " - " +
            toLog
        );
    }
}