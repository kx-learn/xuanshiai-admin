"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "配置名称", key: "configName" },
  { title: "配置值", key: "configValue" },
  { title: "说明", key: "description" },
  { title: "更新时间", key: "updateTime" },
  {
    title: "操作",
    key: "action",
    width: 100,
    render: () => (
      <span className="flex items-center gap-2">
        <button type="button" className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0">编辑</button>
      </span>
    ),
  },
];

const data: Record<string, unknown>[] = [];

export default function FinanceConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "系统配置")}
      pageTitle="系统配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      searchFields={[
        { label: "配置名称", type: "input", placeholder: "请输入配置名称" },
      ]}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
