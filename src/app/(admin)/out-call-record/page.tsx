"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "记录编号", key: "recordNo" },
  { title: "被叫号码", key: "calledNumber" },
  { title: "主叫号码", key: "callerNumber" },
  { title: "呼叫时间", key: "callTime" },
  { title: "通话时长", key: "duration" },
  {
    title: "呼叫结果",
    key: "result",
    render: (row: Record<string, unknown>) => {
      const r = String(row.result ?? "");
      const colorMap: Record<string, string> = {
        "已接通": "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]",
        "未接通": "bg-[#fff1f0] text-[#ff4d4f] border-[#ffa39e]",
        "用户忙": "bg-[#fff7e6] text-[#fa8c16] border-[#ffd591]",
      };
      return <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colorMap[r] || ""}`}>{r}</span>;
    },
  },
  { title: "录音文件", key: "recording" },
  {
    title: "操作",
    key: "action",
    width: 100,
    render: () => (
      <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">详情</button>
    ),
  },
];

const data: Record<string, unknown>[] = [
  { id: 1, recordNo: "REC20260714001", calledNumber: "138****1234", callerNumber: "400-123-4567", callTime: "2026-07-14 08:30:00", duration: "12分30秒", result: "已接通", recording: "播放" },
  { id: 2, recordNo: "REC20260714002", calledNumber: "139****5678", callerNumber: "400-123-4567", callTime: "2026-07-14 09:15:00", duration: "5分10秒", result: "已接通", recording: "播放" },
  { id: 3, recordNo: "REC20260714003", calledNumber: "137****9012", callerNumber: "400-123-4567", callTime: "2026-07-14 10:00:00", duration: "-", result: "未接通", recording: "-" },
  { id: 4, recordNo: "REC20260714004", calledNumber: "136****3456", callerNumber: "400-123-4567", callTime: "2026-07-14 10:30:00", duration: "-", result: "用户忙", recording: "-" },
  { id: 5, recordNo: "REC20260713005", calledNumber: "135****7890", callerNumber: "400-123-4567", callTime: "2026-07-13 14:20:00", duration: "8分45秒", result: "已接通", recording: "播放" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统设置", "呼叫记录")}
      pageTitle="呼叫记录"
      searchFields={[
        { label: "被叫号码", type: "input", placeholder: "请输入被叫号码" },
        { label: "时间范围", type: "dateRange" },
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
