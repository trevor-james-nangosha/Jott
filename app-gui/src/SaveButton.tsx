import { Button } from "@mui/material"
import { TextEditorProps } from "./TextEditor"

const SaveButton = (props: TextEditorProps) => {
    return (
    <div className="save-button">
        <Button className="save-button" variant="contained" size="medium" onClick={props.onClick}>Save</Button>
    </div>)
}

export default SaveButton