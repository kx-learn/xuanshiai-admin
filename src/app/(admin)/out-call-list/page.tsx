"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "呼叫编号", key: "callNo" },
  { title: "被叫号码", key: "calledNumber" },
  { title: "主叫号码", key: "callerNumber" },
  { title: "呼叫时间", key: "callTime" },
  { title: "通话时长", key: "duration" },
  {
    title: "呼叫状态",
    key: "status",
    render: (row: Record<string, unknown>) => {
      const s = String(row.status ?? "");
      const colorClass = "已接通" === s ? "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]" : "bg-[#fff1f0] text-[#ff4d4f] border-[#ffa39e]";
      return <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colorClass}`}>{s}</span>;
    },
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <span className="flex items-center gap-2">
        <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">详情</button>
        <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">录音</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, callNo: "CALL20260714001", calledNumber: "138****1234", callerNumber: "400-123-4567", callTime: "2026-07-14 08:30:00", duration: "12分30秒", status: "已接通" },
  { id: 2, callNo: "CALL20260714002", calledNumber: "139****5678", callerNumber: "400-123-4567", callTime: "2026-07-14 09:15:00", duration: "5分10秒", status: "已接通" },
  { id: 3, callNo: "CALL20260714003", calledNumber: "137****9012", callerNumber: "400-123-4567", callTime: "2026-07-14 10:00:00", duration: "-", status: "未接通" },
  { id: 4, callNo: "CALL20260713004", calledNumber: "136****3456", callerNumber: "400-123-4567", callTime: "2026-07-13 14:20:00", duration: "8分45秒", status: "已接通" },
  { id: 5, callNo: "CALL20260713005", calledNumber: "135****7890", callerNumber: "400-123-4567", callTime: "2026-07-13 15:30:00", duration: "3分20秒", status: "已接通" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统设置", "外呼状态")}
      pageTitle="外呼状态"
      searchFields={[
        { label: "被叫号码", type: "input", placeholder: "请输入被叫号码" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
