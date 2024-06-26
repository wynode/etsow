import { ipcMain, BrowserWindow } from "electron";

export function registerMainIpcHandlers(win: BrowserWindow) {
  ipcMain.on(
    "change-window-size",
    (_event, size: { width: number; height: number }) => {
      win?.setSize(size.width, size.height);
    }
  );

  // 监听渲染进程的消息
  ipcMain.handle("get-platform", () => {
    return process.platform;
  });

  // Add more main process IPC handlers here
}
