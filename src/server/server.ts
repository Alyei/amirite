import * as express from 'express';
import * as https from 'https';
import  * as dotenv from 'dotenv';
import * as routes from './routes';
import * as auth from './authentication';

export namespace Server{
let env: dotenv.DotenvResult = dotenv.config();
export class Serverino{
    private port: any = process.env.port || 1337;


    constructor(){}  
    
    public  app: express.Express = express();

    StartListening():void {
        let route: any = new routes.routes.route(this.app);
        this.app.listen(this.port, (req: any, res: any) => {console.log('Listening on port ' + this.port)});
    }
}
}
