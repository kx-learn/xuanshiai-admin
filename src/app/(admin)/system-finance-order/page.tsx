"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "订单号", key: "orderNo" },
  { title: "付款会员", key: "member" },
  { title: "收入类型", key: "incomeType" },
  {
    title: "金额",
    key: "amount",
    render: (row: Record<string, unknown>) => (
      <span className="font-medium text-[#ff4d4f]">¥{String(row.amount)}</span>
    ),
  },
  { title: "支付方式", key: "payMethod" },
  { title: "时间", key: "time" },
  {
    title: "操作",
    key: "action",
    width: 80,
    render: () => (
      <span className="flex items-center gap-2">
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">查看</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, orderNo: "PAY202607131001", member: "张三", incomeType: "VIP会员", amount: 888, payMethod: "微信支付", time: "2026-07-13 10:00:00" },
  { id: 2, orderNo: "PAY202607121002", member: "李四", incomeType: "牵线费", amount: 199, payMethod: "微信支付", time: "2026-07-12 11:05:00" },
  { id: 3, orderNo: "PAY202607111003", member: "王五", incomeType: "活动报名", amount: 50, payMethod: "微信支付", time: "2026-07-11 12:10:00" },
  { id: 4, orderNo: "PAY202607101004", member: "赵六", incomeType: "送礼物", amount: 19.9, payMethod: "余额支付", time: "2026-07-10 13:15:00" },
  { id: 5, orderNo: "PAY202607091005", member: "孙七", incomeType: "积分充值", amount: 100, payMethod: "微信支付", time: "2026-07-09 14:20:00" },
  { id: 6, orderNo: "PAY202607081006", member: "周八", incomeType: "VIP会员", amount: 268, payMethod: "支付宝", time: "2026-07-08 15:25:00" },
  { id: 7, orderNo: "PAY202607071007", member: "吴九", incomeType: "VIP会员", amount: 98, payMethod: "微信支付", time: "2026-07-07 16:30:00" },
  { id: 8, orderNo: "PAY202607061008", member: "郑十", incomeType: "牵线费", amount: 199, payMethod: "微信支付", time: "2026-07-06 17:35:00" },
  { id: 9, orderNo: "PAY202607051009", member: "钱十一", incomeType: "送礼物", amount: 29.9, payMethod: "余额支付", time: "2026-07-05 18:40:00" },
  { id: 10, orderNo: "PAY202607041010", member: "刘十二", incomeType: "积分充值", amount: 50, payMethod: "微信支付", time: "2026-07-04 19:45:00" },
  { id: 11, orderNo: "PAY202607031011", member: "陈十三", incomeType: "VIP会员", amount: 888, payMethod: "支付宝", time: "2026-07-03 20:50:00" },
  { id: 12, orderNo: "PAY202607021012", member: "杨十四", incomeType: "活动报名", amount: 50, payMethod: "微信支付", time: "2026-07-02 21:55:00" },
];

export default function SystemFinanceOrderPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "收入明细")}
      pageTitle="收入明细"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      searchFields={[
        { label: "付款会员", type: "input", placeholder: "请输入会员名称" },
        { label: "收入类型", type: "select", options: [
          { label: "全部", value: "" },
          { label: "VIP会员", value: "vip" },
          { label: "牵线费", value: "match" },
          { label: "活动报名", value: "event" },
          { label: "送礼物", value: "gift" },
          { label: "积分充值", value: "points" },
        ]},
        { label: "时间范围", type: "dateRange" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
