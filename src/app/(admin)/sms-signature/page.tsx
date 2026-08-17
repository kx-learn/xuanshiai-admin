"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "签名ID", key: "signId" },
  { title: "签名内容", key: "signContent" },
  { title: "签名来源", key: "signSource" },
  { title: "备注", key: "remark" },
  {
    title: "审核状态",
    key: "status",
    render: (row: Record<string, unknown>) => {
      const s = String(row.status ?? "");
      const colorMap: Record<string, string> = {
        "已通过": "bg-[#f6ffed] text-[#52c41a] border-[#b7eb8f]",
        "审核中": "bg-[#fff7e6] text-[#fa8c16] border-[#ffd591]",
        "未通过": "bg-[#fff1f0] text-[#ff4d4f] border-[#ffa39e]",
      };
      return <span className={`inline-block px-2 py-0.5 text-xs rounded border ${colorMap[s] || ""}`}>{s}</span>;
    },
  },
  { title: "创建时间", key: "createTime" },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: (row: Record<string, unknown>) => {
      const s = String(row.status ?? "");
      return (
        <span className="flex items-center gap-2">
          <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">编辑</button>
          {s !== "审核中" && <button className="text-sm text-[#ff4d4f] hover:text-[#ff7875]">删除</button>}
        </span>
      );
    },
  },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统设置", "短信签名")}
      pageTitle="短信签名"
      actions={[
        { label: "申请签名", variant: "primary" },
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
