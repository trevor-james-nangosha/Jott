import { DeltaStatic } from 'quill';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SaveButton from './SaveButton';

export interface TextEditorProps{
    defaultValue?: string;
    value?: ReactQuill.Value;
    handleContentChange?: (value: string, delta: DeltaStatic, source: any, editor: ReactQuill.UnprivilegedEditor) => void
    className?: string;
    onClick?: () => void
  }

export default function TextEditor(props: TextEditorProps){
    return (
        <div className={props.className}>
            <ReactQuill className="text-editor" theme="snow" value={props.value} onChange={props.handleContentChange} />
            <SaveButton onClick={props.onClick} />
        </div>)
}



 // const [entryState, setEntryState] = useState<JournalEntry>({ id: todayEntryId, date: dayjs(), content: "entry state", savedContent: "saved content"})
  // const [todayEntryState, setTodayEntryState] = useState<JournalEntry>({ id: todayEntryId, date: dayjs(), content: "", savedContent: ""}) 
  
  // these are copies of the state that will be used by the save button
  // const [__entryState, __setEntryState] = useState<JournalEntry>({ id: todayEntryId, date: dayjs(), content: "__entry state", savedContent: "__saved content"})
  // const [__todayEntryState, __setTodayEntryState] = useState<JournalEntry>({ id: todayEntryId, date: dayjs(), content: ""}) 


  // const makeJournalEntry = (data: any): void => {
    // let entry: JournalEntry;
    
    // try {
    //   let obj = JSON.parse(data)
    //   console.log(dayjs(obj.date)) /////////////
    //   entry = {id: obj.id, content: obj.content, date: dayjs(obj.date)}
    // } catch (error) {
    //   entry = {id: data.id, content: data.content, date: dayjs(data.date)}
    // }
    // console.log(entry) /////////////////

    // return entry;
  // }

  // const handleDateChange = async (e: any) => {
    // const newDate = dayjs(e.$d)

    // if (!isDateToday(newDate)) {
    //   const entry = await getEntryAtDate(newDate);

    //   if (entry) {
    //     setEntryState({...entry})
    //   } else {
    //     // we update the state, generate a new id for this date
    //     setEntryState({id: uuidv4(), 'date': newDate})
    //   }

    // } else {
    //   setEntryState(todayEntryState)
    // }
  // }

  // i may rename this method "handleSaveButtonClicked"
  // instead of trying to update the state each time the user types something in the editor, 
  // we can update it only when they click the save button.


