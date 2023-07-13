import knex, { Knex } from "knex";
import { DB_ERROR, KnexConnection, SQLITE_ERRORS } from "./types";
import { makeDir } from "./utils";
import { join } from 'path';
import {homedir} from "os";
import { open, existsSync } from 'node:fs';

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

    public constructor(conn_: KnexConnection, appBaseDir: string){
        this.createBaseDbFolders(appBaseDir)
        this.createDbFiles(appBaseDir)

        this.conn = conn_
    }

    public createDbFiles(appBaseDir: string){
        const files = [join(appBaseDir, "dev", "db-dev.sqlite3"), join(appBaseDir, "prod", "db-prod.sqlite3")]
        files.forEach(file => {
            if (!existsSync(file)) {
                open(file, 'w', function (err, _) {
                    if (err) throw err;
                    console.log('Files have been created!!!!!!!!');
                  });
            }
        })
    }

    public createBaseDbFolders(appBaseDir: string){
        const baseFolders = [join(appBaseDir, "dev"), join(appBaseDir, "prod")]
        baseFolders.forEach(path => {
            makeDir(path)
        })
    }

    public async readOperation(date:string|null, id:string|null){
        let flag = date ? ["date", date]: id ? ["id", id] : undefined

        if(!flag) throw new Error(`Please provide a valid search argument. Either one of "id" or "date".`)

        let localEntryResults = await this.conn('entries').select('*').where(flag[0], flag[1]) 
        return localEntryResults;        
    }

    public async postOperation(entry: any){
        await this.saveOrUpdateEntry(entry)
    }
    
    private async saveOrUpdateEntry(entry: any){    
        await this.conn('entries').insert({...entry}).catch(async () => {
            const {content, id} = entry
            await this.conn('entries').where("id", id).update("content", content)  
        })
    }
}

export default {
    JotttDatabase,
    DbConnectionError,
    TableNotFoundError
}