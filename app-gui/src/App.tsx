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

// for some reason which could be with the implementation of the ReactQuill component
// it is quite difficult using useState inside the editor change handler function
// workaround is to use some kind of global variable
let globalText: string;

const onContentChange = (value: string, delta: DeltaStatic, source: any, editor: ReactQuill.UnprivilegedEditor) => {
  globalText = editor.getText()
}

const saveEntryToDb = async (entry: JournalEntry) => {
  const date = entry.date.toISOString()

    try {
      await fetch(`http://${config.HOST}:${config.PORT}/entries?date=${date}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error(error);
    }
}

function App() {
  
  
  // we do not want the id of the current day to change when you select another date entry
  const todayEntryId = uuidv4()  
  const [state, setState] = useState<JournalEntry>({
    id: todayEntryId,
    date: dayjs(),
    content: "", 
    savedContent: ""
  })

  const [todayState, setTodayState] = useState<JournalEntry>({
    id: todayEntryId,
    date: dayjs(),
    content: "", 
    savedContent: ""
  })

  const [savedContent, setSavedContent] = useState("")

  // also, for some reason, we seem to be making two calls to the db
  // it could be that the first time when the editor is rendered, we also perform a fetch call
  // i do want to send an empty content string back to the database.
  // this 'changeCount' flag takes care of that.
  const [changeCount, setChangeCount] = useState(0)

  useEffect(() => {
    setState(prevState => {
      return {...prevState, savedContent: savedContent, content: savedContent}
    })
  }, [savedContent])

  useEffect(() => {
    if (changeCount > 1) {
      saveEntryToDb(state)   
    }
    setChangeCount(count => count + 1)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.content])
  

  const handleSaveButtonClicked = async () => {
    setSavedContent(globalText)
  }

  const handleDateChange = () => {
    console.log("hello, date.")
  }

 
  return (
    <div className="App">
      <DatePicker date={dayjs()} handleDateChange={handleDateChange} />
      <TextEditor handleContentChange={onContentChange} 
                  className="text-editor-container" 
                  onClick={handleSaveButtonClicked}
                  value={state.content}/>
    </div>
  );
}

export default App;


// user clicks save ----> we update the state of the text editor -------->
// save the entry to the db -------> 

// the date changes -----------> generate a new ID, update the state ---------------->
// 