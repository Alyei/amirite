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

/*import * as scrypt from 'scrypt';

let params: scrypt.ParamsObject = scrypt.paramsSync(0.00001, 1024,  0.5);

let s1: string = 'lo5454545454lo';
let wrong: string = 'falsepw';
console.log('hashing pw');
console.time('kdfSync');
let s2: any = scrypt.kdfSync(s1, params);
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