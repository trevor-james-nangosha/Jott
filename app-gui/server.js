/* eslint-disable @typescript-eslint/no-var-requires */
const { SqliteProvider, JottApplicationServer } = require("@jottt/lib");
const config = require("./config");

const sqliteConn = SqliteProvider.getSqliteConnection(
	config.dbConfig,
	"./migrations"
);
const appServer = new JottApplicationServer(sqliteConn, config.appBaseDir);
