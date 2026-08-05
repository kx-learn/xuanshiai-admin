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

const data: Record<string, unknown>[] = [
  { id: 1, product: "钻石会员年卡", merchant: "星辰婚恋服务有限公司", buyer: "陈小明", orderTime: "2026-07-13 10:30:00", status: "已付款", amount: "¥3,999", payMethod: "微信支付", verifyStatus: "已核销" },
  { id: 2, product: "高端一对一匹配服务", merchant: "幸福起点婚介所", buyer: "林小红", orderTime: "2026-07-13 09:15:00", status: "已付款", amount: "¥2,999", payMethod: "微信支付", verifyStatus: "待核销" },
  { id: 3, product: "情感咨询套餐A", merchant: "缘来是你文化传播", buyer: "王建国", orderTime: "2026-07-12 16:45:00", status: "已付款", amount: "¥1,999", payMethod: "微信支付", verifyStatus: "已核销" },
  { id: 4, product: "线下相亲活动门票", merchant: "玫瑰之约婚恋中心", buyer: "赵丽丽", orderTime: "2026-07-12 14:20:00", status: "待付款", amount: "¥299", payMethod: "-", verifyStatus: "-" },
  { id: 5, product: "VIP会员季卡", merchant: "爱桥婚姻服务有限公司", buyer: "孙大海", orderTime: "2026-07-11 11:00:00", status: "已付款", amount: "¥1,999", payMethod: "微信支付", verifyStatus: "已核销" },
  { id: 6, product: "婚礼策划基础套餐", merchant: "金玉良缘工作室", buyer: "周美玲", orderTime: "2026-07-11 08:30:00", status: "已退款", amount: "¥5,999", payMethod: "微信支付", verifyStatus: "-" },
  { id: 7, product: "形象改造课程", merchant: "星辰婚恋服务有限公司", buyer: "吴志强", orderTime: "2026-07-10 15:00:00", status: "已付款", amount: "¥999", payMethod: "微信支付", verifyStatus: "已核销" },
  { id: 8, product: "恋爱技巧培训课", merchant: "幸福起点婚介所", buyer: "郑晓燕", orderTime: "2026-07-10 10:15:00", status: "已付款", amount: "¥199", payMethod: "微信支付", verifyStatus: "待核销" },
];

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
      pagination={{ current: 1, pageSize: 10, total: 8 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
