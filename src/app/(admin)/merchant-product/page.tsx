"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "商品名称", key: "productName", width: 220 },
  { title: "商家名称", key: "merchantName", width: 180 },
  { title: "销售价格", key: "price", width: 100 },
  { title: "添加时间", key: "createTime", width: 160 },
  { title: "销量统计", key: "salesCount", width: 80, align: "center" },
  {
    title: "上架",
    key: "online",
    width: 60,
    align: "center",
    render: (row: Record<string, unknown>) => {
      const online = String(row.online ?? "");
      return (
        <span style={{ color: online === "是" ? "#52c41a" : "#999" }}>{online}</span>
      );
    },
  },
  { title: "链接/二维码", key: "link", width: 90, align: "center" },
  {
    title: "操作",
    key: "action",
    width: 150,
    render: () => (
      <span className="flex items-center gap-2">
        <span className="text-[#3658f7] cursor-pointer hover:opacity-80">编辑</span>
        <span className="text-[#3658f7] cursor-pointer hover:opacity-80">查看</span>
        <span className="text-[#ff4d4f] cursor-pointer hover:opacity-80">下架</span>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

const actions: ActionButton[] = [
  { label: "添加商品", variant: "primary" },
];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("商家联盟", "商品管理")}
      pageTitle="商品管理"
      searchFields={[
        { label: "商品名称", type: "input", placeholder: "请输入商品名称", width: 180 },
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
