require('dotenv').config();
const dbHost = process.env.db_host || '127.0.0.1'
const dbPort = process.env.db_port || '27017'
const dbName = process.env.db_name || 'letschat'
const jwtKey = process.env.jwt_key

module.exports = { dbHost, dbPort, dbName, jwtKey };
