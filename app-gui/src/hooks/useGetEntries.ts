import { useEffect } from "react";
import { JournalEntry } from "@jottt/lib";

// const logger = getLogger();

const useGetEntries = (
	searchPar: string,
	setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>
) => {
	useEffect(() => {
		const getEntryContainsPar = (
			searchPar: string,
			setEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>
		) => {
			if (searchPar.trim() && searchPar !== " ") {
				fetch(`http://127.0.0.1:4001/entries?content=${searchPar}`, {
					headers: { Accept: "application/json" },
				})
					.then((response) => {
						return response.json();
					})
					.then((entries) => {
						setEntries(entries);
					})
					.catch((error) => console.error(error));
			} else {
				setEntries([]);
			}
		};

		getEntryContainsPar(searchPar, setEntries);
	}, [searchPar]);
};

export default useGetEntries;
