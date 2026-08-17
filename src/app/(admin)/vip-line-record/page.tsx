"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "申请牵线人", key: "initiator", width: 200 },
  { title: "牵线对象", key: "target", width: 200 },
  { title: "牵线红娘", key: "matchmaker", width: 100 },
  { title: "支付状态", key: "payStatus", width: 90 },
  {
    title: "牵线状态",
    key: "matchStatus",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.matchStatus ?? "");
      const colorMap: Record<string, string> = {
        "成功": "#52c41a",
        "失败": "#ff4d4f",
        "待牵线": "#1890ff",
        "牵线中": "#fa8c16",
      };
      const bgMap: Record<string, string> = {
        "成功": "#f6ffed",
        "失败": "#fff1f0",
        "待牵线": "#e6f7ff",
        "牵线中": "#fff7e6",
      };
      const borderMap: Record<string, string> = {
        "成功": "#b7eb8f",
        "失败": "#ffa39e",
        "待牵线": "#91d5ff",
        "牵线中": "#ffd591",
      };
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: colorMap[status] || "#999",
            backgroundColor: bgMap[status] || "#f5f5f5",
            border: `1px solid ${borderMap[status] || "#d9d9d9"}`,
          }}
        >
          {status || "-"}
        </span>
      );
    },
  },
  { title: "申请时间", key: "applyTime", width: 160 },
  { title: "完成时间", key: "completeTime", width: 160 },
  { title: "操作", key: "action", width: 120 },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "操作人", type: "select", placeholder: "全部操作人", options: [{ label: "全部操作人", value: "" }], width: 140 },
  { label: "服务红娘", type: "select", placeholder: "全部服务红娘", options: [{ label: "全部服务红娘", value: "" }], width: 140 },
  { label: "时间", type: "dateRange" },
  { label: "搜索", type: "select", placeholder: "按申请人昵称搜", options: [{ label: "按申请人昵称搜", value: "nickname" }, { label: "按编号搜", value: "id" }], width: 150 },
  { label: "", type: "input", placeholder: "请输入", width: 180 },
];

const actions: ActionButton[] = [
  { label: "添加牵线记录", variant: "primary" },
  { label: "导出EXCEL", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("会员服务", "红娘牵线")}
      pageTitle="红娘牵线"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 20, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
