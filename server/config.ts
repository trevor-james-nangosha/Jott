require('dotenv').config()

export interface DbConfig{
    host?: string,
    port?: number, 
    user?: string, 
    password?: string,
    database?: string
}

let config_: DbConfig = {
    host: process.env?.DATABASE_HOST,
    port : parseInt(process.env?.DATABASE_PORT as string),
    user : process.env?.DATABASE_USER,
    password : process.env?.DATABASE_PASSWORD,
    database : process.env?.DATABASE
}


export default config_