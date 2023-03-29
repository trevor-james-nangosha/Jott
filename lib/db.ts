import knex, {Knex} from "knex"

export type DbConnection = Knex;

interface DbConfig{
    host: string | undefined;
    port: number | undefined;
    user: string | undefined;
    password: string | undefined;
    database:string
}

const dbConfig_: DbConfig = {
    host :  process.env.REACT_APP_DATABASE_HOST,
    port : 3306,
    user : process.env.REACT_APP_DATABASE_USER,
    password : process.env.REACT_APP_DATABASE_PASSWORD,
    database : 'jott'
}


export const connectDB = async (): Promise<DbConnection> => {
    const connection = knex({
        client: 'mysql',
        connection: dbConfig_
    })

    return connection;
}

