import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FollowerData {
  username: string;
  followers: string[];
}

const CollectionPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [hours, setHours] = useState(24);
  const [thread, setThread] = useState(10);
  const [removeDuplicates, setRemoveDuplicates] = useState("true");
  const [network, setNetwork] = useState("local");
  const { toast } = useToast();
  const [followerData, setFollowerData] = useState<FollowerData[]>([]);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  // const [fileContent, setFileContent] = useState<string | null>(null);
  const fileContentRef = useRef<string | null>(null);

  const eventListenerRegistered = useRef(false);

  const handleStart = async () => {
    if (file) {
      const content = await file.text();
      fileContentRef.current = content;
      setFile(null);
      window.ipcRenderer.send("open-tiktok-collection-window");
      // window.ipcRenderer.invoke("scrape-followers", fileContentRef.current);
      setIsOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "请选择文件",
      });
    }
  };

  const handleStop = () => {
    window.ipcRenderer.send("stop-scraping");
    setIsScraping(false);
  };

  const handleExport = async (username: string) => {
    const selectedFollowerData = followerData.find(
      (data) => data.username === username
    );
    if (selectedFollowerData) {
      await window.ipcRenderer.send(
        "export-data",
        selectedFollowerData.username,
        selectedFollowerData.followers
      );
      // toast({
      //   title: "导出结果",
      //   description: `导出成功`,
      // });
    }
  };

  const handleExportAll = async () => {
    const allFollowers = followerData.flatMap((data) => data.followers);
    await window.ipcRenderer.send("export-data", "全部", allFollowers);
    // toast({
    //   title: "导出结果",
    //   description: `导出成功`,
    // });
  };

  const handleScrapedFollowers = (
    _event: any,
    scrapedFollowers: FollowerData[]
  ) => {
    // console.log(scrapedFollowers);
    setFetchLoading(true);
    setIsScraping(true);
    setFollowerData(scrapedFollowers);
  };

  const handleGetAppPath = (_event: any, scrapedFollowers: FollowerData[]) => {
    console.log(scrapedFollowers);
  };

  useEffect(() => {
    window.ipcRenderer.on("scraped-followers", handleScrapedFollowers);
    window.ipcRenderer.on("getAppPath", handleGetAppPath);
    // 监听 "export-complete" 消息
    const handleExportComplete = () => {
      toast({
        title: "导出结果",
        description: `导出成功，请到选择导出的文件夹中查看`,
      });
    };

    window.ipcRenderer.on("export-complete", handleExportComplete);
    return () => {
      window.ipcRenderer.off("scraped-followers", handleScrapedFollowers);
      window.ipcRenderer.off("getAppPath", handleGetAppPath);

      window.ipcRenderer.off("export-complete", handleExportComplete);
    };
  }, []);

  const handleCollectionCookiePost = async (
    event: any,
    tiktokInfo: {
      cookies: string;
      all_cookies: string;
      nickname: string;
      location: string;
    }
  ) => {
    if (tiktokInfo.all_cookies) {
      setFetchLoading(true);
      console.log(file);
      console.log(fileContentRef.current);
      setIsScraping(true);
      window.ipcRenderer
        .invoke(
          "scrape-followers",
          fileContentRef.current,
          tiktokInfo.all_cookies
        )
        .then(() => {})
        .catch((error: any) => {
          console.error(error);
          toast({
            variant: "destructive",
            title: "收集出错",
            description: JSON.stringify(error),
          });
        })
        .finally(() => {
          setFetchLoading(false);
          setIsScraping(false);
        });
    } else {
      toast({
        variant: "destructive",
        title: "收集出错",
        description: "登录出错",
      });
    }
  };

  useEffect(() => {
    if (!eventListenerRegistered.current) {
      console.log("on");
      window.ipcRenderer.on(
        "collection-tiktok-cookie-post",
        handleCollectionCookiePost
      );
      console.log(window);
      eventListenerRegistered.current = true;
    }

    return () => {
      console.log("off");
      window.ipcRenderer.off(
        "collection-tiktok-cookie-post",
        handleCollectionCookiePost
      );
      eventListenerRegistered.current = false;
    };
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between mb-4">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div className="flex text-sm items-end">
              <Button disabled={fetchLoading}>
                {fetchLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                开始采集
              </Button>
              <p className="ml-4">剩余: 1231231232条 </p>
              <p className="ml-4">采集额度 (有效期:365天)</p>
            </div>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>采集设置</DialogTitle>
              <DialogDescription>请填写以下信息以开始采集。</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file">导入被采集者</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="hours">几小时内数据</Label>
                <Input
                  id="hours"
                  type="number"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="thread">线程数量</Label>
                <Input
                  id="thread"
                  type="number"
                  value={thread}
                  onChange={(e) => setThread(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="remove-duplicates">去除重复</Label>
                <RadioGroup
                  id="remove-duplicates"
                  value={removeDuplicates}
                  onValueChange={setRemoveDuplicates}
                  className="col-span-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="remove-duplicates-true" />
                    <Label htmlFor="remove-duplicates-true">去除重复</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="network">线路设置</Label>
                <Select value={network} onValueChange={setNetwork}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="请选择线路" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">本机网络</SelectItem>
                    <SelectItem value="remote">远程网络</SelectItem>
                    <SelectItem value="cloud">云端网络</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <div>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  取消
                </Button>
                <Button className="ml-6" onClick={handleStart}>
                  登录账号并自动开始采集
                </Button>

                {/* <div className="text-sm text-gray-400 text-right">
                  登录完成后会自动开始进行采集
                </div> */}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isScraping ? <Button onClick={handleStop}>停止收集</Button> : ""}
        {followerData.length ? (
          <Button disabled={fetchLoading} onClick={handleExportAll}>
            {fetchLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            导出所有已采集粉丝
          </Button>
        ) : (
          ""
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>采集账号名</TableHead>
            <TableHead>已采集粉丝数</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {followerData.map((data) => (
            <TableRow key={data.username}>
              <TableCell>{data.username}</TableCell>
              <TableCell>
                {Array.isArray(data.followers) ? data?.followers?.length : 0}
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => handleExport(data.username)}
                  disabled={fetchLoading}
                >
                  导出
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 text-sm">
        <div className="flex">
          {followerData.length ? (
            <p>
              本次采集数量:{" "}
              {followerData.reduce(
                (acc, cur) => acc + Number(cur.followers.length),
                0
              )}
            </p>
          ) : (
            ""
          )}
          {/* <p className="ml-4">采集总数:123123123</p> */}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
