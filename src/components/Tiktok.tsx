import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  getStreamCode,
  offlineUser,
  LoginTunnel,
  patchCookie,
  getTunnelList,
} from "@/api";

let selected: TableItem | null = null;

const TableComponent: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<TableItem | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [isFetch, setIsFetch] = useState(false);
  const [tuiliuma, setTuiliuma] = useState("");
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("us");
  const { toast } = useToast();
  const [tunnelList, setTunnelList] = useState<TableItem[]>([]);

  const handleOpenLoginWindow = (item: TableItem) => {
    console.log(item);
    setSelectedItem(item);
    selected = item;
    setTimeout(() => {
      window.ipcRenderer.send("open-login-window");
    }, 1000);
  };

  const handlePostTunnel = () => {
    window.ipcRenderer.send("open-login-window");
  };

  const handleOffline = (item: TableItem) => {
    selected = item;
    setSelectedItem(item);
  };

  const handleGetStreamCode = async (item: TableItem) => {
    try {
      setFetchLoading(true);
      await LoginTunnel(item.id || 1, {
        location: location,
      });
      const data = await getStreamCode(item.id);
      setTuiliuma(data.rtmp_push_url);
      setOpen(false);
      fetchList();
      // 处理获取推流码的结果
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "获取推流码结果",
        description: JSON.stringify(error),
      });
      if (JSON.stringify(error).includes("重新登录")) {
        window.ipcRenderer.send("open-login-window");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const confirmOffline = async () => {
    console.log(selected, selectedItem);
    if (selectedItem || selected) {
      try {
        setFetchLoading(true);
        await offlineUser(selectedItem?.id || selected?.id || 1);
        fetchList();
        // 处理下播的结果
      } catch (error: any) {
        if (error?.msg?.includes("账号登录信息过期")) {
          toast({
            variant: "destructive",
            title: "下播出错",
            description: `${error.msg}。然后再进行下播操作`,
          });

          window.ipcRenderer.send("open-login-window");
        } else {
          toast({
            variant: "destructive",
            title: "下播出错",
            description: error.message,
          });
        }
      } finally {
        setFetchLoading(false);
        setSelectedItem(null);
      }
    }
  };

  const fetchList = async () => {
    setTableLoading(true);
    try {
      const res = await getTunnelList();
      setTunnelList(res.results);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "获取出错",
        description: error.msg || "版本号不匹配，请在官网下载新版",
      });
    } finally {
      setTableLoading(false);
    }
  };

  const copyToClipboard = async (val: string) => {
    if (typeof val !== "string") {
      console.error("Invalid input: Input must be a string.");
      return;
    }

    try {
      await navigator.clipboard.writeText(val);
      toast({
        title: "复制成功",
      });
    } catch (error) {
      try {
        const textArea = document.createElement("textarea");
        textArea.value = val;
        Object.assign(textArea.style, {
          width: "0px",
          position: "fixed",
          left: "-9999px",
          top: "10px",
          opacity: "0",
          pointerEvents: "none",
          readonly: "readonly",
        });
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast({
          title: "复制成功",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "复制失败",
        });
      }
    }
  };

  const handleOpenShop = (item: TableItem) => {
    window.ipcRenderer.send("restore-tiktok-window", item);
  };

  useEffect(() => {
    window.ipcRenderer.on("cookie-post", async (event, tiktokInfo) => {
      try {
        if (!tiktokInfo.nickname || tiktokInfo.nickname.includes("?lang=")) {
          throw new Error("未登录，请在弹出窗口中登录Tiktok");
        }
        console.log(selectedItem, selected);
        if (!isFetch && (selectedItem?.id || selected?.id)) {
          setFetchLoading(true);
          setIsFetch(true);
          await LoginTunnel(selectedItem?.id || selected?.id || 1, {
            nickname: tiktokInfo.nickname,
            cookies: tiktokInfo.cookies,
            all_cookies: tiktokInfo.all_cookies,
            location: tiktokInfo.location,
          });
          fetchList();
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "获取出错",
          description: error?.non_field_errors || error.message || "请重试",
        });
      } finally {
        setIsFetch(false);
        setFetchLoading(false);
      }
    });
    fetchList();
    return () => {
      // 在组件卸载时移除监听器
      // window.ipcRenderer.removeAllListeners("tiktok-cookies");
    };
  }, []);

  return (
    <div>
      {/* <Button onClick={() => handlePostTunnel()} className="mb-4">
        登录TikTok并建立通道
      </Button> */}
      <Table>
        <TableHeader>
          <TableRow>
            {/* <TableHead>ID</TableHead> */}
            <TableHead>TikTok昵称</TableHead>
            <TableHead>地区</TableHead>
            <TableHead>推流地址</TableHead>
            <TableHead>直播状态</TableHead>
            <TableHead>登录时间</TableHead>

            {/* <TableHead>通道状态</TableHead> */}
            <TableHead>通道期限</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tunnelList?.map((item, index) => {
            const rtmp1 = item?.rtmp_push_url?.split("/stream")[0];
            const rtmp2 = item?.rtmp_push_url?.split("/stage/")[1];
            return (
              <TableRow key={item.id}>
                <TableCell>{item.nickname}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <div className="space-y-4 w-[480px]">
                    <p>
                      推流地址：{rtmp1}
                      {rtmp1 && (
                        <Button
                          size="sm"
                          className="ml-4"
                          onClick={() => copyToClipboard(rtmp1)}
                        >
                          复制
                        </Button>
                      )}
                    </p>
                    <p className="break-words">
                      推流密钥：
                      <span className="break-all">{rtmp2}</span>
                      {rtmp2 && (
                        <Button
                          size="sm"
                          className="ml-4"
                          onClick={() => copyToClipboard(rtmp2)}
                        >
                          复制
                        </Button>
                      )}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{item.live_status_cn}</TableCell>
                <TableCell>{item.created_at}</TableCell>
                {/* <TableCell>{item.status_cn}</TableCell> */}
                <TableCell>
                  <div className="w-[100px]">
                    <div>{item.start_time?.slice(0, 10)}</div>

                    {item.expire_time && <div className="ml-8">-</div>}
                    <div>{item.expire_time?.slice(0, 10)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-4 items-center">
                    {item.nickname ? (
                      ""
                    ) : (
                      <Button
                        onClick={() => handleOpenLoginWindow(item)}
                        disabled={fetchLoading}
                      >
                        {fetchLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        登录TikTok
                      </Button>
                    )}
                    {item.nickname && !item.rtmp_push_url ? (
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">获取推流码</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[460px]">
                          <DialogHeader>
                            <DialogTitle>获取推流码</DialogTitle>
                            <DialogDescription className="mt-4">
                              请选择您账号的所在地区
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="device_id" className="text-right">
                                地区：
                              </Label>
                              <Select
                                defaultValue="us"
                                onValueChange={(value) => {
                                  setLocation(value);
                                }}
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="选择地区" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectItem value="us">美国</SelectItem>
                                    <SelectItem value="other">
                                      其他地区
                                    </SelectItem>
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              disabled={fetchLoading}
                              onClick={() => handleGetStreamCode(item)}
                            >
                              {fetchLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              确定
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      ""
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        {item.rtmp_push_url ? (
                          <Button
                            onClick={() => handleOffline(item)}
                            disabled={fetchLoading}
                          >
                            {fetchLoading && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            下播
                          </Button>
                        ) : (
                          ""
                        )}
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认下播</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要下播{item.nickname}吗?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmOffline}>
                            确认
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {item.all_cookies ? (
                      <Button
                        onClick={() => handleOpenShop(item)}
                        disabled={fetchLoading}
                      >
                        {fetchLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        打开小店
                      </Button>
                    ) : (
                      ""
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex justify-center mt-20">
        {tableLoading && <Loader2 className="h-20 w-20 animate-spin" />}
      </div>
    </div>
  );
};

export default TableComponent;
