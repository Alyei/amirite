//#region imports
import { iDuelPlayerData, PlayerRole, PlayerState } from "../models/GameModels";
import { PlayerBase, iPlayerBaseArguments } from "./PlayerBase";
//#endregion

//#region classes
/**
 * The DuelPlayer-class provides all data for a player in a Duel-game by implementing the iDuelPlayerData-interface and extending the PlayerBase-class.
 * @author Georg Schubbauer
 */
export class DuelPlayer extends PlayerBase implements iDuelPlayerData {
    //#region properties
    /**
     * - indicates the player's current score
     */
    public score: number;

    /**
     * - indicates whether the player is ready to begin
     */
    public ready: boolean;
    //#endregion

    //#region constructors
    /**
     * Creates an instance of the iDuelPlayerData class
     * @param baseArguments - the arguments that have been returned by the parent's class GetArguments-method
     */
    constructor(baseArguments: iPlayerBaseArguments) {
        super(baseArguments.username, baseArguments.socket, baseArguments.roles);
        //Object.setPrototypeOf(this, new.target.prototype);
        this.state = baseArguments.state;
        this.ready = false;
        this.score = 0;
    }
    //#endregion

    //#region publicFunctions
    /**
     * Returns the player's data as a new JSON
     * @returns - player data according to the iDuelPlayerData-interface
     */
    public GetPlayerData(): iDuelPlayerData {
        return {
            username: this.username,
            roles: this.roles,
            state: this.state,
            score: this.score,
            ready: this.ready
        }
    }
    //#endregion
}
//#endregion