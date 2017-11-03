import * as express from 'express';
import * as server from './src/server/server';
import * as fs from 'fs';
import * as env from 'dotenv';
env.config();
let pKey: string = fs.readFileSync(process.env.tls_key as string).toString();
let cert: string = fs.readFileSync(process.env.tls_cert as string).toString();
let creds: object = {
    key: pKey,
    cert: cert    
}

let serverano = new server.Server.Serverino(creds);

let app: any = express();
serverano.StartListening();


