"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70, align: "center" },
  { title: "门店名称", key: "storeName", width: 150 },
  { title: "所属分站", key: "branch", width: 120 },
  { title: "店长", key: "storeManager", width: 100 },
  { title: "联系电话", key: "phone", width: 130 },
  { title: "地址", key: "address", width: 200 },
  { title: "创建时间", key: "createTime", width: 130 },
  {
    title: "状态",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const isOpen = status === "营业中";
      return (
        <span className={`inline-block px-2 py-0.5 text-xs rounded ${isOpen ? "bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "bg-[#f5f5f5] text-[#999] border border-[#d9d9d9]"}`}>
          {status}
        </span>
      );
    },
  },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: (_row: Record<string, unknown>) => (
      <span className="flex items-center gap-2">
        <button className="text-[#3658f7] hover:text-[#6b85ff] text-sm">编辑</button>
        <button className="text-[#ff4d4f] hover:text-[#ff7875] text-sm">删除</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "门店名称", type: "input", placeholder: "请输入门店名称", width: 160 },
  { label: "所属分站", type: "select", options: [{ label: "全部", value: "" }], width: 130 },
];

const actions: ActionButton[] = [
  { label: "新增门店", variant: "primary", onClick: () => {} },
];

export default function MendianListPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("分店管理", "门店管理")}
      pageTitle="门店管理"
      searchFields={searchFields}
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
