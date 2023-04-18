import express, { json, urlencoded, Request, Response } from 'express';
import { connectDb, KnexConnection} from "./db";

const cors = require('cors')
const app = express();
const connection = connectDb();

app.use(cors())
app.use(json())
app.use(urlencoded())

app.get('/', (req, res) => {
    res.send('hello, world');
})

app.get('/entries', async (req, res) => {
    let date = req.query.date
    let id = req.query.id
    const conn_ = (await Promise.all([connection]))[0]

    if (date) {
        res.json(await conn_('entries').select('*').where('date', date))
    } else if (id) {
        res.json(await conn_('entries').select('*').where('id', id))
    }
})

app.post('/entries', async (req, res) => {
    const conn = (await Promise.all([connection]))[0]
    const entry = parseEntryFromRequest(req)
    await saveEntry(conn, entry, res)

})

app.listen(4001, () => {
    console.log('Server has been started!!!!!!!');
})

const parseEntryFromRequest = (req: Request) => {
    const body = req.body
    return {
        id: body.id,
        date: body.date.slice(0, 10),
        content: body.content
    }
}

const saveEntry = async (conn: KnexConnection, entry: any, res: Response) => {
    const result = await entryExists(conn, entry)
    console.log(`Exists: ${result}`)
    if (!result) {
        try {
            await conn('entries').insert({...entry})
            res.json( {message: "Entry saved successfully."} )
        } catch (error) {
            console.error(error)
            res.status(500).json( {message: "Entry could not be saved.", error} )
        }  
    } else {
        res.status(500).json( {message: "Entry could not be saved. Already exists."} )
    }
}

const entryExists = async (conn: KnexConnection, entry: any) => {
    const date = entry.date
    try {
        const result = await conn('entries').select('*').where('date', date)  
        console.log(`Result: ${result}`) 
        if(result.length) return true
        return false
    } catch (error) {
        console.error(error)
        return false
    }
}
