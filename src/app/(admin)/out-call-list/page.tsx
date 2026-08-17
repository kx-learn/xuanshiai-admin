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

const data: Record<string, unknown>[] = [];

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
