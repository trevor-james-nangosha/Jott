import knex from "knex";
import { DB_ERROR, KnexConnection, SQLITE_ERRORS } from "./types";
import { DbConnectionError } from "./JotttDatabase";
import { getLogger } from "./utils";

const logger = getLogger();

export default class SqliteProvider {
	private static conn: KnexConnection;
	private static migrationDir: string;

	public static getSqliteConnection(
		config_: any,
		migrationDir_: string
	): KnexConnection {
		if (!SqliteProvider.conn) {
			SqliteProvider.migrationDir = migrationDir_;
			SqliteProvider.conn = SqliteProvider.connectDb(config_);

			SqliteProvider.testConnection();
		}

		return SqliteProvider.conn;
	}

	private static connectDb(config: any): KnexConnection {
		const connection = knex(config);
		return connection;
	}

	private static async testConnection() {
		await SqliteProvider.conn("entries")
			.select("*")
			.catch(async (error) => {
				switch (error) {
					case DB_ERROR.ECONNREFUSED:
						throw new DbConnectionError(
							"Could not establish database connection."
						);
					case error.errno === SQLITE_ERRORS.ER_NO_SUCH_TABLE:
						await this.migrateLatest(SqliteProvider.conn).catch(
							(error) => {
								//the reason this migration will not run is actually quite simple......we do
								// not have a knexfile in this current directory. so it looks like we are going to do a  "manual"
								// "entries" table creation using raw SQL.
								logger.error(
									`Error from trying migrations while testing connection: ${error}`
								);
							}
						);
						break;
					case DB_ERROR.ER_NO_SUCH_TABLE:
						// i am doing this raw, but it would be a good idea to also test out the migration file.
						SqliteProvider.conn
							.raw(
								"CREATE TABLE `entries` (`id` varchar(255), `date` varchar(255), `content` text, `createdAt` datetime not null default CURRENT_TIMESTAMP, `updatedAt` datetime not null default CURRENT_TIMESTAMP, primary key (`id`));"
							)
							.catch((err) => {
								logger.error(
									`\nCould not create table entries in MySQL: ${err}\n`
								);
							});
						break;
					default:
						throw error;
				}
			});
		// console.log("Database connection successful.")
	}

	private static async migrateLatest(
		conn: KnexConnection,
		disableTransactions = false
	) {
		await conn.migrate
			.latest({
				directory: SqliteProvider.migrationDir,
				disableTransactions,
			})
			.then(() => {
				logger.info("done running migrations.");
			});
	}
}
