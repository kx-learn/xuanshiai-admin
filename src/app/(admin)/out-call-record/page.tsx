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

const data: Record<string, unknown>[] = [];

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
