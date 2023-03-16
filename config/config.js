require('dotenv').config();
const dbUser = process.env.db_user
const dbPwd = process.env.db_password
const dbName = process.env.db_name
const jwtKey = process.env.jwt_key

module.exports = { dbUser, dbPwd, dbName, jwtKey};