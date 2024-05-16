import React, { useState, useEffect } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import qrcodeV from "@/assets/qrcodeV.png";
import qrcodeE from "@/assets/qrcodeE.jpg";
import { Button } from "@/components/ui/button";

const ListItem: React.FC<{
  metaInfo: {
    title: string;
    description: string;
    isRecommend: Boolean;
    outerDescript: string;
    openUrl?: string;
    qrCode?: string;
  };
}> = ({ metaInfo }) => {
  const { title, description, isRecommend, outerDescript, openUrl, qrCode } =
    metaInfo;
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger>
          <div
            className="border rounded-md w-80 px-4 py-2 text-left transition duration-300 ease-in-out transform hover:-translate-y-1"
            onClick={() => {
              if (openUrl) {
                window.open(openUrl);
              }
            }}
          >
            <div className="flex justify-between items-center">
              <h1 className="text-base">{title}</h1>
              {
                <Button size="sm" className="text-xs px-2 h-4 bg-blue-500">
                  AD
                </Button>
              }
            </div>
            <p className="text-xs text-col text-gray-500 mt-2 min-h-[32px]">
              {description}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {/* <TooltipArrow></TooltipArrow> */}
          <p className="w-80">
            {outerDescript}
            {qrCode && <img className="w-40 ml-20" src={qrCode} alt="" />}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const LoginPage: React.FC = () => {
  return (
    <div className="mt-2 p-4">
      {/* <div className="grid grid-cols-2 text-center text-gray-500 mb-2">
        <h1>部分内容需要跨境访问</h1>
        <h1>非自有业务 注意识别风险</h1>
      </div> */}
      <div className="grid grid-cols-2">
        <div>
          <h1 className="font-bold mb-2 text-xl">优质工具</h1>
          <div className="space-x-4">
            <ListItem
              metaInfo={{
                title: "IP 检测",
                isRecommend: true,
                openUrl: "https://ipjiance.com/",
                description:
                  "为做外贸电商，海外社交流量用户提供方便的IP 检测工具，防止使用黑名单节点",
                outerDescript:
                  "我们搜集大量ip数据，以及针对Tiktok，FB，油管等平台实际大量测试。为做跨境电商，社交流量用户提供IP检测工具，当时自己做TK电商时候，发现IP是流量影响因素之一。恰好自己曾经开发过平台反作弊检测系统，开发这个IP检测方便自己人使用",
              }}
            ></ListItem>
            <ListItem
              metaInfo={{
                title: "PRISM",
                isRecommend: false,
                openUrl: "https://prismlive.com",
                description:
                  "一款基于 OBS 而开发的全新直播工具，不仅继承了OBS 的所有功能，还有许多独有的能力",
                outerDescript:
                  "Prism Live是一款直播软件，用于实时录制和直播视频内容。我们无意中在网上看到这款软件，并实际使用以后，发现功能还是非常强大，所以业务的帮助宣传宣传，实际使用还是看各位自己的体验",
              }}
            ></ListItem>
          </div>
        </div>

        <div>
          <h1 className="font-bold mb-2 text-xl">货盘商</h1>
          <ListItem
            metaInfo={{
              title: "暂无服务商",
              isRecommend: false,
              description: "合作请与管理员联系",
              outerDescript:
                "我们针对于合作伙伴以及优质客户提供了伙伴业务推荐功能，有相关业务的朋友可以与我们联系",
            }}
          ></ListItem>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-6">
        <div>
          <h1 className="font-bold mb-2 text-xl mt-4">帐号商</h1>
          <ListItem
            metaInfo={{
              title: "暂无服务商",
              isRecommend: false,
              description: "合作请与管理员联系",
              outerDescript:
                "我们针对于合作伙伴以及优质客户提供了伙伴业务推荐功能，有相关业务的朋友可以与我们联系",
            }}
          ></ListItem>
        </div>
        <div>
          <h1 className="font-bold mb-2 text-xl mt-4">跨境线路</h1>

          <ListItem
            metaInfo={{
              title: "视界云专线",
              isRecommend: false,
              description:
                "服务覆盖超过50个国家和地区，像本土用户一样，快、稳、准！价格1000+，适用于真人直播及视频发布",
              outerDescript:
                "为全球TikTok等跨境直播提供无缝的网络方案。我们的服务覆盖超过50个国家和地区，配置专线级网络和高质量原生独享IP，确保直播的稳定性、速度和精确性。无论您在户外还是室内，无论是国内团队出海还是海外团队进行跨境直播，我们都能满足您一键开播的需求，让您享受流畅的直播体验。",
              qrCode: qrcodeV,
            }}
          ></ListItem>
        </div>
      </div>
      <div className="grid grid-cols-2 mt-6">
        <div>
          <h1 className="font-bold mb-2 text-xl mt-4">资料商</h1>

          <ListItem
            metaInfo={{
              title: "暂无服务商",
              isRecommend: false,
              description: "合作请与管理员联系",
              outerDescript:
                "我们针对于合作伙伴以及优质客户提供了伙伴业务推荐功能，有相关业务的朋友可以与我们联系",
            }}
          ></ListItem>
        </div>
        <div>
          <h1 className="font-bold mb-2 text-xl mt-6">其他</h1>
          <ListItem
            metaInfo={{
              title: "hushbeey网络科技",
              isRecommend: false,
              description: "跨境直播实盘打品，跨境咨询（长期寻找英美货盘）",
              outerDescript:
                "成都hushbeey长期深耕tiktok跨境直播,拥有无人，半无，真人各项成熟直播技术。熟悉平台风控规则及各类运营细节，曾创下单日销售3万美刀的好成绩。现由于业务增长需要，长期寻求建联全球各国货盘及生态服务资源，致力于打造西南第一跨境直播新势力。",
              qrCode: qrcodeE,
            }}
          ></ListItem>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
