const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;

 app.get('/',(req,res)=>{
    res.send('assignment 11 server is running')
 });

 app.listen(port,()=>{
    console.log('surver is running on port', port)
 })