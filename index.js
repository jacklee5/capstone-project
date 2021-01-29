const { app, BrowserWindow, net } = require('electron');
let ejs = require("ejs-electron");
const CLIENT_ID = "iZD7FqQlR1G1oJRVU8LLsQ";
const CLIENT_SECRET = "HTPcQBzO4ND5BrtycWluc0kUHWCkgNCa";
const REDIRECT_URI = "https://localhost";

// import {JSO, Popup} from 'jso';

// let client = new JSO({
//     client_id: "Q52BUw5kREym86duDulQ5A",
//     redirect_uri: "",//this should be a localhost url, I think, but it doesn't really matter
//     authorization: "https://zoom.us/oauth/",
//     scopes: ""
// })
// client.callback()

const fetch = (url, method, headers) => {
  return new Promise((res, rej) => {
      if (!method) 
          method = "GET";
      const request = net.request({
          method: method,
          url: url
      });
      for (let i = 0; i < headers.length; i++) {
          request.setHeader(headers[i][0], headers[i][1]);
      }
      request.on("response", response => {
          let body = '';
          response.on("data" , chunk => {
              body += chunk;
          });
          response.on("end", () => {
              res(body);
              // TODO: handle network error
          });
          response.on("error", () => {
              rej("bruh");
          })
      });
      request.end();
  });
}

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    },
    'web-security': false
  })


  let authURL = `https://zoom.us/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
    win.loadURL(authURL, {userAgent: "Chrome"});

    win.webContents.on("will-redirect", (event, newURL) => { 
        if (newURL.startsWith("https://localhost")) {
            event.preventDefault();
            const code = newURL.split("code=")[1];
            fetch(
                `https://zoom.us/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${REDIRECT_URI}`, 
                "POST", 
                [["Authorization", "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64")]]
            ).then(response => {
                const token = JSON.parse(response)["access_token"];

                fetch("https://api.zoom.us/v2/users/me", "GET", [["Authorization", "Bearer " + token]])
                .then(res => {
                    console.log(JSON.parse(res));
                    win.loadFile("index.ejs");
                })

                let meetingId = 9084198757;
                fetch(
                    `https://api.zoom.us/v2/metrics/meetings/${meetingId}/participants`, 
                    "GET", 
                    [["Authorization", "Bearer " + token]]
                ).then(response => {
                    console.log(response);
                }).catch((error) => {
                  console.error(error);
                });
            }).catch((error) => {
              console.error(error);
            });
        }
    });
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