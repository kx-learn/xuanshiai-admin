"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "收费项目", key: "itemName" },
  { title: "金额(元)", key: "amount" },
  { title: "有效期", key: "validity" },
  { title: "说明", key: "description" },
  { title: "更新时间", key: "updateTime" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [];

export default function PlatformPayconfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "收费配置")}
      pageTitle="收费配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
