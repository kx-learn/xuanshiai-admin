"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60, align: "center" },
  { title: "时间", key: "time", width: 180 },
  { title: "推广红娘", key: "promoter", width: 100 },
  { title: "消费会员", key: "member", width: 200 },
  {
    title: "分成/奖励事件",
    key: "bonusEvent",
    width: 130,
    render: (row: Record<string, unknown>) => {
      const event = String(row.bonusEvent ?? "");
      const colors: Record<string, string> = {
        "会员注册奖励": "bg-[#edf2ff] text-[#3658f7] border-[#adc6ff]",
        "活动报名": "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]",
      };
      const cls = colors[event] || "bg-[#f5f5f5] text-[#999] border-[#d9d9d9]";
      return <span className={`inline-block px-2 py-0.5 text-xs rounded border ${cls}`}>{event}</span>;
    },
  },
  { title: "分成金额", key: "bonusAmount", width: 100, align: "right" },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "推广红娘", type: "input", placeholder: "请输入红娘姓名", width: 160 },
  { label: "时间范围", type: "dateRange" },
];

const actions: ActionButton[] = [
  { label: "录入一笔分成", variant: "primary", onClick: () => {} },
  { label: "导出EXCEL", onClick: () => {} },
];

export default function PoploveMatchmakerDistributionDetailsPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("推广红娘", "分成明细")}
      pageTitle="分成明细"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
