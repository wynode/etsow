import { app, BrowserWindow } from "electron";
// import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import { createMainWindow } from "./windows/mainWindow";
import { registerMainIpcHandlers } from "./ipcHandlers/main";
import { registerDouyinIpcHandlers } from "./ipcHandlers/douyin";
import { registerTiktokIpcHandlers } from "./ipcHandlers/tiktok";
import { registerGameIpcHandlers } from "./ipcHandlers/game";
import { registerCollectionIpcHandlers } from "./ipcHandlers/collection";

// const require = createRequire(import.meta.url);
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

process.env.APP_ROOT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

// process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;


if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | undefined = undefined;

app.whenReady().then(() => {
  win = createMainWindow();
  if (win) {
    registerMainIpcHandlers(win);
    registerDouyinIpcHandlers(win);
    registerGameIpcHandlers();
    registerTiktokIpcHandlers(win);
    registerCollectionIpcHandlers(win); // 注册 Collection IPC 处理程序
  }
});

app.on("window-all-closed", () => {
  win = undefined;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    win = createMainWindow();
  }
});
