const { Synchroniser, SqliteProvider } = require("@jottt/lib");
const config = require("./config")

const sqliteConn = SqliteProvider.getSqliteConnection(config.dbConfig, "./migrations")

Synchroniser.setSqliteConnection(sqliteConn)

if (Synchroniser.setSyncPid(process.pid)) {
    Synchroniser.emitStartBackup()
}
    

