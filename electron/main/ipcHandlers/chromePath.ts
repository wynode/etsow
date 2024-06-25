import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";
import path from "path";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const appPath = path.join(__dirname, "../..");
const windowsPath = path.join(__dirname, "../../../../");

// 根据操作系统确定Chrome可执行文件的路径
let chromePath: string;
switch (os.platform()) {
  case "win32":
    chromePath = path.join(windowsPath, "chrome", "win", "chrome.exe");
    break;
  case "darwin":
    chromePath = path.join(
      appPath,
      "chrome",
      "mac",
      "Chromium.app",
      "Contents",
      "MacOS",
      "Chromium"
    );
    break;
  case "linux":
    chromePath = path.join(appPath, "chrome", "linux", "chrome");
    break;
  default:
    chromePath = path.join(windowsPath, "chrome", "win", "chrome.exe");
    break;
}

export default chromePath