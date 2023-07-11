import { KnexConnection } from "./types";
import http from "http";
import { AuthTypes, Connector, IpAddressTypes } from '@google-cloud/cloud-sql-connector';
import mysql from 'mysql2/promise';
import { spawn } from 'child_process';
import EventEmitter from 'events';
import retry from 'retry';
import fs from 'fs';
import FileStorage from "./FileStorage";

/**
     * This class manages all access with the remote database and entries.
     * Shares a lot of functionality with `JotttDatabase`
*/
export default class Synchroniser{    
    private static connector = new Connector()
    private static pool: any
    private static conn: any // this is a remote mysql connection
    private static sqlite: KnexConnection
    private static eventManager = new EventEmitter()
    private static syncPid: number
    
    public static setSqliteConnection(sqlite: KnexConnection){
        if(!Synchroniser.sqlite){
            Synchroniser.sqlite = sqlite
        }
    }

    public static setSyncPid(pid: any){
        if (!Synchroniser.syncProcessExists()) {
            console.log(`Set sync process, pid: ${pid}`)
            FileStorage.setItem("syncPid", process.pid)
            Synchroniser.syncPid = pid
            return true
        } else {
            console.log(`Sync process is already running.`)
            return false
        }  
    }

    private static killSyncProcess(){
        if(Synchroniser.syncProcessExists()){
            console.log(`Terminating sync process with pid: ${Synchroniser.syncPid}`)
            FileStorage.deleteAll()
            process.kill(Synchroniser.syncPid)
        } else {
            console.log(`No currently running sync process to kill.`)
        }
    }

    public static syncProcessExists(){
        let jsonFileExists = fs.existsSync("./meta.json")
        if (jsonFileExists) return true
        return false
    }

    public static createSyncSubProcess(){
        const fileDesc = fs.openSync("./sync.log", "a");
        const childProcess = spawn('node', ['./backupAndSync.js'], {
            detached: true,
            stdio: [fileDesc, fileDesc, fileDesc]
        });

        childProcess.on('exit', (code) => {
            FileStorage.deleteAll()
            fs.closeSync(fileDesc);
        });
        childProcess.unref();        
    }

    private static hasInternetConnection(){
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
                }
            });

            req.on('error', (err) => {
                reject(err);
            });
        
            req.end();
        });
    }

    public static async tryConnectGoogleCloud(){
        //TODO; what do we do if we have an active connection
        if(!Synchroniser.conn){                
            const clientOpts = await Synchroniser.connector.getOptions({
                instanceConnectionName: 'arctic-sentry-390411:europe-west2:jottt-instance',
                ipType: IpAddressTypes.PUBLIC,
                authType: AuthTypes.IAM
            })

            Synchroniser.pool = mysql.createPool({
                ...clientOpts,
                user: 'jottt-service-account',
                database: 'jottt',
            });
    
            const conn_ = await Synchroniser.pool.getConnection();
            return conn_
        }
    }

    private static async closeConnections(){
        console.log(`Closing connection to remote database.`)
        await Synchroniser.pool.end();
        Synchroniser.connector.close();
    }

    public static emitStartBackup(){
        Synchroniser.eventManager.emit("start_backup")
    }

    public static emitDisconnectRemote(){
        Synchroniser.eventManager.emit("disconnect-remote")
    }

    public static emitGetRemote(){
        Synchroniser.eventManager.emit("get-remote")
    }

    public static initialiseEventManager(){
        Synchroniser.eventManager.on("start_backup", async () => {
            Synchroniser.startBackup()
        })

        Synchroniser.eventManager.on("disconnect-remote", async () => {
            Synchroniser.closeConnections()
        })

        Synchroniser.eventManager.on("get-remote", async () => {
            Synchroniser.getRemoteChanges()
        })
    }

    public static async startBackup(){
        let operation = retry.operation({
            retries: 5,
            factor: 3,
            minTimeout: 60 * 1000,
            maxTimeout: 2 * 60 * 1000,
        })

        operation.attempt(async (currentAttempt: number) => {
            console.log(`Attempt number: ${currentAttempt}`)
            let isConnectionActive = await Synchroniser.hasInternetConnection().catch(err => {
                console.log(`Could not find internet connection. Retrying.`)
                if (operation.retry(err)) return
                Synchroniser.killSyncProcess()
            })
           
            if (isConnectionActive) {
                let operationGoogle = retry.operation({
                    retries: 5,
                    factor: 3,
                    minTimeout: 60 * 1000,
                    maxTimeout: 2 * 60 * 1000,
                })

                operationGoogle.attempt(async (currentAttempt: number) => {
                    console.log(`Attempt number for GCP: ${currentAttempt}`)
                    await Synchroniser.tryConnectGoogleCloud().then(async (conn) => {
                        Synchroniser.conn = conn

                        let pendingEntries = await Synchroniser.sqlite("entries_changes").select("*").where("sync_state", "pending")

                        if (!pendingEntries.length) {
                            console.log(`Cannot begin sync as all entries have been synced/there are no entries to sync..`)
                            Synchroniser.closeConnections()
                            Synchroniser.killSyncProcess()
                            return
                        } else {
                            if (Synchroniser.conn) {
                                console.log(`Found ${pendingEntries.length} entries to sync.`)
                                Synchroniser.backupEntries(pendingEntries).then((result: any) => {
                                    if(result.backupDone){
                                        Synchroniser.closeConnections()
                                        Synchroniser.killSyncProcess()
                                    }
                                })
                            }
                        }
                    }).catch((err) => {
                        if (operationGoogle.retry(err)) return
                        Synchroniser.closeConnections()
                        Synchroniser.killSyncProcess()
                    })
                })
            }
        })
    }

    private static backupEntries(entries: any[]){
        return new Promise(async (resolve, reject) => {
            entries.forEach(async (entry: any) => {
                const needSyncing = await Synchroniser.sqlite("entries").select("*").where("id", entry.id)
                const needSyncingEntry = needSyncing[0]
    
                Synchroniser.conn.execute(
                    'INSERT INTO `entries` (`id`, `date`, `content`, `createdAt`, `updatedAt`) VALUES(?, ?, ?, ?, ?)',
                    Object.values(needSyncingEntry),
                ).then(() => {
                    console.log(`Synced entry with id: ${needSyncingEntry.id}`)
                    resolve({backupDone: true})                    
                }).catch((err: any) => {
                    if (err.code === "ER_DUP_ENTRY") {
                        Synchroniser.conn.execute(
                            'UPDATE `entries` SET `content` = ? WHERE `id` = ?',
                            [needSyncingEntry.content, needSyncingEntry.id]
                        ).then(() => {
                            console.log(`Synced entry with id: ${needSyncingEntry.id}`)
                            resolve({backupDone: true})
                        })
                    } else { resolve({backupDone: false})}
                })     
    
                await Synchroniser.sqlite.raw(`UPDATE entries_changes SET last_synced = CURRENT_TIMESTAMP, sync_state = "done" where id = "${needSyncingEntry.id}"`).catch(err => {
                    console.error(`could not set sync_state to "done": ${err}`)
                })        
            })
        })
        

    }

    public static async getRemoteChanges(){
        // this is the last time that we made a sync to the remote database
        // so ideally, anything in the remote database from this point onwards
        // is out of sync with the local database.
        const lastSyncTime_ = await Synchroniser.sqlite.raw(`select datetime(max(last_synced), "localtime") from entries_changes`)
        const lastSyncTime = Object.values(lastSyncTime_[0])

        // check for any writes made to the remote database "entries" table after this lastSyncTime
        let remoteChanges_ = await Synchroniser.conn.execute(
            'SELECT * from entries WHERE `createdAt` > ?',
            [lastSyncTime]
        )
        let remoteChanges = remoteChanges_[0]
        if (!remoteChanges.length) {
            console.log(`No remote changes found.`)
            return
        }else{
            // TODO; move this to a separate function
            // hand over all this local database stuff to JotttDatabase, this does not look good.
            // only one class should be responsible for interacting with the database.
            remoteChanges.forEach(async (entry: any) => {
                const localEntry = await Synchroniser.sqlite("entries").select("*").where("id", entry.id)
                if (!localEntry.length) {
                    await Synchroniser.sqlite("entries").insert({...entry}).then(() => {
                        // when we get something from remote, we should mark
                        // its sync_state as "done" in the entries_changes table
                        Synchroniser.sqlite.raw(`UPDATE entries_changes SET last_synced = CURRENT_TIMESTAMP, sync_state = "done" where id = "${entry.id}"`)
                    }).catch(err => {
                        console.error(`Could not insert remote entry into local database: ${err}`)
                    })
                } else {
                    await Synchroniser.sqlite("entries").where("id", entry.id).update(entry).catch(err => {
                        console.error(`Could not update remote entry in local database: ${err}`)
                    })
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
        let entry = await Synchroniser.conn.execute(
            'SELECT * FROM `entries` WHERE `id` = ? ',
            [entryId]
        )
        return entry
    }

    public async getRemoteEntryByDate(entryDate: string){
        let entry = await Synchroniser.conn.execute(
            'SELECT * FROM `entries` WHERE `date` = ? ',
            [entryDate]
        )
        return entry
    }

}

Synchroniser.initialiseEventManager()
