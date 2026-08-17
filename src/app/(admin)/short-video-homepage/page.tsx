"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPageHeader from "@/components/AdminPageHeader";
import AdminSearchBar, { type SearchField } from "@/components/AdminSearchBar";
import { DataTable, type Column } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const mockData: Record<string, unknown>[] = [];

export default function ShortVideoHomepagePage() {
  const [nickname, setNickname] = useState("");

  const searchFields: SearchField[] = [
    { label: "会员昵称", name: "nickname", type: "text", placeholder: "请输入会员昵称", value: nickname, onChange: setNickname },
  ];

  const columns: Column[] = [
    { key: "id", title: "编号", dataIndex: "id", width: 70 },
    { key: "nickname", title: "会员昵称", dataIndex: "nickname" },
    { key: "videoCount", title: "视频数", dataIndex: "videoCount" },
    { key: "likeCount", title: "获赞数", dataIndex: "likeCount", render: (value: unknown) => (value as number).toLocaleString() },
    { key: "followerCount", title: "粉丝数", dataIndex: "followerCount", render: (value: unknown) => (value as number).toLocaleString() },
    {
      key: "homepageUrl",
      title: "主页链接",
      dataIndex: "homepageUrl",
      render: (value: unknown) => (
        <span className="text-[#3658f7]">{value as string}</span>
      ),
    },
    {
      key: "action",
      title: "操作",
      dataIndex: "action",
      width: 100,
      render: (_value: unknown, _record: Record<string, unknown>) => (
        <span className="flex items-center gap-2">
          <Button variant="link" size="sm">查看</Button>
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
          { label: "会员主页" },
        ]}
      />
      <AdminPageHeader title="会员主页" />
      <div className="admin-card">
        <div className="admin-card-body">
          <AdminSearchBar
            fields={searchFields}
            onSearch={() => {}}
            onReset={() => { setNickname(""); }}
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
