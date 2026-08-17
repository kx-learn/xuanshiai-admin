"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 50 },
  { title: "活动名称", key: "name", width: 280 },
  { title: "链接/二维码", key: "link", width: 80, align: "center" },
  { title: "分享海报", key: "poster", width: 80, align: "center" },
  {
    title: "活动状态",
    key: "activityStatus",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.activityStatus ?? "");
      const isActive = status === "报名中";
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: isActive ? "#52c41a" : "#999",
            backgroundColor: isActive ? "#f6ffed" : "#f5f5f5",
            border: `1px solid ${isActive ? "#b7eb8f" : "#d9d9d9"}`,
          }}
        >
          {status}
        </span>
      );
    },
  },
  { title: "报名人数", key: "signups", width: 140 },
  { title: "创建时间", key: "createTime", width: 160 },
  {
    title: "审核状态",
    key: "auditStatus",
    width: 70,
    render: (row: Record<string, unknown>) => {
      const status = String(row.auditStatus ?? "");
      return (
        <span style={{ color: status === "通过" ? "#52c41a" : "#999" }}>
          {status}
        </span>
      );
    },
  },
  {
    title: "上线",
    key: "online",
    width: 60,
    render: (row: Record<string, unknown>) => {
      const status = String(row.online ?? "");
      return (
        <span style={{ color: status === "上线" ? "#52c41a" : "#999" }}>
          {status}
        </span>
      );
    },
  },
  { title: "操作", key: "action", width: 200 },
];

const data: Record<string, unknown>[] = [];

const actions: ActionButton[] = [
  { label: "发布活动", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("活动报名", "活动管理")}
      pageTitle="活动管理"
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
