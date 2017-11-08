import * as mongo from 'mongoose';
import * as scrypt from 'scrypt';


export namespace models{
    export class User{
        private userSchema: mongo.Schema;
        private kdfParams: any;
        public userModel: any;

        constructor(){
            
            this.kdfParams = scrypt.params(0.1, 1024, 0.5, () => {
                console.log('test');
            });
            this.userModel = mongo.model('User', this.userSchema);

            
        }
        
        private setupSchema(): void {
            this.userSchema = new mongo.Schema({
                local: { userId: String, email: String, password: String, rooms: Array, emailConfirmed: Date}
            })

            this.userSchema.methods.generateHash = this.generateHash;
        }

        private generateHash(password: string): void {        //Not string because of callback                
            scrypt.kdf(password, this.kdfParams, (err: any, result: any) => {
                if(err) throw new err; //errorhandling
                return result;  //Needs a callback
            });
        }

        private validatePassword(key: Buffer, password: string): void {
            scrypt.verifyKdf(key, password, () => {
                console.log('MAATCH!'); //Needs Callback
            })
        }
    }
}