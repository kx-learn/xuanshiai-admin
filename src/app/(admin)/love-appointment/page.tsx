"use client";

import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 80 },
  { title: "申请单 ID", key: "request_id", width: 100 },
  { title: "组织/门店", key: "organization_id", width: 110 },
  { title: "组织者", key: "organizer_id", width: 100 },
  { title: "约见时间", key: "scheduled_at", width: 180 },
  { title: "地点", key: "location", width: 240 },
  {
    title: "状态",
    key: "status",
    width: 110,
    render: (row) => {
      const status = String(row.status ?? "");
      const label: Record<string, string> = {
        SCHEDULED: "已安排",
        REMINDED: "已提醒",
        CHECKED_IN: "已签到",
        COMPLETED: "已完成",
        CANCELLED: "已取消",
        NO_SHOW: "未到场",
      };
      const className = status === "COMPLETED" ? "text-[#52c41a]" : status === "CANCELLED" || status === "NO_SHOW" ? "text-[#ff4d4f]" : "text-[#3658f7]";
      return <span className={className}>{label[status] ?? status}</span>;
    },
  },
  { title: "取消原因", key: "cancel_reason", width: 180 },
  { title: "创建时间", key: "created_at", width: 180 },
];

export default function LoveAppointmentPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员服务", "预约管理")}
      pageTitle="约见管理"
      searchFields={[
        { label: "状态", type: "select", options: [
          { label: "已安排", value: "SCHEDULED" },
          { label: "已提醒", value: "REMINDED" },
          { label: "已签到", value: "CHECKED_IN" },
          { label: "已完成", value: "COMPLETED" },
          { label: "已取消", value: "CANCELLED" },
          { label: "未到场", value: "NO_SHOW" },
        ] },
        { label: "时间范围", type: "dateRange" },
      ]}
      columns={columns}
      dataSource={[]}
      rowKey="id"
      endpoint="/api/backend/admin/matchmaker/meetings?page=1&page_size=20"
      pagination={{ current: 1, pageSize: 20, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
