import dayjs, { Dayjs } from 'dayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

export interface DatePickerProps{
    date?: Dayjs;
    handleDateChange: (value: any) => void

}

function DatePicker(props: DatePickerProps){

    return <div className="date-picker">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticDatePicker value={props.date} disableFuture onChange={props.handleDateChange} />
        </LocalizationProvider>
    </div>
}

export default DatePicker;