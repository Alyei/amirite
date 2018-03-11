"use strict";
exports.__esModule = true;
var express = require("express");
var https = require("https");
var ExpressRoutes = require("./Routes");
var http = require("http");
var body = require("body-parser");
var cookie = require("cookie-parser");
var session = require("express-session");
var morgan = require("morgan");
var logging_1 = require("./logging");
var Socketio_1 = require("./Socketio");
var QuestionEditor_1 = require("./QuestionEditor");
var RunningGames_1 = require("../game/RunningGames");
var GameFactory_1 = require("../game/GameFactory");
var PlayerCom_1 = require("./PlayerCom");
var helper_1 = require("./helper");
var flash = require("connect-flash");
var MongoStore = require("connect-mongo")(session);
/**
 * Server setup.
 * @class
 */
var server = /** @class */ (function () {
    /**
     * Initializes the HTTPS server.
     * @constructor
     * @param certificate - Certificate object for HTTPS. `key`, `cert`
     * @param pass - The passport.js object to be used.
     */
    function server(certificate, pass) {
        this.port = helper_1.settings.server.https_port || 1337;
        this.app = express();
        this.cors = require("cors");
        this.certificate = certificate;
        this.httpsServer = https.createServer(this.certificate, this.app);
        this.passport = pass;
        this.QuestionEditor = new QuestionEditor_1.Editor();
        this.GameSessions = new RunningGames_1.RunningGames();
        this.GameFactory = new GameFactory_1.GameFactory(this.GameSessions);
        this.PlayerComm = new PlayerCom_1.PlayerCommunication(this.GameSessions);
        this.app.use(function (req, res, next) {
            // Website you wish to allow to connect
            res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
            // Request methods you wish to allow
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
            // Request headers you wish to allow
            res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");
            // Set to true if you need the website to include cookies in the requests sent
            // to the API (e.g. in case you use sessions)
            res.setHeader("Access-Control-Allow-Credentials", true);
            // Pass to next layer of middleware
            next();
        });
        this.app.use(morgan("dev"));
        this.app.use(cookie());
        this.app.use(session({
            secret: "AlternativeGraphicalCatdog",
            name: "session",
            store: new MongoStore({
                url: "mongodb://localhost:27017/amirite",
                ttl: 14 * 24 * 60 * 60
            }),
            proxy: true,
            resave: true,
            saveUninitialized: true
        }));
        this.app.use(this.passport.initialize());
        this.app.use(this.passport.session());
        this.app.use(flash());
        this.app.use(body.json());
        this.app.use(body.urlencoded({ extended: true }));
        this.socketIo = new Socketio_1.io(this.httpsServer, this.GameSessions, this.GameFactory, this.PlayerComm);
        this.app.set("view engine", "ejs");
    }
    /**
     * Starts the server.
     * @function
     */
    server.prototype.StartListening = function () {
        var _this = this;
        var route = new ExpressRoutes.Https(this.app, this.passport, this.QuestionEditor, this.GameSessions);
        this.httpRedirect();
        try {
            this.httpsServer.listen(this.port, function (req, res) {
                logging_1.logger.log("info", "HTTPS server started listening on port %d.", _this.port);
            });
        }
        catch (err) {
            logging_1.logger.log("error", "Stopping program execution - server could not start listening: " +
                err.stack);
            process.exit(-1);
        }
    };
    /**
     * Method for the HTTP to HTTPS redirection.
     * @function
     */
    server.prototype.httpRedirect = function () {
        this.httpExpress = express();
        this.httpServer = http.createServer(this.httpExpress);
        var route = new ExpressRoutes.Http(this.httpExpress);
        this.httpServer.listen(helper_1.settings.server.http_port, function (req, res) {
            logging_1.logger.log("info", "HTTP redirect to HTTPS started listening.");
        });
    };
    return server;
}());
exports.server = server;
