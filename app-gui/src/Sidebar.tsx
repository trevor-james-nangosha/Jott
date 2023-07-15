import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import DatePicker, { DatePickerProps } from "./DatePicker";
import IconButton from "@mui/material/IconButton";
import { CalendarMonth } from "@mui/icons-material";

export default function Sidebar(props: DatePickerProps) {
	const [state, setState] = React.useState({
		left: false,
	});

	const toggleDrawer = (anchor: string, open: boolean) => () => {
		setState({ ...state, [anchor]: open });
	};

	const list = (anchor: string) => (
		<Box
			sx={{ width: 400 }}
			role="presentation"
			// onClick={toggleDrawer(anchor, false)}
			onKeyDown={toggleDrawer(anchor, false)}
		>
			<DatePicker
				date={props.date}
				setDate={props.setDate}
				onSelect={toggleDrawer(anchor, false)}
			/>
		</Box>
	);

	return (
		<div>
			<React.Fragment key="left">
				<IconButton onClick={toggleDrawer("left", true)}>
					<CalendarMonth fontSize="large" />
				</IconButton>
				<Drawer
					anchor="left"
					open={state["left"]}
					onClose={toggleDrawer("left", false)}
				>
					{list("left")}
				</Drawer>
			</React.Fragment>
		</div>
	);
}
