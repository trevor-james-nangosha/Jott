var _a, _b, _c;
require("dotenv").config();
var homedir = require("os").homedir;
var join = require("path").join;
var APP_BASE_DIR = join(homedir(), "jottt");
var dbDev = join(APP_BASE_DIR, "dev", "db-dev.sqlite3");
var dbProd = join(APP_BASE_DIR, "prod", "db-prod.sqlite3");
var nodeEnv =
	(_a = process.env) === null || _a === void 0 ? void 0 : _a.NODE_ENV;
var config = {
	appBaseDir: APP_BASE_DIR,
	dbConfig: {
		client: "sqlite3",
		connection: {
			filename: nodeEnv === "production" ? dbProd : dbDev,
		},
	},
};
console.log(
	"config.dbconfig.connection.filename: ".concat(
		JSON.stringify(
			(_c =
				(_b = config.dbConfig) === null || _b === void 0
					? void 0
					: _b.connection) === null || _c === void 0
				? void 0
				: _c.filename
		)
	)
);
module.exports = config;
