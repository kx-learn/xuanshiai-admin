"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "配置项", key: "configKey" },
  { title: "配置值", key: "configValue" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [];

export default function WechatConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "公众号参数配置")}
      pageTitle="公众号参数配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
