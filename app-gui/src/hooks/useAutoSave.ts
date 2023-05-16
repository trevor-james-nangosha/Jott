import { JournalEntry } from '@jott/lib/types'
import { useEffect} from 'react'
import config from '../config'

const useAutoSave = (entry: JournalEntry) => {
  useEffect(() => {
    const debounce = (cb: Function, delay = 1000) => {
      let timeout: string | number | NodeJS.Timeout | undefined

      return (...args: any) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          cb(...args)
        }, delay)
      }
    }

    const saveEntryToDb = (entry: JournalEntry) =>{
      if(entry.content){
        const date = entry.date.toDate()
        const dateString_ = new Date(date.getTime()  + Math.abs(date.getTimezoneOffset()*60000))

        fetch(`http://${config.HOST}:${config.PORT}/entries?date=${dateString_}`, {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(entry)
        }).catch(error => console.error(error)) 
      }
    }

    debounce(saveEntryToDb)(entry)

  }, [entry]) 
}

export default useAutoSave