"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "日期", key: "date" },
  { title: "新增注册", key: "newRegistrations" },
  { title: "新增VIP", key: "newVip" },
  { title: "活跃用户", key: "activeUsers" },
  { title: "牵线次数", key: "matchCount" },
  { title: "成功脱单", key: "successCount" },
];

const data: Record<string, unknown>[] = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  date: `2026-07-${String(13 - i).padStart(2, "0")}`,
  newRegistrations: String(Math.floor(Math.random() * 40) + 10),
  newVip: String(Math.floor(Math.random() * 15) + 2),
  activeUsers: String(Math.floor(Math.random() * 200) + 100),
  matchCount: String(Math.floor(Math.random() * 30) + 5),
  successCount: String(Math.floor(Math.random() * 5)),
}));

export default function LoveUserStatisticsPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员CRM", "数据报表")}
      pageTitle="会员数据报表"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      searchFields={[
        { label: "日期范围", type: "dateRange" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
