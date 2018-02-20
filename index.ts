import * as env from "dotenv";
import * as express from "express";
import { server } from "./src/server/server";
import * as fs from "fs";
import * as mongo from "mongoose";
import * as userauth from "./src/server/usermanagement";
import { join } from "path";
import { settings } from "./src/server/helper";

env.config();
require("mongoose").Promise = require("bluebird");
const mongodb: any = mongo.connect("mongodb://localhost:27017/amirite", {
  useMongoClient: true
});
let pKey: string = fs
  .readFileSync(join(__dirname + settings.server.tls_cert))
  .toString();
let cert: string = fs
  .readFileSync(join(__dirname + settings.server.tls_key))
  .toString();
let creds: object = {
  key: pKey,
  cert: cert
};
let pass: any = new userauth.Authentication();

let serverano = new server(creds, pass.passport);

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let app: any = express();
serverano.StartListening();
