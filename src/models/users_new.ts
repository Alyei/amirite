import * as mongo from 'mongoose';
import * as scrypt from 'scrypt';
import { config } from '../config/database';


export namespace models{
    export class User{
        private userId: string;
        private username: string;
        private password: string;
        private email: string;
        private emailConfirmed: string;
        private rooms: string[];
        private firstName?: string;
        private lastName?: string;

        
    }
}