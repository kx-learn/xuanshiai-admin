"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "月份", key: "month", width: 100 },
  { title: "新增男会员", key: "newMaleMember", width: 110, align: "center" },
  { title: "新增女会员", key: "newFemaleMember", width: 110, align: "center" },
  { title: "新增客源线索", key: "newLead", width: 120, align: "center" },
  { title: "新增线上VIP会员", key: "newOnlineVip", width: 140, align: "center" },
  { title: "新增牵线申请", key: "newMatchApply", width: 120, align: "center" },
  { title: "新增线下约会", key: "newOfflineDate", width: 120, align: "center" },
  { title: "新增线下VIP会员", key: "newOfflineVip", width: 140, align: "center" },
  { title: "线上分成", key: "onlineBonus", width: 100, align: "right" },
  { title: "线下业绩", key: "offlineRevenue", width: 100, align: "right" },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "时间范围", type: "dateRange" },
];

export default function BranchReportListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("分店管理", "分店报表")}
      pageTitle="分店报表"
      searchFields={searchFields}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
