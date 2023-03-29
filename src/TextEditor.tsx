import { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function TextEditor(){
    const [value, setValue] = useState(" ");
    return <ReactQuill className="text-editor" theme="snow" value={value} onChange={setValue} />
}

