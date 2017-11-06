import * as mongo from 'mongoose';
import * as scrypt from 'scrypt';

export namespace models{
    export class User{
        public userSchema: mongo.Schema;
        private kdfParams: any;

        constructor(){
            this.userSchema = new mongo.Schema({
                local: { userId: String, email: String, password: String, rooms: Array, emailConfirmed: Date}
            })
            this.kdfParams = scrypt.params(0.1, 1024, 0.5, () => {
                console.log('test');
            });
        }
        
        public generateHash(password: string): void{        //Not string because of callback                
            scrypt.kdf(password, this.kdfParams, (err: any, result: any) => {
                if(err) throw new err;
                return result;  //Needs a callback
            });
        }
    }
}