import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * Route-setting library for amirite.
 */
export namespace ExpressRoutes{
    /**
     * Sets routes for the HTTPS server.
     */
    export class Https{

        private app: any;
        private res?: any;

        /**
         * Sets up the routes.
         * @param app Express server.
         * @param res Passport object.
         */
        constructor(app: any, res?: any){
            this.app = app;
            this.res = res;
            this.setRoutes();
        }

        /**
         * Sets the express server's routes.
         */
        private setRoutes(){
            this.app.get('/', (req: any, res: any) => {
                res.sendFile(path.join(__dirname, '..', '..', 'public', 'index.html'));
            })
            
            this.app.get('/login', (req: any, res: any) => {
                res.sendFile(path.join(__dirname, '..', '..', 'public', 'login.html'));
            })

            this.app.get('/signup', (req: any, res: any) => {
                res.sendFile(path.join(__dirname, '..', '..', 'public', 'signup.html'));
            })
            
            this.app.post('/login', (req: any, res: any) => {
                console.log(req);
            })
        }

    }

    /**
     * Sets the redirect route for the HTTPS server,
     * to redirect from HTTP to HTTPS.
     */
    export class Http{
        private app: any;
        private env: any;

            /**
             * Adds the route for redirection. * `app.get('*', ...)`
             * @param app HTTPS express app that should redirect.
             */
        constructor(app: any){
            this.env = dotenv.config();
            this.app = app;
            this.httpRedirectRoute();
        }

        /**
         * Redirection route.
         */
        private httpRedirectRoute(): void {
            this.app.get('*', (req: any, res: any) =>{
                res.redirect('https://localhost:' + process.env.https_port + req.url);
            })
        }
    }
}