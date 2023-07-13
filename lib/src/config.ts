// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

export interface DbConfigConnection {
	host?: string;
	port?: number;
	user?: string;
	password?: string;
	database?: string;
	filename?: string;
}
export interface DbConfig {
	client: string;
	connection: DbConfigConnection;
	pool?: {
		min: number;
		max: number;
	};
	migrations?: {
		tableName: string;
	};
}

const nodeEnv = process.env?.NODE_ENV as string;
const client = nodeEnv === "production" ? "sqlite3" : "mysql";

export const configDev: DbConfig = {
	client,
	connection: {
		host: process.env?.DATABASE_HOST,
		port: parseInt(process.env?.DATABASE_PORT as string),
		user: process.env?.DATABASE_USER,
		password: process.env?.DATABASE_PASSWORD,
		database: process.env?.DATABASE,
	},
	pool: {
		min: 2,
		max: 10,
	},
	migrations: {
		tableName: "knex_migrations",
	},
};

export const configProd: DbConfig = {
	client,
	connection: {
		filename: "./db-prod.sqlite3",
	},
};

const config = nodeEnv === "production" ? configProd : configDev;

export default config;
