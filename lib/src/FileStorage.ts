import jsonfile from 'jsonfile'
import fs from 'fs';

export default class FileStorage{
    private static file: string
    private static baseObj: any = {}
    public static initStorage(file: string){
        FileStorage.file = file
    }

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
                console.log('Error deleting file, Retrying...');
                fs.unlinkSync(FileStorage.file)
            }
            console.log("file deleted")
        } catch (err) {
            console.log('Error deleting file:', err);
        }
    }
}
