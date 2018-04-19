import { iQuestionQSaveGameData, iQuestionQPlayerData, PlayerRole, iQuestionQGameData, Gamemode, iQuestionQPlayerStatistic, iDeterminationGameData, iDeterminationPlayerData, iDeterminationEndGameData, iDeterminationPlayerStatistic, iMillionaireGameData, iMillionairePlayerData, iDuelEndGameData, iDuelPlayerData } from "../models/GameModels";

/**
 * The GameDataManager-class' purpose is to extract the data of a game that a user is permitted to receive.
 */
export class GameDataManager {
    //#region constructors
    public constructor() { }
    //#endregion

    //#region generalFunctions
    /**
     * Calculates and returns the sum of the numbers of the passed array
     * @param numberArray - array of numbers that are to sum up
     * @returns - number that equals the sum of the passed numbers
     */
    public GetSum(numberArray: number[]): number {
        let result: number = 0;
        for (let j of numberArray) {
            result += j;
        }
        return result;
    }
    //#endregion

    //#region questionQ
    /**
     * Returns the data of a game a user is permitted to see
     * @param gameData - the game's data
     * @param username - the user's username
     * @returns - the game's and the player's data the user may be let known in the formtat: { gameData: any, playerData: any }
     */
    public QQGetPermittedGameData(gameData: iQuestionQSaveGameData, username: string): any {
        const playerData: iQuestionQPlayerData | undefined = gameData.players.find(p => p.username == username);
        const permittedData: any = { gameData: {}, playerData: {} };

        if (!playerData)
            return permittedData;

        permittedData.playerData = playerData;

        if (playerData.roles.find(role => [PlayerRole.Mod, PlayerRole.Host].find(r => r == role) != undefined) != undefined) {
            permittedData.gameData = gameData;
        } else {
            permittedData.gameData = this.QQGetStatisticsOfGame(gameData);
        }

        return permittedData;
    }

    /**
     * Returns a game's statistics
     * @returns - the game's data according to the iQuestionQGameData-interface
     */
    public QQGetStatisticsOfGame(gameData: iQuestionQSaveGameData): iQuestionQGameData {
        return {
            gameId: gameData.gameId,
            gamemode: Gamemode.QuestionQ,
            gameArguments: gameData.gameArguments,
            playerStatistics: this.QQGetPlayerStatisticsOfGame(gameData)
        };
    }

    /**
     * Returns the statistics of every player of a game
     * @returns - an array containing the statistics of each player of the game
     */
    public QQGetPlayerStatisticsOfGame(gameData: iQuestionQSaveGameData): iQuestionQPlayerStatistic[] {
        const result: iQuestionQPlayerStatistic[] = [];
        for (let player of gameData.players) {
            result.push(this.QQGetPlayerStats(player));
        }
        return result;
    }

    /**
     * Returns the players statistics
     * @param player - the player who's statistics are to return
     * @returns - the player's statistics
     */
    public QQGetPlayerStats(player: iQuestionQPlayerData): iQuestionQPlayerStatistic {
        return {
            username: player.username,
            score: player.score,
            roles: player.roles,
            state: player.state,
            questionIds: player.tips.map(td => td.feedback.questionId),
            correctAnswers: player.tips.filter(td => td.feedback.correct).length,
            totalValuedTime: this.GetSum(player.tips.map(td => td.feedback.duration)),
            totalTimeCorrection: this.GetSum(player.tips.map(td => td.feedback.timeCorrection))
        };
    }
    //#endregion

    //#region determination
    /**
     * Returns the data of a game a user is permitted to see
     * @param gameData - the game's data
     * @param username - the user's username
     * @returns - the game's and the player's data the user may be let known in the formtat: { gameData: any, playerData: any }
     */
    public DeGetPermittedGameData(gameData: iDeterminationGameData, username: string): any {
        const playerData: iDeterminationPlayerData | undefined = gameData.players.find(p => p.username == username);
        const permittedData: any = { gameData: {}, playerData: {} };

        if (!playerData)
            return permittedData;

        permittedData.playerData = playerData;

        if (playerData.roles.find(role => [PlayerRole.Mod, PlayerRole.Host].find(r => r == role) != undefined) != undefined) {
            permittedData.gameData = gameData;
        } else {
            permittedData.gameData = this.DeGetStatisticsOfGame(gameData);
        }

        return permittedData;
    }

    /**
     * Returns a game's statistics
     * @returns - the game's data according to the iDeterminationGameData-interface
     */
    public DeGetStatisticsOfGame(gameData: iDeterminationGameData): iDeterminationEndGameData {
        return {
            gameId: gameData.gameId,
            gamemode: Gamemode.Determination,
            gameArguments: gameData.gameArguments,
            playerStatistics: this.DeGetPlayerStatisticsOfGame(gameData)
        };
    }

    /**
     * Returns the statistics of every player of a game
     * @returns - an array containing the statistics of each player of the game
     */
    public DeGetPlayerStatisticsOfGame(gameData: iDeterminationGameData): iDeterminationPlayerStatistic[] {
        const result: iDeterminationPlayerStatistic[] = [];
        for (let player of gameData.players) {
            result.push(this.DeGetPlayerStats(player));
        }
        return result;
    }

    /**
     * Returns the players statistics
     * @param player - the player who's statistics are to return
     * @returns - the player's statistics
     */
    public DeGetPlayerStats(player: iDeterminationPlayerData): iDeterminationPlayerStatistic {
        return {
            username: player.username,
            score: player.score,
            roles: player.roles,
            state: player.state,
            tips: player.tipData.length,
            correctTips: player.tipData.filter(td => td.correct).length,
            totalValuedTime: this.GetSum(player.tipData.map(td => td.duration)),
            totalTimeCorrection: this.GetSum(player.tipData.map(td => td.timeCorrection))
        };
    }
    //#endregion

    //#region millionaire
    /**
     * Returns the data of a game a user is permitted to see
     * @param gameData - the game's data
     * @param username - the user's username
     * @returns - the game's and the player's data the user may be let known in the formtat: { gameData: any, playerData: any }
     */
    public MiGetPermittedGameData(gameData: iMillionaireGameData, username: string): any {
        const playerData: iMillionairePlayerData | undefined = gameData.players.find(p => p.username == username);
        const permittedData: any = { gameData: {}, playerData: {} };

        if (!playerData)
            return permittedData;

        permittedData.playerData = playerData;

        if (playerData.roles.find(role => [PlayerRole.Mod, PlayerRole.Host].find(r => r == role) != undefined) != undefined) {
            permittedData.gameData = gameData;
        } else {
            permittedData.gameData = this.MiGetBriefGameData(gameData);
        }

        return permittedData;
    }

    /**
     * Returns the data of a game excluding the questions' base data
     * @param gameData - the game's data
     * @returns - the game's data excluding the questions' base data in the formtat: { gameId: gameData.gameId, gamemode: gameData.gamemode, gameArguments: gameData.gameArguments, players: gameData.players }
     */
    public MiGetBriefGameData(gameData: iMillionaireGameData): any {
        return {
            gameId: gameData.gameId,
            gamemode: gameData.gamemode,
            gameArguments: gameData.gameArguments,
            players: gameData.players
        };
    }
    //#endregion

    //#region staticFunctions
    /**
     * Returns the data of a game a user is permitted to see
     * @param gameData - the game's data
     * @param username - the user's username
     * @returns - the game's and the player's data the user may be let known in the formtat: { gameData: any, playerData: any }
     */
    public DuGetPermittedGameData(gameData: iDuelEndGameData, username: string): any {
        const playerData: iDuelPlayerData | undefined = gameData.players.find(p => p.username == username);
        const permittedData: any = { gameData: {}, playerData: {} };

        if (!playerData)
            return permittedData;

        permittedData.playerData = playerData;
        permittedData.gameData = gameData;

        return permittedData;
    }
    //#endregion
}