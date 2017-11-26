"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const io = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");
var bandTest;
(function (bandTest) {
    let env = dotenv.config();
    class socketServer {
        constructor() {
            this.createApp();
            this.config();
            this.createServer();
            this.sockets();
            this.listen();
        }
        createApp() {
            this.app = express();
            this.app.get('/', (req, res) => {
                res.sendFile(path.join(__dirname, '..', 'public', 'index.html')); //path.join enables relative paths
            });
        }
        config() {
            this.port = socketServer.PORT;
        }
        createServer() {
            this.server = http.createServer(this.app);
        }
        sockets() {
            this.io = io(this.server);
        }
        listen() {
            this.server.listen(this.port, () => {
                console.log('Running server on port %s', this.port);
            });
            this.io.on('connect', (socket) => {
                console.log('Client connected.');
            });
        }
    }
    socketServer.PORT = 1234;
    bandTest.socketServer = socketServer;
})(bandTest = exports.bandTest || (exports.bandTest = {}));
//# sourceMappingURL=bandwidthTest.js.map