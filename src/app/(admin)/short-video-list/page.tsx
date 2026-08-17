"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 50 },
  { title: "封面", key: "cover", width: 60, align: "center" },
  { title: "描述", key: "description", width: 280 },
  { title: "浏览权限", key: "permission", width: 90 },
  { title: "关联内容", key: "related", width: 80 },
  { title: "统计数据", key: "stats", width: 160 },
  { title: "打赏收入", key: "tipIncome", width: 80 },
  { title: "红包", key: "redPacket", width: 70 },
  { title: "显示", key: "display", width: 50, align: "center" },
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
  { title: "属性", key: "props", width: 140 },
  {
    title: "操作",
    key: "action",
    width: 180,
    render: (row: Record<string, unknown>) => {
      const hasRedPacket = String(row.redPacket ?? "") === "有红包";
      return (
        <span className="flex items-center gap-1.5 text-xs">
          {hasRedPacket && <span className="text-[#3658f7] cursor-pointer hover:opacity-80">发红包</span>}
          <span className="text-[#3658f7] cursor-pointer hover:opacity-80">编辑</span>
          <span className="text-[#3658f7] cursor-pointer hover:opacity-80">预览</span>
          <span className="text-[#3658f7] cursor-pointer hover:opacity-80">视频</span>
          <span className="text-[#ff4d4f] cursor-pointer hover:opacity-80">删除</span>
        </span>
      );
    },
  },
];

const data: Record<string, unknown>[] = [];

const actions: ActionButton[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("短视频", "视频管理")}
      pageTitle="视频管理"
      searchFields={[
        { label: "描述", type: "input", placeholder: "请输入描述", width: 180 },
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
