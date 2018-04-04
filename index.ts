import * as express from "express";
import { server } from "./src/server/server";
import * as fs from "fs";
import * as mongo from "mongoose";
import * as userauth from "./src/server/usermanagement";
import { join } from "path";
import { settings } from "./src/server/helper";
import { logger } from "./src/server/logging";

if (
  !fs.existsSync(join(__dirname + settings.server.tls_cert)) ||
  !fs.existsSync(join(__dirname + settings.server.tls_key))
) {
  logger.log(
    "error",
    "The keys for HTTPS aren't where they are supposed to be. Read the docs for more information."
  );

  process.exit(-1);
}
require("mongoose").Promise = require("bluebird");
const mongodb: any = mongo.connect(settings.server.db_connection, {
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

let app: any = express();
serverano.StartListening();
