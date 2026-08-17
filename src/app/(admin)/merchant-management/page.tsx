"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "商家名称", key: "merchantName", width: 200 },
  { title: "分类", key: "category", width: 100 },
  { title: "管理账号", key: "account", width: 120 },
  { title: "创建时间", key: "createTime", width: 160 },
  { title: "商品统计", key: "productCount", width: 80, align: "center" },
  { title: "销售额统计", key: "salesAmount", width: 100 },
  { title: "核销员工", key: "verifyStaff", width: 100 },
  { title: "展示", key: "display", width: 60, align: "center" },
  { title: "链接/二维码", key: "link", width: 90, align: "center" },
  {
    title: "操作",
    key: "action",
    width: 150,
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
  { label: "添加商家", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("商家联盟", "商家管理")}
      pageTitle="商家管理"
      searchFields={[
        { label: "商家名称", type: "input", placeholder: "请输入商家名称", width: 180 },
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
