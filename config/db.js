const mongoose = require('mongoose')
const config = require('./config');

const mongooseSetting = { 
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
}

const uri = `mongodb+srv://${config.dbUser}:${config.dbPwd}@${config.dbName}.mem3brj.mongodb.net/hexpress?retryWrites=true&w=majority`

exports.getConnection = () => {
    mongoose.set('strictQuery', false);
    mongoose.connect(uri, mongooseSetting)
    // .then(() => console.log('Database is connected.'))
    // .then(x => console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`))
    .catch(err => console.error('Error connecting to mongo', err));
}