import knex, {Knex} from "knex"
import { DbConfig } from "./config";
import { DB_ERROR } from '@jott/lib/types'

export type KnexConnection = Knex;

export class DbConnectionError extends Error{
    constructor(message: string){
        super(message)
        this.name = "DbConnectionError"
    }
}

export class TableNotFoundError extends Error{
    constructor(message: string){
        super(message)
        this.name = "TableNotFoundError"
    }
}

export const connectDb = async (client: string, config: DbConfig): Promise<KnexConnection> => {
    let connection_: KnexConnection;
    let config_;

    switch (client) {
        case "sqlite":
            config_ = {}
            break;
        case "mysql":
            config_ = config
            break;
        default:
            throw new DbConnectionError("Could not connect to database. Please provide a valid client.")
     }
    
    connection_ = knex({
        client,
        connection: config_
    })

    try {
        const result = await Promise.all([isConnectionSuccessful(connection_)])
        if (!result) {
            throw new DbConnectionError(`Could not connect to: ${client}`)
        }
    } catch (error: any) {
        console.error(error.message)
    }

    return connection_;
}

const isConnectionSuccessful = async (conn: KnexConnection) => {
    try {
        await conn('entries').select('*')
        console.log("Database connection successful.")
        return true
    } catch (error: any) {
        switch (error) {
            case DB_ERROR.ECONNREFUSED:
                throw new DbConnectionError("Could not establish database connection.")
                break;
            case DB_ERROR.ER_NO_SUCH_TABLE:
                createTable(conn, "entries")
                return true
            default:
                break;
        }
    }

    return false
}

export const createTable = (conn: KnexConnection, name: string) => {
    tableExists(conn, name)
        .then(async exists => {
            if(!exists){
                try {
                    await conn.schema.createTable(name, table => {
                        table.string('id')
                        table.string('date')
                        table.text('content')
                        table.timestamps(true, true, true)
        
                        table.primary(['id'])
                    })
                    console.log(`Table: ${name} created.`)
                } catch (error: any) {
                    console.error('Could not create table..... %s', error.message)
                }
            }
        })         
    } 

const tableExists = (conn: KnexConnection, table: string) => {
    return conn.schema.hasTable(table);
}

export const saveOrUpdateEntry = async (conn: KnexConnection, entry: any,) => {
    const result = await entryExists(conn, entry)
    if (!result) {
        try {
            await conn('entries').insert({...entry})
        } catch (error) {
            console.error(error)
        }  
    } else {
        const {content, id} = entry
        await conn('entries').where("id", id).update("content", content)
    }
}

const entryExists = async (conn: KnexConnection, entry: any) => {
    const date = entry.date
    try {
        const result = await conn('entries').select('*').where('date', date)  
        if(result.length) return true
        return false
    } catch (error) {
        console.error(error)
        return false
    }
}
