import express = require('express');
let app: any = express();
import { bandTest } from './src/bandwidthTest';

let serv = new bandTest.socketServer();

