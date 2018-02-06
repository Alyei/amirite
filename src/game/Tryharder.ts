import { logger } from "../server/logging";

export class Tryharder {
    private Sleep (time: number) {
        return new Promise((resolve) => setTimeout(resolve, time));
      }

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
}