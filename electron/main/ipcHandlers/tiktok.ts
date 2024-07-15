import { ipcMain, BrowserWindow, session, dialog } from "electron";
import {
  createLoginWindow,
  createCollectionLoginWindow,
  createRestoreTiktokWindow,
} from "../windows/tiktokWindows";

let tiktokLoginWindow: BrowserWindow | undefined = undefined;
let tiktokCollectionLoginWindow: BrowserWindow | undefined = undefined;
export function registerTiktokIpcHandlers(win: BrowserWindow) {
  ipcMain.on("open-tiktok-window", () => {
    tiktokLoginWindow = createLoginWindow(win);
  });
  ipcMain.on("open-tiktok-collection-window", () => {
    tiktokCollectionLoginWindow = createCollectionLoginWindow(win);
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
      tiktokLoginWindow?.destroy(); // 获取到 Cookies 后再关闭窗口
    } catch (error) {
      console.error("获取 Cookies 失败:", error);
      win.webContents.send("tiktok-cookie-post", {});
      tiktokLoginWindow?.destroy(); // 获取到 Cookies 后再关闭窗口
    }
  });

  ipcMain.on("save-collection-tiktok-cookies", async (event) => {
    try {
      const cookies =
        (await tiktokCollectionLoginWindow?.webContents.session.cookies.get({
          url: "https://www.tiktok.com",
        })) || [];
      // const formattedCookies = cookies.map((cookie) => ({
      //   ...cookie,
      //   sameSite: "lax",
      // }));

      const tiktokInfo = {
        // cookies: formattedCookies,
        all_cookies: JSON.stringify(cookies),
      };
      console.log("xxxxxx, 收集到了cookies", cookies[0]);
      win.webContents.send("collection-tiktok-cookie-post", tiktokInfo);

      console.log("发送了哦", cookies[0]);
      tiktokCollectionLoginWindow?.destroy(); // 获取到 Cookies 后再关闭窗口
    } catch (error) {
      console.error("获取 Cookies 失败:", error);
      win.webContents.send("collection-tiktok-cookie-post", {});
      tiktokCollectionLoginWindow?.destroy(); // 获取到 Cookies 后再关闭窗口
    }
  });
}
