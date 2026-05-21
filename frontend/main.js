const {app, BrowserWindow, Menu} = require('electron');
const path = require('path');
const {startServer, PORT} = require('./server');

function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Jikan",
        icon: path.join(__dirname, "img/favicon.ico"),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        },
    });
    win.loadURL(`http://127.0.0.1:${PORT}`);
}

app.whenReady().then(async () => {
    const {port} = await startServer();
    createWindow(port);
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});