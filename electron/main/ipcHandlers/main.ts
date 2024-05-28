import { ipcMain, BrowserWindow } from "electron";

export function registerMainIpcHandlers(win: BrowserWindow) {
  ipcMain.on("change-window-size", (_event, size: { width: number; height: number }) => {
    win?.setSize(size.width, size.height);
  });

  // Add more main process IPC handlers here
}
