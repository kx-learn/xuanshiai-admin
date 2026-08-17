"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "布局名称", key: "name" },
  { title: "布局描述", key: "description" },
  { title: "状态", key: "status", width: 100, align: "center" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [];

export default function PlatformPagePage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "平台布局")}
      pageTitle="平台布局"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
