"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "规则名称", key: "ruleName" },
  { title: "适用角色", key: "applicableRole" },
  { title: "权限内容", key: "permissions" },
  { title: "创建时间", key: "createTime" },
  { title: "状态", key: "status", width: 80, align: "center" },
  { title: "操作", key: "action", width: 140, align: "center" },
];

const data: Record<string, unknown>[] = [];

export default function PowerConfigPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("平台配置", "权限配置")}
      pageTitle="权限配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
