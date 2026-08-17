"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "配置项", key: "configKey" },
  { title: "配置内容", key: "configValue" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [];

export default function PlatformContentPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "内容配置")}
      pageTitle="内容配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
