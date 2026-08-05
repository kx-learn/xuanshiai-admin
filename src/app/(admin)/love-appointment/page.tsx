"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "单号", key: "orderId", width: 80 },
  { title: "男方", key: "male", width: 150 },
  { title: "女方", key: "female", width: 150 },
  { title: "会员端", key: "memberView", width: 80 },
  { title: "约见详情", key: "detail", width: 120 },
  { title: "本次约见服务红娘", key: "matchmaker", width: 140 },
  {
    title: "状态",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const colorMap: Record<string, string> = {
        "进行中": "#1890ff",
        "已完成": "#52c41a",
        "已取消": "#999",
      };
      const bgMap: Record<string, string> = {
        "进行中": "#e6f7ff",
        "已完成": "#f6ffed",
        "已取消": "#f5f5f5",
      };
      const borderMap: Record<string, string> = {
        "进行中": "#91d5ff",
        "已完成": "#b7eb8f",
        "已取消": "#d9d9d9",
      };
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: colorMap[status] || "#999",
            backgroundColor: bgMap[status] || "#f5f5f5",
            border: `1px solid ${borderMap[status] || "#d9d9d9"}`,
          }}
        >
          {status}
        </span>
      );
    },
  },
  { title: "会员反馈", key: "feedback", width: 100 },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "男方", type: "input", placeholder: "请输入男方姓名", width: 160 },
  { label: "女方", type: "input", placeholder: "请输入女方姓名", width: 160 },
  { label: "状态", type: "select", placeholder: "全部", options: [{ label: "全部", value: "" }, { label: "进行中", value: "ongoing" }, { label: "已完成", value: "completed" }, { label: "已取消", value: "cancelled" }], width: 120 },
  { label: "时间", type: "dateRange" },
];

const actions: ActionButton[] = [
  { label: "添加约会记录", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员服务", "约会管理")}
      pageTitle="约会管理"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="orderId"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
