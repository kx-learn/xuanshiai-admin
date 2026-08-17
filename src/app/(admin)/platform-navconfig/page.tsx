"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "图标位置", key: "position" },
  { title: "当前图标", key: "preview" },
  { title: "图标名称", key: "iconName" },
  { title: "最佳尺寸", key: "bestSize" },
  { title: "操作", key: "action", width: 160 },
];

const data: Record<string, unknown>[] = [];

export default function PlatformNavconfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "导航配置")}
      pageTitle="导航配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 20, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
