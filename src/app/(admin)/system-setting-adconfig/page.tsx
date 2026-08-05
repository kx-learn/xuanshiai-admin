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

const data: Record<string, unknown>[] = [
  { id: 1, orderNo: "FO1411281242405056", payTime: "", orderTime: "2026-07-14 17:18:32", member: "Oᴗoಣ(ID:760)", payItem: "推广红娘入伙费", payMethod: "-", payAmount: "99元", status: "未支付", receipt: "-", actionStatus: "未支付" },
  { id: 2, orderNo: "FO9031585677851679", payTime: "2026-07-11 10:45:57", orderTime: "2026-07-11 10:45:45", member: "秋刀鱼(ID:716)", payItem: "活动报名", payMethod: "微信支付 (公众号)", payAmount: "98元", status: "已退款退款金额：98元(原路退回)", receipt: "是", actionStatus: "已退款" },
  { id: 3, orderNo: "FO6771296129230221", payTime: "2026-07-11 10:45:17", orderTime: "2026-07-11 10:45:00", member: "秋刀鱼(ID:716)", payItem: "活动报名", payMethod: "后台支付", payAmount: "98元", status: "已支付", receipt: "是", actionStatus: "已支付" },
  { id: 4, orderNo: "FO6092778197454947", payTime: "2026-07-10 14:47:27", orderTime: "2026-07-10 14:47:07", member: "秋刀鱼(ID:716)", payItem: "推广红娘入伙费", payMethod: "后台支付", payAmount: "99元", status: "已支付", receipt: "是", actionStatus: "已支付" },
  { id: 5, orderNo: "FO9208344526556665", payTime: "", orderTime: "2026-07-09 23:27:50", member: "空空(ID:750)", payItem: "活动报名", payMethod: "-", payAmount: "98元", status: "未支付", receipt: "-", actionStatus: "未支付" },
  { id: 6, orderNo: "FO3667157235269829", payTime: "", orderTime: "2026-07-09 09:48:41", member: "出现1(ID:54)", payItem: "会员爆灯", payMethod: "-", payAmount: "9.9元", status: "未支付", receipt: "-", actionStatus: "未支付" },
  { id: 7, orderNo: "FO5342288217532854", payTime: "2026-07-08 18:10:33", orderTime: "2026-07-08 18:10:22", member: "木木夕(ID:740)", payItem: "活动报名", payMethod: "微信支付 (小程序)", payAmount: "98元", status: "已支付", receipt: "是", actionStatus: "已支付" },
  { id: 8, orderNo: "FO5030646619194861", payTime: "2026-07-11 14:19:36", orderTime: "2026-07-08 15:18:53", member: "Azu(ID:739)", payItem: "活动报名", payMethod: "微信支付 (小程序)", payAmount: "98元", status: "已支付", receipt: "是", actionStatus: "已支付" },
  { id: 9, orderNo: "FO8518787977194632", payTime: "2026-07-05 08:32:12", orderTime: "2026-07-05 08:31:04", member: "fu福(ID:726)", payItem: "活动报名", payMethod: "微信支付 (小程序)", payAmount: "98元", status: "已支付", receipt: "是", actionStatus: "已支付" },
  { id: 10, orderNo: "FO3193591079600264", payTime: "", orderTime: "2026-07-03 14:29:15", member: "秋刀鱼(ID:716)", payItem: "送礼物", payMethod: "-", payAmount: "90元", status: "未支付", receipt: "-", actionStatus: "未支付" },
];

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
