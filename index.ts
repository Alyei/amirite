import express = require('express');
let app: any = express();
import { bandTest } from './src/test/bandwidthTest';
import * as route from './src/server/server' ;

let server = new route.Server.Serverino();

server.StartListening();

//let serv = new bandTest.socketServer();

