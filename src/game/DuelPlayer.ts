import { iDuelPlayerData, PlayerRole, PlayerState } from "../models/GameModels";
import { PlayerBase, iPlayerBaseArguments } from "./PlayerBase";

export class DuelPlayer extends PlayerBase implements iDuelPlayerData {
    //username: string;
    //state: PlayerState;
    //role: PlayerRole;
    public score: number;
    public ready: boolean;

    /**
     * Creates an instance of the iDuelPlayerData class.
     * @param baseArguments - the arguments that have been returned by the parent's class GetArguments-method
     */
    constructor(baseArguments: iPlayerBaseArguments) {
        super(baseArguments.username, baseArguments.socket, baseArguments.roles);
        //Object.setPrototypeOf(this, new.target.prototype);
        this.state = baseArguments.state;
        this.ready = false;
        this.score = 0;
    }

    /**
     * Returns the player's data as a new JSON.
     * @returns - player data according to the iDuelPlayerData-interface
     */
    public GetPlayerData(): iDuelPlayerData {
        return {
            username: this.username,
            roles: this.roles,
            state: this.state,
            score: this.score
        }
    }
}