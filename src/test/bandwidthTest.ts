import * as express from 'express';
import * as io from 'socket.io';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as http from 'http';

export namespace bandTest{
let env: dotenv.DotenvResult = dotenv.config();
export class socketServer{
    public static readonly PORT: number = 1234;
    public app: any;
    private server: any;
    private io: any;
    private port: string | number;
    constructor(){
        this.createApp();
        this.config();
        this.createServer();
        this.sockets();
        this.listen();
    }  
    
   private createApp(): void {
       this.app = express();
       this.app.get('/', (req: any, res:any) => {
           res.sendFile(path.join(__dirname, '..', 'public', 'index.html')); //path.join enables relative paths
       })
   }

   private config():void {
       this.port = socketServer.PORT;
   }
    private createServer(): void{
        this.server = http.createServer(this.app);
    }

    private sockets(): void {
        this.io = io(this.server);
    }

    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });

        this.io.on('connect', (socket: any) => {
            console.log('Client connected.');
        })
    }

   
}
}
