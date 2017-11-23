import * as pass from 'passport';
import * as local from 'passport-local';
import * as scrypt from 'scrypt';
import { models }  from '../models/user';
import { Passport } from 'passport';

export namespace UserManagement{
    export class Authentication{
        private SignupStrategy: local.Strategy;
        private User: models.User = new models.User();
        public passport: any;

        constructor(){
            this.setupSerialization();
            this.SignupStrat();
            pass.use('local-signup', this.SignupStrategy)
            this.passport = pass;
        }

        private setupSerialization(): void {
            pass.serializeUser((user: any, done: any) => {
                done(null, user.id);
            })

            pass.deserializeUser((id: any, done: any) => {
                this.User.userModel.findById(id, (err: any, user: any) => {
                    done(err, user);
                })
            })
        }

        private SignupStrat(): void {
            this.SignupStrategy = new local.Strategy((username: string, password: string, done: any) => {
                process.nextTick(() => {
                    this.User.userModel.findOne({ 'local.userId' : username } , (err: any, user: any) => {
                        if(err) return done(err);
    
                        if(user){
                            return done(null, false /*,flash*/); //Add flash message
                        } else{
                            let newUser: models.User = new models.User();
    
                            newUser.userModel.local.userId = username;
                            newUser.userModel.local.pasword = password;
    
                            newUser.userModel.save((err: Error) => {
                                if(err) throw err;
                                return done(null, newUser);
                            })
                        }
                    })
                })

            } )            
        }
    }
}