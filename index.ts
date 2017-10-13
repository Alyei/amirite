import express = require('express');
let app: any = express();

app.get('/', (req: any, res: any) =>{
    res.send('testerino');
} )

app.listen('3000', () =>{
    console.log('listening');
} )