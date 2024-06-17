import { ipcMain, BrowserWindow, session, dialog } from "electron";
import {
  createLoginWindow,
  createRestoreTiktokWindow,
} from "../windows/tiktokWindows";

let tiktokLoginWindow: BrowserWindow | undefined = undefined;
export function registerTiktokIpcHandlers(win: BrowserWindow) {
  ipcMain.on("open-tiktok-window", () => {
    tiktokLoginWindow = createLoginWindow(win);
  });

  ipcMain.on("restore-tiktok-window", (event, item) => {
    createRestoreTiktokWindow(item);
  });

  ipcMain.on("save-tiktok-username", async (event, username) => {
    try {
      const cookies =
        (await tiktokLoginWindow?.webContents.session.cookies.get({
          url: "https://www.tiktok.com",
        })) || [];
      const formattedCookies = cookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

      const tiktokInfo = {
        cookies: formattedCookies,
        all_cookies: JSON.stringify(cookies),
        nickname: username.replace("?lang=en", ""),
        location: "us",
      };
      win.webContents.send("tiktok-cookie-post", tiktokInfo);
      win.webContents.send("collection-cookie-post", tiktokInfo);
      tiktokLoginWindow?.destroy(); // 获取到 Cookies 后再关闭窗口
    } catch (error) {
      console.error("获取 Cookies 失败:", error);
      win.webContents.send("tiktok-cookie-post", {});
      tiktokLoginWindow?.destroy(); // 获取到 Cookies 后再关闭窗口
    }
  });
}
