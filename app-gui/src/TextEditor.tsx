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
