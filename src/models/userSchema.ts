import * as mongoose from 'mongoose';

export namespace schemas{
    export class user{
        public schema: mongoose.Schema;

        constructor(){
            this.setupSchema();
            mongoose.model('user', this.schema);
        }

        private setupSchema(): void{
            this.schema = new mongoose.Schema({
                userId: {
                    type: String,
                    required: true,
                    unique: true,
                    match: /^[0-9]{2,10}$/
                },
                username: {
                    type: String,
                    required: true,
                    match: /^[A-Z0-9]+$/i
                },
                password: {
                    type: String,
                    required: true,
                    minlength: 8
                },
                email: {
                    type: String,
                    required: true,
                    match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}/i
                },
                emailConfirmed: Date,
                created: {
                    type: Date,
                    required: true,
                    default: Date.now()
                },
                rooms: Array,
                firstName: String,
                lastName: String            
            })
        }
    }
}