"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "印章名称", key: "sealName" },
  { title: "印章类型", key: "sealType" },
  { title: "创建时间", key: "createTime" },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      return (
        <span className={status === "启用" ? "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "inline-block px-2 py-0.5 text-xs rounded bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]"}>
          {status}
        </span>
      );
    },
  },
  {
    title: "操作",
    key: "action",
    width: 140,
    render: () => (
      <span className="flex items-center gap-2">
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">编辑</button>
        <button type="button" className="text-[#ff4d4f] hover:text-[#ff7875] text-sm cursor-pointer bg-transparent border-none p-0">删除</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

export default function EContractYinzhangPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "印章管理")}
      pageTitle="印章管理"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      actions={[
        { label: "添加印章", variant: "primary" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
