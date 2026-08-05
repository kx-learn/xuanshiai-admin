"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPageHeader from "@/components/AdminPageHeader";
import { DataTable, type Column } from "@/components/ui/table";

const authInfo = {
  licensor: "宣誓爱",
  version: "V9.0",
  status: "已授权",
  authorizedAt: "2026-01-01",
  expiresAt: "2027-01-01",
  domain: "www.xuanshiai.com",
};

const mockData = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  module: [
    "用户管理系统", "会员匹配引擎", "牵线服务系统", "活动管理平台",
    "财务管理模块", "合同管理系统", "微信集成模块", "小程序端",
    "数据统计分析", "客服工单系统",
  ][i],
  authStatus: i < 9 ? "已授权" : "未授权",
  expiresAt: i < 9 ? "2027-01-01" : "-",
}));

export default function SystemEmpowerPage() {
  const columns: Column[] = [
    { key: "id", title: "编号", dataIndex: "id", width: 70 },
    { key: "module", title: "授权模块", dataIndex: "module" },
    {
      key: "authStatus",
      title: "授权状态",
      dataIndex: "authStatus",
      width: 100,
      render: (value: unknown) => {
        const status = String(value ?? "");
        return (
          <span className={status === "已授权" ? "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "inline-block px-2 py-0.5 text-xs rounded bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]"}>
            {status}
          </span>
        );
      },
    },
    {
      key: "expiresAt",
      title: "到期时间",
      dataIndex: "expiresAt",
      render: (value: unknown) => (
        <span className={String(value) === "-" ? "text-[#999]" : ""}>{String(value)}</span>
      ),
    },
  ];

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "系统管理" },
          { label: "软件授权" },
        ]}
      />
      <AdminPageHeader title="软件授权" />

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="admin-card">
          <div className="admin-card-header">
            <span className="font-medium text-base">授权信息</span>
          </div>
          <div className="admin-card-body">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#999]">授权方：</span>
                <span className="text-[#333] font-medium">{authInfo.licensor}</span>
              </div>
              <div>
                <span className="text-[#999]">授权版本：</span>
                <span className="text-[#333] font-medium">{authInfo.version}</span>
              </div>
              <div>
                <span className="text-[#999]">授权状态：</span>
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]">{authInfo.status}</span>
              </div>
              <div>
                <span className="text-[#999]">授权域名：</span>
                <span className="text-[#333] font-medium">{authInfo.domain}</span>
              </div>
              <div>
                <span className="text-[#999]">授权时间：</span>
                <span className="text-[#333]">{authInfo.authorizedAt}</span>
              </div>
              <div>
                <span className="text-[#999]">到期时间：</span>
                <span className="text-[#333] font-medium">{authInfo.expiresAt}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <span className="font-medium text-base">系统信息</span>
          </div>
          <div className="admin-card-body">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[#999]">系统版本：</span>
                <span className="text-[#333]">V9.0.1</span>
              </div>
              <div>
                <span className="text-[#999]">PHP版本：</span>
                <span className="text-[#333]">8.2.0</span>
              </div>
              <div>
                <span className="text-[#999]">数据库版本：</span>
                <span className="text-[#333]">MySQL 8.0.33</span>
              </div>
              <div>
                <span className="text-[#999]">服务器环境：</span>
                <span className="text-[#333]">Linux / Nginx</span>
              </div>
              <div>
                <span className="text-[#999]">最大上传：</span>
                <span className="text-[#333]">50M</span>
              </div>
              <div>
                <span className="text-[#999]">运行状态：</span>
                <span className="inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]">正常</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <span className="font-medium text-base">授权模块列表</span>
        </div>
        <div className="admin-card-body">
          <DataTable columns={columns} dataSource={mockData as unknown as Record<string, unknown>[]} />
        </div>
      </div>
    </div>
  );
}
