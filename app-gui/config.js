require('dotenv').config()
const {homedir} = require("os")
const { join } = require('path');
const APP_BASE_DIR = join(homedir(), "jottt")


let nodeEnv = process.env?.NODE_ENV
let client = (nodeEnv === "production") ? "sqlite3" : "mysql"

let configDev = {
    client,
    connection:{
        host: process.env?.DATABASE_HOST,
        port : parseInt(process.env?.DATABASE_PORT),
        user : process.env?.DATABASE_USER,
        password : process.env?.DATABASE_PASSWORD,
        database : process.env?.DATABASE
    },
    pool: {
        min: 2,
        max: 10
    },
    migrations: {
        tableName: "knex_migrations"
    }
}

let configProd = {
    client,
    connection: {
        filename: join(APP_BASE_DIR, "prod", "db-prod.sqlite3"), 
    },
}

let config = (nodeEnv === "production") ? configProd : configDev

module.exports = config
