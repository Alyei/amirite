import * as path from 'path';

export namespace routes{
    export class route{

        private app: any;
        private res: any;

        /**
         * Constructor for the route class.
         * @param app Express server.
         * @param res Passport object.
         */
        constructor(app: any/*, res: any*/){
            this.app = app;
           // this.res = res;
            this.setRoutes();
        }
        /**
         * Sets the express server's routes.
         */
        private setRoutes(){
            this.app.get('/', (req: any, res: any) => {
                res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
            })
        }

    }
}