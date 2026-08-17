"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 50 },
  { title: "礼品标题", key: "title", width: 200 },
  { title: "性质", key: "type", width: 100 },
  { title: "所需积分", key: "points", width: 100, align: "center" },
  { title: "库存数", key: "stock", width: 80, align: "center" },
  {
    title: "操作",
    key: "action",
    width: 120,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:opacity-80">编辑</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:opacity-80">删除</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const actions: ActionButton[] = [
  { label: "新增礼品", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("积分商城", "礼品管理")}
      pageTitle="礼品管理"
      searchFields={[
        { label: "礼品标题", type: "input", placeholder: "请输入礼品标题", width: 180 },
      ]}
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
