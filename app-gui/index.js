require("dotenv").config()
const { app, BrowserWindow, } = require('electron');
const {JottApplicationServer} = require("@jottt/lib")
const { join } = require('path');
const { format } = require('url');
const config = require("./config")

const appServer = new JottApplicationServer(config, "./migrations");

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
        }
    });

    win.loadURL(startUrl);

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