import { JournalEntry } from "@jottt/lib"
import { useEffect} from 'react'

const useAutoSave = (entry: JournalEntry) => {
  // TODO; right now this works fine, but i think we need to use a throttle instead
  // on inspecting the network calls, a request is made for each keystroke
  // ideally only the last call should ever get made.
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
        const date = entry.date.toDate().toUTCString().slice(0, 16) // keep the time independent of time zones, hence UTC
        let newEntry = {...entry, date}
        console.log(`New entry: ${newEntry}`)

        fetch(`http://127.0.0.1:4001/entries`, {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
                body: JSON.stringify(newEntry)
        }).catch(error => console.error(error)) 
      }
    }

    debounce(saveEntryToDb)(entry)

  }, [entry]) 
}

export default useAutoSave