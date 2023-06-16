import express, { json, urlencoded } from "express";
import cors from "cors";
import { JotttDatabase } from "./JotttDatabase";
import { DbConfig } from "./types";
import { parseEntryFromRequest } from "./utils";

export default class JottApplicationServer{
    public app
    public server
    public serverActive = false
    public db: JotttDatabase;

    public constructor(dbConfig: DbConfig, migrationDir: string){
        this.db = new JotttDatabase(dbConfig, migrationDir)
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
            let date= new Date((req.query.date as string)).toISOString().slice(0, 11)
            let id = req.query?.id
        
            if (date) {
                res.json(await this.db.conn('entries').select('*').where('date', date))
            } else if (id) {
                res.json(await this.db.conn('entries').select('*').where('id', id))
            }
        })

        this.app.post('/entries', async (req, res) => {
            const entry = parseEntryFromRequest(req)
            
            await this.db.saveOrUpdateEntry(entry)
            .then(() => {
                res.status(201).send({message: "Entry saved successfully"})
            }).catch(error => {
                console.error(error)
                res.status(500).send({message: "Could not save entry."})
            })
        
        })     
    }

}

