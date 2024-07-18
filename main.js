const { app, BrowserWindow } = require("electron");
const path = require("path");
const { ipcMain } = require("electron");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webviewTag: true, // 启用 webview 标签
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false, // 禁用 Web 安全限制
    },
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("cookies", (event, cookies) => {
  console.log("Cookies:", cookies);
  // 在这里可以对获取到的cookies进行处理或保存
});
