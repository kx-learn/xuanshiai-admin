"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 70, align: "center" },
  { title: "配置名称", key: "configName", width: 200 },
  { title: "配置值", key: "configValue", width: 150 },
  { title: "说明", key: "description" },
  { title: "更新时间", key: "updateTime", width: 180 },
  {
    title: "操作",
    key: "action",
    width: 100,
    render: () => (
      <span className="text-[#3658f7] cursor-pointer hover:underline">编辑</span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

export default function LovePartnerConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("合伙红娘", "功能配置")}
      pageTitle="功能配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
    />
  );
}
