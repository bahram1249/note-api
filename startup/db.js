const mongoose = require('mongoose');
const config = require('config');
const winston = require('winston');

module.exports = async function(){
    try{
        await mongoose.connect(config.get('db.address'), { useNewUrlParser: true });
        winston.log('info', `connected to mongodb on ${config.get('db.address')}`);
    }
    catch(ex) {
        throw ex;
    }
}
