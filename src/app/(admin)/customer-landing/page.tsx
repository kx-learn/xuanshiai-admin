"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "落地页标题", key: "title" },
  { title: "形式", key: "formType" },
  { title: "数据位置", key: "dataPosition" },
  { title: "创建时间", key: "createTime" },
  { title: "浏览量", key: "views" },
  { title: "获取客源", key: "customerSource" },
  { title: "推广红娘", key: "promoteMatchmaker" },
  { title: "链接/二维码", key: "linkQrcode" },
  { title: "操作", key: "action", width: 180 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "客户落地页")}
      pageTitle="客户落地页"
      actions={[
        { label: "创建落地页", variant: "primary" },
      ]}
      searchFields={[
        { label: "搜索", type: "input", placeholder: "请输入" },
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
