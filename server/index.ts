import express, { json, urlencoded, Request } from 'express';
import { connectDb, KnexConnection, saveOrUpdateEntry} from "./db";
import config_ from './config';

let conn: KnexConnection;
const cors = require('cors')
const app = express();

app.use(cors())
app.use(json())
app.use(urlencoded())

app.get('/', (req, res) => {
    res.send('hello, world');
})

app.get('/entries', async (req, res) => {
    let date= new Date((req.query.date as string)).toISOString().slice(0, 11)
    let id = req.query?.id

    if (date) {
        res.json(await conn('entries').select('*').where('date', date))
    } else if (id) {
        res.json(await conn('entries').select('*').where('id', id))
    }
})

app.post('/entries', async (req, res) => {
    const entry = parseEntryFromRequest(req)
    
    await saveOrUpdateEntry(conn, entry)
    .then(() => {
        res.status(201).send({message: "Entry saved successfully"})
    }).catch(error => {
        console.error(error)
        res.status(500).send({message: "Could not save entry."})
    })

})

app.listen(4001, async () => {
    console.log('Server has been started!!!!!!!');
    let connection = await connectDb(config_);
    conn = connection
})

const parseEntryFromRequest = (req: Request) => {
    const body = req.body
    let dateString = parseDate((body.date as string))

    return {
        id: body.id,
        date: dateString,
        content: body.content
    }
}

const parseDate = (date: string) => {
    let date_ = new Date(date)
    let dateString = new Date(date_.getTime()  + Math.abs(date_.getTimezoneOffset()*60000)).toISOString().slice(0, 11)
    return dateString
}
