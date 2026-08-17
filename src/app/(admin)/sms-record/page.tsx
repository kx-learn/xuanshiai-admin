"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "发送时间", key: "sendTime" },
  { title: "手机号码", key: "phone" },
  { title: "短信内容", key: "content" },
  { title: "短信类型", key: "smsType" },
  { title: "发送结果", key: "result",
    render: (row: Record<string, unknown>) => {
      const s = String(row.result ?? "");
      const colorMap: Record<string, string> = {
        "成功": "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]",
        "失败": "bg-[#fff1f0] text-[#ff4d4f] border-[#ffa39e]",
      };
      return <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colorMap[s] || ""}`}>{s}</span>;
    },
  },
  { title: "失败原因", key: "failReason" },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统设置", "短信发送记录")}
      pageTitle="短信发送记录"
      searchFields={[
        { label: "手机号码", type: "input", placeholder: "请输入手机号码" },
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
