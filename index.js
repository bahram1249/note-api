const config = require('config');
const express = require('express');
const app = express();


require('./startup/logging')();
require('./startup/db')();
require('./startup/routes')(app);

const port = process.env.PORT || config.get('server.port');
const server = app.listen(port, ()=>{
    console.log(`server run on http://localhost:${port}`);
});
module.exports = server;