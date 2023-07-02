import { KnexConnection } from "./types";
import http from "http";
import { AuthTypes, Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import mysql from 'mysql2/promise';
import { spawn } from 'child_process';
import EventEmitter from 'events';

/**
     * This class manages all access with the remote database and entries.
     * Shares a lot of functionality with `JotttDatabase`
*/
export default class Synchroniser{    
    private static connector = new Connector()
    private static syncTimeInterval: number
    private static pool: any
    private static conn: any // this is a remote mysql connection
    private static sqlite: KnexConnection
    private static eventManager = new EventEmitter()
    
    public static setSqliteConnection(sqlite: KnexConnection){
        if(!Synchroniser.sqlite){
            Synchroniser.sqlite = sqlite
        }
    }

    private static createSyncSubProcess(){
        const childProcess = spawn('node', ['./child.js']);
        childProcess.stdout.on("data", (data: any) => console.log(data.toString()))
    }

    private static checkInternetConnection(){
        return new Promise((resolve, reject) => {
            const options = {
              hostname: 'www.google.com',
              port: 80,
              method: 'GET',
            };
        
            const req = http.request(options, (res) => {
              // Check the response status code
              if (res.statusCode === 200) {
                console.log(`Will proceed with backup. Internet connection is active.`)
                resolve(true);
              } else {
                console.error(`Internet connection is not active.`)
                resolve(false); 
              }
            });
        
            req.on('error', (err) => {
              resolve(false); 
            });
        
            req.end();
          });
    }

    public static async tryConnectGoogleCloud(){
        console.log(`trying to connect to google cloud`)

        //TODO; what do we do if we have an active connection
        if(!Synchroniser.conn){
            const clientOpts = await Synchroniser.connector.getOptions({
                instanceConnectionName: 'arctic-sentry-390411:europe-west2:jottt-instance',
                ipType: IpAddressTypes.PUBLIC,
                authType: AuthTypes.IAM
            });
    
            Synchroniser.pool = await mysql.createPool({
                ...clientOpts,
                user: 'jottt-service-account',
                database: 'jottt',
            });
    
            const conn_ = await Synchroniser.pool.getConnection();
            Synchroniser.conn = conn_
        }
        
        // const [result] = await conn_.query( `SELECT * from entries;`);
        // await pool.end();
        // connector.close();
    }

    private async closeConnections(){
        await Synchroniser.pool.end();
        Synchroniser.connector.close();
    }

    public static emitStartBackup(){
        Synchroniser.eventManager.emit("start_backup")
    }

    public static initialiseEventManager(){
        Synchroniser.eventManager.on("start_backup", async () => {
            Synchroniser.startBackup()
        })
    }

    public static async startBackup(){
        // TODO; re-evaluate the need for this line.
        // Synchroniser.createSyncSubProcess()

        // check if a remote connection can be established with the server
        let isConnectionActive = await this.checkInternetConnection()
        if (!isConnectionActive){
            console.error(`Cannot initiate connection to remote server.`)
            return
        } else {
            await this.tryConnectGoogleCloud().catch(err => {
                console.error(`Could not access Google Cloud: ${err}`)
            })
        }

        let pendingEntries = await Synchroniser.sqlite("entries_changes").select("*").where("sync_state", "pending")
        if (!pendingEntries) {
            console.log(`Cannot begin sync as all entries have been synced/there are no entries to sync..`)
            return
        } else {
            console.log(`pending entries: ${pendingEntries}`)
            pendingEntries.forEach(async (entry: any) => {
                const needSyncing = await Synchroniser.sqlite("entries").select("*").where("id", entry.id)
                console.log(`needSyncing: ${JSON.stringify(needSyncing)}`)
                const needSyncingEntry = needSyncing[0]
                console.log(`needSyncingEntry: ${JSON.stringify(needSyncingEntry)}`)

                
                if (Synchroniser.conn) {
                    // TODO; for some reason this seems to work
                    // i tried running the statement below for each individual array using switch statements to check
                    // for the error codes, but it seemed not to work.
                    // no matter the error, i will just do the "update" instead of "insert". it seems to fix everything.
        
                    // also normally, we should handle the situation that the backup process does not go as planned...
                    // ...and i have not tested this, so have no idea if it works or not.

                    Synchroniser.conn.query(
                        'INSERT INTO `entries` (`id`, `date`, `content`, `createdAt`, `updatedAt`) VALUES(?, ?, ?, ?, ?)',
                        Object.values(needSyncingEntry),
                        (err: any, _: any) => {
                            if (err) {
                                Synchroniser.conn.query(
                                    'UPDATE `entries` SET `content` = ? WHERE `id` = ?',
                                    [needSyncingEntry.content, needSyncingEntry.id]
                                )
                            }
                        }
                    )
                } else {
                    console.error(`There is no valid remote database connection.`)
                }
            })
        }
    }

    public async getRemoteEntryById(entryId: string){
        // in the beginning, i will assume that trying to do something like fetch the entire database is not only 
        // meaningless, but also hard to scale.
        // only fetch a single entry when it is not found in the local database......
        // ...............and only when the user asks for it, that is when the user clicks that date

        // 1. fetch the entry from remote
        // we could have done something like update the local database but we shall leave that to the 
        // JotttDatabase class.
        let entry = await Synchroniser.conn.query(
            'SELECT * FROM `entries` WHERE `id` = ? ',
            [entryId]
        )
        return entry
    }

    public async getRemoteEntryByDate(entryDate: string){
        let entry = await Synchroniser.conn.query(
            'SELECT * FROM `entries` WHERE `date` = ? ',
            [entryDate]
        )
        return entry
    }

}

Synchroniser.initialiseEventManager()
