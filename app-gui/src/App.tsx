import { JournalEntry } from "@jottt/lib";
import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { v4 as uuidv4 } from "uuid";
import useGetEntry from "./hooks/useGetEntry";
import { EditorState, convertToRaw } from "draft-js";
import useAutoSave from "./hooks/useAutoSave";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./App.css";
import Sidebar from "./Sidebar";
import TextEditor from "./TextEditor";
import Box from "@mui/material/Box";

export type EntryStateDispatch = React.Dispatch<
	React.SetStateAction<JournalEntry>
>;
export type EditorStateDispatch = React.Dispatch<
	React.SetStateAction<EditorState>
>;

export function isDateToday(date: Dayjs): boolean {
	//TODO; move this to the lib/utils file.
	return dayjs().diff(date, "day") <= 0;
}

function App() {
	const defaultState = { id: uuidv4(), date: dayjs(new Date()), content: "" };
	const [state, setState] = useState<JournalEntry>(defaultState);
	const [date, setDate] = useState<Dayjs>(dayjs(new Date()));
	const [editorState, setEditorState] = useState(() =>
		EditorState.createEmpty()
	);

	useEffect(() => {
		const html = editorState.getCurrentContent();
		const contentStateObject = convertToRaw(html);

		const blocks = contentStateObject["blocks"];
		let newString = "";

		blocks.forEach((block) => {
			if (block["text"]) {
				newString += block["text"];
			}
		});

		setState((oldState: any) => {
			return { ...oldState, content: newString };
		});
	}, [editorState]);

	useGetEntry(date, setState, setEditorState);
	useAutoSave(state);

	return (
		<Box sx={{ display: "flex", marginTop: "3%", marginLeft: "3%" }}>
			<Sidebar date={date} setDate={setDate} />
			<TextEditor
				editorState={editorState}
				setEditorState={setEditorState}
			/>
		</Box>
	);
}

export default App;
