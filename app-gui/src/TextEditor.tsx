import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export interface TextEditorProps {
	editorState?: any;
	setEditorState?: any;
	wrapperClassName?: string;
	editorClassName?: string;
	toolbarClassName?: string;
}

export default function TextEditor(props: TextEditorProps) {
	return (
		<Editor
			editorState={props.editorState}
			onEditorStateChange={props.setEditorState}
			wrapperClassName="text-editor-container"
			editorClassName="text-editor"
			toolbarHidden
			toolbarClassName="toolbar-class"
		/>
	);
}
