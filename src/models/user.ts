import * as mongo from 'mongoose';
import * as scrypt from 'scrypt';
import { config } from '../config/database';


export namespace models{
    export class User{
        private userSchema: mongo.Schema;
        private kdfParams: any;
        private signupUser: mongo.MongooseThenable;
        private authUser: mongo.MongooseThenable;
        private dbConfig: any;
        public userModel: any;

        constructor(){
            
            this.kdfParams = scrypt.params(0.1, 1024, 0.5, () => {
                console.log('test');
            });
            
            this.setupSchema();

            this.userModel = mongo.model('User', this.userSchema);

            this.dbConfig = config.database.options;
            this.signupUser = mongo.connect(this.dbConfig['url_readWrite']);
            this.authUser = mongo.connect(this.dbConfig['url_read']);
        }
        
        private setupSchema(): void {
            this.userSchema = new mongo.Schema({
                local: { userId: String, email: String, password: String, rooms: Array, emailConfirmed: Date}
            })

            this.userSchema.methods.generateHash = this.generateHash;
            this.userSchema.methods.validatePassword = this.validatePassword;
        }

        private generateHash(password: string): void {        //Not string because of callback                
            scrypt.kdf(password, this.kdfParams, (err: any, result: any) => {
                if(err) throw new err; //errorhandling
                return result;  //Needs a callback
            });
        }

        private validatePassword(key: Buffer, password: string): void {
            scrypt.verifyKdf(key, password, (err: any, result: any) => {
                console.log('MAATCH!'); //Needs Callback
            })
        }
    }
}