import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Divide, Loader2 } from "lucide-react";
import { downloadUrl } from "@/config";
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

import { copyToClipboard } from "@/lib/utils"; // 导入工具函数

let selected: TableItem | null = null;

const TableComponent: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<TableItem | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [isFetch, setIsFetch] = useState(false);
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
    }, 100);
  };

  const handlePostTunnel = () => {
    window.ipcRenderer.send("open-login-window");
  };

  const handleOffline = (item: TableItem) => {
    selected = item;
    setSelectedItem(item);
  };

  const handleGetStreamCode = async () => {
    try {
      setFetchLoading(true);
      await LoginTunnel(selectedItem?.id || selected?.id || 1, {
        location: location,
      });
      const data = await getStreamCode(selectedItem?.id || selected?.id || 1);
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
        // 处理释放通道的结果
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "释放通道出错",
          description: JSON.stringify(error),
        });
        if (JSON.stringify(error).includes("重新登录")) {
          window.ipcRenderer.send("open-login-window");
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
      const errorMsg = JSON.stringify(error);
      if (errorMsg.includes("请下载最新的版本")) {
        window.open(downloadUrl);
      }
      toast({
        variant: "destructive",
        title: "获取出错",
        description: JSON.stringify(error),
      });
    } finally {
      setTableLoading(false);
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
          description:
            error?.non_field_errors || error.message || JSON.stringify(error),
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
            <TableHead>ID</TableHead>
            <TableHead>TikTok昵称</TableHead>
            <TableHead>地区</TableHead>
            <TableHead>推流地址</TableHead>
            <TableHead>版本</TableHead>
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
                          onClick={() => copyToClipboard(rtmp1, toast)}
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
                          onClick={() => copyToClipboard(rtmp2, toast)}
                        >
                          复制
                        </Button>
                      )}
                    </p>
                  </div>
                </TableCell>
                <TableCell>{item.location_type_cn}</TableCell>
                <TableCell>{item.created_at}</TableCell>
                {/* <TableCell>{item.status_cn}</TableCell> */}
                <TableCell>
                  {/* <div className="w-[100px]">
                    <div>{item.start_time?.slice(0, 10)}</div>

                    {item.expire_time && <div className="ml-8">-</div>}
                    <div>{item.expire_time?.slice(0, 10)}</div>
                  </div> */}
                  <div>{item.remain_valid_days}</div>
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
                        {item.nickname ? "重新登录" : "登录TikTok"}
                      </Button>
                    )}
                    {item.nickname && !item.rtmp_push_url ? (
                      <Dialog
                        open={open}
                        onOpenChange={(open) => {
                          setSelectedItem(item);
                          selected = item;
                          console.log(item);
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
                              onClick={() => handleGetStreamCode()}
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
      <div className="flex justify-center mt-28 text-gray-500">
        {tunnelList.length ? (
          <div>TikTok通道不够？联系管理员可开通更多通道哦～ </div>
        ) : (
          <div>您还没有开通TikTok通道，请联系管理员开启～ </div>
        )}
      </div>
      <div className="flex justify-center mt-20">
        {tableLoading && <Loader2 className="h-20 w-20 animate-spin" />}
      </div>
    </div>
  );
};

export default TableComponent;
