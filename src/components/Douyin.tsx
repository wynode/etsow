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
  getDouyinStreamCode,
  offlineDouyin,
  LoginDouyinTunnel,
  getDouyinTunnelList,
} from "@/api";

let selected: TableItem | null = null;

const TableComponent: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<TableItem | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [isFetch, setIsFetch] = useState(false);
  const [tuiliuma, setTuiliuma] = useState("");
  const { toast } = useToast();
  const [tunnelList, setTunnelList] = useState<TableItem[]>([]);
  const [open, setOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  const handleOpenLoginWindow = (item: TableItem) => {
    setSelectedItem(item);
    selected = item;
    window.ipcRenderer.send("open-douyin-window");
  };

  const handlePostTunnel = () => {
    window.ipcRenderer.send("open-douyin-window");
  };

  const handleOffline = (item: TableItem) => {
    selected = item;
    setSelectedItem(item);
  };

  const handleGetDouyinStreamCode = async () => {
    try {
      setFetchLoading(true);
      const data = await getDouyinStreamCode(
        selectedItem?.id || selected?.id || 1,
        { device_id: deviceId }
      );
      console.log("获取推流码结果:", data);
      setTuiliuma(data.rtmp_push_url);
      setOpen(false);
      fetchList();
      // 处理获取推流码的结果
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "获取推流码错误",
        description: JSON.stringify(error),
      });
      if (JSON.stringify(error).includes("重新登录")) {
        window.ipcRenderer.send("open-douyin-window");
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
        await offlineDouyin(selectedItem?.id || selected?.id || 1);
        fetchList();
        // 处理释放通道的结果
      } catch (error: any) {
        if (error?.msg?.includes("账号登录信息过期")) {
          toast({
            variant: "destructive",
            title: "释放通道出错",
            description: `${error.msg}。然后再进行释放通道操作`,
          });

          window.ipcRenderer.send("open-douyin-window");
        } else {
          toast({
            variant: "destructive",
            title: "释放通道出错",
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
      const res = await getDouyinTunnelList();
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

  const handleOpenShop = (item: TableItem) => {
    window.ipcRenderer.send("restore-douyin-window", item);
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

  useEffect(() => {
    window.ipcRenderer.on("douyin-cookie-post", async (event, douyinInfo) => {
      try {
        if (!douyinInfo.nickname || douyinInfo.nickname.includes("?lang=")) {
          throw new Error("未登录，请在弹出窗口中登录抖音");
        }
        console.log(selectedItem, selected);
        if (!isFetch && (selectedItem?.id || selected?.id)) {
          setFetchLoading(true);
          setIsFetch(true);
          await LoginDouyinTunnel(selectedItem?.id || selected?.id || 1, {
            nickname: douyinInfo.nickname,
            cookies: douyinInfo.cookies,
            all_cookies: douyinInfo.all_cookies,
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
      // window.ipcRenderer.removeAllListeners("douyin-cookies");
    };
  }, []);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>抖音昵称</TableHead>
            <TableHead>地区</TableHead>
            <TableHead>推流地址</TableHead>
            <TableHead>直播状态</TableHead>
            <TableHead>登录时间</TableHead>
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
                <TableCell>{index + 1}</TableCell>
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
                <TableCell>
                  <div className="w-[100px]">
                    <div>{item.start_time?.slice(0, 10)}</div>

                    {item.expire_time && <div className="ml-8">-</div>}
                    <div>{item.expire_time?.slice(0, 10)}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-4 items-center">
                    {item.rtmp_push_url ? (
                      ""
                    ) : (
                      <Button
                        onClick={() => handleOpenLoginWindow(item)}
                        disabled={fetchLoading}
                      >
                        {fetchLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {item.nickname ? "重新登录" : "登录抖音"}
                      </Button>
                    )}
                    {item.nickname && !item.rtmp_push_url ? (
                      <Dialog
                        open={open}
                        onOpenChange={(open) => {
                          setSelectedItem(item);
                          selected = item;
                          setOpen(open);
                          console.log(item);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline">获取推流码</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[460px]">
                          <DialogHeader>
                            <DialogTitle>获取推流码</DialogTitle>
                            <DialogDescription className="mt-4">
                              请填入您的设备ID
                              <div>
                                （打开抖音APP - 设置 - 滑动到最底部连续点击抖音
                                version字样 -
                                复制DeviceId（安卓）或DID（IOS）即为设备ID）
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="device_id" className="text-right">
                                设备Id：
                              </Label>
                              <Input
                                id="device_id"
                                onChange={(e) => {
                                  setDeviceId(e.target.value);
                                }}
                                className="col-span-3"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              disabled={fetchLoading}
                              onClick={() => handleGetDouyinStreamCode()}
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
                            释放通道
                          </Button>
                        ) : (
                          ""
                        )}
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认释放通道</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要释放通道{item.nickname}吗?
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

                    {/* {item.all_cookies ? (
                      <Button
                        onClick={() => handleOpenShop(item)}
                        disabled={fetchLoading}
                      >
                        {fetchLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        打开抖音
                      </Button>
                    ) : (
                      ""
                    )} */}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="flex justify-center mt-28 text-gray-500">
        {tunnelList.length ? (
          <div>抖音通道不够？联系管理员可开通更多通道哦～ </div>
        ) : (
          <div>您还没有开通抖音通道，请联系管理员开启～ </div>
        )}
      </div>
      <div className="flex justify-center mt-20">
        {tableLoading && <Loader2 className="h-20 w-20 animate-spin" />}
      </div>
    </div>
  );
};

export default TableComponent;
