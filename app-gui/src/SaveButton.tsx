import { Button } from "@mui/material"
import { TextEditorProps } from "./TextEditor"

const SaveButton = (props: TextEditorProps) => {
    return (
    <div className="save-button">
        <Button className="save-button" variant="contained" size="medium" >Save</Button>
    </div>)
}

export default SaveButton