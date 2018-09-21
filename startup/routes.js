const express = require('express');
const users = require('../routes/users');
const auth = require('../routes/auth');
const notes = require('../routes/notes');
const error = require('../middlewares/error');
var bodyParser = require('body-parser');

module.exports = function(app){
    app.use(express.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use('/api/auth', auth);
    app.use('/api/users', users);
    app.use('/api/notes', notes);
    app.use(error);
}
