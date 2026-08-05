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

const data: Record<string, unknown>[] = [
  { id: 1, sn: 1, account: "admin", nickname: "超级管理员", role: "超级管理员", lastLoginTime: "2026-07-14 08:30:00", status: "启用" },
  { id: 2, sn: 2, account: "admin1", nickname: "张管理员", role: "管理员", lastLoginTime: "2026-07-13 10:00:00", status: "启用" },
  { id: 3, sn: 3, account: "admin2", nickname: "李管理员", role: "管理员", lastLoginTime: "2026-07-12 09:00:00", status: "启用" },
  { id: 4, sn: 4, account: "hongniang1", nickname: "王红娘", role: "红娘", lastLoginTime: "2026-07-14 14:00:00", status: "启用" },
  { id: 5, sn: 5, account: "hongniang2", nickname: "赵红娘", role: "红娘", lastLoginTime: "2026-07-13 16:00:00", status: "启用" },
  { id: 6, sn: 6, account: "hongniang3", nickname: "孙红娘", role: "红娘", lastLoginTime: "2026-07-12 11:00:00", status: "启用" },
  { id: 7, sn: 7, account: "hongniang4", nickname: "周红娘", role: "红娘", lastLoginTime: "2026-07-11 15:00:00", status: "启用" },
  { id: 8, sn: 8, account: "hongniang5", nickname: "吴红娘", role: "红娘", lastLoginTime: "2026-07-10 10:00:00", status: "启用" },
  { id: 9, sn: 9, account: "hongniang6", nickname: "郑红娘", role: "红娘", lastLoginTime: "2026-07-09 08:00:00", status: "启用" },
  { id: 10, sn: 10, account: "hongniang7", nickname: "钱红娘", role: "红娘", lastLoginTime: "2026-07-08 17:00:00", status: "启用" },
  { id: 11, sn: 11, account: "hongniang8", nickname: "刘红娘", role: "红娘", lastLoginTime: "2026-07-07 12:00:00", status: "启用" },
  { id: 12, sn: 12, account: "admin3", nickname: "陈管理员", role: "管理员", lastLoginTime: "2026-07-06 09:00:00", status: "停用" },
];

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
