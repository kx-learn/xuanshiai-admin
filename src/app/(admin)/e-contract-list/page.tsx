"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "合同编号", key: "contractNo" },
  { title: "签署人", key: "signer" },
  { title: "合同类型", key: "contractType" },
  { title: "签署时间", key: "signTime" },
  {
    title: "状态",
    key: "status",
    width: 80,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const colorMap: Record<string, string> = {
        "已签署": "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]",
        "待签署": "inline-block px-2 py-0.5 text-xs rounded bg-[#fff7e6] text-[#fa8c16] border border-[#ffd591]",
        "已过期": "inline-block px-2 py-0.5 text-xs rounded bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]",
        "已取消": "inline-block px-2 py-0.5 text-xs rounded bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]",
      };
      return <span className={colorMap[status] || ""}>{status}</span>;
    },
  },
  {
    title: "操作",
    key: "action",
    width: 140,
    render: () => (
      <span className="flex items-center gap-2">
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">查看</button>
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">下载</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

export default function EContractListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "合同管理")}
      pageTitle="合同管理"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      searchFields={[
        { label: "合同编号", type: "input", placeholder: "请输入合同编号" },
        { label: "会员姓名", type: "input", placeholder: "请输入会员姓名" },
        { label: "状态", type: "select", options: [
          { label: "全部", value: "" },
          { label: "待签署", value: "pending" },
          { label: "已签署", value: "signed" },
          { label: "已过期", value: "expired" },
          { label: "已取消", value: "cancelled" },
        ]},
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
