const mysql = require('mysql2')
const dotenv = require('dotenv')
dotenv.config()

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnection: true,
    connectionlimit: 10,
})

const db = pool.promise()

db.getConnection()
    .then(()=> console.log("Mysql connected successfully"))
    .catch((err) => console.log("Failed",err.message))
    

module.exports = db    