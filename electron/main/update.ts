import { app, ipcMain } from "electron";
import { createRequire } from "node:module";
import type {
  ProgressInfo,
  UpdateDownloadedEvent,
  UpdateInfo,
} from "electron-updater";

const { autoUpdater } = createRequire(import.meta.url)("electron-updater");

// 设置更新源
autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'wynode',
  repo: 'etsow',
  releaseType: 'release'
});

// 根据平台设置更新文件
if (process.platform === 'darwin') {
  autoUpdater.channel = 'latest-mac';
} else if (process.platform === 'win32') {
  autoUpdater.channel = 'latest';
} else if (process.platform === 'linux') {
  autoUpdater.channel = 'latest-linux';
}

export function update(win: Electron.BrowserWindow) {
  // When set to false, the update download will be triggered through the API
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.allowDowngrade = false;

  // start check
  console.log("xxxx");
  autoUpdater.on("checking-for-update", function () {});
  // update available
  autoUpdater.on("update-available", (arg: UpdateInfo) => {
    console.log("-update-can-availabel-", arg);
    win.webContents.send("update-can-available", {
      update: true,
      version: app.getVersion(),
      newVersion: arg?.version,
    });
  });
  // update not available
  autoUpdater.on("update-not-available", (arg: UpdateInfo) => {
    console.log("-update-can't-availabel-", arg);
    win.webContents.send("update-can-available", {
      update: false,
      version: app.getVersion(),
      newVersion: arg?.version,
    });
  });

  setTimeout(async () => {
    try {
      const res = await autoUpdater.checkForUpdatesAndNotify();
      if (res) {
        win.webContents.send("auto-update", {
          update: true,
          version: app.getVersion(),
        });
      } else {
        win.webContents.send("auto-update", {
          update: false,
        });
      }
    } catch (error) {
      win.webContents.send("auto-update", {
        update: false,
      });
    }
  }, 2000);

  // Checking for updates
  ipcMain.handle("check-update", async () => {
    if (!app.isPackaged) {
      const error = new Error("更新功能仅在打包后可用。");
      return { message: error.message, error };
    }

    try {
      return await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      return { message: "网络错误", error };
    }
  });

  // Start downloading and feedback on progress
  ipcMain.handle("start-download", (event: Electron.IpcMainInvokeEvent) => {
    startDownload(
      (error, progressInfo) => {
        if (error) {
          // feedback download error message
          event.sender.send("update-error", { message: error.message, error });
        } else {
          // feedback update progress message
          event.sender.send("download-progress", progressInfo);
        }
      },
      () => {
        // feedback update downloaded message
        event.sender.send("update-downloaded");
      }
    );
  });

  // Install now
  ipcMain.handle("quit-and-install", () => {
    autoUpdater.quitAndInstall(false, true);
  });
}

function startDownload(
  callback: (error: Error | null, info: ProgressInfo | null) => void,
  complete: (event: UpdateDownloadedEvent) => void
) {
  autoUpdater.on("download-progress", (info: ProgressInfo) =>
    callback(null, info)
  );
  autoUpdater.on("error", (error: Error) => callback(error, null));
  autoUpdater.on("update-downloaded", complete);
  autoUpdater.downloadUpdate();
}
