import dayjs, { Dayjs } from 'dayjs'
import { EntryStateDispatch, isDateToday } from '../App'
import { JournalEntry } from '@jott/lib/types'
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { useEffect, useState } from 'react';

const useGetEntry = (date: Dayjs, setState: EntryStateDispatch) => {
    // const defaultState = {id: uuidv4(), date: dayjs(new Date()), content: "", }
    // how would you implement your own useState functionality, where you have a variable and a method that
    // kinda keeps track of some sort of global variable and update it accordingly.
    // const [entry, setEntry] = useState<JournalEntry>(defaultState)

    useEffect(() => {
        const getEntryAtDate = (date: Dayjs, setState: EntryStateDispatch) => {
            const dateString = date.toDate()
            const dateString_ = new Date(dateString.getTime()  + Math.abs(dateString.getTimezoneOffset()*60000))
            
            fetch(`http://${config.HOST}:${config.PORT}/entries?date=${dateString_}`, {
                headers: { Accept: 'application/json' },
            }).then((response) => {
                return response.json()
            }).then(entries => {
                const entry = entries[0] as JournalEntry
                if (entries.length && isDateToday(date)){
                    setState({...entry, date: dayjs(entry.date)})
                }else if(entries.length) {
                setState({...entry, date: dayjs(entry.date)})
                } else {
                let setId = uuidv4()
                setState({date: date, id: setId, content: ""})
                }
                //setEntry({...entry})
            }).catch(error => console.error(error))             
        }

        getEntryAtDate(date, setState)         
        
    }, [date, setState])

    // return entry
}

export default useGetEntry