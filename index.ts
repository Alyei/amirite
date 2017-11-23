/*import * as express from "express";
import * as server from "./src/server/server";
import * as fs from "fs";
import * as env from "dotenv";
import { UserManagement } from "./src/server/user_management";


env.config();
let pKey: string = fs.readFileSync(process.env.tls_key as string).toString();
let cert: string = fs.readFileSync(process.env.tls_cert as string).toString();
let creds: object = {
  key: pKey,
  cert: cert
};
//let pass: any = new UserManagement.Authentication();

let serverano = new server.Server.Serverino(creds);



let app: any = express();
serverano.StartListening();*/

/*

import * as scrypt from 'scrypt';
import * as mongo from 'mongoose';
import { Schema } from 'mongoose';

let params: scrypt.paramsObject = scrypt.paramsSync(0.00001, 1024,  0.3);

let mongooo: Schema = new mongo.Schema();







let s1: string = 'sklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsdsklhfsakldjhf2io38rhgwelkdfjhedkfljhsadfkjsd';
let wrong: string = 'falsepw';
console.log('hashing pw');
console.time('kdfSync');
let s2: any = scrypt.kdfSync(s1, params);
console.log(s2.toString('hex'));
console.timeEnd('kdfSync');


//(s1, scrypt.paramsSync(2, 1024,  0.5), 64, 'testo').toString('hex') test;

console.log('verifying correct pw');
console.time('correct');
let correctResult: any = scrypt.verifyKdfSync(s2, s1);
console.timeEnd('correct');
console.log(correctResult);
console.log("");
console.log('verifying wrong pw');
console.time('wrong');
let wrongResult: any = scrypt.verifyKdfSync(s2, wrong);
console.timeEnd('wrong');
console.log(wrongResult);*/

import { config } from "./src/config/database";
import * as mongo from "mongoose";
import * as test from "./src/models/userSchema";
import { UserData } from "./src/server/helper";
import { MongooseThenable } from "mongoose";
import * as users from "./src/models/user_new";
import * as scrypt from "scrypt";

let dbPromise: MongooseThenable = mongo.connect(
  "mongodb://localhost:27017/users",
  {
    useMongoClient: true
  }
);

let user: any = mongo.model("user", test.userSchema);
/*let andrej: any = new user({
  userId: "69",
  username: "alyei",
  password: "pwtest234243",
  email: "test@test.com"
});
andrej.save((err: any, user: any) => {
  if (err) return console.error(err);
  console.log("Saved");
});*/

let params: scrypt.ParamsObject = scrypt.paramsSync(2);

let testUser: any = new user({
  username: "alyei",
  password: "password",
  email: "andrej.resanovic@gmail.com"
});

user.findOne({ username: testUser.username }, (err: any, person: any) => {
  if (err) return console.error(err);
  if (!person) UserData.hashPwAndSave(testUser, params);
  else {
    return console.log("user exists");
  }
});
