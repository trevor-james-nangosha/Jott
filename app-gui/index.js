/* eslint-disable @typescript-eslint/no-var-requires */
require("dotenv").config();
const {
	SqliteProvider,
	JottApplicationServer,
	Synchroniser,
} = require("@jottt/lib");
const { join } = require("path");
const { format } = require("url");
const { app, BrowserWindow } = require("electron");
const config = require("./config");

const sqliteConn = SqliteProvider.getSqliteConnection(
	config.dbConfig,
	"./migrations"
);
const appServer = new JottApplicationServer(sqliteConn, config.appBaseDir);
Synchroniser.setSqliteConnection(sqliteConn);

function createWindow() {
	const startUrl = format({
		pathname: join(__dirname, "build/index.html"),
		protocol: "file:",
		slashes: true,
	});

	const win = new BrowserWindow({
		width: 1800,
		height: 1800,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			devTools: true,
		},
	});

	win.loadURL(startUrl);
	win.webContents.openDevTools();
}

app.whenReady().then(() => {
	// Synchroniser.createSyncSubProcess();
	createWindow();
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		appServer.killServer();
		app.quit();
	}
});

// i find this block useless, but it is in the electron docs...
// ...so i will leave it here for now
// app.on('activate', async () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//         createWindow()
//     }
// });
