"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "分区名称", key: "zoneName" },
  { title: "链接/二维码", key: "linkQrcode" },
  { title: "创建时间", key: "createTime" },
  { title: "状态", key: "status" },
  { title: "数据", key: "dataInfo" },
  { title: "排序", key: "sort" },
  { title: "操作", key: "action", width: 120 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "主题管理")}
      pageTitle="主题管理"
      actions={[
        { label: "添加分区", variant: "primary" },
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
