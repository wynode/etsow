import { BrowserWindow, dialog, session } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";

const preload = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../preload/index.mjs"
);

export function createLoginWindow(parent: BrowserWindow): BrowserWindow {
  let loginWindow = new BrowserWindow({
    width: 640,
    height: 640,
    parent,
    autoHideMenuBar: true,
    webPreferences: {
      preload,
      partition: "incognito-" + Date.now(),
    },
  });

  loginWindow.loadURL("https://www.tiktok.com/");

  loginWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      dialog.showErrorBox(
        "加载失败",
        `TikTok 网站加载失败: ${errorDescription}`
      );
    }
  );

  loginWindow.webContents.on("did-finish-load", () => {
    loginWindow?.webContents.executeJavaScript(`
      let loggedIn = false;
      const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
          if (mutation.type === 'childList') {
            const loginElement = document.getElementById('app-header') ? document.getElementById('app-header').textContent : '登录'
            if (!loginElement.includes('登录') && !loggedIn) {
              loggedIn = true;
              setTimeout(() => {
                const username = document.querySelector('a[data-e2e="nav-profile"]').getAttribute('href').slice(2);
                window.ipcRenderer.saveTiktokUsername(username);
              }, 1000);
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    `);
  });

  return loginWindow;
}

export async function createRestoreTiktokWindow(item: any) {
  const tiktokSession = session.fromPartition("persist:tiktok");
  const cookies = JSON.parse(item.all_cookies);

  for (const cookie of cookies) {
    await tiktokSession.cookies.set({
      url: "https://www.tiktok.com",
      ...cookie,
    });
  }

  let tiktokWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      session: tiktokSession,
    },
  });

  tiktokWindow.loadURL(
    "https://shop.tiktok.com/streamer/live/product/dashboard"
  );
}
