import * as express from "express";
import * as https from "https";
import * as ExpressRoutes from "./Routes";
import * as auth from "./UserManagement";
import * as http from "http";
import * as body from "body-parser";
import * as cookie from "cookie-parser";
import * as session from "express-session";
import * as morgan from "morgan";
import { logger } from "./logging";
import { io } from "./Socketio";
import * as ejs from "ejs";
import { Editor } from "./QuestionEditor";
import * as cors from "cors";
import { RunningGames } from "../game/RunningGames";
import { GameFactory } from "../game/GameFactory";
import { settings } from "./helper";

let flash: any = require("connect-flash");
let MongoStore: any = require("connect-mongo")(session);

/**
 * Server setup.
 * @class
 */
export class server {
  private port: any = settings.server.https_port || 1337;
  private certificate: object;
  private app: any = express();
  private httpsServer: https.Server;
  private httpExpress: any;
  private httpServer: any;
  private env: any;
  private passport: any;
  private socketIo: any;
  private QuestionEditor: any;
  private cors: any = require("cors");
  public GameSessions: RunningGames;
  public GameFactory: GameFactory;

  /**
   * Initializes the HTTPS server.
   * @constructor
   * @param certificate - Certificate object for HTTPS. `key`, `cert`
   * @param pass - The passport.js object to be used.
   */
  constructor(certificate: object, pass: any) {
    this.certificate = certificate;
    this.httpsServer = https.createServer(this.certificate, this.app);
    this.passport = pass;
    this.QuestionEditor = new Editor();
    this.GameSessions = new RunningGames();
    this.GameFactory = new GameFactory(this.GameSessions);
    this.app.use(function(req: any, res: any, next: any) {
      // Website you wish to allow to connect
      res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
      // Request methods you wish to allow
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE"
      );
      // Request headers you wish to allow
      res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type"
      );
      // Set to true if you need the website to include cookies in the requests sent
      // to the API (e.g. in case you use sessions)
      res.setHeader("Access-Control-Allow-Credentials", true);
      // Pass to next layer of middleware
      next();
    });
    this.app.use(morgan("dev"));
    this.app.use(cookie());
    this.app.use(
      session({
        secret: "AlternativeGraphicalCatdog", //probably change sessionsecret
        name: "session",
        store: new MongoStore({
          url: "mongodb://localhost:27017/amirite",
          ttl: 14 * 24 * 60 * 60
        }),
        proxy: true,
        resave: true,
        saveUninitialized: true
      })
    );
    this.app.use(this.passport.initialize());
    this.app.use(this.passport.session());
    this.app.use(flash());
    this.app.use(body.json());
    this.app.use(body.urlencoded({ extended: true }));
    this.socketIo = new io(
      this.httpsServer,
      this.GameSessions,
      this.GameFactory
    );
    this.app.set("view engine", "ejs");
  }

  /**
   * Starts the server.
   * @function
   */
  StartListening(): void {
    let route: any = new ExpressRoutes.Https(
      this.app,
      this.passport,
      this.QuestionEditor,
      this.GameSessions
    );
    this.httpRedirect();

    try {
      this.httpsServer.listen(this.port, (req: any, res: any) => {
        logger.log(
          "info",
          "HTTPS server started listening on port %d.",
          this.port
        );
      });
    } catch (err) {
      logger.log(
        "error",
        "Stopping program execution - server could not start listening: " +
          err.stack
      );
      process.exit(-1);
    }
  }

  /**
   * Method for the HTTP to HTTPS redirection.
   * @function
   */
  private httpRedirect(): void {
    this.httpExpress = express();
    this.httpServer = http.createServer(this.httpExpress);
    let route: any = new ExpressRoutes.Http(this.httpExpress);
    this.httpServer.listen(settings.server.http_port, (req: any, res: any) => {
      logger.log("info", "HTTP redirect to HTTPS started listening.");
    });
  }
}
