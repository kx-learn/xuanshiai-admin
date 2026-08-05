"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "分站地区", key: "region" },
  { title: "显示名称", key: "displayName" },
  { title: "链接", key: "link" },
  { title: "显示排序", key: "sortOrder" },
  { title: "链接/二维码", key: "qrcode" },
  { title: "自动跳转", key: "autoRedirect" },
  {
    title: "操作",
    key: "action",
    width: 140,
    render: () => (
      <span className="flex items-center gap-2">
        <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">编辑</button>
        <button className="text-sm text-[#ff4d4f] hover:text-[#ff7875]">删除</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统管理", "分站配置")}
      pageTitle="分站配置"
      actions={[
        { label: "添加分站", variant: "primary" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
