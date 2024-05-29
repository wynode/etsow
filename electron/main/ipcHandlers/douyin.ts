import { ipcMain, BrowserWindow, session, dialog } from "electron";
import {
  createDouyinWindow,
  createRestoreDouyinWindow,
} from "../windows/douyinWindows";

let douyinLoginWindow: BrowserWindow | undefined = undefined;

export function registerDouyinIpcHandlers(win: BrowserWindow) {
  ipcMain.on("open-douyin-window", () => {
    douyinLoginWindow = createDouyinWindow(win);
  });

  ipcMain.on("restore-douyin-window", (event, item) => {
    createRestoreDouyinWindow(item);
  });

  ipcMain.on("save-douyin-username", async (event, username) => {
    try {
      const cookies =
        (await douyinLoginWindow?.webContents.session.cookies.get({
          url: "https://www.douyin.com/",
        })) || [];
      const formattedCookies = cookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");
      const douyinInfo = {
        all_cookies: JSON.stringify(cookies),
        cookies: formattedCookies,
        nickname: username,
      };

      win.webContents.send("douyin-cookie-post", douyinInfo);
      douyinLoginWindow?.destroy(); // 获取到 Cookies 后再关闭窗口
    } catch (error) {
      console.error("获取 Cookies 失败:", error);
      win.webContents.send("douyin-cookie-post", {});
      douyinLoginWindow?.destroy(); // 获取到 Cookies 后再关闭窗口
    }
  });

  // Add more Douyin IPC handlers here
}
