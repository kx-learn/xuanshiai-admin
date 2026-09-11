"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 70 },
  { title: "购买时间", key: "purchaseTime" },
  { title: "购买推广人", key: "promoter" },
  { title: "支付状态", key: "payStatus" },
  { title: "支付方式", key: "payMethod" },
  { title: "支付订单", key: "payOrder" },
  { title: "状态", key: "status" },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <span className="flex items-center gap-2">
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">查看</button>
        <button type="button" className="text-[#ff4d4f] hover:text-[#ff7875] text-sm cursor-pointer bg-transparent border-none p-0">删除</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const actions: ActionButton[] = [
  { label: "导出", variant: "default" },
];

export default function VipPopularizeRecordPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员服务", "推广管理")}
      pageTitle="推广管理"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      actions={actions}
      searchFields={[
        { label: "支付状态", type: "select", options: [
          { label: "全部", value: "" },
          { label: "已支付", value: "paid" },
          { label: "待支付", value: "pending" },
        ]},
        { label: "购买时间", type: "dateRange" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
