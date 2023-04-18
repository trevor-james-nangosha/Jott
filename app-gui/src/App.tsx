import TextEditor from './TextEditor';
import DatePicker from './DatePicker';
import { JournalEntry } from '@jott/lib/types'
import './App.css';
import { useState } from 'react';
import { DeltaStatic } from 'quill';
import ReactQuill from 'react-quill';
import dayjs, { Dayjs } from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import config from './config';

function App() {
  const todayEntryId = uuidv4()
  const [entryState, setEntryState] = useState<JournalEntry>({ id: todayEntryId, date: dayjs()})
  const [todayEntryState, setTodayEntryState] = useState<JournalEntry>({ id: todayEntryId, date: dayjs(), content: "today-default"})  

  const isDateToday = (date: Dayjs): boolean => {
    return dayjs().diff(date, "day") <= 0;
  }

  const getEntryAtDate = async (date: Dayjs): Promise<JournalEntry | void> => {
    try {
      const response = await fetch(`http://${config.HOST}:${config.PORT}/entries?date=${date.toISOString().slice(0, 10)}`, {
        headers: { Accept: 'application/json' },
      });
      const data =  await response.json() as any[] // this is right 'cause what you get back is an array of objects
      console.log(data) /////////

      if (data.length) {
        return makeJournalEntry(data[0])
      }
    } catch (error) {
      return console.error(error);
    }
  }

  const makeJournalEntry = (data: any): JournalEntry => {
    let entry: JournalEntry;
    
    try {
      let obj = JSON.parse(data)
      console.log(dayjs(obj.date)) /////////////
      entry = {id: obj.id, content: obj.content, date: dayjs(obj.date)}
    } catch (error) {
      entry = {id: data.id, content: data.content, date: dayjs(data.date)}
    }
    console.log(entry) /////////////////

    return entry;
  }

  const handleDateChange = async (e: any) => {
    const newDate = dayjs(e.$d)

    if (!isDateToday(newDate)) {
      const entry = await getEntryAtDate(newDate);

      if (entry) {
        setEntryState({...entry})
      } else {
        // we update the state, generate a new id for this date
        setEntryState({id: uuidv4(), 'date': newDate})
      }

    } else {
      setEntryState(todayEntryState)
    }
  }

  const handleContentChange = (value: string, delta: DeltaStatic, source: any, editor: ReactQuill.UnprivilegedEditor) => {
    if (!isDateToday(entryState.date as Dayjs)) {
      setEntryState((oldState) => {
        return {...oldState, 'content': editor.getText()}
      })
    } else {
      setTodayEntryState(oldState => {
        return {...oldState, 'content': editor.getText()}
      })

      // editor.getContents()
      
    }
  }

  const saveEntry = async (): Promise<void> => {
    const date = entryState['date'] as Dayjs
    try {
      await fetch(`http://${config.HOST}:${config.PORT}/entries?date=${date.toISOString()}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(entryState)
      });
    } catch (error) {
      console.error(error);
    }
  }

  if (!isDateToday(entryState.date as Dayjs)) {
    return (
      <div className="App">
        <DatePicker date={entryState.date} handleDateChange={handleDateChange} />
        <TextEditor handleContentChange={handleContentChange} className="text-editor-container" onClick={saveEntry} defaultValue={entryState.content} />
      </div>
    );
  } 

  return (
    <div className="App">
      <DatePicker date={todayEntryState.date} handleDateChange={handleDateChange} />
      <TextEditor handleContentChange={handleContentChange} className="text-editor-container" onClick={saveEntry} defaultValue={todayEntryState.content} />
    </div>
  );
}

export default App;
