import * as pass from 'passport';
import * as local from 'passport-local';
import * as scrypt from 'scrypt';
import { models }  from '../models/user';

export namespace UserManagement{
    export class Authentication{
        private LocalStrategy: local.Strategy;
        private User: models.User = new models.User();

        constructor(passport: any){
            pass.serializeUser((user: any, done: any) => {
                done(null, user.id);
            })
            this.LocalStrategy = new local.Strategy((username: string, password: string, done: any) => {
                

            } )
        }

        private setup(): void {
            pass.serializeUser((user: any, done: any) => {
                done(null, user.id);
            })

            pass.deserializeUser((id: any, done: any) => {
                this.User.userSchema.findById(id, (err: any, user: any) => {
                    done(err, user);
                })
            })
        }
    }
}