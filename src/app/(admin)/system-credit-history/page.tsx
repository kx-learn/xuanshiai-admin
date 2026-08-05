"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "会员昵称", key: "nickname" },
  {
    title: "积分变动",
    key: "change",
    render: (row: Record<string, unknown>) => {
      const num = Number(row.change);
      return (
        <span className={`font-medium ${num >= 0 ? "text-[#52c41a]" : "text-[#ff4d4f]"}`}>
          {num >= 0 ? `+${num}` : num}
        </span>
      );
    },
  },
  {
    title: "变动类型",
    key: "changeType",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const type = String(row.changeType ?? "");
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded border ${type === "获得" ? "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]" : "bg-[#fff1f0] text-[#ff4d4f] border-[#ffa39e]"}`}>
          {type}
        </span>
      );
    },
  },
  { title: "余额", key: "balance" },
  { title: "说明", key: "description" },
  { title: "时间", key: "time" },
];

const data: Record<string, unknown>[] = [
  { id: 1, nickname: "张三", change: 100, changeType: "获得", balance: 1100, description: "每日签到奖励", time: "2026-07-13 09:00:00" },
  { id: 2, nickname: "李四", change: 50, changeType: "获得", balance: 580, description: "完善个人资料奖励", time: "2026-07-12 10:13:00" },
  { id: 3, nickname: "王五", change: 200, changeType: "获得", balance: 2100, description: "邀请好友注册奖励", time: "2026-07-11 11:26:00" },
  { id: 4, nickname: "赵六", change: 10, changeType: "获得", balance: 150, description: "首次发布动态", time: "2026-07-10 12:39:00" },
  { id: 5, nickname: "孙七", change: 500, changeType: "获得", balance: 5200, description: "参加线下活动奖励", time: "2026-07-09 13:52:00" },
  { id: 6, nickname: "周八", change: 100, changeType: "获得", balance: 800, description: "连续签到7天奖励", time: "2026-07-08 14:05:00" },
  { id: 7, nickname: "吴九", change: 30, changeType: "获得", balance: 300, description: "分享文章到朋友圈", time: "2026-07-07 15:18:00" },
  { id: 8, nickname: "郑十", change: 1000, changeType: "获得", balance: 6000, description: "购买VIP会员赠送", time: "2026-07-06 16:31:00" },
  { id: 9, nickname: "钱十一", change: -50, changeType: "消费", balance: 550, description: "兑换玫瑰花束", time: "2026-07-05 17:44:00" },
  { id: 10, nickname: "刘十二", change: -100, changeType: "消费", balance: 480, description: "兑换牵线服务折扣券", time: "2026-07-04 18:57:00" },
  { id: 11, nickname: "陈十三", change: -200, changeType: "消费", balance: 200, description: "兑换VIP周卡", time: "2026-07-03 19:10:00" },
  { id: 12, nickname: "杨十四", change: -30, changeType: "消费", balance: 170, description: "兑换活动报名优惠券", time: "2026-07-02 20:23:00" },
];

export default function SystemCreditHistoryPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "积分明细")}
      pageTitle="积分明细"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      searchFields={[
        { label: "会员", type: "input", placeholder: "请输入会员昵称" },
        { label: "积分类型", type: "select", options: [
          { label: "全部", value: "" },
          { label: "获得", value: "earn" },
          { label: "消费", value: "spend" },
        ]},
        { label: "时间范围", type: "dateRange" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
