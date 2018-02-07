import * as env from "dotenv";
import * as express from "express";
import { server } from "./src/server/server";
import * as fs from "fs";
import * as mongo from "mongoose";
import * as userauth from "./src/server/usermanagement";

env.config();
require("mongoose").Promise = require("bluebird");
const mongodb: any = mongo.connect("mongodb://localhost:27017/amirite", {
  useMongoClient: true
});
let pKey: string = fs.readFileSync(process.env.tls_key as string).toString();
let cert: string = fs.readFileSync(process.env.tls_cert as string).toString();
let creds: object = {
  key: pKey,
  cert: cert
};
let pass: any = new userauth.Authentication();

Error.stackTraceLimit = 2;

let serverano = new server(creds, pass.passport);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let app: any = express();
serverano.StartListening();

/*import * as scrypt from "scrypt";
import * as mongo from "mongoose";
import { Schema } from "mongoose";

let params: scrypt.ParamsObject = scrypt.paramsSync(0.00001, 1024, 0.3);

let mongooo: Schema = new mongo.Schema();

let s1: string = "test";
let wrong: string = "falsepw";
console.log("hashing pw");
//console.time("kdfSync");
let s2: any = scrypt.kdfSync(s1, params);
console.log(s2);
let hexString: string = s2.toString("hex");
console.log(hexString);
console.log(Buffer.from(hexString, "hex"));
//console.timeEnd("kdfSync");

console.log(Buffer.from(s2, "hex"));

//(s1, scrypt.paramsSync(2, 1024,  0.5), 64, 'testo').toString('hex') test;

console.log("verifying correct pw");
console.time("correct");
let correctResult: any = scrypt.verifyKdfSync(
  Buffer.from(hexString, "hex"),
  s1
);
console.timeEnd("correct");
console.log(correctResult);
console.log("");
console.log("verifying wrong pw");
console.time("wrong");
let wrongResult: any = scrypt.verifyKdfSync(s2, wrong);
console.timeEnd("wrong");
console.log(wrongResult);
/*
import { config } from "./src/config/database";
import * as mongo from "mongoose";
import * as test from "./src/models/userSchema";
import { UserData } from "./src/server/helper";
import { MongooseThenable } from "mongoose";
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
});

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
});*/
