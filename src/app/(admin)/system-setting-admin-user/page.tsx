"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "sn", width: 70 },
  { title: "账号", key: "account" },
  { title: "昵称", key: "nickname" },
  {
    title: "角色",
    key: "role",
    render: (row: Record<string, unknown>) => {
      const role = String(row.role ?? "");
      const colorMap: Record<string, string> = {
        "超级管理员": "text-[#ff4d4f]",
        "管理员": "text-[#3658f7]",
        "红娘": "text-[#52c41a]",
      };
      return <span className={`font-medium ${colorMap[role] || ""}`}>{role}</span>;
    },
  },
  { title: "最后登录时间", key: "lastLoginTime" },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const s = String(row.status ?? "");
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded border ${s === "启用" ? "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]" : "bg-[#f5f5f5] text-[#999] border-[#d9d9d9]"}`}>
          {s}
        </span>
      );
    },
  },
  {
    title: "操作",
    key: "action",
    width: 140,
    render: () => (
      <span className="flex items-center gap-2">
        <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">编辑</button>
        <button className="text-sm text-[#ff4d4f] hover:text-[#ff7875]">删除</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统管理", "系统账号管理")}
      pageTitle="系统账号管理"
      actions={[
        { label: "添加账号", variant: "primary" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
