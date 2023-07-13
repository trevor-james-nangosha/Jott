import express, { json, urlencoded } from "express";
import cors from "cors";
import { JotttDatabase } from "./JotttDatabase";
import {KnexConnection } from "./types";
import { parseEntryFromRequest } from "./utils";

export default class JottApplicationServer{
    public app
    public server
    public serverActive = false
    public db: JotttDatabase;

    public constructor(conn: KnexConnection, appBaseDir: string){
        this.db = new JotttDatabase(conn, appBaseDir)
        this.app = express()
        this.app.use(json())
        this.app.use(urlencoded())
        this.app.use(cors())

        this.registerRoutes()

        this.server = this.app.listen(4001, () => {
            this.serverActive = true
            console.log('Server listening on port 4001')
        });
    }

    public killServer(){
        this.server.close( _ => {
            console.log("Closing server connections.")
            this.serverActive = false
            process.exit(0)
        })
    }

    private registerRoutes(){
        this.app.get('/', (req, res) => {
            res.send('hello, world');
        })

        this.app.get('/entries', async (req, res) => {
            let date = req.query.date as string        
            res.json(await this.db.readOperation(date, null))
            
        })

        this.app.post('/entries', async (req, res) => {
            let entry = parseEntryFromRequest(req)
            
            await this.db.postOperation(entry)
            .then(() => {
                res.status(201).send({message: "Entry saved successfully"})
            }).catch(error => {
                console.error(error)
                res.status(500).send({message: "Could not save entry."})
            })
        
        })     
    }

}

