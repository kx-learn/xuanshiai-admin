"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "栏目标题", key: "title" },
  { title: "栏目描述", key: "description" },
  { title: "分享封面", key: "shareCover" },
  { title: "宣传头图", key: "bannerImage" },
  { title: "商家分类", key: "merchantCategory" },
  { title: "操作", key: "action", width: 160 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("商家联盟", "商家联盟配置")}
      pageTitle="商家联盟配置"
      actions={[
        { label: "增加分类", variant: "primary" },
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
