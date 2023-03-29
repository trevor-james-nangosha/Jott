import dayjs from 'dayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

function DatePicker(){
    return <div className="date-picker">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDatePicker defaultValue={dayjs}/>
        </LocalizationProvider>
    </div>
}

export default DatePicker;