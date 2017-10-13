import express = require('express');
let app: any = express();
import { Server } from './src/server';

let serc: Server.serverino = new Server.serverino();

serc.StartListening(1234);