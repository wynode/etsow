import MianFei from "@/assets/mianfei.jpg";
import FuFei from "@/assets/fufei.jpg";

export default function UpdateLog() {
  return (
    <div className="flex mt-24 justify-center h-full">
      <div className="space-y-10">
        <div className="flex items-center border p-6 relative">
          <p className="absolute top-[-12px] bg-white px-4">免费用户交流</p>
          <img src={MianFei} alt="" className="w-32 m-4" />
          <div>
            <p className="mb-6">试用用户交流</p>
            <p className="mb-4">
              针对于帮助我们宣传的用户，我们将赠送更多使用时长以及永久使用权限
            </p>
            <p className="mb-4">
              QQ1群：暂无 QQ2群：暂无 QQ3群：暂无 QQ4群：暂无
            </p>
            <p>微信号：alangwei345（加后拉你进群）</p>
          </div>
        </div>
        <div className="flex items-center border p-6 relative">
          <p className="absolute top-[-12px] bg-white px-4">付费用户沟通</p>
          <img src={FuFei} alt="" className="w-32 m-4" />
          <div>
            <p className="mb-6">付费客户售后</p>
            <p className="mb-4">
              购买软件的客户，我们将统一进行售后，保障客户使用。
            </p>
            <p>微信号：alangwei345</p>
          </div>
        </div>
      </div>
      <div className="border p-6 ml-10 relative">
        <p className="absolute top-[-12px] bg-white px-4">业务合作</p>
        <div className="flex flex-col items-center justify-center h-full">
          <p>代理合作</p>
          <p>etsowcom@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
