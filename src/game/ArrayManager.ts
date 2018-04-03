//#region classes
/**
 * The purpose of the ArrayManager-class is to manage an array.
 * @author Georg Schubbauer
 */
export class ArrayManager {
    //#region constructors
    /**
     * Creates a new instance of the ArrayManager-class
     * @param collection - the array that is to manage
     */
    public constructor(
        public collection?: any[]
    ) { }
    //#endregion

    //#region publicFunctions
    /**
     * Returns a shuffled version of the current array
     * @returns - the shuffled array
     */
    public ShuffleArray(): any[] { // assuming that any[] works
        if (this.collection) {
            const col: any[] = [];
            for (let item of this.collection) {
                col.push(item);
            }

            let shuffled: any[] = [];

            let index: number;
            while (col.length > 0) {
                index = Math.floor(Math.random() * col.length);
                shuffled.push(col[index]);
                col.splice(index, 1)
            }

            return shuffled;
        }
        return [];
    }
    //#endregion
}
//#endregion