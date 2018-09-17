const mongoose = require('mongoose');
const config = require('config');

module.exports = function(){
    mongoose.connect(config.get('db.address'))
    .then(()=>{ console.log(`mongodb run at ${config.get('db.address')}`)})
    .catch(()=> { console.log("mongodb cannot connect."); process.exit(1); });
}