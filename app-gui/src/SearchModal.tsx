import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import { useEffect, useState, Fragment, ChangeEvent } from "react";
import { JournalEntry } from "@jottt/lib";
import useGetEntries from "./hooks/useGetEntries";
import { ListItem, MenuList } from "@mui/material";
import dayjs from "dayjs";

function sleep(delay = 0) {
	return new Promise((resolve) => {
		setTimeout(resolve, delay);
	});
}

export default function SearchModal(props: any) {
	const [options, setOptions] = useState<JournalEntry[]>([]);
	const loading = props.modalOpen && options.length === 0;
	const [searchParam, setSearchParam] = useState("");

	useGetEntries(searchParam, setOptions);

	const handleClose = () => {
		props.setModalOpen(false);
	};

	useEffect(() => {
		let active = true;

		if (!loading) {
			return undefined;
		}

		(async () => {
			await sleep(1e1); // For demo purposes.

			if (active) {
				setOptions([...options]);
			}
		})();

		return () => {
			active = false;
		};
	}, [loading]);

	return (
		<div>
			<Dialog
				open={props.modalOpen}
				onClose={handleClose}
				fullWidth
				sx={{
					top: "-50%",
				}}
			>
				<DialogContent>
					<Autocomplete
						id="asynchronous-demo"
						noOptionsText="No entries found"
						sx={{ marginLeft: "0" }}
						isOptionEqualToValue={(option, value) =>
							option.content === value.content
						}
						getOptionLabel={(option) => option.content}
						options={options}
						loading={loading}
						renderOption={(listItemProps, option, { selected }) => {
							return (
								<MenuList>
									<ListItem
										key={option.id}
										onClick={() => {
											// anyone with the slightest idea about working with dates should know the pain
											// that comes from working with timezones and different formats etc.
											// for my use case, i have been having issues with UTC time whereby it kinda takes
											// a date off the time if no timezone is provided.
											// for that reason, i have "faked" the correct functionality by appending a time
											// at the end as shown below. till i learn about dates and time, i will leave this here for now.
											// PS. this could be a source of ugly bugs.
											const fakeDate = new Date(
												(option.date as unknown as string) +
													" 3:00:00"
											);
											props.setDate(
												dayjs(dayjs(fakeDate))
											);
											props.setModalOpen(false);
										}}
										sx={{
											// backgroundColor: "pink",
											color: "black",
											"&:hover": {
												backgroundColor: "pink",
												cursor: "pointer",
											},
										}}
									>
										{option.content}
									</ListItem>
								</MenuList>
							);
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="Search entries......."
								onChange={(
									event: ChangeEvent<HTMLInputElement>
								) => {
									setSearchParam(event.target.value);
								}}
								InputProps={{
									...params.InputProps,
									endAdornment: (
										<Fragment>
											{loading ? (
												<CircularProgress
													color="inherit"
													size={20}
												/>
											) : null}
											{params.InputProps.endAdornment}
										</Fragment>
									),
								}}
							/>
						)}
					/>
				</DialogContent>
			</Dialog>
		</div>
	);
}
