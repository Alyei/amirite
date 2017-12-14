import * as express from "express";
import * as https from "https";
import * as dotenv from "dotenv";
import * as ExpressRoutes from "./routes";
import * as auth from "./user_management";
import * as http from "http";
import * as body from "body-parser";
import * as cookie from "cookie-parser";
import * as session from "express-session";
import * as morgan from "morgan";
let flash: any = require("connect-flash");

/**
 * Server setup.
 * @class
 */
export class server {
  private port: any = process.env.https_port || 1337;
  private certificate: object;
  private app: any = express();
  private httpsServer: https.Server;
  private httpExpress: any;
  private httpServer: any;
  private env: any;
  private passport: any;

  /**
   * Initializes the HTTPS server.
   * @constructor
   * @param certificate - Certificate object for HTTPS. `key`, `cert`
   * @param pass - The passport.js object to be used.
   */
  constructor(certificate: object, pass: any) {
    this.env = dotenv.config();
    this.certificate = certificate;
    this.httpsServer = https.createServer(this.certificate, this.app);
    this.passport = pass;
    this.app.use(morgan("dev"));
    this.app.use(cookie());
    this.app.use(
      session({
        secret: "sessionsecret", //probably change sessionsecret
        name: "test",
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
  }

  /**
   * Starts the server.
   * @function
   */
  StartListening(): void {
    let route: any = new ExpressRoutes.Https(this.app, this.passport);
    this.httpRedirect();
    this.httpsServer.listen(this.port, (req: any, res: any) => {
      console.log(`Listening on port ${this.port}`);
    });
  }

  /**
   * Method for the HTTP to HTTPS redirection.
   * @function
   */
  private httpRedirect(): void {
    this.httpExpress = express();
    this.httpServer = http.createServer(this.httpExpress);
    let route: any = new ExpressRoutes.Http(this.httpExpress);
    this.httpServer.listen(process.env.http_port);
  }
}
