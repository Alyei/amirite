"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const https = require("https");
const dotenv = require("dotenv");
const routes_1 = require("./routes");
const http = require("http");
/**
 * The amirite server.
 */
var Server;
(function (Server) {
    /**
     * Sets up the https server.
     */
    class Serverino {
        /**
         * Initializes the HTTPS server.
         * @param certificate Certificate object for HTTPS. `key`, `cert`
         */
        constructor(certificate, pass) {
            this.port = process.env.https_port || 1337;
            this.app = express();
            this.certificate = certificate;
            this.httpsServer = https.createServer(this.certificate, this.app);
            this.env = dotenv.config();
            this.passport = pass;
        }
        /**
         * Starts the HTTPS server and the HTTP to HTTPS redirection.
         */
        StartListening() {
            let route = new routes_1.ExpressRoutes.Https(this.app, this.passport);
            this.httpRedirect();
            this.httpsServer.listen(this.port, (req, res) => {
                console.log("Listening on port " + this.port);
            });
        }
        /**
         * Method for the HTTP to HTTPS redirection.
         */
        httpRedirect() {
            this.httpExpress = express();
            this.httpServer = http.createServer(this.httpExpress);
            let route = new routes_1.ExpressRoutes.Http(this.httpExpress);
            this.httpServer.listen(process.env.http_port);
        }
    }
    Server.Serverino = Serverino;
})(Server = exports.Server || (exports.Server = {}));
//# sourceMappingURL=server.js.map