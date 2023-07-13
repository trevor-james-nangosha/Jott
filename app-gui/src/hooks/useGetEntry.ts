import dayjs, { Dayjs } from 'dayjs'
import { EditorStateDispatch, EntryStateDispatch, isDateToday } from '../App'
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import { EditorState, ContentState } from 'draft-js';
import { JournalEntry } from "@jottt/lib";

const useGetEntry = (date: Dayjs, setState: EntryStateDispatch, setEditorState: EditorStateDispatch) => {

    useEffect(() => {
        const getEntryAtDate = (date: Dayjs, setState: EntryStateDispatch) => {
            const dateString = date.toDate().toUTCString().slice(0, 16)
            
            fetch(`http://127.0.0.1:4001/entries?date=${dateString}`, {
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