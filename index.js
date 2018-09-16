const config = require('config');
const express = require('express');
const users = require('./routes/users');
const auth = require('./routes/auth');
const notes = require('./routes/notes');
const app = express();
const mongoose = require('mongoose');


mongoose.connect(config.get('db.address'))
    .then(()=>{ console.log(`mongodb run at ${config.get('db.address')}`)})
    .catch(()=> { console.log('mongoodb couldnt start'); process.exit(1); });

    
app.use(express.json());
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/notes', notes);

const port = process.env.PORT || config.get('server.port');
const server = app.listen(port, ()=>{
    console.log(`server run on http://localhost:${port}`);
});
module.exports = server;