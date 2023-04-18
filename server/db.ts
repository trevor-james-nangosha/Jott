import knex, {Knex} from "knex"

export type KnexConnection = Knex;

// export interface KnexConnection_ extends Knex{}

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

// interface DbConfig{
//     host: string | undefined;
//     port: number | undefined;
//     user: string | undefined;
//     password: string | undefined;
//     database:string
// }

const dbConfig_ = {
    host : "127.0.0.1",
    port : 3306,
    user : "",
    password : "",
    database : 'jott'
}

export const connectDb = async (): Promise<KnexConnection> => {
    let conn_: KnexConnection = knex({
        client: 'sqlite',
        connection: {}
    })
    
    const connection: KnexConnection = knex({
        client: 'mysql',
        connection: dbConfig_
    })

    const result = await Promise.all([isConnectionSuccessful(connection)])
    if(result[0]) return connection

    return conn_;
}

const isConnectionSuccessful = async (conn: KnexConnection) => {
    // there could be a bug with this function.
    // look into it later.
    try {
        await conn('entries').select('*')
        console.log("Database connection successful.")

        return true
    } catch (error: any) {
        if(error.code === "ECONNREFUSED") {
            throw new DbConnectionError("Could not establish database connection.")
        }
        if(error.code === "ER_NO_SUCH_TABLE") {
            createTable(conn, "entries")
            return true
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
                } catch (error) {
                    console.error('Could not create table..... %s', error)
                }
            }
        })         
    } 

const tableExists = (conn: KnexConnection, table: string) => {
    return conn.schema.hasTable(table);
}
