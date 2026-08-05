"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "分站地区", key: "region", width: 150 },
  { title: "显示名称", key: "displayName", width: 150 },
  { title: "链接", key: "link", width: 200 },
  { title: "显示排序", key: "sort", width: 100, align: "center" },
  { title: "链接/二维码", key: "qrcode", width: 120, align: "center" },
  { title: "自动跳转", key: "autoRedirect", width: 100, align: "center" },
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

const actions: ActionButton[] = [
  { label: "添加分站", variant: "primary", onClick: () => {} },
];

export default function BranchConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("分店管理", "分站配置")}
      pageTitle="分站配置"
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
    />
  );
}
