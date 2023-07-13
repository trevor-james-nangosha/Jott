/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();
const { homedir } = require("os");
const { join } = require("path");

const APP_BASE_DIR = join(homedir(), "jottt");
const dbDev = join(APP_BASE_DIR, "dev", "db-dev.sqlite3");
const dbProd = join(APP_BASE_DIR, "prod", "db-prod.sqlite3");
const nodeEnv = process.env?.NODE_ENV;

interface DbConfig {
	client?: string;
	connection?: {
		filename?: string;
	};
}

interface Config {
	appBaseDir: string;
	dbConfig?: DbConfig;
}

const config: Config = {
	appBaseDir: APP_BASE_DIR,
	dbConfig: {
		client: "sqlite3",
		connection: {
			filename: nodeEnv === "production" ? dbProd : dbDev,
		},
	},
};

module.exports = config;
