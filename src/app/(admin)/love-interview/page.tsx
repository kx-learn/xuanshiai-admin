"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "提交人", key: "user_id", width: 180 },
  { title: "想约见", key: "target_user_id", width: 180 },
  { title: "提交时间", key: "created_at", width: 160 },
  { title: "红娘", key: "matchmaker_id", width: 100 },
  {
    title: "状态标记",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const isPending = status === "PENDING" || status === "0" || status === "待处理";
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: isPending ? "#fa8c16" : "#52c41a",
            backgroundColor: isPending ? "#fff7e6" : "#f6ffed",
            border: `1px solid ${isPending ? "#ffd591" : "#b7eb8f"}`,
          }}
        >
          {status === "PENDING" || status === "0" ? "待处理" : status || "已处理"}
        </span>
      );
    },
  },
  { title: "操作", key: "action", width: 200 },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "申请人", type: "input", placeholder: "请输入申请人", width: 160 },
  { label: "被申请人", type: "input", placeholder: "请输入被申请人", width: 160 },
  { label: "时间", type: "dateRange" },
];

const actions: ActionButton[] = [
  { label: "添加约见记录", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员服务", "约见申请")}
      pageTitle="约见申请"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      endpoint="/api/backend/admin/matchmaker/meetings/requests"
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
