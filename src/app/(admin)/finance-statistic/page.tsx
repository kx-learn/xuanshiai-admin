"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "时间", key: "date" },
  { title: "成功付款笔数", key: "payCount" },
  { title: "收入金额", key: "incomeAmount" },
  { title: "已退款", key: "refund" },
];

const data: Record<string, unknown>[] = [];

export default function FinanceStatisticPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "统计报表")}
      pageTitle="统计报表"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      searchFields={[
        { label: "时间范围", type: "dateRange" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
