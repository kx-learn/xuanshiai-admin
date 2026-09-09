"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "时间", key: "date" },
  { title: "成功付款笔数", key: "pay_count", width: 140, render: (row) => <span className="font-medium">{String(row.pay_count ?? "0")} 笔</span> },
  { title: "收入金额", key: "income_amount", width: 160, render: (row) => <span className="font-medium text-[#ff4d4f]">¥{String(row.income_amount ?? "0.00")}</span> },
  { title: "已退款", key: "refund_amount", width: 160, render: (row) => <span className="text-[#ff4d4f]">¥{String(row.refund_amount ?? "0.00")}</span> },
];

export default function FinanceStatisticPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "统计报表")}
      pageTitle="统计报表"
      columns={columns}
      dataSource={[]}
      rowKey="date"
      endpoint="/api/backend/admin/finance/daily-report"
      searchFields={[
        { label: "时间范围", type: "dateRange", dateKeys: { from: "start_date", to: "end_date" } },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
