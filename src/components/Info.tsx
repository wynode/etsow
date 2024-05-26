// import a from "next/a"
import { useState, useEffect } from "react";
import {
  Activity,
  ArrowUpRight,
  // CircleUser,
  // CreditCard,
  DollarSign,
  // Menu,
  // Package2,
  // Search,
  Users,
  SquareActivity,
} from "lucide-react";
import * as echarts from "echarts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";

export default function Dashboard() {
  const [dashData, setDashData] = useState({
    user: "1202",
    userAdd: "24",
    allLive: "4103",
    allLiveAdd: "36",
    sales: "10210312",
    salesAdd: "48023",
    currentLive: "3201",
    currentLiveAdd: "32",
  });
  function formatNumberWithCommas(number: number) {
    return new Intl.NumberFormat("en-US").format(number);
    // return String(number)
  }

  function getRandomIncrement(min: number, max: number): string {
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  function setEchart1() {
    const chartDom = document.getElementById("main");
    const myChart = echarts.init(chartDom);
    const data: number[] = [];
    for (let i = 0; i < 5; ++i) {
      data.push(Math.round(Math.random() * 2000));
    }

    const option: any = {
      xAxis: {
        max: "dataMax",
      },
      yAxis: {
        type: "category",
        data: [
          "Olivia liao",
          "Jackson Lee",
          "Isabella wang",
          "William Kim",
          "Sofia Davis",
        ],
        inverse: true,
        animationDuration: 300,
        animationDurationUpdate: 300,
        max: 4, // only the largest 3 bars will be displayed
      },
      series: [
        {
          realtimeSort: true,
          name: "X",
          type: "bar",
          data: data,
          itemStyle: {
            color: "#000",
          },
          label: {
            show: true,
            position: "right",

            valueAnimation: true,
            formatter: "¥ {c}", // c 代表这个点的值
          },
        },
      ],
      // legend: {
      //   show: true,
      // },
      animationDuration: 0,
      animationDurationUpdate: 3000,
      animationEasing: "linear",
      animationEasingUpdate: "linear",
    };

    function run() {
      for (var i = 0; i < data.length; ++i) {
        if (Math.random() > 0.9) {
          data[i] += Math.round(Math.random() * 4000);
        } else {
          data[i] += Math.round(Math.random() * 2000);
        }
      }
      myChart.setOption<echarts.EChartsOption>({
        series: [
          {
            type: "bar",
            data,
          },
        ],
      });
    }

    setTimeout(function () {
      run();
    }, 0);
    setInterval(function () {
      run();
    }, 3000);

    myChart.setOption(option);
  }
  function setEchart2() {
    const chartDom = document.getElementById("main1");
    const myChart = echarts.init(chartDom);
    const data: number[] = [];
    for (let i = 0; i < 5; ++i) {
      data.push(Math.round(Math.random() * 200));
    }

    const option: any = {
      yAxis: {
        max: "dataMax",
      },
      xAxis: {
        type: "category",
        data: [
          "Olivia liao",
          "Jackson Lee",
          "Isabella wang",
          "William Kim",
          "Sofia Davis",
        ],
        inverse: true,
        animationDuration: 300,
        animationDurationUpdate: 300,
        max: 4, // only the largest 3 bars will be displayed
      },
      series: [
        {
          realtimeSort: true,
          name: "X",
          type: "bar",
          data: data,
          itemStyle: {
            color: "#000",
          },
          label: {
            show: true,
            position: "top",
            valueAnimation: true,
            formatter: "{c} 人", // c 代表这个点的值
          },
        },
      ],
      // legend: {
      //   show: true,
      // },
      animationDuration: 0,
      animationDurationUpdate: 3000,
      animationEasing: "linear",
      animationEasingUpdate: "linear",
    };

    function run() {
      for (var i = 0; i < data.length; ++i) {
        if (Math.random() > 0.9) {
          data[i] += Math.round(Math.random() * 2000);
        } else {
          data[i] += Math.round(Math.random() * 300);
        }
      }
      myChart.setOption<echarts.EChartsOption>({
        series: [
          {
            type: "bar",
            data,
          },
        ],
      });
    }

    setTimeout(function () {
      run();
    }, 0);
    setInterval(function () {
      run();
    }, 3000);

    myChart.setOption(option);
  }

  useEffect(() => {
    const lastUpdateDate = localStorage.getItem("lastUpdate");
    const storedData = localStorage.getItem("data");
    const today = new Date().toDateString();

    if (storedData && lastUpdateDate === today) {
      // 数据已是最新，仅加载数据
      setDashData(JSON.parse(storedData));
    } else {
      // 更新数据
      let newData1 = {
        userAdd: getRandomIncrement(1, 50),
        allLiveAdd: getRandomIncrement(20, 50),
        salesAdd: getRandomIncrement(21000, 100210),
        currentLiveAdd: getRandomIncrement(10, 20),
      };
      const newData2 = {
        user: formatNumberWithCommas(
          Number(dashData.user) + Number(newData1.userAdd)
        ),
        allLive: formatNumberWithCommas(
          Number(dashData.allLive) + Number(newData1.allLiveAdd)
        ),
        sales: formatNumberWithCommas(
          Number(dashData.sales) + Number(newData1.salesAdd)
        ),
        currentLive: formatNumberWithCommas(
          Number(dashData.currentLive) + Number(newData1.currentLiveAdd)
        ),
      };

      Object.keys(newData1).forEach((key) => {
        const safeKey = key as keyof typeof newData1;
        newData1[safeKey] = formatNumberWithCommas(Number(newData1[safeKey]));
      });

      const newData = { ...newData1, ...newData2 };
      setDashData(newData);

      // 存储更新的数据和日期
      localStorage.setItem("data", JSON.stringify(newData));
      localStorage.setItem("lastUpdate", today);
    }

    // const chartDom1 = document.getElementById("main1");
    // const myChart1 = echarts.init(chartDom1);
    const chartDom2 = document.getElementById("main2");
    const myChart2 = echarts.init(chartDom2);
    const chartDom3 = document.getElementById("main3");
    const myChart3 = echarts.init(chartDom3);
    const data = [
      [6123, 7212, 8212, 8231, 7212, 6232, 7231],
      [7120, 8200, 6150, 5830, 6370, 6310, 8130],
      [214330, 223280, 253150, 304200, 321230],
      [1200, 2200, 3150, 3280, 3470, 4110, 4430],
    ];
    function getOptions(index: number) {
      if (index === 3) {
        return {
          xAxis: {
            type: "category",
            data: ["5/12", "5/12", "5/14", "5/15", "5/16", "5/17", "5/18"],
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              data: data[index],
              type: "bar",
              itemStyle: {
                color: "#000",
              },
              label: {
                show: true,
                position: "top",
                valueAnimation: true,
                formatter: "{c} 个", // c 代表这个点的值
              },
            },
          ],
        };
      } else {
        return {
          yAxis: {
            type: "category",
            data: [
              "Olivia liao",
              "Jackson Lee",
              "Isabella wang",
              "William Kim",
              "Sofia Davis",
            ],
          },
          xAxis: {
            type: "value",
          },
          series: [
            {
              data: data[index],
              type: "bar",
              itemStyle: {
                color: "#000",
              },
              label: {
                show: true,
                position: "right",
                valueAnimation: true,
                formatter: "{c}次播放", // c 代表这个点的值
              },
            },
          ],
        };
      }
    }

    setEchart1();
    setEchart2();
    // myChart1.setOption(getOptions(1));
    myChart2.setOption(getOptions(2));
    myChart3.setOption(getOptions(3));
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card x-chunk="dashboard-01-chunk-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashData.user}</div>
              <p className="text-xs text-muted-foreground">
                较昨天增长 +{dashData.userAdd} 人
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总直播间</CardTitle>
              <SquareActivity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashData.allLive}</div>
              <p className="text-xs text-muted-foreground">
                较昨天增长 +{dashData.allLiveAdd} 间
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总销售额</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashData.sales}</div>
              <p className="text-xs text-muted-foreground">
                较昨天增长 +{dashData.salesAdd} 元
              </p>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-3">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">当前直播间</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashData.currentLive}</div>
              <p className="text-xs text-muted-foreground">
                较昨天增长 +{dashData.currentLiveAdd} 间
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 relative">
          <div className="absolute w-full h-full bg-black/50 z-10 text-white text-3xl flex justify-center items-center">
            数据未开放展示
          </div>

          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>直播销售额排行榜数据</CardTitle>
                <CardDescription></CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <a href="#">
                  查看所有
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div id="main" className="h-[400px]"></div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>用户销售数据</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>廖</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia liao
                  </p>
                  <p className="text-sm text-muted-foreground">
                    olivia.liao@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+¥89,199.00</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/02.png" alt="Avatar" />
                  <AvatarFallback>李</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Jackson Lee
                  </p>
                  <p className="text-sm text-muted-foreground">
                    jackson.lee@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+¥87,939.00</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/03.png" alt="Avatar" />
                  <AvatarFallback>王</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Isabella wang
                  </p>
                  <p className="text-sm text-muted-foreground">
                    isabella.wang@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+¥76,299.00</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/04.png" alt="Avatar" />
                  <AvatarFallback>张</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    William Kim
                  </p>
                  <p className="text-sm text-muted-foreground">
                    will@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+¥66,199.00</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/05.png" alt="Avatar" />
                  <AvatarFallback>周</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Sofia Davis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sofia.davis@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">+¥45,339.00</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 relative">
          <div className="absolute w-full h-full bg-black/50 z-10 text-white text-3xl flex justify-center items-center">
            数据未开放展示
          </div>
          <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>直播间在线人数</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>廖</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia liao
                  </p>
                  <p className="text-sm text-muted-foreground">
                    olivia.liao@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">122,232</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/02.png" alt="Avatar" />
                  <AvatarFallback>李</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Jackson Lee
                  </p>
                  <p className="text-sm text-muted-foreground">
                    jackson.lee@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">92,232</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/03.png" alt="Avatar" />
                  <AvatarFallback>王</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Isabella wang
                  </p>
                  <p className="text-sm text-muted-foreground">
                    isabella.wang@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">73,146</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/04.png" alt="Avatar" />
                  <AvatarFallback>张</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    William Kim
                  </p>
                  <p className="text-sm text-muted-foreground">
                    will@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">51,895</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/05.png" alt="Avatar" />
                  <AvatarFallback>周</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Sofia Davis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sofia.davis@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">32,353</div>
              </div>
            </CardContent>
          </Card>
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>直播间在线人数（总）</CardTitle>
                <CardDescription></CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <a href="#">
                  查看所有
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div id="main1" className="h-[400px]"></div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 relative">
          <div className="absolute w-full h-full bg-black/50 z-10 text-white text-3xl flex justify-center items-center">
            数据未开放展示
          </div>

          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>短视频榜单（播放量）</CardTitle>
                <CardDescription></CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <a href="#">
                  查看所有
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div id="main2" className="h-[400px]"></div>
            </CardContent>
          </Card>
          <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>短视频标题及播放量</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>廖</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia liao
                  </p>
                  <p className="text-sm text-muted-foreground">
                    olivia.liao@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">32.8w</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/02.png" alt="Avatar" />
                  <AvatarFallback>李</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Jackson Lee
                  </p>
                  <p className="text-sm text-muted-foreground">
                    jackson.lee@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">23.2w</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/03.png" alt="Avatar" />
                  <AvatarFallback>王</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Isabella wang
                  </p>
                  <p className="text-sm text-muted-foreground">
                    isabella.wang@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">21.7w</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/04.png" alt="Avatar" />
                  <AvatarFallback>张</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    William Kim
                  </p>
                  <p className="text-sm text-muted-foreground">
                    will@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">20.3w</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/05.png" alt="Avatar" />
                  <AvatarFallback>周</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Sofia Davis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sofia.davis@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium">11.2w</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 relative">
          <div className="absolute w-full h-full bg-black/50 z-10 text-white text-3xl flex justify-center items-center">
            数据未开放展示
          </div>
          <Card x-chunk="dashboard-01-chunk-5">
            <CardHeader>
              <CardTitle>通道大客户展示</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-8">
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/01.png" alt="Avatar" />
                  <AvatarFallback>廖</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Olivia liao
                  </p>
                  <p className="text-sm text-muted-foreground">
                    olivia.liao@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium"></div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/02.png" alt="Avatar" />
                  <AvatarFallback>李</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Jackson Lee
                  </p>
                  <p className="text-sm text-muted-foreground">
                    jackson.lee@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium"></div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/03.png" alt="Avatar" />
                  <AvatarFallback>王</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Isabella wang
                  </p>
                  <p className="text-sm text-muted-foreground">
                    isabella.wang@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium"></div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/04.png" alt="Avatar" />
                  <AvatarFallback>张</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    William Kim
                  </p>
                  <p className="text-sm text-muted-foreground">
                    will@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium"></div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="/avatars/05.png" alt="Avatar" />
                  <AvatarFallback>周</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">
                    Sofia Davis
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sofia.davis@email.com
                  </p>
                </div>
                <div className="ml-auto font-medium"></div>
              </div>
            </CardContent>
          </Card>
          <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle> 总通道数</CardTitle>
                <CardDescription></CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <a href="#">
                  查看所有
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </CardHeader>
            <CardContent>
              <div id="main3" className="h-[400px]"></div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
