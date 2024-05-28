import { BrowserWindow, Menu, MenuItem, shell } from "electron";
import path from "node:path";
import { MAIN_DIST, RENDERER_DIST, VITE_DEV_SERVER_URL } from "../index";

const preload = path.join(__dirname, "../../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");

export function createMainWindow(): BrowserWindow {
  console.log("xxx");
  let win = new BrowserWindow({
    width: 1440,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
    title: "探行- V1.1.0",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  const contextMenu = new Menu();
  contextMenu.append(
    new MenuItem({
      label: "刷新",
      click: () => {
        win?.webContents.reload();
      },
    })
  );

  win.webContents.on("context-menu", (e, params) => {
    contextMenu.popup({
      window: win,
      x: params.x,
      y: params.y,
    });
  });

  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  return win;
}
