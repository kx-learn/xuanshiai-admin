"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "时间", key: "date" },
  { title: "成功付款笔数", key: "payCount" },
  { title: "收入金额", key: "incomeAmount" },
  { title: "已退款", key: "refund" },
];

const data: Record<string, unknown>[] = [
  { id: 1, date: "2026-07-13", payCount: "0笔", incomeAmount: "0元", refund: "0元，0笔" },
  { id: 2, date: "2026-07-12", payCount: "0笔", incomeAmount: "0元", refund: "0元，0笔" },
  { id: 3, date: "2026-07-11", payCount: "1笔", incomeAmount: "98元", refund: "98元，1笔" },
  { id: 4, date: "2026-07-10", payCount: "1笔", incomeAmount: "99元", refund: "0元，0笔" },
  { id: 5, date: "2026-07-09", payCount: "0笔", incomeAmount: "0元", refund: "0元，0笔" },
  { id: 6, date: "2026-07-08", payCount: "2笔", incomeAmount: "196元", refund: "0元，0笔" },
  { id: 7, date: "2026-07-07", payCount: "0笔", incomeAmount: "0元", refund: "0元，0笔" },
  { id: 8, date: "2026-07-06", payCount: "0笔", incomeAmount: "0元", refund: "0元，0笔" },
  { id: 9, date: "2026-07-05", payCount: "1笔", incomeAmount: "98元", refund: "0元，0笔" },
  { id: 10, date: "2026-07-04", payCount: "0笔", incomeAmount: "0元", refund: "0元，0笔" },
];

export default function FinanceStatisticPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "统计报表")}
      pageTitle="统计报表"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 10 }}
      searchFields={[
        { label: "时间范围", type: "dateRange" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
