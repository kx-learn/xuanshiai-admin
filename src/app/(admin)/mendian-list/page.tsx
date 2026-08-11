"use client";

import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 80 },
  { title: "门店编码", key: "code", width: 150 },
  { title: "门店名称", key: "name", width: 180 },
  { title: "展示名称", key: "display_name", width: 180 },
  { title: "区域", key: "region_code", width: 120 },
  { title: "状态", key: "status", width: 90, render: (row) => <span className={row.status === 1 ? "text-[#52c41a]" : "text-[#999]"}>{row.status === 1 ? "启用" : "停用"}</span> },
  { title: "自动分配", key: "auto_redirect", width: 100, render: (row) => row.auto_redirect ? "开启" : "关闭" },
  { title: "创建时间", key: "created_at", width: 180 },
  { title: "操作", key: "action", width: 100, render: () => <button className="text-[#3658f7]">查看</button> },
];

export default function MendianListPage() {
  return <ListPage breadcrumb={getBreadcrumb("分店管理", "门店管理")} pageTitle="门店管理" searchFields={[{ label: "门店名称", type: "input", placeholder: "请输入门店名称", width: 180 }, { label: "区域编码", type: "input", placeholder: "请输入区域", width: 140 }]} actions={[{ label: "新增门店", variant: "primary" }]} columns={columns} dataSource={[]} rowKey="id" endpoint="/api/backend/admin/matchmaker/branches?page=1&page_size=20" pagination={{ current: 1, pageSize: 20, total: 0 }} onSearch={() => {}} onReset={() => {}} />;
}
