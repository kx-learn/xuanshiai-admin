"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "菜单名称", key: "menuName" },
  { title: "菜单类型", key: "menuType" },
  { title: "关联内容", key: "relatedContent" },
  { title: "排序", key: "sortOrder", width: 70, align: "center" },
  { title: "操作", key: "action", width: 140, align: "center" },
];

const data: Record<string, unknown>[] = [];

export default function WechatMenuPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "菜单配置")}
      pageTitle="菜单配置"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
