const mongoose = require('mongoose')
const config = require('./config');

const mongooseSetting = { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
}

const uri = `mongodb://${config.dbHost}:${config.dbPort}/${config.dbName}`

exports.getConnection = () => {
    mongoose.set('strictQuery', false);
    mongoose.connect(uri, mongooseSetting)
    .catch(err => console.error('Error connecting to mongo', err));
}