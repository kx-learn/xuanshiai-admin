"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 70, align: "center" },
  { title: "合伙人", key: "partnerName", width: 150 },
  {
    title: "分成来源",
    key: "bonusSource",
    width: 130,
    render: (row: Record<string, unknown>) => {
      const source = row.bonusSource as string;
      const colors: Record<string, string> = {
        "注册奖励": "bg-[#edf2ff] text-[#3658f7] border-[#adc6ff]",
        "消费分成": "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]",
        "团队奖励": "bg-[#fff7e6] text-[#fa8c16] border-[#ffd591]",
        "活动奖励": "bg-[#fff0f6] text-[#eb2f96] border-[#ffadd2]",
      };
      const cls = colors[source] || "bg-[#f5f5f5] text-[#999] border-[#d9d9d9]";
      return <span className={`inline-block px-2 py-0.5 text-xs rounded border ${cls}`}>{source}</span>;
    },
  },
  { title: "相关订单/会员", key: "relatedInfo", width: 160 },
  { title: "消费金额", key: "orderAmount", width: 110 },
  { title: "分成金额", key: "bonusAmount", width: 110 },
  { title: "分成时间", key: "bonusTime", width: 180 },
];

const data: Record<string, unknown>[] = [
  { id: 1, partnerName: "出现1", bonusSource: "注册奖励", relatedInfo: "会员：Thera（G824771）", orderAmount: "-", bonusAmount: "1元", bonusTime: "2026-07-10 14:10:38" },
  { id: 2, partnerName: "出现1", bonusSource: "消费分成", relatedInfo: "订单：DD20260708001", orderAmount: "299元", bonusAmount: "14.95元", bonusTime: "2026-07-08 16:32:00" },
  { id: 3, partnerName: "出现1", bonusSource: "团队奖励", relatedInfo: "6月份团队奖励", orderAmount: "-", bonusAmount: "50元", bonusTime: "2026-07-01 00:00:00" },
];

const searchFields: SearchField[] = [
  { label: "合伙人", type: "input", placeholder: "请输入合伙人账号", width: 180 },
  { label: "分成来源", type: "select", options: [{ label: "全部", value: "" }, { label: "注册奖励", value: "register" }, { label: "消费分成", value: "consumption" }, { label: "团队奖励", value: "team" }, { label: "活动奖励", value: "activity" }], width: 130 },
  { label: "时间范围", type: "dateRange" },
];

export default function LovePartnerBonusDetailsPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("合伙红娘", "分成明细")}
      pageTitle="分成明细"
      searchFields={searchFields}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 3 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
