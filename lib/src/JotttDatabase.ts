import knex, { Knex } from "knex";
import { DB_ERROR, DbConfig, KnexConnection, SQLITE_ERRORS } from "./types";
import { makeDir } from "./utils";
import { join } from 'path';
import {homedir} from "os";
import { open, existsSync } from 'node:fs';
import mysql from 'mysql2/promise';
import { AuthTypes, Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';

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
    private conn: KnexConnection

    public constructor(conn_: KnexConnection){
        this.createBaseDbFolders()
        this.createDbFiles()

        this.conn = conn_
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

    

    public async readOperation(date:string|null, id:string|null){
        let flag = date ? ["date", date]: id ? ["id", id] : undefined
        // console.log(flag)

        if(!flag) throw new Error(`Please provide a valid search argument. Either one of "id" or "date".`)

        let localEntryResults = await this.conn('entries').select('*').where(flag[0], flag[1]) 
        return localEntryResults;
        
        // if (localEntryResults.length) {
        //     return localEntryResults
        // } else {
        //     // TODO; debug and test this.....'ts too hacky for now.
        //     let remoteEntryResults: any[] = []

        //     if (flag[0] === "date") {
        //         remoteEntryResults = await sync.getRemoteEntryByDate(flag[1])
        //     } else if (flag[0] === "id") {
        //         remoteEntryResults = await sync.getRemoteEntryById(flag[1])
        //     }
    
        //     return remoteEntryResults
        // }
    }

    public async postOperation(entry: any){
        await this.saveOrUpdateEntry(entry)
    }
    
    private async saveOrUpdateEntry(entry: any){
    const result = await this.entryExists(entry)
    if (!result) {
        try {
            await this.conn('entries').insert({...entry}).then(async _ => {
                // await sync.startBackup(this.conn, this.conn_mysql)
            })
        } catch (error) {
            console.error(error)
        }  
    } else {
        const {content, id} = entry
        await this.conn('entries').where("id", id).update("content", content).then(async _ => {
            // await sync.startBackup(this.conn, this.conn_mysql) //TODO; some ugly shit is happening here.
        })
    }
}

    public async entryExists(entry: any){
        const date = entry.date
        try {
            const result = await this.conn('entries').select('*').where('date', date)  
            if(result.length) return true
            return false
        } catch (error) {
            console.error(error)
            return false
        }
    }

}

export default {
    JotttDatabase,
    DbConnectionError,
    TableNotFoundError
}