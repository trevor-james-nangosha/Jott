import knex from "knex";
import { DB_ERROR, DbConfig, KnexConnection, SQLITE_ERRORS } from "./types";
import { makeDir } from "./utils";
import { join } from 'path';
import {homedir} from "os";
import { open } from 'node:fs';
import { existsSync } from 'node:fs';

const APP_BASE_DIR = join(homedir(), "jottt")

// move the database functionality to lib, since if we
// need to add, say a CLI application, we shall also need to access them
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

export class JotttDatabase{
    private config: DbConfig
    public conn: KnexConnection
    public migrationDir: string;

    public constructor(config_: DbConfig, migrationDir_: string){
        this.createBaseDbFolders()
        this.createDbFiles()

        this.config = config_
        this.migrationDir = migrationDir_
        this.conn = this.connectDb(config_)
        this.testConnection(this.conn)
    }

    public connectDb(config: DbConfig){
        let connection = knex(config)
        return connection;
    }

    public createDbFiles(){
        const files = [join(APP_BASE_DIR, "dev", "db-dev.sqlite3"), join(APP_BASE_DIR, "prod", "db-prod.sqlite3")]
        files.forEach(file => {
            if (!existsSync(file)) {
                open(file, 'w', function (err, _) {
                    if (err) throw err;
                    console.log('Files have been created!!!!!!!!');
                  });
            }
        })
    }

    public createBaseDbFolders(){
        const baseFolders = [join(APP_BASE_DIR, "dev"), join(APP_BASE_DIR, "prod")]
        baseFolders.forEach(path => {
            makeDir(path)
        })
    }

    private async testConnection(conn: KnexConnection){
        try {
            await conn('entries').select('*').catch(async error => {
                console.error(`Error from trying to select from DB: ${error}`)
                await this.migrateLatest().catch(error => {
                    console.error(`Error from trying migrations_1: ${error}`)
                })
            })
            // console.log("Database connection successful.")
        } catch (error: any) {
            console.error(error.errno === SQLITE_ERRORS.ER_NO_SUCH_TABLE)
            switch (error) {
                case DB_ERROR.ECONNREFUSED:
                    throw new DbConnectionError("Could not establish database connection.")
                case DB_ERROR.ER_NO_SUCH_TABLE || (error.errno === SQLITE_ERRORS.ER_NO_SUCH_TABLE):
                    await this.migrateLatest().catch(error => {
                        console.error(`Error from trying migrations_2: ${error}`)
                    })
                    break
                default:
                    break;
            }
        }
    }

    
    private tableExists(conn: KnexConnection, table: string){
        return conn.schema.hasTable(table);
    }
    
     public async saveOrUpdateEntry(entry: any){
        const result = await this.entryExists(this.conn, entry)
        if (!result) {
            try {
                await this.conn('entries').insert({...entry})
            } catch (error) {
                console.error(error)
            }  
        } else {
            const {content, id} = entry
            await this.conn('entries').where("id", id).update("content", content)
        }
    }
    
    public async entryExists(conn: KnexConnection, entry: any){
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
    
    public async migrateLatest(disableTransactions = false) {
        await this.conn.migrate.latest({
            directory: this.migrationDir,
            disableTransactions,
        }).then(val => {
            console.log("done running migrations.")
            console.log(val)
        });
    }

}

export default {
    JotttDatabase,
    DbConnectionError,
    TableNotFoundError
}