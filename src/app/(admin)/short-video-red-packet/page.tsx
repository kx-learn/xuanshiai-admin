"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSearchBar, { type SearchField } from "@/components/AdminSearchBar";
import { DataTable, type Column } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const mockData: Record<string, unknown>[] = [];

const statusBadge = (status: string) => {
  const map: Record<string, { label: string; className: string }> = {
    "进行中": { label: "进行中", className: "bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" },
    "已领完": { label: "已领完", className: "bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]" },
    "已过期": { label: "已过期", className: "bg-[#fff2f0] text-[#ff4d4f] border border-[#ffccc7]" },
  };
  const item = map[status] || { label: status, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${item.className}`}>
      {item.label}
    </span>
  );
};

export default function ShortVideoRedPacketPage() {
  const [videoTitle, setVideoTitle] = useState("");

  const searchFields: SearchField[] = [
    { label: "视频标题", name: "videoTitle", type: "text", placeholder: "请输入视频标题", value: videoTitle, onChange: setVideoTitle },
  ];

  const columns: Column[] = [
    { key: "id", title: "编号", dataIndex: "id", width: 70 },
    { key: "videoTitle", title: "视频标题", dataIndex: "videoTitle" },
    { key: "amount", title: "红包金额", dataIndex: "amount", render: (value: unknown) => `¥${value}` },
    { key: "claimCount", title: "领取人数", dataIndex: "claimCount" },
    { key: "createTime", title: "创建时间", dataIndex: "createTime" },
    {
      key: "status",
      title: "状态",
      dataIndex: "status",
      render: (value: unknown) => statusBadge(value as string),
    },
    {
      key: "action",
      title: "操作",
      dataIndex: "action",
      width: 80,
      render: (_value: unknown, _record: Record<string, unknown>) => (
        <span className="flex items-center gap-2">
          <Button variant="link" size="sm">详情</Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "短视频" },
          { label: "红包记录" },
        ]}
      />
      <AdminPageHeader title="红包记录" />
      <div className="admin-card">
        <div className="admin-card-body">
          <AdminSearchBar
            fields={searchFields}
            onSearch={() => {}}
            onReset={() => { setVideoTitle(""); }}
          />
          <DataTable columns={columns} dataSource={mockData as unknown as Record<string, unknown>[]} />
          <div className="flex items-center justify-end gap-2 mt-4 text-sm text-[#666]">
            <span>共 {mockData.length} 条</span>
            <span className="flex items-center gap-1">
              <Button variant="default" size="sm" disabled>上一页</Button>
              <span className="px-2">1 / 2</span>
              <Button variant="default" size="sm">下一页</Button>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
