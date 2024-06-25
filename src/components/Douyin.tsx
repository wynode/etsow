import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
  Box,
} from "@chakra-ui/react";
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
import { copyToClipboard } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNumbers,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const initialTableItem: TableItem = {
  agent_name: "",
  all_cookies: "",
  cookies: "",
  created_at: "",
  expire_time: "",
  id: 0,
  live_status: "",
  live_status_cn: "",
  location: "",
  location_selection: [],
  location_type: "",
  location_type_cn: "",
  nickname: "",
  rtmp_push_url: "",
  staff: 0,
  staff_name: "",
  start_time: "",
  status: "",
  status_cn: "",
  tunnel_type: "",
  remain_valid_days: "",
};

const steps = [
  {
    title: "扫描登录抖音",
    description: "点击登录按钮后扫描登录，等待几秒将自动关闭窗口并获取用户名",
  },
  {
    title: "手机打开直播",
    description: "手机打开并开始直播，可提前设置上线商品，或者后续在小店设置",
  },
  {
    title: "填写设备ID并获取推流码",
    description: "填写设备ID，设备ID在抖音设置最下方，注意要填写正确",
  },
  {
    title: "设置OBS并开播",
    description: "OBS进入设置->自播->自定义，填写对应的推流地址和推流码并开播",
  },
  {
    title: "直播手机被动断网",
    description: "请通过拔网线、关路由、断热点等方式被动让直播手机断网",
  },
];

const TableComponent: React.FC = () => {
  const { activeStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  const isDouyinCookiePostListenerSet = useRef(false);
  const selectedItemRef = useRef<{
    action: string;
    item: TableItem;
  }>({ action: "", item: initialTableItem });
  const [currentItem, setCurrentItem] = useState<TableItem>(initialTableItem);
  const [selectedItem, setSelectedItem] = useState<{
    action: string;
    item: TableItem;
  }>({ action: "", item: initialTableItem });
  const [fetchLoading, setFetchLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(0);
  const [open, setOpen] = useState(false);
  const [deviceId, setDeviceId] = useState("");
  const [tunnelList, setTunnelList] = useState<TableItem[]>([]);

  const { toast } = useToast();

  const fetchList = async (page: number, per_page: number) => {
    setTableLoading(true);
    try {
      const res = await getDouyinTunnelList(page, per_page);
      setTunnelList(res.results);
      setTotalPages(Math.ceil(res.count / per_page)); // 添加这一行
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

  const handleOpenLoginWindow = () => {
    window.ipcRenderer.send("open-douyin-window");
  };

  const handleGetStreamCode = async () => {
    try {
      console.log(selectedItem, selectedItemRef.current);
      setFetchLoading(true);

      await getDouyinStreamCode(selectedItemRef.current.item.id, {
        device_id: deviceId,
      });
      setOpen(false);
      fetchList(currentPage, perPage);
      // 处理获取推流码的结果
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "获取推流码结果",
        description: JSON.stringify(error),
      });
      if (JSON.stringify(error).includes("重新登录")) {
        window.ipcRenderer.send("open-douyin-window");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const handleConfirmOffline = async () => {
    try {
      setFetchLoading(true);
      await offlineDouyin(selectedItemRef.current.item.id);
      fetchList(currentPage, perPage);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "释放通道出错",
        description: JSON.stringify(error),
      });
      if (JSON.stringify(error).includes("重新登录")) {
        window.ipcRenderer.send("open-douyin-window");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const handleOpenShop = () => {
    window.ipcRenderer.send(
      "restore-douyin-window",
      selectedItemRef.current.item
    );
  };

  const handleDouyinCookiePost = async (
    event: any,
    douyinInfo: {
      cookies: string;
      all_cookies: string;
      nickname: string;
      location: string;
    }
  ) => {
    try {
      if (!douyinInfo.nickname) {
        throw new Error("未登录，请在弹出窗口中登录抖音");
      }
      if (selectedItemRef.current?.item?.id) {
        setFetchLoading(true);
        await LoginDouyinTunnel(selectedItemRef.current?.item?.id, {
          nickname: douyinInfo.nickname,
          cookies: douyinInfo.cookies,
          all_cookies: douyinInfo.all_cookies,
        });
        fetchList(currentPage, perPage);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "获取出错",
        description: JSON.stringify(error),
      });
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    selectedItemRef.current = selectedItem;
    console.log(selectedItem, selectedItemRef.current);
    if (selectedItem.action === "login") {
      handleOpenLoginWindow();
    } else if (selectedItem.action === "getStreamUrl") {
      handleGetStreamCode();
    } else if (selectedItem.action === "offline") {
      handleConfirmOffline();
    } else if (selectedItem.action === "openShop") {
      handleOpenShop();
    }
  }, [selectedItem]);

  useEffect(() => {
    window.ipcRenderer.on("douyin-cookie-post", handleDouyinCookiePost);
    return () => {
      window.ipcRenderer.off("douyin-cookie-post", handleDouyinCookiePost);
    };
  }, []);

  useEffect(() => {
    fetchList(currentPage, perPage);
  }, [currentPage, perPage]);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>抖音昵称</TableHead>
            {/* <TableHead>地区</TableHead> */}
            <TableHead>推流地址</TableHead>
            {/* <TableHead>直播状态</TableHead> */}
            <TableHead>登录时间</TableHead>
            <TableHead>通道期限</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tunnelList
            ?.filter((item) => {
              const remainingDays = item.expire_time
                ? Math.ceil(
                    (new Date(item.expire_time).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
                : 0;
              return remainingDays > 0;
            })
            ?.map((item, index) => {
              const rtmp1 = item?.rtmp_push_url?.split("/stream")[0];
              const rtmp2 = item?.rtmp_push_url?.split("/stage/")[1];
              return (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{item.nickname}</TableCell>
                  {/* <TableCell>{item.location}</TableCell> */}
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
                  {/* <TableCell>{item.live_status_cn}</TableCell> */}
                  <TableCell>{item.created_at}</TableCell>
                  <TableCell>
                    {/* <div className="w-[100px]">
                    <div>{item.start_time?.slice(0, 10)}</div>

                    {item.expire_time && <div className="ml-8">-</div>}
                    <div>{item.expire_time?.slice(0, 10)}</div>
                  </div> */}
                    <div>
                      {item.expire_time
                        ? Math.ceil(
                            (new Date(item.expire_time).getTime() -
                              new Date().getTime()) /
                              (1000 * 60 * 60 * 24)
                          )
                        : 0}
                      天
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-4 items-center">
                      {item.rtmp_push_url ? (
                        ""
                      ) : (
                        <Button
                          onClick={() =>
                            setSelectedItem({
                              action: "login",
                              item,
                            })
                          }
                          disabled={fetchLoading}
                        >
                          {fetchLoading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          {item.nickname ? "重新登录" : "登录抖音"}
                        </Button>
                      )}

                      <Dialog
                        open={open}
                        onOpenChange={(open) => {
                          setOpen(open);
                        }}
                      >
                        <DialogTrigger asChild>
                          {item.nickname && !item.rtmp_push_url ? (
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCurrentItem(item);
                              }}
                            >
                              获取推流码
                            </Button>
                          ) : (
                            ""
                          )}
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
                              onClick={() =>
                                setSelectedItem({
                                  action: "getStreamUrl",
                                  item: currentItem,
                                })
                              }
                            >
                              {fetchLoading && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              确定
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          {item.rtmp_push_url ? (
                            <Button
                              onClick={() => {
                                setCurrentItem(item);
                              }}
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
                            <AlertDialogAction
                              onClick={() => {
                                setSelectedItem({
                                  action: "offline",
                                  item: currentItem,
                                });
                              }}
                            >
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
      {tunnelList.length && (
        <Pagination className="mt-10">
          <PaginationContent>
            <PaginationPrevious
              onClick={() => {
                if (currentPage > 1) {
                  setCurrentPage(currentPage - 1);
                  // fetchList(currentPage - 1, perPage);
                }
              }}
              isActive={currentPage !== 1}
            />
            <PaginationNumbers
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                // fetchList(page, perPage);
              }}
            />
            <PaginationNext
              onClick={() => {
                if (currentPage < totalPages) {
                  setCurrentPage(currentPage + 1);
                  // fetchList(currentPage + 1, perPage);
                }
              }}
              isActive={currentPage !== totalPages}
            />
          </PaginationContent>
        </Pagination>
      )}

      <div className="flex justify-center mt-10 text-gray-500">
        {tunnelList.length ? (
          <div>抖音通道不够？联系管理员可开通更多通道哦～ </div>
        ) : (
          <div>您还没有开通抖音通道，请联系管理员开启～ </div>
        )}
      </div>

      {tableLoading && (
        <div className="flex justify-center mt-20">
          <Loader2 className="h-20 w-20 animate-spin" />
        </div>
      )}

      {!tableLoading && (
        <Stepper index={activeStep} className="p-10">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator className="text-primary !border-primary">
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{step.title}</StepTitle>
                <StepDescription className="w-[180px]">
                  {step.description}
                </StepDescription>
              </Box>

              <StepSeparator />
            </Step>
          ))}
        </Stepper>
      )}
    </div>
  );
};

export default TableComponent;
