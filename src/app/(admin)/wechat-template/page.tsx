"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "模板名称", key: "templateName" },
  { title: "模板ID", key: "templateId" },
  { title: "模板类型", key: "templateType" },
  { title: "创建时间", key: "createTime" },
  { title: "状态", key: "status", width: 80, align: "center" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [];

export default function WechatTemplatePage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "模板消息")}
      pageTitle="模板消息"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
