"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 50 },
  { title: "申请人", key: "applicant", width: 250 },
  { title: "兑换礼物", key: "gift", width: 120 },
  { title: "积分", key: "points", width: 80, align: "center" },
  { title: "申请兑换时间", key: "time", width: 170 },
  {
    title: "状态",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const colorMap: Record<string, string> = {
        "兑换成功": "#52c41a",
        "等待审核": "#faad14",
        "兑换失败": "#ff4d4f",
      };
      const bgMap: Record<string, string> = {
        "兑换成功": "#f6ffed",
        "等待审核": "#fffbe6",
        "兑换失败": "#fff2f0",
      };
      const borderMap: Record<string, string> = {
        "兑换成功": "#b7eb8f",
        "等待审核": "#ffe58f",
        "兑换失败": "#ffccc7",
      };
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: colorMap[status] || "#666",
            backgroundColor: bgMap[status] || "#f5f5f5",
            border: `1px solid ${borderMap[status] || "#d9d9d9"}`,
          }}
        >
          {status}
        </span>
      );
    },
  },
  {
    title: "操作",
    key: "action",
    width: 160,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      return (
        <span className="flex items-center gap-2">
          {status === "等待审核" && <span className="text-[#52c41a] cursor-pointer hover:opacity-80">兑换成功</span>}
          {status === "等待审核" && <span className="text-[#ff4d4f] cursor-pointer hover:opacity-80">兑换失败</span>}
          <span className="text-[#ff4d4f] cursor-pointer hover:opacity-80">删除</span>
        </span>
      );
    },
  },
];

const data: Record<string, unknown>[] = [];

const actions: ActionButton[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("积分商城", "兑换管理")}
      pageTitle="兑换管理"
      searchFields={[
        { label: "申请人", type: "input", placeholder: "请输入申请人", width: 180 },
        { label: "状态", type: "select", options: [{ label: "全部", value: "" }, { label: "等待审核", value: "pending" }, { label: "兑换成功", value: "success" }, { label: "兑换失败", value: "failed" }], width: 120 },
      ]}
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
