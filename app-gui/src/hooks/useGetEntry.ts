import dayjs, { Dayjs } from 'dayjs'
import { EditorStateDispatch, EntryStateDispatch, isDateToday } from '../App'
import { JournalEntry } from '@jottt/lib'
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import { useEffect } from 'react';
import { EditorState, ContentState } from 'draft-js';

const useGetEntry = (date: Dayjs, setState: EntryStateDispatch, setEditorState: EditorStateDispatch) => {

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
                    setEditorContent(entry.content, setEditorState)
                }else if(entries.length) {
                    setState({...entry, date: dayjs(entry.date)})
                    setEditorContent(entry.content, setEditorState)
                } else {
                    let setId = uuidv4()
                    setState({date: date, id: setId, content: ""})
                    setEditorContent("", setEditorState)
                }
            }).catch(error => console.error(error))             
        }

        const setEditorContent = (text: string, setEditorState: EditorStateDispatch) => {
            const contentState = ContentState.createFromText(text);
            const newEditorState = EditorState.createWithContent(contentState);
            setEditorState(newEditorState);
        }

        getEntryAtDate(date, setState)         
        
    }, [date, setEditorState, setState])
}

export default useGetEntry