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
            let shuffled: any[] = [];

            let index: number;
            while (this.collection.length > 0) {
                index = Math.floor(Math.random() * this.collection.length);
                shuffled.push(this.collection[index]);
                this.collection.splice(index, 1)
            }

            return shuffled;
        }
        return [];
    }
    //#endregion
}
//#endregion