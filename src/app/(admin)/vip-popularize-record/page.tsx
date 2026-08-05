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

const data: Record<string, unknown>[] = [
  {
    id: 1001,
    purchaseTime: "2026-07-13 14:30:00",
    promoter: "张红娘",
    payStatus: "已支付",
    payMethod: "微信支付",
    payOrder: "WX202607131430001",
    status: "已完成",
  },
  {
    id: 1002,
    purchaseTime: "2026-07-12 10:15:00",
    promoter: "王红娘",
    payStatus: "已支付",
    payMethod: "微信支付",
    payOrder: "WX202607121015002",
    status: "已完成",
  },
  {
    id: 1003,
    purchaseTime: "2026-07-11 16:45:00",
    promoter: "李红娘",
    payStatus: "已支付",
    payMethod: "余额支付",
    payOrder: "BAL202607111645003",
    status: "已完成",
  },
  {
    id: 1004,
    purchaseTime: "2026-07-10 09:00:00",
    promoter: "赵红娘",
    payStatus: "待支付",
    payMethod: "-",
    payOrder: "WX202607100900004",
    status: "待付款",
  },
  {
    id: 1005,
    purchaseTime: "2026-07-09 11:20:00",
    promoter: "张红娘",
    payStatus: "已支付",
    payMethod: "微信支付",
    payOrder: "WX202607091120005",
    status: "已完成",
  },
];

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
