import { BrowserWindow, dialog, session } from "electron";
import path from "node:path";

const preload = path.join(__dirname, "../../preload/index.mjs");

export function createDouyinWindow(parent: BrowserWindow): BrowserWindow {
  let loginWindow = new BrowserWindow({
    width: 740,
    height: 740,
    parent,
    autoHideMenuBar: true,
    webPreferences: {
      preload,
      partition: "incognito-" + Date.now(),
    },
  });

  loginWindow.loadURL("https://www.douyin.com/user/self?showTab=post");

  loginWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      dialog.showErrorBox("加载失败", `抖音网站加载失败，请检查网络: ${errorDescription}`);
    }
  );

  loginWindow.webContents.on("did-finish-load", () => {
    loginWindow?.webContents.executeJavaScript(`
      let loggedIn = false;
      const observer = new MutationObserver((mutations) => {
        for (let mutation of mutations) {
          if (mutation.type === 'childList') {
            const loginElement = document.getElementById('douyin-header') ? document.getElementById('douyin-header').innerText : '登录';
            if (!loginElement.includes('登录') && !loggedIn) {
              loggedIn = true;
              setTimeout(() => {
                const username = document.getElementById('douyin-header').querySelectorAll('a[target="_self"]')[1].textContent;
                console.log(username, '------');
                window.ipcRenderer.saveDouyinUsername(username);
              });
            }
          }
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    `);
  });

  return loginWindow;
}

export async function createRestoreDouyinWindow(item: any) {
  const douyinSession = session.fromPartition("persist:douyin");
  const cookies = JSON.parse(item.all_cookies);

  for (const cookie of cookies) {
    await douyinSession.cookies.set({
      url: "https://www.douyin.com",
      ...cookie,
    });
  }

  let douyinWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      session: douyinSession,
    },
  });

  douyinWindow.loadURL("https://www.douyin.com/");
}
