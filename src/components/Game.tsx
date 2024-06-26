import { useState, useEffect } from "react";
import GameMain from "@/assets/game-main.png";
import GameBottom from "@/assets/game-bottom.jpg";

import { useToast } from "@/components/ui/use-toast";

export default function UpdateLog() {
  const { toast } = useToast();
  const handleRunGame = async () => {
    const platform = await window.ipcRenderer.invoke("get-platform");

    if (platform === "win32") {
      //     "game_username": "tx_admin",
      // "game_platform_password": "",
      console.log("当前操作系统是 Windows");
      const name = localStorage.getItem("game_username");
      const password = localStorage.getItem("game_platform_password");
      if (!name || !password) {
        toast({
          variant: "destructive",
          title: "需重新登录",
          description: "请于右上角退出并重新登录一次，以注册游戏内部账号",
        });
      }
    } else if (platform === "darwin") {
      console.log("当前操作系统是 macOS");
      toast({
        variant: "destructive",
        title: "系统不支持",
        description: "当前系统不支持启动探行游戏",
      });
    } else {
      console.log("当前操作系统是其他类型");
      toast({
        variant: "destructive",
        title: "系统不支持",
        description: "当前系统不支持启动探行游戏",
      });
    }
  };
  return (
    <div>
      <div id="__next">
        <div className="flex min-h-screen flex-col bg-white text-black">
          <div className="mt-20 flex-grow px-4 md:px-16 lg:px-32">
            <div className="space-y-20">
              <div className="text-center">
                <div className="text-3xl font-extrabold tracking-tight md:text-5xl">
                  探行弹幕游戏 - 即刻开启 弹幕互游
                </div>
                <div className="mt-4 font-serif text-xl text-gray-600 md:text-2xl">
                  <p>
                    专注TikTok弹幕互游赛道，助力主播出海，助力公会出海，助力厂商出海
                  </p>
                </div>
              </div>
              <div className="mx-auto max-w-[100rem] rounded-md border">
                <div className="flex flex-col gap-x-5 p-2 transition hover:bg-gray-50/50 xl:flex-row 0">
                  <div className="w-full xl:w-9/12">
                    <div className="w-full overflow-hidden rounded-[3px] bg-gray-50 relative aspect-[16/9]">
                      <img
                        alt="xxx"
                        loading="lazy"
                        width="3500"
                        height="2000"
                        decoding="async"
                        data-nimg="1"
                        className="absolute h-full w-full"
                        style={{ color: "transparent" }}
                        sizes="100vw"
                        src={GameMain}
                      />
                    </div>
                  </div>
                  <div className="flex xl:w-1/4">
                    <div className="relative mt-2 flex w-full flex-col justify-between p-3 xl:mt-0">
                      <div>
                        <div className="mb-2 text-xl font-extrabold tracking-tight md:text-2xl">
                          快速了解:什么是探行游戏
                        </div>
                        <div className="font-serif text-gray-500">
                          <p>
                            集百款游戏于一体的游戏盒子，专注TikTol平台直播
                            为主播、工会、开发者提供全套可靠的解决方案
                          </p>
                        </div>
                      </div>
                      {/* <div className="mt-4 flex flex-row gap-x-2">
                        <div className="text-sm font-medium lowercase md:text-lg">xx</div>
                        <div className="text-sm font-medium lowercase md:text-lg">xxxx</div>
                      </div> */}

                      <div className="bg-slate-800 text-white">
                        <div className="flex justify-between">
                          <div className="text-xl">Free免费</div>
                          <div className="text-sm">主播</div>
                        </div>
                        <div className="text-sm text-gray-400">
                          主播合作，盒子内所有游戏无押金，无开卡费用，预充值抽取礼物流水10%
                        </div>
                        <div className="w-full h-1 bg-gray-100"></div>
                        <div>
                          <div>
                            <span>☑️</span>无需注册，一键开播
                          </div>
                          <div>
                            <span>☑️</span>内置TkTok资源
                          </div>
                          <div>
                            <span>☑️</span>内置TkTok直播教科
                          </div>
                          <div>
                            <span>☑️</span>精品游戏持续更亲
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="bottom-0 w-full bg-white px-12 py-12 text-center md:py-20">
            <p className="text-md md:text-xl">主播 5分钟 开启海外直播</p>
            <p className="text-md md:text-xl">Etsow</p>
          </footer>
          <div className="flex justify-center border-t border-gray-100 bg-gray-50/50">
            <div className="mb-4 mt-20 grid max-w-screen-2xl grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-16 md:gap-y-32 lg:gap-x-32">
              <div className="self-center">
                <img
                  alt="An illustration of a browser window, a terminal window, the Sanity.io logo and the NextJS logo"
                  loading="lazy"
                  width="1234"
                  height="834"
                  decoding="async"
                  data-nimg="1"
                  src={GameBottom}
                  style={{ color: "transparent" }}
                />
                <div className="mt-10 hidden px-14 text-xs text-gray-700 md:block"></div>
              </div>
              <div className="mx-6 md:mx-0 md:mr-24">
                <h2 className="mb-5 text-xl font-bold tracking-tight md:text-5xl">
                  操作步骤
                </h2>
                <ol>
                  <li className="mt-2 grid grid-flow-col grid-rows-1 place-content-start gap-3">
                    <div className="row-span-3 select-none">
                      <div className="relative flex h-5 w-5 select-none items-center justify-center rounded-full bg-gray-200 p-3 text-center">
                        1
                      </div>
                    </div>
                    <div>
                      <div className="col-span-2 mb-2 mt-1 font-semibold">
                        运行探行游戏
                      </div>
                      <div className="text-xs text-gray-700">
                        当前游戏仅支持windows，请在windows系统下运行
                      </div>
                      <div className="mt-3">
                        <a
                          className="inline-flex rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-800 cursor-pointer"
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.preventDefault();
                            handleRunGame();
                          }}
                        >
                          运行游戏
                        </a>
                      </div>
                    </div>
                  </li>
                  <li className="mt-2 grid grid-flow-col grid-rows-1 place-content-start gap-3">
                    <div className="row-span-3 select-none">
                      <div className="relative flex h-5 w-5 select-none items-center justify-center rounded-full bg-gray-200 p-3 text-center">
                        2
                      </div>
                    </div>
                    <div>
                      <div className="col-span-2 mb-2 mt-1 font-semibold">
                        领取并下载游戏
                      </div>
                      <div className="text-xs text-gray-700">
                        部分游戏需要钻石，请提前充值小额费用
                      </div>
                    </div>
                  </li>
                  <li className="mt-2 grid grid-flow-col grid-rows-1 place-content-start gap-3">
                    <div className="row-span-3 select-none">
                      <div className="relative flex h-5 w-5 select-none items-center justify-center rounded-full bg-gray-200 p-3 text-center">
                        3
                      </div>
                    </div>
                    <div>
                      <div className="col-span-2 mb-3 mt-1 font-semibold">
                        启动游戏并连接弹幕
                      </div>
                      <div className="text-xs text-gray-700">
                        直播间开启以后，填写对应链接，则游戏与弹幕进行捆绑
                      </div>
                    </div>
                  </li>
                  <li className="mt-2 grid grid-flow-col grid-rows-1 place-content-start gap-3">
                    <div className="row-span-3 select-none">
                      <div className="relative flex h-5 w-5 select-none items-center justify-center rounded-full bg-gray-200 p-3 text-center">
                        4
                      </div>
                    </div>
                    <div>
                      <div className="col-span-2 mb-2 mt-1 font-semibold">
                        开始直播
                      </div>
                      <div className="text-xs text-gray-700">
                        支持手机、Tiktok studio以及OBS模式，并允许无人及真人直播
                      </div>
                    </div>
                  </li>
                </ol>
                <div className="text-center text-xs text-gray-700 md:invisible"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
