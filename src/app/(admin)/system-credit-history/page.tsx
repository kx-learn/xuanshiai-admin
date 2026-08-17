"use client";

import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "账户", key: "account_id", width: 120, render: (row) => `${String(row.account_type ?? "-")} / ${String(row.account_id ?? "-")}` },
  { title: "方向", key: "direction", width: 80, render: (row) => String(row.direction) === "CREDIT" ? <span className="text-[#52c41a]">收入</span> : <span className="text-[#ff4d4f]">支出</span> },
  { title: "金额", key: "amount", width: 110, render: (row) => `¥${String(row.amount ?? "0.00")}` },
  { title: "状态", key: "state", width: 100 },
  { title: "来源类型", key: "source_type", width: 150 },
  { title: "来源 ID", key: "source_id", width: 100 },
  { title: "幂等键", key: "idempotency_key", width: 260 },
  { title: "时间", key: "created_at", width: 180 },
];

export default function SystemCreditHistoryPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "资金流水")}
      pageTitle="资金流水"
      searchFields={[
        { label: "账户类型", type: "input", placeholder: "user / store", width: 140 },
        { label: "账户 ID", type: "input", placeholder: "请输入账户 ID", width: 120 },
        { label: "时间范围", type: "dateRange" },
      ]}
      columns={columns}
      dataSource={[]}
      rowKey="id"
      endpoint="/api/backend/admin/finance/ledger?page=1&page_size=20"
      pagination={{ current: 1, pageSize: 20, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
