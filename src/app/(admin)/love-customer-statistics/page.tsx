"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type TabConfig } from "@/components/ListPage";

const tabs: TabConfig[] = [
  { key: "follow-statistics", label: "客户跟进统计" },
  { key: "intention-statistics", label: "客户意向统计" },
  { key: "source-statistics", label: "客户来源统计" },
  { key: "status-statistics", label: "客源状态统计" },
  { key: "increment-statistics", label: "客户增量统计" },
  { key: "assign-statistics", label: "客源分派统计" },
  { key: "promote-statistics", label: "推广红娘获客统计" },
];

const columns: ColumnDef[] = [
  { title: "红娘", key: "matchmaker" },
  { title: "名下客源", key: "customerCount" },
  { title: "从未跟进", key: "neverFollowed" },
  { title: "超3天未跟进", key: "over3Days" },
  { title: "超7天未跟进", key: "over7Days" },
  { title: "超15天未跟进", key: "over15Days" },
  { title: "超30天未跟进", key: "over30Days" },
  { title: "跟进总条数", key: "totalFollowUps" },
  { title: "本月跟进条数", key: "monthFollowUps" },
];

const data: Record<string, unknown>[] = [
  {
    id: 1,
    matchmaker: "芸希老师",
    customerCount: "0",
    neverFollowed: "0",
    over3Days: "0",
    over7Days: "0",
    over15Days: "0",
    over30Days: "0",
    totalFollowUps: "0条",
    monthFollowUps: "0条",
  },
];

export default function LoveCustomerStatisticsPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("客源线索", "数据报表")}
      pageTitle="数据报表"
      tabs={tabs}
      activeTab="follow-statistics"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 1 }}
      searchFields={[]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
