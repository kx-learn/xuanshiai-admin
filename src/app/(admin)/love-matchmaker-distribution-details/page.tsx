"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70, align: "center" },
  { title: "红娘姓名", key: "matchmakerName", width: 120 },
  { title: "订单金额", key: "orderAmount", width: 120 },
  { title: "分成金额", key: "bonusAmount", width: 120 },
  {
    title: "分成类型",
    key: "bonusType",
    width: 120,
    render: (row: Record<string, unknown>) => {
      const type = String(row.bonusType ?? "");
      return (
        <span className="inline-block px-2 py-0.5 text-xs rounded bg-[#edf2ff] text-[#3658f7] border border-[#adc6ff]">
          {type}
        </span>
      );
    },
  },
  { title: "时间", key: "time", width: 180 },
  {
    title: "状态",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const isSettled = status === "已结算";
      return (
        <span className={isSettled ? "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "inline-block px-2 py-0.5 text-xs rounded bg-[#fffbe6] text-[#faad14] border border-[#ffe58f]"}>
          {status}
        </span>
      );
    },
  },
];

interface DetailsRow {
  id: number;
  matchmakerName: string;
  orderAmount: number;
  bonusAmount: number;
  bonusType: string;
  time: string;
  status: string;
}

const data: DetailsRow[] = [
  { id: 1, matchmakerName: "红娘张丽", orderAmount: 3200, bonusAmount: 800, bonusType: "牵线成功", time: "2026-01-01 08:00:00", status: "已结算" },
  { id: 2, matchmakerName: "红娘王芳", orderAmount: 1800, bonusAmount: 450, bonusType: "会员充值", time: "2026-02-01 09:03:00", status: "已结算" },
  { id: 3, matchmakerName: "红娘李华", orderAmount: 4500, bonusAmount: 1200, bonusType: "活动奖励", time: "2026-03-01 10:06:00", status: "待结算" },
  { id: 4, matchmakerName: "红娘赵敏", orderAmount: 2500, bonusAmount: 600, bonusType: "推广分成", time: "2026-04-01 11:09:00", status: "已结算" },
  { id: 5, matchmakerName: "红娘孙静", orderAmount: 3800, bonusAmount: 950, bonusType: "牵线成功", time: "2026-05-01 12:12:00", status: "已结算" },
  { id: 6, matchmakerName: "红娘周婷", orderAmount: 1500, bonusAmount: 375, bonusType: "会员充值", time: "2026-06-01 13:15:00", status: "已结算" },
  { id: 7, matchmakerName: "红娘吴秀", orderAmount: 5000, bonusAmount: 1500, bonusType: "活动奖励", time: "2026-07-01 14:18:00", status: "待结算" },
  { id: 8, matchmakerName: "红娘郑雅", orderAmount: 2100, bonusAmount: 525, bonusType: "推广分成", time: "2026-01-15 15:21:00", status: "已结算" },
  { id: 9, matchmakerName: "红娘陈洁", orderAmount: 4200, bonusAmount: 1050, bonusType: "牵线成功", time: "2026-02-15 16:24:00", status: "已结算" },
  { id: 10, matchmakerName: "红娘林娜", orderAmount: 2800, bonusAmount: 700, bonusType: "会员充值", time: "2026-03-15 17:27:00", status: "已结算" },
  { id: 11, matchmakerName: "红娘何月", orderAmount: 3600, bonusAmount: 900, bonusType: "活动奖励", time: "2026-04-15 18:30:00", status: "待结算" },
  { id: 12, matchmakerName: "红娘刘萍", orderAmount: 1900, bonusAmount: 475, bonusType: "推广分成", time: "2026-05-15 19:33:00", status: "已结算" },
];

const searchFields: SearchField[] = [
  { label: "红娘姓名", type: "input", placeholder: "请输入红娘姓名", width: 180 },
  { label: "时间范围", type: "dateRange" },
];

const dataSource = data as unknown as Record<string, unknown>[];

export default function LoveMatchmakerDistributionDetailsPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("总店红娘", "分成明细")}
      pageTitle="分成明细"
      searchFields={searchFields}
      columns={columns}
      dataSource={dataSource}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 12 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
