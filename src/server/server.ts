import * as express from 'express';
import * as https from 'https';
import * as dotenv from 'dotenv';
import {ExpressRoutes} from './routes';
import * as auth from './user_management';
import * as http from 'http';

/**
 * The amirite server.
 */
export namespace Server{

    /**
     * Sets up the https server.
     */
export class Serverino{
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
     * @param certificate Certificate object for HTTPS. `key`, `cert`
     */
    constructor(certificate: object){
        this.certificate = certificate;
        this.httpsServer = https.createServer(this.certificate, this.app);
        this.env = dotenv.config();
        this.passport = new auth.UserManagement.Authentication();
    }  
    
    /**
     * Starts the HTTPS server and the HTTP to HTTPS redirection.
     */
    StartListening():void {
        let route: any = new ExpressRoutes.Https(this.app, this.passport.passport);
        this.httpRedirect();
        this.httpsServer.listen(this.port, (req: any, res: any) => {console.log('Listening on port ' + this.port)});
    }

    /**
     * Method for the HTTP to HTTPS redirection.
     */
    private httpRedirect(): void {
        this.httpExpress = express();
        this.httpServer = http.createServer(this.httpExpress);
        let route: any = new ExpressRoutes.Http(this.httpExpress);
        this.httpServer.listen(process.env.http_port);
    }
}
}
