"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "下单商品", key: "product", width: 200 },
  { title: "商家", key: "merchant", width: 160 },
  { title: "下单人", key: "buyer", width: 100 },
  { title: "下单时间", key: "orderTime", width: 160 },
  {
    title: "订单状态",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const colorMap: Record<string, string> = {
        "已付款": "#52c41a",
        "待付款": "#faad14",
        "已退款": "#ff4d4f",
      };
      const bgMap: Record<string, string> = {
        "已付款": "#f6ffed",
        "待付款": "#fffbe6",
        "已退款": "#fff2f0",
      };
      const borderMap: Record<string, string> = {
        "已付款": "#b7eb8f",
        "待付款": "#ffe58f",
        "已退款": "#ffccc7",
      };
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: colorMap[status] || "#666",
            backgroundColor: bgMap[status] || "#f5f5f5",
            border: `1px solid ${borderMap[status] || "#d9d9d9"}`,
          }}
        >
          {status}
        </span>
      );
    },
  },
  { title: "订单金额", key: "amount", width: 100 },
  { title: "方式/时间", key: "payMethod", width: 130 },
  {
    title: "核销状态",
    key: "verifyStatus",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const vs = String(row.verifyStatus ?? "");
      return <span style={{ color: vs === "已核销" ? "#52c41a" : "#faad14" }}>{vs}</span>;
    },
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:opacity-80">详情</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:opacity-80">退款</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const actions: ActionButton[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("商家联盟", "订单管理")}
      pageTitle="订单管理"
      searchFields={[
        { label: "订单号", type: "input", placeholder: "请输入订单号", width: 180 },
        { label: "订单状态", type: "select", options: [{ label: "全部", value: "" }, { label: "已付款", value: "paid" }, { label: "待付款", value: "pending" }, { label: "已退款", value: "refunded" }], width: 120 },
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
