"use client";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "配置项", key: "configKey" },
  { title: "配置值", key: "configValue" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [
  { id: 1, configKey: "AppID", configValue: "wx9876543210fedcba", action: "编辑" },
  { id: 2, configKey: "AppSecret", configValue: "***hidden***", action: "编辑" },
];

export default function MiniprogramConfigPage() {
  return (
    <ListPage
      breadcrumb={[{ label: "首页", href: "/" }, { label: "小程序" }, { label: "小程序参数配置" }]}
      pageTitle="小程序参数配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 2 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
