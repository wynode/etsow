import React, { useState, useEffect } from "react";
import Tiktok from "@/components/Tiktok";
import Douyin from "@/components/Douyin";
import Tools from "@/components/Tools";
import Info from "@/components/Info";
import ContactUs from "@/components/ContactUs";
import UpdateLog from "@/components/UpdateLog";
import Collection from "@/components/Collection";
import Game from "@/components/Game";
import Teach from "@/components/Teach";
import Logo from "@/assets/logo.png";
import Banner from "@/assets/bannernew.jpg";
// import Banner2 from "@/assets/banner2.png";
import Autoplay from "embla-carousel-autoplay";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Container: React.FC<ContainerProps> = ({ onLoginOut, userName }) => {
  const plugin = React.useRef(
    Autoplay({
      delay: 4000,
      stopOnFocusIn: false,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
    })
  );

  const [teachURL, setTeachURL] = useState("http://help.etsow.com/");
  const [tabsValue, setTabsValue] = useState("info");

  const handelBannerClick = () => {
    window.open("https://console.etsow.com/live_tools/obs_download");
  };
  const handelBanner2Click = () => {
    window.open("https://work.weixin.qq.com/ca/cawcde945a90447f0f");
  };

  const handleCheckTeachUrl = (url: string) => {
    setTeachURL(url);
    setTabsValue("teach");
  };

  return (
    <div>
      <div>
        <div className="flex justify-between items-center my-4 mx-10">
          {/* <Logo></Logo> */}
          <img className="w-20" src={Logo} alt="" />
          <div>
            <Carousel
              plugins={[plugin.current]}
              className="w-[1000px] relative"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
            >
              <CarouselContent>
                <CarouselItem>
                  <img
                    className="w-[1000px] cursor-pointer"
                    onClick={() => {
                      handelBannerClick();
                    }}
                    src={Banner}
                    alt=""
                  />
                </CarouselItem>
                {/* <CarouselItem>
                  <img
                    className="w-[1000px] cursor-pointer"
                    onClick={() => {
                      handelBanner2Click();
                    }}
                    src={Banner2}
                    alt=""
                  />
                </CarouselItem> */}
              </CarouselContent>
              {/* <CarouselPrevious className="w-3 h-3 absolute left-[490px] top-[78px]" /> */}
              {/* <CarouselNext className="w-3 h-3 absolute left-[506px] top-[78px]" /> */}
            </Carousel>
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
                      onClick={onLoginOut}
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
        <Tabs
          defaultValue="info"
          className="w-full"
          value={tabsValue}
          onValueChange={(value) => setTabsValue(value)}
        >
          <TabsList className="flex justify-center">
            <TabsTrigger value="info">数据统计</TabsTrigger>
            <TabsTrigger value="douyin">抖音直播</TabsTrigger>
            <TabsTrigger value="tiktok">Tiktok直播</TabsTrigger>

            <TabsTrigger value="collection">采集TikTok粉丝        <Badge
                className="px-2 py-0 pb-[1px] ml-1 mb-1 bg-gray-300"
                variant="outline"
              >
                beta
              </Badge></TabsTrigger>
            <TabsTrigger value="game">
              探行游戏
              <Badge
                className="px-2 py-0 pb-[1px] ml-1 mb-1"
                variant="destructive"
              >
                new
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="tools">伙伴专区</TabsTrigger>
            <TabsTrigger value="teach">教程中心</TabsTrigger>
            <TabsTrigger value="contact">联系我们</TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <Info></Info>
          </TabsContent>
          <TabsContent value="douyin">
            <Douyin onCheck={handleCheckTeachUrl}></Douyin>
          </TabsContent>
          <TabsContent value="tiktok">
            <Tiktok onCheck={handleCheckTeachUrl}></Tiktok>
          </TabsContent>
          <TabsContent value="collection">
            <Collection></Collection>
          </TabsContent>
          <TabsContent value="game">
            <Game></Game>
          </TabsContent>
          <TabsContent value="tools">
            <Tools></Tools>
          </TabsContent>
          <TabsContent value="teach">
            <Teach url={teachURL}></Teach>
          </TabsContent>
          <TabsContent value="contact">
            <ContactUs></ContactUs>
          </TabsContent>
        </Tabs>
      </div>

      <UpdateLog></UpdateLog>
    </div>
  );
};

export default Container;
