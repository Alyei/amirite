export class ArrayManager {
    public constructor(
        public collection?: any[]
    ) { }

    public ShuffleArray(): any[] { // assuming that any[] works
        if (this.collection) {
            let shuffled: any[] = [];

            let index: number;
            while (this.collection.length > 0) {
                index = Math.floor(Math.random() * this.collection.length);
                shuffled.push(this.collection[index]);
                this.collection.splice(index, 1)
            }

            this.collection = shuffled;
            return shuffled;
        }
        return [];
    }
}