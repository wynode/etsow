import { exec } from "child_process";
import path from "path";

import { ipcMain } from "electron";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function openAnotherElectronApp(username: string, password: string): void {
  const windowsPath = path.join(__dirname, "../../");
  const chromePath = path.join(
    windowsPath,
    "chrome",
    "hooyoo-electron",
    "hooyoo-electron.exe"
  );
  console.log(chromePath);

  const command = `"${chromePath}" ${username} ${password}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`启动应用程序时出错: ${error}`);
      return;
    }

    console.log(`应用程序输出: ${stdout}`);

    if (stderr) {
      console.error(`应用程序错误: ${stderr}`);
    }
  });
}

export function registerGameIpcHandlers() {
  ipcMain.on("open-game-window", () => {
    openAnotherElectronApp("test110test110", "test110test110");
  });
}