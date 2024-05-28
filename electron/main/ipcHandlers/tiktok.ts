import { ipcMain, BrowserWindow, session, dialog } from "electron";
import { createLoginWindow, createRestoreTiktokWindow } from '../windows/tiktokWindows';

let tiktokCookies: string | undefined = "";

export function registerTiktokIpcHandlers(win: BrowserWindow) {
  ipcMain.on("open-login-window", () => {
    createLoginWindow(win);
  });

  ipcMain.on("restore-tiktok-window", (event, item) => {
    createRestoreTiktokWindow(item);
  });

  ipcMain.on("save-tiktok-username", async (event, username) => {
    try {
      const cookies = await win.webContents.session.cookies.get({ url: "https://www.tiktok.com" });
      const formattedCookies = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
      tiktokCookies = formattedCookies;

      const tiktokInfo = {
        cookies: formattedCookies,
        all_cookies: JSON.stringify(cookies),
        nickname: username,
        location: "us",
      };

      win.webContents.send("cookie-post", tiktokInfo);
    } catch (error) {
      console.error("获取 Cookies 失败:", error);
      win.webContents.send("cookie-post", {});
    }
  });

  ipcMain.on("get-tiktok-cookies", async (event) => {
    event.reply("tiktok-cookies", tiktokCookies);
  });

  // Add more TikTok IPC handlers here
}
