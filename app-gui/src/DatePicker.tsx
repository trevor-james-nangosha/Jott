import dayjs, { Dayjs } from "dayjs";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export interface DatePickerProps {
	date?: Dayjs;
	setDate?: (value: any) => void;
	onSelect?: () => void;
}

function DatePicker(props: DatePickerProps) {
	return (
		<div className="date-picker">
			<LocalizationProvider dateAdapter={AdapterDayjs}>
				<StaticDatePicker
					value={props.date}
					disableFuture
					onChange={(value) => {
						if (props.setDate) {
							props.setDate(value);
						}

						if (props.onSelect) {
							props.onSelect();
						}
					}}
				/>
			</LocalizationProvider>
		</div>
	);
}

export default DatePicker;
