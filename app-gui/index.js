require("dotenv").config()
const { app, BrowserWindow, } = require('electron');
const {SqliteProvider, JottApplicationServer, Synchroniser} = require("@jottt/lib")
const { join } = require('path');
const { format } = require('url');
const config = require("./config");

const sqliteConn = SqliteProvider.getSqliteConnection(config, "./migrations")
const appServer = new JottApplicationServer(sqliteConn);
Synchroniser.setSqliteConnection(sqliteConn)

function createWindow() {
    const startUrl = format({
        pathname: join(__dirname, 'build/index.html'),
        protocol: 'file:',
        slashes: true,
    });

    const win = new BrowserWindow({
        width: 1800,
        height: 1800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false
        }
    });

    win.once("ready-to-show", () => {
        Synchroniser.emitStartBackup();
    })

    win.loadURL(startUrl);
    win.webContents.openDevTools()

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            // the app server is closed automatically when the windows are closed,
            // but for any reason it can fail to close. It is better to hedge against this by killing
            // the server manually
            appServer.killServer()
            app.quit()
        }
    });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});