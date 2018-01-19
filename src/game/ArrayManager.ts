export class ArrayManager {
    public constructor(
        public item?: any[]
    ) { }

    public ShuffleArray(): any[] { // assuming that any[] works
        if (this.item) {
            let shuffled: any[] = [];

            let index: number;
            while (this.item.length > 0) {
                index = Math.floor(Math.random() * this.item.length);
                shuffled.push(this.item[index]);
                this.item.splice(index, 1)
            }

            this.item = shuffled;
            return shuffled;
        }
        return null;
    }
}