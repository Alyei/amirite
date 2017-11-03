import * as pass from 'passport';
import * as local from 'passport-local';

export namespace UserManagement{
    export class Authentication{
        private LocalStrategy: local.Strategy;

        constructor(){
            this.LocalStrategy = new local.Strategy((username: string, password: string, done: any) => {
                
            } )
        }
    }
}