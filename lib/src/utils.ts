import dayjs, { Dayjs } from "dayjs";
import { Request } from 'express';
import { mkdirSync } from 'node:fs';
import { existsSync } from 'node:fs';


// ------------------------- dayjs date utils ---------------------------------
export function isDateToday(date: Dayjs): boolean {
      return dayjs().diff(date, "day") <= 0;
}

// ------------------------- request utils -------------------------------
export function parseEntryFromRequest(req: Request){
      const body = req.body
      const {id, date, content} = body
  
      return {id, date, content}
  }


// ------------------------- file utils -------------------------------
export function makeDir(dir: string){
    try {
        if (existsSync(dir)) {
            console.log("Directory exists.")
          } else {
            mkdirSync(dir, {recursive: true})
          }
    } catch (error) {
        console.error(error)
    }
    
}
