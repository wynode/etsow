import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Divide, Loader2, CircleHelp } from "lucide-react";
import { downloadUrl } from "@/config";
import { useToast } from "@/components/ui/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getStreamCode,
  getStreamCodeVirtual,
  offlineUser,
  tiktokOfflineUser,
  LoginTunnel,
  patchCookie,
  getTunnelList,
} from "@/api";

import { copyToClipboard } from "@/lib/utils"; // 导入工具函数

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
  tunnel_perms: [""],
};

const steps = [
  {
    title: "扫描登录tiktok",
    description: "点击登录按钮后扫描登录，等待几秒将自动关闭窗口并获取用户名",
  },
  {
    title: "打开直播",
    description:
      "点击获取推流码，如果是手机和电脑方式需要提前开播，设置上线商品或后续在小店设置",
  },
  { title: "获取推流码", description: "选择对应的区域并点击获取推流码" },
  {
    title: "设置OBS并开播",
    description: "请使用我们提供的定制版OBS，软件上方Banner处可直接下载",
  },
  {
    title: "直播手机被动断网",
    description: "请通过拔网线、关路由、断热点等方式被动让直播手机断网",
  },
];

interface ContainerProps {
  onCheck: (url: string) => void;
}

const TableComponent: React.FC<ContainerProps> = ({ onCheck }) => {
  const { activeStep } = useSteps({
    index: 0,
    count: steps.length,
  });
  const isTiktokCookiePostListenerSet = useRef(false);
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
  const [location, setLocation] = useState("us");
  const [tunnelList, setTunnelList] = useState<TableItem[]>([]);
  const [rType, setRType] = useState("phone");

  const { toast } = useToast();

  const fetchList = async (page: number, per_page: number) => {
    setTableLoading(true);
    try {
      const res = await getTunnelList(page, per_page);
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

  const handleTitleClick = (title: string) => {
    if (title.includes("设置OBS并开播")) {
      // window.open(
      //   "http://help.etsow.com/tiktokzhibohouOBStishiwufalianjiefuwuqiruhejiejue%EF%BC%9F.html"
      // );
      onCheck(
        "http://help.etsow.com/tiktokzhibohouOBStishiwufalianjiefuwuqiruhejiejue%EF%BC%9F.html"
      );
    } else if (title.includes("断网")) {
      onCheck("http://help.etsow.com/OBStishiyizhizhonglian.html");
      // window.open("http://help.etsow.com/OBStishiyizhizhonglian.html");
    }
    console.log(title);
  };

  const handleOpenLoginWindow = () => {
    window.ipcRenderer.send("open-tiktok-window");
  };

  const handleGetStreamCode = async () => {
    try {
      console.log(selectedItem, selectedItemRef.current);
      setFetchLoading(true);
      await LoginTunnel(selectedItemRef.current.item.id, {
        location: location,
      });
      await getStreamCode(selectedItemRef.current.item.id);
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
        window.ipcRenderer.send("open-tiktok-window");
      }
    } finally {
      setFetchLoading(false);
    }
  };
  const handleGetStreamCodeVirtual = async () => {
    try {
      console.log(selectedItem, selectedItemRef.current);
      setFetchLoading(true);
      await LoginTunnel(selectedItemRef.current.item.id, {
        location: location,
      });
      await getStreamCodeVirtual(selectedItemRef.current.item.id);
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
        window.ipcRenderer.send("open-tiktok-window");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const handleConfirmOffline = async () => {
    try {
      setFetchLoading(true);
      await offlineUser(selectedItemRef.current.item.id);
      fetchList(currentPage, perPage);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "释放通道出错",
        description: JSON.stringify(error),
      });
      if (JSON.stringify(error).includes("重新登录")) {
        window.ipcRenderer.send("open-tiktok-window");
      }
    } finally {
      setFetchLoading(false);
    }
  };

  const handleConfirmAutoOffline = async () => {
    try {
      setFetchLoading(true);
      await tiktokOfflineUser(selectedItemRef.current.item.id);
      fetchList(currentPage, perPage);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "自动释放通道出错",
        description: JSON.stringify(error),
      });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleOpenShop = () => {
    window.ipcRenderer.send(
      "restore-tiktok-window",
      selectedItemRef.current.item
    );
  };

  const handleTiktokCookiePost = async (
    event: any,
    tiktokInfo: {
      cookies: string;
      all_cookies: string;
      nickname: string;
      location: string;
    }
  ) => {
    try {
      if (!tiktokInfo.nickname) {
        throw new Error("未登录，请在弹出窗口中登录Tiktok");
      }
      if (selectedItemRef.current?.item?.id) {
        setFetchLoading(true);
        await LoginTunnel(selectedItemRef.current?.item?.id, {
          nickname: tiktokInfo.nickname,
          cookies: tiktokInfo.cookies,
          all_cookies: tiktokInfo.all_cookies,
          location: tiktokInfo.location,
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
    if (selectedItem.action === "login") {
      handleOpenLoginWindow();
    } else if (selectedItem.action === "getStreamUrl") {
      if (rType === "virtual") {
        handleGetStreamCodeVirtual();
      } else {
        handleGetStreamCode();
      }
    } else if (selectedItem.action === "handle-offline") {
      handleConfirmOffline();
    } else if (selectedItem.action === "auto-offline") {
      handleConfirmAutoOffline();
    } else if (selectedItem.action === "openShop") {
      handleOpenShop();
    }
  }, [selectedItem]);

  useEffect(() => {
    if (!selectedItemRef.current.action) {
      window.ipcRenderer.on("tiktok-cookie-post", handleTiktokCookiePost);
    }
    return () => {
      if (selectedItemRef.current.action) {
        window.ipcRenderer.off("tiktok-cookie-post", handleTiktokCookiePost);
      }
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
            <TableHead>TikTok昵称</TableHead>
            <TableHead>地区</TableHead>
            <TableHead>推流地址</TableHead>
            <TableHead>版本</TableHead>
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
                <TableCell>{item.id}</TableCell>
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
                <TableCell className="w-[100px]">
                  {item.location_type_cn}
                </TableCell>
                <TableCell>{item.created_at}</TableCell>
                <TableCell>
                  <div>{item.remain_valid_days}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-4 items-center">
                    {item.rtmp_push_url ? (
                      ""
                    ) : (
                      <Button
                        variant="outline"
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
                        {item.nickname ? "重新登录" : "登录TikTok"}
                      </Button>
                    )}

                    <Dialog
                      open={open}
                      onOpenChange={(open) => {
                        setRType("phone");
                        setOpen(open);
                      }}
                    >
                      <DialogTrigger asChild>
                        {item.nickname && !item.rtmp_push_url ? (
                          <Button
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
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>获取推流码</DialogTitle>
                          <DialogDescription className="mt-4">
                            请选择您账号的所在地区
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 ml-6">
                          <div className="flex items-center gap-4 mb-4">
                            <Label htmlFor="remove-duplicates">
                              获取方式：
                            </Label>
                            <RadioGroup
                              id="remove-duplicates"
                              value={rType}
                              defaultValue="phone"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="phone"
                                  id="phone"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setRType("phone");
                                  }}
                                />
                                <Label className="flex items-center">
                                  手机获取
                                  <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                      <TooltipTrigger asChild>
                                        <CircleHelp className="w-4 ml-1 mr-2"></CircleHelp>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          获取手机开播的推流码（先开播再获取）
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </Label>

                                <RadioGroupItem
                                  value="computer"
                                  id="computer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setRType("computer");
                                  }}
                                />
                                <Label className="flex items-center">
                                  电脑获取
                                  <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                      <TooltipTrigger asChild>
                                        <CircleHelp className="w-4 ml-1 mr-2"></CircleHelp>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          获取电脑开播的推流码（先开播再获取）
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </Label>
                                <RadioGroupItem
                                  disabled={
                                    !currentItem?.tunnel_perms?.includes(
                                      "virtual_brodcast"
                                    )
                                  }
                                  value="virtual"
                                  id="virtual"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setRType("virtual");
                                  }}
                                />
                                <Label className="flex items-center">
                                  无设备获取
                                  <TooltipProvider>
                                    <Tooltip delayDuration={100}>
                                      <TooltipTrigger asChild>
                                        <CircleHelp className="w-4 ml-1 mr-2"></CircleHelp>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>
                                          由探行模拟设备并获取推流码（无需要手动开播）
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <div className="ml-6 flex items-center gap-4">
                            <Label htmlFor="device_id" className="text-right">
                              地区：
                            </Label>
                            <Select
                              defaultValue="us"
                              onValueChange={(value) => {
                                setLocation(value);
                              }}
                            >
                              <SelectTrigger className="w-[280px]">
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
                            type="button"
                            disabled={fetchLoading}
                            onClick={(e) => {
                              setSelectedItem({
                                action: "getStreamUrl",
                                item: currentItem,
                              });
                            }}
                          >
                            {fetchLoading && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            确定
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {item.rtmp_push_url && (
                      // <Button
                      //   disabled={fetchLoading}
                      //   onClick={() => {
                      //     setCurrentItem(item);
                      //   }}
                      // >
                      //   {fetchLoading && (
                      //     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      //   )}
                      //   释放通道
                      // </Button>
                      <Popover>
                        <PopoverTrigger>
                          <Button disabled={fetchLoading}>
                            {fetchLoading && (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            释放通道
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-40">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className=" hover:bg-gray-300"
                                disabled={fetchLoading}
                                onClick={() => {
                                  setCurrentItem(item);
                                }}
                              >
                                手动下播并释放
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  手动释放通道
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要释放通道{item.nickname}
                                  吗?（请确保已手动进行下播）
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    setSelectedItem({
                                      action: "handle-offline",
                                      item: currentItem,
                                    });
                                  }}
                                >
                                  确认
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                className="mt-4 hover:bg-gray-300"
                                variant="outline"
                                disabled={
                                  !currentItem?.tunnel_perms?.includes(
                                    "finish_brodcast"
                                  )
                                }
                                onClick={() => {
                                  setCurrentItem(item);
                                }}
                              >
                                自动下播并释放
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  自动释放通道
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要自动下播并释放通道{item.nickname}吗?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={(e) => {
                                    setSelectedItem({
                                      action: "auto-offline",
                                      item: currentItem,
                                    });
                                  }}
                                >
                                  确认
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </PopoverContent>
                      </Popover>
                    )}

                    {item.all_cookies && (
                      <Button
                        onClick={() =>
                          setSelectedItem({
                            action: "openShop",
                            item,
                          })
                        }
                        disabled={fetchLoading}
                      >
                        {fetchLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        打开小店
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {tunnelList.length ? (
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
      ) : (
        ""
      )}

      <div className="flex justify-center my-10 text-gray-700 text-xl font-bold">
        {tunnelList.length ? (
          <div>TikTok通道不够？联系管理员可开通更多通道哦～ </div>
        ) : (
          <div>您还没有开通TikTok通道，请联系管理员开启～ </div>
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
                <StepTitle
                  className={
                    step.title.includes("OBS") || step.title.includes("断网")
                      ? "cursor-pointer flex"
                      : "flex"
                  }
                  onClick={() => {
                    handleTitleClick(step.title);
                  }}
                >
                  {step.title}{" "}
                  {step.title.includes("OBS") || step.title.includes("断网") ? (
                    <CircleHelp className="w-4 ml-1 mr-2"></CircleHelp>
                  ) : (
                    ""
                  )}
                </StepTitle>
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
