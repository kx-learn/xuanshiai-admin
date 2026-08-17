"use client";

import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const statusLabel: Record<string, string> = {
  PENDING_REVIEW: "待审核",
  APPROVED: "已通过",
  REJECTED: "已驳回",
  PROCESSING: "处理中",
  SUCCEEDED: "已完成",
  FAILED: "失败",
};

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "账户", key: "account_id", width: 110, render: (row) => `${String(row.account_type ?? "-")} / ${String(row.account_id ?? "-")}` },
  { title: "提现金额", key: "amount", width: 120, render: (row) => <span className="font-medium text-[#ff4d4f]">¥{String(row.amount ?? "0.00")}</span> },
  { title: "收款账户", key: "payee_masked", width: 180 },
  { title: "申请时间", key: "created_at", width: 180 },
  { title: "状态", key: "status", width: 100, render: (row) => {
    const status = String(row.status ?? "");
    const className = status === "SUCCEEDED" ? "text-[#52c41a]" : status === "REJECTED" || status === "FAILED" ? "text-[#ff4d4f]" : "text-[#fa8c16]";
    return <span className={className}>{statusLabel[status] ?? status}</span>;
  } },
  { title: "失败原因", key: "failure_reason", width: 180 },
];

export default function SystemCashoutHistoryPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "余额提现")}
      pageTitle="余额提现"
      tabs={[
        { key: "all", label: "全部" },
        { key: "PENDING_REVIEW", label: "待审核" },
        { key: "SUCCEEDED", label: "已完成" },
        { key: "REJECTED", label: "已驳回" },
      ]}
      searchFields={[
        { label: "账户 ID", type: "input", placeholder: "请输入账户 ID", width: 140 },
        { label: "状态", type: "select", options: Object.entries(statusLabel).map(([value, label]) => ({ value, label })) },
        { label: "时间范围", type: "dateRange" },
      ]}
      columns={columns}
      dataSource={[]}
      rowKey="id"
      endpoint="/api/backend/admin/finance/withdrawals?page=1&page_size=20"
      pagination={{ current: 1, pageSize: 20, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
