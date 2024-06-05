import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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

export default function UpdateLog() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="link" className="fixed z-100 bottom-4 right-4">
          更新日志
        </Button>
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
                <p>4、完成banner设置</p>
              </div>
              <p className="mt-4">版本号 1.0.3 : </p>
              <div className="ml-4">
                <p>1、优化登录逻辑</p>
                <p>2、增加未充值等各类提示</p>
                <p>3、新增伙伴专区</p>
              </div>
              <p className="mt-4">版本号 1.1.0 : </p>
              <div className="ml-4">
                <p>1、增加数据统计页面</p>
                <p>2、修复获取推流码串位问题</p>
                <p>3、添加重新登录按钮</p>
                <p>4、下播修改为释放通道</p>
              </div>
              <p className="mt-4">版本号 1.1.1 : </p>
              <div className="ml-4">
                <p>1、登录抖音、Tiktok不用再点x关闭，登录完成后自动关闭弹窗</p>
                <p>2、修复串流问题</p>
                <p>3、添加翻页</p>
              </div>
              <p className="mt-4">版本号 1.1.2 : </p>
              <div className="ml-4">
                <p>1、修复登录窗口大小问题</p>
                <p>2、修复连续打开Tiktok小店会替换前一个账号的问题</p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>确定</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
