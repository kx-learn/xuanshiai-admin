"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPageHeader from "@/components/AdminPageHeader";
import { Button } from "@/components/ui/button";

const plugins: { id: number; name: string; description: string; iconColor: string; installed: boolean }[] = [];

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
