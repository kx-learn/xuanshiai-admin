"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "创建时间", key: "createTime" },
  { title: "项目标题", key: "title" },
  { title: "二维码类型", key: "qrcodeType" },
  { title: "二维码有效期", key: "qrcodeValidity" },
  { title: "模板", key: "template" },
  { title: "数量", key: "count" },
  { title: "操作", key: "action", width: 120 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "恋爱卡片")}
      pageTitle="恋爱卡片"
      tabs={[
        { key: "custom", label: "自定义条件" },
        { key: "activity", label: "按活动报名" },
      ]}
      actions={[
        { label: "新建批量生成", variant: "primary" },
        { label: "模版样式总览", variant: "primary" },
      ]}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
