const { app, BrowserWindow } = require('electron');

// import {JSO, Popup} from 'jso';

// let client = new JSO({
//     client_id: "Q52BUw5kREym86duDulQ5A",
//     redirect_uri: "",//this should be a localhost url, I think, but it doesn't really matter
//     authorization: "https://zoom.us/oauth/",
//     scopes: ""
// })
// client.callback()

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})