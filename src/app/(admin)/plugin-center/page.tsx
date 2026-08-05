"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPageHeader from "@/components/AdminPageHeader";
import { Button } from "@/components/ui/button";

const plugins = [
  { id: 1, name: "微信支付", description: "集成微信支付功能，支持扫码支付、H5支付", iconColor: "#07c160", installed: true },
  { id: 2, name: "支付宝支付", description: "集成支付宝支付，支持手机网站和电脑网站支付", iconColor: "#1677ff", installed: true },
  { id: 3, name: "短信服务", description: "阿里云/腾讯云短信服务，支持验证码和通知短信", iconColor: "#ff6a00", installed: true },
  { id: 4, name: "OSS存储", description: "阿里云/腾讯云OSS对象存储，图片视频云端存储", iconColor: "#00a4ff", installed: false },
  { id: 5, name: "IM即时通讯", description: "融云/腾讯云IM，支持用户即时聊天和消息推送", iconColor: "#6366f1", installed: false },
  { id: 6, name: "实名认证", description: "阿里云/腾讯云实名认证，身份证、人脸识别验证", iconColor: "#f59e0b", installed: true },
  { id: 7, name: "直播推流", description: "腾讯云直播/阿里云直播，支持直播相亲和互动", iconColor: "#ef4444", installed: false },
  { id: 8, name: "数据分析", description: "百度统计/友盟，用户行为分析和数据可视化", iconColor: "#8b5cf6", installed: false },
];

export default function PluginCenterPage() {
  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "系统管理" },
          { label: "应用中心" },
        ]}
      />
      <AdminPageHeader title="应用中心" />

      <div className="grid grid-cols-4 gap-4">
        {plugins.map((plugin) => (
          <div key={plugin.id} className="admin-card p-5 flex flex-col items-center text-center">
            <div
              className="size-14 rounded-xl flex items-center justify-center mb-3 text-white text-xl font-bold"
              style={{ backgroundColor: plugin.iconColor }}
            >
              {plugin.name.charAt(0)}
            </div>
            <div className="font-medium text-sm text-[#333] mb-1">{plugin.name}</div>
            <div className="text-xs text-[#999] mb-4 leading-relaxed">{plugin.description}</div>
            <Button
              variant={plugin.installed ? "default" : "primary"}
              size="sm"
              className="w-full"
              disabled={plugin.installed}
            >
              {plugin.installed ? "已安装" : "安装"}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
