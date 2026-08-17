"use client";

import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "订单号", key: "order_no", width: 220 },
  { title: "会员 ID", key: "user_id", width: 90 },
  { title: "商品", key: "product_name", width: 180 },
  { title: "金额", key: "amount", width: 110, render: (row) => <span className="font-medium text-[#ff4d4f]">¥{String(row.amount ?? "0.00")}</span> },
  { title: "状态", key: "status", width: 90, render: (row) => {
    const status = Number(row.status);
    return status === 1 ? <span className="text-[#52c41a]">已支付</span> : status === 3 ? <span className="text-[#ff4d4f]">已退款</span> : status === 2 ? <span className="text-[#999]">已关闭</span> : <span className="text-[#fa8c16]">待支付</span>;
  } },
  { title: "支付时间", key: "pay_time", width: 180 },
  { title: "创建时间", key: "created_at", width: 180 },
];

export default function SystemFinanceOrderPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "收入明细")}
      pageTitle="收入明细"
      searchFields={[
        { label: "订单号", type: "input", placeholder: "请输入订单号", width: 220 },
        { label: "会员 ID", type: "input", placeholder: "请输入会员 ID", width: 120 },
        { label: "状态", type: "select", options: [{ label: "待支付", value: "0" }, { label: "已支付", value: "1" }, { label: "已关闭", value: "2" }, { label: "已退款", value: "3" }] },
        { label: "时间范围", type: "dateRange" },
      ]}
      columns={columns}
      dataSource={[]}
      rowKey="id"
      endpoint="/api/backend/admin/finance/orders?page=1&page_size=20"
      pagination={{ current: 1, pageSize: 20, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
