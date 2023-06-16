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
      let dateString = parseDate((body.date as string))
  
      return {
          id: body.id,
          date: dateString,
          content: body.content
      }
  }
  
  export function parseDate(date: string){
      let date_ = new Date(date)
      let dateString = new Date(date_.getTime()  + Math.abs(date_.getTimezoneOffset()*60000)).toISOString().slice(0, 11)
      return dateString
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
