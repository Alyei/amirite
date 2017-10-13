import express = require('express');
import dotenv = require('dotenv');

export namespace Server{
let env: dotenv.DotenvResult = dotenv.config();
export class serverino{
    constructor(){}  
    
    public  app: express.Express = express();

    StartListening(port: number):void {
        this.app.listen(port, (req: any, res: any) => {console.log('Listening on port ' + port)});
    }
}
}
