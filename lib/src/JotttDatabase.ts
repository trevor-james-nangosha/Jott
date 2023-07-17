import { KnexConnection } from "./types";
import { getLogger, makeDir } from "./utils";
import { join } from "path";
import { open, existsSync } from "node:fs";

const logger = getLogger();
export class DbConnectionError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "DbConnectionError";
	}
}

export class TableNotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "TableNotFoundError";
	}
}

export class JotttDatabase {
	private conn: KnexConnection;

	public constructor(conn_: KnexConnection, appBaseDir: string) {
		this.createBaseDbFolders(appBaseDir);
		this.createDbFiles(appBaseDir);

		this.conn = conn_;
	}

	public createDbFiles(appBaseDir: string) {
		const files = [
			join(appBaseDir, "dev", "db-dev.sqlite3"),
			join(appBaseDir, "prod", "db-prod.sqlite3"),
		];
		files.forEach((file) => {
			if (!existsSync(file)) {
				open(file, "w", function (err) {
					if (err) throw err;
					logger.info("Files have been created!!!!!!!!");
				});
			}
		});
	}

	public createBaseDbFolders(appBaseDir: string) {
		const baseFolders = [join(appBaseDir, "dev"), join(appBaseDir, "prod")];
		baseFolders.forEach((path) => {
			makeDir(path);
		});
	}

	public async readOperation(date: string | null, id: string | null) {
		const flag = date ? ["date", date] : id ? ["id", id] : undefined;

		if (!flag)
			throw new Error(
				`Please provide a valid search argument. Either one of "id" or "date".`
			);

		const localEntryResults = await this.conn("entries")
			.select("*")
			.where(flag[0], flag[1]);
		return localEntryResults;
	}

	public async postOperation(entry: any) {
		await this.saveOrUpdateEntry(entry);
	}

	private async saveOrUpdateEntry(entry: any) {
		await this.conn("entries")
			.insert({ ...entry })
			.catch(async () => {
				const { content, id } = entry;
				await this.conn("entries")
					.where("id", id)
					.update("content", content);
			});
	}
}

export default {
	JotttDatabase,
	DbConnectionError,
	TableNotFoundError,
};
