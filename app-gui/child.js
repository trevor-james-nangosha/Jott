// console.log(`\nthis code is running in a child process and it is set to be detached from the main process.`)
// console.log(`this is the process pid: ${process.pid}\n`)

// const { Synchroniser, SqliteProvider } = require("@jottt/lib")
// const config = require("./config")

// TODO; check whether this is still the same connection
// that is passed to the JottDatabase even though we are in a different file now.
// const sqliteConn = SqliteProvider.getSqliteConnection(config, "./migrations")

// Synchroniser.setSqliteConnection(sqliteConn)
// await Synchroniser.startBackup()


// childProcess.unref(); // Allow the parent process to exit independently
