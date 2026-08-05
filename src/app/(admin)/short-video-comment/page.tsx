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

const data: Record<string, unknown>[] = [
  { id: 3, content: "太真实了 原文：相亲一定要先见面再聊天！！ 文字都是冷冰冰的，真实的见面才能拉近两颗心的距离", likes: "0", time: "2026-06-12 18:03:42", ip: "180.111.215.178", member: "不吃猪肉", audit: "通过" },
  { id: 2, content: "总结的太到位了，感觉我也是这样的 原文：相亲一定要先见面再聊天！！ 文字都是冷冰冰的，真实的见面才能拉近两颗心的距离", likes: "0", time: "2026-06-12 17:29:43", ip: "116.147.253.130", member: "出现1", audit: "通过" },
  { id: 1, content: "总结的太到位了，感觉我也是这样的 原文：相亲一定要先见面再聊天！！ 文字都是冷冰冰的，真实的见面才能拉近两颗心的距离", likes: "0", time: "2026-06-12 17:28:41", ip: "116.147.253.130", member: "出现1", audit: "通过" },
];

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
      pagination={{ current: 1, pageSize: 10, total: 3 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
