import { ipcMain, dialog, app } from "electron";
import fs from "fs";
import path from "path";
import os from "os";
import puppeteer, { Browser, Page } from "puppeteer";
import { cookies } from "./contants";
// const path = require('path');
// const os = require('os');

// 获取应用程序的根目录
// const appPath = app.getAppPath();
// path.resolve(__dirname, '..', '..');
import { fileURLToPath } from "url";
import { dirname } from "path";

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
interface FollowerData {
  username: string;
  followers: string[];
}

async function scrapeFollowers(
  username: string,
  all_cookies: string,
  onProgress: (followers: string[]) => void,
  shouldStop: () => boolean
): Promise<string[]> {
  console.log(all_cookies);
  // const isProd = process.env.NODE_ENV === "production";
  // const executablePath = isProd
  //   ? path.join(
  //       process.resourcesPath,
  //       "chromium",
  //       "chrome" + (process.platform === "win32" ? ".exe" : "")
  //     )
  //   : puppeteer.executablePath();
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: chromePath,
    ignoreDefaultArgs: ["--disable-extensions"],
    args: [
      "--window-size=1920,1080",
      "--disable-blink-features=AutomationControlled",
    ],
  });
  const page: Page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
  );
  await page.setViewport({ width: 1920, height: 1080 });
  await page.setJavaScriptEnabled(true);

  let followers: string[] = [];
  try {
    const cookies = JSON.parse(all_cookies || "{}");
    await page.setCookie(...cookies);
    await page.goto(`https://www.tiktok.com/@${username}`, { timeout: 60000 });
    await page.click('span[data-e2e="followers"]');
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 等待弹窗完全加载
    await page.waitForSelector('div[class*="DivUserListContainer"]', {
      visible: true,
      timeout: 30000,
    });
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 等待列表完全加载

    const totalFollowers: string = await page.evaluate(() => {
      const dom = document.querySelector('strong[data-e2e="followers-count"]');
      return dom?.textContent || "";
    });

    const totalCount = parseInt(totalFollowers?.replace(/,/g, "") || "0", 10);
    let previousFollowerCount = 0;
    let noChangeCount = 0;
    const maxNoChangeCount = 5;

    while (true) {
      if (shouldStop()) {
        console.log("Scraping stopped by user");
        return followers; // 如果需要停止,直接返回已收集的粉丝列表
      }
      const currentFollowers = await page.$$eval(
        'div[class*="DivUserListContainer"] p',
        (elements) =>
          elements.map((element) => element.textContent?.trim() || "")
      );

      followers = [...new Set([...followers, ...currentFollowers])];

      onProgress(followers); // 调用回调函数,返回当前已收集的粉丝列表

      if (followers.length >= totalCount) {
        break;
      }

      if (currentFollowers.length === previousFollowerCount) {
        noChangeCount++;
        if (noChangeCount >= maxNoChangeCount) {
          console.warn(
            `No new followers loaded after ${maxNoChangeCount} attempts. Skipping further scrolling.`
          );
          break;
        }
      } else {
        noChangeCount = 0;
      }

      previousFollowerCount = currentFollowers.length;

      await page.evaluate(() => {
        const container = document.querySelector(
          'div[class*="DivUserListContainer"]'
        );
        const lastChild = container?.lastElementChild as HTMLElement;
        if (lastChild) {
          lastChild.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      });

      await new Promise((resolve) => setTimeout(resolve, 3000)); // 等待滚动加载完成
    }

    await browser.close();

    return followers;
  } catch (error) {
    console.error("Error occurred during scraping:", error);
    await browser.close();
    throw new Error(JSON.stringify(error));
  }
}

export function registerCollectionIpcHandlers(win: Electron.BrowserWindow) {
  let shouldStopScraping = false;

  ipcMain.handle(
    "scrape-followers",
    async (event, fileContent: string, all_cookies: string) => {
      try {
        // win.webContents.send("scraped-followers", {
        //   __filename,
        //   __dirname,
        //   appPath,
        //   chromePath,
        //   windowsPath,
        //   getAppPath: app.getAppPath(),
        // });
        const usernames = fileContent.split("\n").filter(Boolean);
        let followersData: FollowerData[] = [];

        for (const username of usernames) {
          if (shouldStopScraping) {
            shouldStopScraping = false;
            break;
          }
          console.log(`Scraping followers for ${username}...`);
          const followers = await scrapeFollowers(
            username,
            cookies,
            (progress) => {
              const existingData = followersData.find(
                (data) => data.username === username
              );
              if (existingData) {
                followersData = followersData.map((data) =>
                  data.username === username
                    ? { ...data, followers: progress }
                    : data
                );
              } else {
                followersData = [
                  ...followersData,
                  { username, followers: progress },
                ];
              }
              win.webContents.send("scraped-followers", followersData);
            },
            () => shouldStopScraping
          );

          console.log(`Scraped ${followers.length} followers for ${username}.`);
        }
      } catch (error) {
        console.error("Error occurred during scraping shouji:", error);
        throw error;
      }
    }
  );

  ipcMain.on("stop-scraping", () => {
    shouldStopScraping = true;
  });

  ipcMain.on(
    "export-data",
    async (event, username: "", followers: string[]) => {
      const timestamp = new Date().getTime();
      const defaultFileName = `探行粉丝收集_${username}_${timestamp}.txt`;

      const { filePath } = await dialog.showSaveDialog({
        defaultPath: defaultFileName,
        filters: [
          { name: "Text Files", extensions: ["txt"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (filePath) {
        fs.writeFileSync(filePath, followers.join("\n"));
        console.log(`Exported ${followers.length} followers to ${filePath}.`);
        event.reply("export-complete", filePath);
      }
    }
  );
}
