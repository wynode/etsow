import React, { useState, useEffect } from "react";
import Tiktok from "@/components/Tiktok";
import Douyin from "@/components/Douyin";
import Logo from "@/assets/logo.png";
import Banner from "@/assets/banner.jpg";
import FuFei from "@/assets/fufei.jpg";
import MianFei from "@/assets/mianfei.jpg";
import LoginRegister from "@/components/Login";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LoginPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    setUserName(localStorage.getItem("userName") || "");
  }, []);

  const handleLogout = () => {
    // 登出时清除 localStorage 中的 token
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
  };

  useEffect(() => {
    // 在组件挂载时检查 localStorage 中是否存在 token
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
    // setInterval(() => {
    //   const token = localStorage.getItem("token");
    //   if (!token) {
    //     console.log("xxx");
    //     setIsLoggedIn(false);
    //   }
    // }, 3000);
  }, []);

  const handleLogin = (username: any) => {
    setIsLoggedIn(true);
    setUserName(username);
  };
  const handelBannerClick = () => {
    window.open(
      "https://console-api.etsow.com/live_tools/static/定制版_OBS.zip"
    );
  };

  return (
    <div className="mt-2">
      <Toaster />
      {!isLoggedIn ? (
        <div className="h-screen flex justify-center items-center">
          <div className="max-h-96">
            <LoginRegister onLoginSuccess={handleLogin}></LoginRegister>
          </div>
        </div>
      ) : (
        <div>
          <div>
            <div className="flex justify-between items-center my-4 mx-10">
              {/* <Logo></Logo> */}
              <img className="w-20" src={Logo} alt="" />
              <div>
                <img
                  className="w-[1000px] cursor-pointer"
                  onClick={() => {
                    handelBannerClick();
                  }}
                  src={Banner}
                  alt=""
                />
              </div>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      {userName || "佚名"}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <NavigationMenuLink>
                        <p
                          onClick={handleLogout}
                          className="whitespace-nowrap text-sm py-2 px-6 hover:bg-accent cursor-pointer"
                        >
                          退出登录
                        </p>
                      </NavigationMenuLink>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="flex justify-center">
                <TabsTrigger value="info">免责声明</TabsTrigger>
                <TabsTrigger value="douyin">抖音推流</TabsTrigger>
                <TabsTrigger value="tiktok">Tiktok推流</TabsTrigger>
                <TabsTrigger value="contact">联系我们</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <div className="ml-4 space-y-4 p-6 mt-10">
                  <p>关于［探行］的使用，本软件作者特此声明以下免责条款：</p>
                  <p>
                    合法使用：用户应确保在使用本软件时遵守所有适用的地方、国家和国际法律法规。用户不得将本软件用于任何非法、违法或不道德的目的。软件功能：本软件的主要功能是［获取直播推流码］。用户应明确，本软件不提供任何形式的非法、恶意或有害的功能。
                  </p>
                  <p>
                    风险自负：用户在使用本软件时应自行承担所有风险。软件作者不对因使用或误用本软件而造成的任何直接或间接损失承担责任。
                  </p>
                  <p>
                    数据安全和隐私：用户应确保在使用本软件时，严格遵守相关的数据保护和隐私法规。软件作者不对用户数据的丢失、泄露或被滥用承担任何责任。
                  </p>
                  <p>
                    第三方内容和服务：如果本软件提供了访问第三方内容或服务的功能，软件作者对第三方内容或服务的准确性、可靠性、安全性或合法性不提供在何形式的保证。
                  </p>
                  <p>
                    软件更新和变更：软件作者保留在不通知用户的情况下，对软件进行更新、修改或替换的权利。
                  </p>
                  <p>
                    病毒和恶意软件：虽然我们已经尽力确保软件的安全性，但软件作者不保证本软件不包含病毒或其他恶意软件。用户在使用前应确保自己的系统已安装有效的防病毒软件。
                  </p>
                  <p>
                    版权声明；本软件及其相关文档的所有权归软件作者所有，并受相关版权法保护。未经授权，禁止复制、分发、修改或以其他方式使用本软件的任何部分。
                  </p>
                  <p>
                    请用户仔细阅读并完全理解上述免责声明后，再决定是否下载、安装或使用本软件。若有任何疑问，请与软件作者联系以获得更多信息。使用本软件即表示您已接受上述免责声明。
                  </p>
                </div>
                <p className="mt-10 ml-10">
                  软件作者：［探行］ 日期：［2024.4.15］
                </p>
              </TabsContent>
              <TabsContent value="douyin">
                <Douyin></Douyin>
              </TabsContent>
              <TabsContent value="tiktok">
                <Tiktok></Tiktok>
              </TabsContent>
              <TabsContent value="contact">
                <div className="flex mt-24 justify-center h-full">
                  <div className="space-y-10">
                    <div className="flex items-center border p-6 relative">
                      <p className="absolute top-[-12px] bg-white px-4">
                        免费用户交流
                      </p>
                      <img src={MianFei} alt="" className="w-32 m-4" />
                      <div>
                        <p className="mb-6">试用用户交流</p>
                        <p className="mb-4">
                          针对于帮助我们宣传的用户，我们将赠送更多使用时长以及永久使用权限
                        </p>
                        <p className="mb-4">
                          QQ1群：暂无 QQ2群：暂无 QQ3群：暂无 QQ4群：暂无
                        </p>
                        <p>微信号：alangwei345（加后拉你进群）</p>
                      </div>
                    </div>
                    <div className="flex items-center border p-6 relative">
                      <p className="absolute top-[-12px] bg-white px-4">
                        付费用户沟通
                      </p>
                      <img src={FuFei} alt="" className="w-32 m-4" />
                      <div>
                        <p className="mb-6">付费客户售后</p>
                        <p className="mb-4">
                          购买软件的客户，我们将统一进行售后，保障客户使用。
                        </p>
                        <p>微信号：alangwei345</p>
                      </div>
                    </div>
                  </div>
                  <div className="border p-6 ml-10 relative">
                    <p className="absolute top-[-12px] bg-white px-4">
                      业务合作
                    </p>
                    <div className="flex flex-col items-center justify-center h-full">
                      <p>代理合作</p>
                      <p>etsowcom@gmail.com</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="absolute bottom-4 right-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="link">更新日志</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>更新日志</AlertDialogTitle>
                  <AlertDialogDescription>
                    <div>
                      <p>版本号 1.0.0 : </p>
                      <div className="ml-4">
                        <p>1、完成Tiktik登录</p>
                        <p>2、完成Tiktok获取推流码</p>
                        <p>3、完成下播功能</p>
                      </div>
                      <p className="mt-4">版本号 1.0.1 : </p>
                      <div className="ml-4">
                        <p>1、完成版本号限制</p>
                      </div>
                      <p className="mt-4">版本号 1.0.2 : </p>
                      <div className="ml-4">
                        <p>1、完成用户注册</p>
                        <p>2、完成抖音获取推流码</p>
                        <p>3、完成回填进入tiktok小店</p>
                      </div>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>确定</AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
