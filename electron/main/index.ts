import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  session,
  Cookie,
  dialog,
  Menu,
  MenuItem,
} from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
// import { update } from "./update";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, "../..");

export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, "public")
  : RENDERER_DIST;

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | undefined = undefined;
let loginWindow: BrowserWindow | undefined = undefined;
let spinnerWindow: BrowserWindow | undefined = undefined;
let tiktokCookies: string | undefined = "";
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
const loadingHtml = path.join(RENDERER_DIST, "loading.html");
const spinnerHtml = path.join(RENDERER_DIST, "spinner.html");

async function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 800,
    resizable: false,
    autoHideMenuBar: true,
    title: "Newbee - 代理端",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      // devTools: false, // 禁用开发者工具
      // webviewTag: true, // 启用 webview 标签
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    // #298
    win.loadURL(VITE_DEV_SERVER_URL);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }

  const contextMenu = new Menu();
  // contextMenu.append(
  //   new MenuItem({
  //     label: "打开抖音小店",
  //     click: () => {
  //       shell.openExternal(
  //         "https://shop.tiktok.com/streamer/live/product/dashboard"
  //       );
  //     },
  //   })
  // );

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

  // Test actively push message to the Electron-Renderer
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // Auto update
  // update(win);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = undefined;
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

function showLoadingSpinner() {
  spinnerWindow = new BrowserWindow({
    width: 100,
    height: 100,
    frame: false,
    transparent: true,
    focusable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
  });

  spinnerWindow.loadFile(spinnerHtml);
}

async function createLoginWindow() {
  let canOpenTiktok: boolean = false;
  let isClosing: boolean = false;
  loginWindow = new BrowserWindow({
    width: 640,
    height: 640,
    parent: win,
    autoHideMenuBar: true,
    webPreferences: {
      partition: "incognito-" + Date.now(),
    },
  });

  loginWindow.loadURL("https://www.tiktok.com/");

  loginWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      canOpenTiktok = false;
      dialog.showErrorBox(
        "加载失败",
        `TikTok 网站加载失败: ${errorDescription}`
      );
    }
  );

  loginWindow.webContents.on("did-finish-load", () => {
    canOpenTiktok = true;
  });

  loginWindow.on("close", async (event) => {
    if (!canOpenTiktok && loginWindow) {
      const options = {
        // type: 'info',
        title: "确认操作",
        message: "网站未加载完成，将不能获取到推流码，是否退出?",
        buttons: ["确定", "取消"],
        defaultId: 0,
        cancelId: 1,
      };

      const response = await dialog.showMessageBox(options);

      if (response.response === 0) {
        // 用户点击了确定按钮
        console.log("用户点击了确定按钮");
        return;
        // 执行确定操作的代码
      } else {
        // 用户点击了取消按钮或关闭了对话框
        console.log("用户点击了取消按钮或关闭了对话框");
        event.preventDefault();
        return;
        // 执行取消操作的代码
      }
    }
    if (isClosing) {
      const options = {
        title: "确认操作",
        message: "关闭窗口动作会涉及读取信息，读取完成会自动关闭，请耐心等待",
        buttons: ["确定", "取消"],
        defaultId: 0,
        cancelId: 1,
      };
      await dialog.showMessageBox(options);
    }
    event.preventDefault(); // 阻止窗口关闭

    try {
      isClosing = true;
      const cookies = await loginWindow?.webContents.session.cookies.get({
        url: "https://www.tiktok.com",
      });
      // 将cookies格式化为HTTP请求头中的"Cookie"字段的格式
      const formattedCookies = cookies
        ?.map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");
      tiktokCookies = formattedCookies;

      const tiktokInfo = {
        cookies: formattedCookies,
        all_cookies: JSON.stringify(cookies),
        nickname: "",
        location: "us",
      };

      // 使用executeJavaScript获取页面的HTML内容
      const href = await loginWindow?.webContents.executeJavaScript(`
        new Promise((resolve) => {
          resolve(document.querySelector('a[data-e2e="nav-profile"]').getAttribute('href'));
        })
      `);

      // // 使用正则表达式提取href属性的值
      const regex = /\/@([^?]+)/;
      const match = href?.match(regex);
      if (match && match[1]) {
        tiktokInfo.nickname = match[1];
      } else {
        console.log("Href Value not found");
      }

      win?.webContents.send("cookie-post", tiktokInfo);
      loginWindow?.destroy(); // 获取到 Cookies 后再关闭窗口
    } catch (error) {
      console.error("获取 Cookies 失败:", error);
      win?.webContents.send("cookie-post", {});
      loginWindow?.destroy(); // 获取 Cookies 失败也关闭窗口
    } finally {
      isClosing = false;
    }
  });

  loginWindow.on("closed", () => {
    loginWindow = undefined;
  });
}

async function createDouyinWindow() {
  let canOpenDouyin: boolean = false;
  let isClosing: boolean = false;
  loginWindow = new BrowserWindow({
    width: 740,
    height: 740,
    parent: win,
    autoHideMenuBar: true,
    webPreferences: {
      partition: "incognito-" + Date.now(),
    },
  });

  loginWindow.loadURL("https://www.douyin.com/user/self?showTab=post");

  loginWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      canOpenDouyin = false;
      dialog.showErrorBox(
        "加载失败",
        `抖音网站加载失败，请检查网络: ${errorDescription}`
      );
    }
  );

  loginWindow.webContents.on("did-finish-load", () => {
    canOpenDouyin = true;
  });

  loginWindow.on("close", async (event) => {
    if (!canOpenDouyin && loginWindow) {
      const options = {
        title: "确认操作",
        message: "网站未加载完成，将不能获取到推流码，是否退出?",
        buttons: ["确定", "取消"],
        defaultId: 0,
        cancelId: 1,
      };

      const response = await dialog.showMessageBox(options);

      if (response.response === 0) {
        // 用户点击了确定按钮
        return;
      } else {
        event.preventDefault();
        return;
      }
    }
    if (isClosing) {
      const options = {
        title: "确认操作",
        message: "关闭窗口动作会涉及读取信息，读取完成会自动关闭，请耐心等待",
        buttons: ["确定", "取消"],
        defaultId: 0,
        cancelId: 1,
      };
      await dialog.showMessageBox(options);
    }
    event.preventDefault(); // 阻止窗口关闭

    try {
      isClosing = true;
      const cookies = await loginWindow?.webContents.session.cookies.get({
        url: "https://www.douyin.com/",
      });

      // 将cookies格式化为HTTP请求头中的"Cookie"字段的格式
      const formattedCookies = cookies
        ?.map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

      tiktokCookies = formattedCookies;
      const douyinInfo = {
        all_cookies: JSON.stringify(cookies),
        cookies: formattedCookies,
        nickname: "",
      };

      const nickname = await loginWindow?.webContents.executeJavaScript(`
        new Promise((resolve) => {
          resolve(document.querySelector("div[data-e2e='user-info'] h1").textContent);
        })
      `);

      douyinInfo.nickname = nickname;
      win?.webContents.send("douyin-cookie-post", douyinInfo);
      loginWindow?.destroy(); // 获取到 Cookies 后再关闭窗口
    } catch (error) {
      console.error("获取 Cookies 失败:", error);
      win?.webContents.send("douyin-cookie-post", {});
      loginWindow?.destroy(); // 获取 Cookies 失败也关闭窗口
    } finally {
      isClosing = false;
    }
  });

  loginWindow.on("closed", () => {
    loginWindow = undefined;
  });
}
async function createRestoreDouyinWindow(item: any) {
  // 创建一个新的持久性会话
  const douyinSession = session.fromPartition("persist:douyin");

  // 设置 cookies
  const cookies = JSON.parse(item.all_cookies);

  for (const cookie of cookies) {
    await douyinSession.cookies.set({
      url: "https://www.douyin.com",
      ...cookie,
    });
  }

  // 创建新的 BrowserWindow 实例，并指定会话分区
  let douyinWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      session: douyinSession, // 使用之前创建的会话
    },
  });

  // 加载 douyin.com
  douyinWindow.loadURL("https://www.douyin.com/");
}

async function createRestoreTiktokWindow(item: any) {
  // 创建一个新的持久性会话
  const douyinSession = session.fromPartition("persist:douyin");

  // 设置 cookies
  const cookies = JSON.parse(item.all_cookies);

  for (const cookie of cookies) {
    await douyinSession.cookies.set({
      url: "https://www.tiktok.com",
      ...cookie,
    });
  }

  // 创建新的 BrowserWindow 实例，并指定会话分区
  let douyinWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      session: douyinSession, // 使用之前创建的会话
    },
  });

  // 加载 douyin.com
  douyinWindow.loadURL(
    "https://shop.tiktok.com/streamer/live/product/dashboard"
  );
}

ipcMain.on("open-login-window", () => {
  createLoginWindow();
});

ipcMain.on("open-douyin-window", () => {
  createDouyinWindow();
});

ipcMain.on("restore-douyin-window", (event, item) => {
  createRestoreDouyinWindow(item);
});

ipcMain.on("restore-tiktok-window", (event, item) => {
  createRestoreTiktokWindow(item);
});

ipcMain.on("get-tiktok-cookies", async (event) => {
  event.reply("tiktok-cookies", tiktokCookies);
});

// New window example arg: new windows url
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
