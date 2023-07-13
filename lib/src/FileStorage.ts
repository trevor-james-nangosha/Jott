require("dotenv").config()
import jsonfile from 'jsonfile'
import fs from 'fs';
import {homedir} from "os"
import {join} from "path"

export default class FileStorage{
    private static prodMeta = join(homedir(), "jottt", "prod", "meta.json")
    private static devMeta = join(homedir(), "jottt", "dev", "meta.json")
    private static file = process.env?.NODE_ENV === "production" ? FileStorage.prodMeta : FileStorage.devMeta
    private static baseObj: any = {}
    // public static initStorage(){}

    // public static getAll(){
    //     const obj = jsonfile.readFileSync(FileStorage.file)
    //     return obj
    // }

    public static getItem(key: any){
        const obj = jsonfile.readFileSync(FileStorage.file)
        if (obj.hasOwnProperty(key)) return obj[key]
        return null
    }

    public static setItem(key: string, value: any){
        FileStorage.baseObj[key] = value
        return jsonfile.writeFileSync(FileStorage.file, FileStorage.baseObj, { spaces: 2, EOL: '\r\n' })
    }

    public static async removeItem(key: string){
        delete FileStorage.baseObj[key]
        return jsonfile.writeFileSync(FileStorage.file, FileStorage.baseObj, { spaces: 2, EOL: '\r\n' })
    }

    public static deleteAll(){
        try {
            fs.unlinkSync(FileStorage.file)
            while(fs.existsSync(FileStorage.file)) {
                console.log(`Error deleting "${FileStorage.file}", Retrying...`);
                fs.unlinkSync(FileStorage.file)
            }
            console.log(`File "${FileStorage.file}" deleted`)
        } catch (err) {
            console.log(`Error deleting "${FileStorage.file}":`, err);
        }
    }
}

// FileStorage.initStorage()

