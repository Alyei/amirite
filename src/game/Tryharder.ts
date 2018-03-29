//#region imports
import { logger } from "../server/logging";
//#endregion

//#region classes
/**
 * The Tryharder-class' purpose is to try to execute a boolean-returning function four a couple times with a time gap in-between
 */
export class Tryharder {
    //#region publicFunctions
    /**
     * Waits for the passed amount of time... That's it actually
     * @param time - time to rest in milliseconds
     */
    private Sleep (time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
      }

    /**
     * Tries to execute the passed method and retries it after the passed amount of timer when it fails
     * @param toTry - the method that is executed
     * @param timeGap - the time gap between every try
     * @param maxTries - the maximum amount of tries
     * @returns - true if a try succeeded, false when all tries failed
     */
    public Tryhard(
        toTry: () => boolean,
        timeGap: number,
        maxTries: number
    ): boolean {
        let result: boolean = false;
        for (let i: number = 0; i < maxTries; i++) {
            try {
                result = toTry();
            } catch (err) {
                logger.log("info", err.message);
            }
            if (result)
                return true;
            this.Sleep(timeGap).then(() => {});
        }
        return false;
    }
    //#endregion
}
//#endregion