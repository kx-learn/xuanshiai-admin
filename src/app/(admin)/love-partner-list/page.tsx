"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60, align: "center" },
  {
    title: "合伙人",
    key: "partner",
    width: 200,
    render: (row: Record<string, unknown>) => (
      <div className="text-sm leading-relaxed">
        <div>账号：{row.account as string}</div>
        <div className="text-[#666]">团队：{row.teamName as string}</div>
      </div>
    ),
  },
  { title: "合伙级别", key: "level", width: 110 },
  { title: "创建时间", key: "createTime", width: 170 },
  {
    title: "团队成员",
    key: "teamMembers",
    width: 100,
    render: (row: Record<string, unknown>) => (
      <span>{row.teamMemberCount as string}人 <span className="text-[#3658f7] cursor-pointer hover:underline">名单</span></span>
    ),
  },
  { title: "团队业绩", key: "teamPerformance", width: 100 },
  { title: "团队有效会员", key: "teamValidMembers", width: 140 },
  {
    title: "累积分成",
    key: "totalBonus",
    width: 130,
    render: (row: Record<string, unknown>) => (
      <span>{row.totalBonus as string}<span className="text-[#3658f7] cursor-pointer hover:underline ml-1">[明细]</span></span>
    ),
  },
  {
    title: "操作",
    key: "action",
    width: 200,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:underline">合伙人中心</span>
        <span className="text-[#3658f7] cursor-pointer hover:underline">编辑</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:underline">删除</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const actions: ActionButton[] = [
  { label: "添加合伙人", variant: "primary" },
];

export default function LovePartnerListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("合伙红娘", "合伙人管理")}
      pageTitle="合伙人管理"
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
    />
  );
}
