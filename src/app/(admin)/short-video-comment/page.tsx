"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 50 },
  { title: "评论内容", key: "content", width: 400 },
  { title: "点赞数", key: "likes", width: 70, align: "center" },
  { title: "发布时间", key: "time", width: 170 },
  { title: "IP", key: "ip", width: 140 },
  { title: "会员", key: "member", width: 100 },
  {
    title: "审核",
    key: "audit",
    width: 60,
    align: "center",
    render: (row: Record<string, unknown>) => {
      const audit = String(row.audit ?? "");
      return (
        <span style={{ color: audit === "通过" ? "#52c41a" : "#faad14" }}>{audit}</span>
      );
    },
  },
  {
    title: "操作",
    key: "action",
    width: 130,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:opacity-80">编辑</span>
        <span className="text-[#3658f7] cursor-pointer hover:opacity-80">回复</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:opacity-80">删除</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const actions: ActionButton[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("短视频", "评论管理")}
      pageTitle="评论管理"
      searchFields={[
        { label: "评论内容", type: "input", placeholder: "请输入评论内容", width: 180 },
      ]}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
