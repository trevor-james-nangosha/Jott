import TextEditor from './TextEditor';
import DatePicker from './DatePicker';
import { JournalEntry } from '@jott/lib/types'
import './App.css';
import { useEffect, useState } from 'react';
import { DeltaStatic } from 'quill';
import ReactQuill from 'react-quill';
import dayjs, { Dayjs } from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import config from './config';
import useGetEntry from './hooks/useGetEntry';

export type EntryStateDispatch = React.Dispatch<React.SetStateAction<JournalEntry>>

export function isDateToday(date: Dayjs): boolean {
  //TODO; move this to the lib/utils file.
  return dayjs().diff(date, "day") <= 0;
}

// for some reason which could be with the implementation of the ReactQuill component
// it is quite difficult using useState inside the editor change handler function
// workaround is to use some kind of global variable
let globalText: string;

const onContentChange = (value: string, delta: DeltaStatic, source: any, editor: ReactQuill.UnprivilegedEditor) => {
  globalText = editor.getText()
}

const saveEntryToDb = async (entry: JournalEntry) => {
  const date = entry.date.toDate()
  const dateString_ = new Date(date.getTime()  + Math.abs(date.getTimezoneOffset()*60000))

    try {
      await fetch(`http://${config.HOST}:${config.PORT}/entries?date=${dateString_}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error(error);
    }
}

const getEntryAtDate = async (date: Dayjs, setState: EntryStateDispatch) => {
  const dateString = date.toDate()
  const dateString_ = new Date(dateString.getTime()  + Math.abs(dateString.getTimezoneOffset()*60000))

  try {
    const response = await fetch(`http://${config.HOST}:${config.PORT}/entries?date=${dateString_}`, {
      headers: { Accept: 'application/json' },
    });
    const data: JournalEntry[] = await response.json()
    const entry = data[0]

    if (data.length && isDateToday(date)){
      setState({...entry, date: dayjs(entry.date)})
    }else if(data.length) {
      setState({...entry, date: dayjs(entry.date)})
    } else {
      let setId = uuidv4()
      setState({date: date, id: setId, content: ""})
    }
  } catch (error) {
    return console.error(error);
  }
}

function App() {  
  const defaultState = {id: uuidv4(), date: dayjs(new Date()), content: "", }
  const [state, setState] = useState<JournalEntry>(defaultState)
  
  const [savedContent, setSavedContent] = useState("")
  const [changeCount, setChangeCount] = useState(0)
  const entry = useGetEntry(state.date, setState)
  console.log(entry)
  
  useEffect(() => {
    setState(prevState => {
      let newState = {...prevState, content: savedContent}
      if(savedContent){
        saveEntryToDb({...newState})   
      }

      return newState
    })    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedContent])

  useEffect(() => {
    if(changeCount === 0){
      // run the first time the component is rendered.
      // to see if we have any instance of the current date.
      getEntryAtDate(state.date, setState)
    }
    setChangeCount(count => count + 1)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.content])
  

  const handleSaveButtonClicked = async () => {
    setSavedContent(globalText)
  }

  const handleDateChange = async (value: any) => {
      await getEntryAtDate(dayjs(value.$d), setState)
  }

 
  return (
    <div className="App">
      <DatePicker date={state.date} handleDateChange={handleDateChange} />
      <TextEditor handleContentChange={onContentChange} 
                  className="text-editor-container" 
                  onClick={handleSaveButtonClicked}
                  value={state.content}/>
    </div>
  );
}

export default App;