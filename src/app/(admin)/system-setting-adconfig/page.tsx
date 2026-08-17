"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "平台订单号", key: "orderNo" },
  { title: "支付时间", key: "payTime" },
  { title: "下单时间", key: "orderTime" },
  { title: "付款会员", key: "member" },
  { title: "支付事项", key: "payItem" },
  { title: "支付方式", key: "payMethod" },
  { title: "支付金额", key: "payAmount" },
  {
    title: "状态",
    key: "status",
    render: (row: Record<string, unknown>) => {
      const s = String(row.status ?? "");
      if (s.includes("已退款")) {
        return <span className="inline-block px-2 py-0.5 text-xs rounded bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]">{s}</span>;
      }
      if (s === "已支付") {
        return <span className="inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]">{s}</span>;
      }
      return <span className="inline-block px-2 py-0.5 text-xs rounded bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]">{s}</span>;
    },
  },
  { title: "已支付回执", key: "receipt" },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: (row: Record<string, unknown>) => {
      const s = String(row.status ?? "");
      if (s.includes("已退款")) return <span className="text-sm text-[#999]">-</span>;
      if (s === "已支付") {
        return <button className="text-sm text-[#ff4d4f] hover:text-[#ff7875]">退款</button>;
      }
      return <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">改为已支付</button>;
    },
  },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统管理", "广告管理")}
      pageTitle="广告管理"
      actions={[
        { label: "导出EXCEL", variant: "primary" },
      ]}
      searchFields={[
        { label: "订单号", type: "input", placeholder: "请输入订单号" },
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
