"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "配置名称", key: "configName" },
  { title: "配置值", key: "configValue" },
  { title: "说明", key: "description" },
  { title: "更新时间", key: "updateTime" },
  {
    title: "操作",
    key: "action",
    width: 100,
    render: () => (
      <button className="text-sm text-[#3658f7] hover:text-[#2d4fd6]">编辑</button>
    ),
  },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("系统管理", "外呼平台配置")}
      pageTitle="外呼平台配置"
      searchFields={[
        { label: "配置名称", type: "input", placeholder: "请输入配置名称" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: data.length }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
