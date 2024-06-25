import { ipcMain, dialog } from "electron";
import fs from "fs";
import puppeteer, { Page } from "puppeteer";
import { cookies } from "./contants";
import { fileURLToPath } from "url";
import { dirname } from "path";
import axios from "axios";
import chromePath from "./chromePath";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface FollowerData {
  username: string;
  followers: string[];
}

async function scrapeFollowersFromAPI(
  username: string,
  all_cookies: string,
  onProgress: (followers: string[]) => void,
  shouldStop: () => boolean
): Promise<string[]> {
  const secUid = await getSecUidFromProfile(username, all_cookies);
  const cookies = JSON.parse(all_cookies || "{}");
  let followers: string[] = [];
  let hasMore = true;
  let maxCursor = "0";

  while (hasMore) {
    if (shouldStop()) {
      console.log("Scraping stopped by user");
      return followers;
    }

    const response = await axios.get("https://www.tiktok.com/api/user/list/", {
      params: {
        aid: "1988",
        app_language: "en",
        app_name: "tiktok_web",
        browser_language: "zh-CN",
        browser_name: "Mozilla",
        browser_online: "true",
        browser_platform: "MacIntel",
        browser_version:
          "5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        channel: "tiktok_web",
        cookie_enabled: "true",
        count: "30",
        device_id: "7359569741240010282",
        device_platform: "web_pc",
        focus_state: "false",
        from_page: "user",
        history_len: "3",
        is_fullscreen: "false",
        is_page_visible: "true",
        maxCursor,
        os: "mac",
        priority_region: "US",
        referer: "",
        region: "SG",
        scene: "67",
        screen_height: "982",
        screen_width: "1512",
        secUid,
        tz_name: "Asia/Shanghai",
        webcast_language: "en",
        msToken: cookies.msToken,
        "X-Bogus": cookies["X-Bogus"],
        _signature: cookies._signature,
      },
      headers: {
        Cookie: Object.entries(cookies)
          .map(([key, value]) => `${key}=${value}`)
          .join("; "),
      },
    });
    console.log(response);
    const userList = response.data.userList;
    console.log(userList);

    const newFollowers = userList.map((user: any) => user.user.unique_id);
    followers = [...new Set([...followers, ...newFollowers])];

    onProgress(followers);

    hasMore = response.data.hasMore;
    maxCursor = response.data.maxCursor;
  }

  return followers;
}

async function getSecUidFromProfile(
  username: string,
  all_cookies: string
): Promise<string> {
  const browser = await puppeteer.launch({ executablePath: chromePath });
  const page: Page = await browser.newPage();
  const cookies = JSON.parse(all_cookies || "{}");
  await page.setCookie(...cookies);
  await page.goto(`https://www.tiktok.com/@${username}`, {
    timeout: 60000,
  });

  const secUid = await page.evaluate(() => {
    const scriptElement = document.querySelector(
      'script[id="__UNIVERSAL_DATA_FOR_REHYDRATION__"]'
    );
    const scriptContent = scriptElement?.textContent;
    console.log(scriptContent);
    return scriptContent;
    // if (scriptContent) {
    //   const parsedData = JSON.parse(scriptContent);
    //   return parsedData;
    // }

    return "";
  });

  await browser.close();
  console.log(secUid);

  if (!secUid) {
    throw new Error(`Could not find secUid for user ${username}`);
  }

  return secUid;
}

export function registerCollectionIpcHandlers(win: Electron.BrowserWindow) {
  let shouldStopScraping = false;

  ipcMain.handle(
    "scrape-followers",
    async (event, fileContent: string, all_cookies: string) => {
      try {
        const usernames = fileContent.split("\n").filter(Boolean);
        let followersData: FollowerData[] = [];

        for (const username of usernames) {
          if (shouldStopScraping) {
            shouldStopScraping = false;
            break;
          }
          console.log(`Scraping followers for ${username}...`);
          const followers = await scrapeFollowersFromAPI(
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
        console.error("Error occurred during scraping:", error);
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
