"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "称呼", key: "nickname" },
  { title: "性别", key: "gender" },
  { title: "手机号", key: "phone" },
  { title: "更多信息", key: "moreInfo" },
  { title: "落地页", key: "landingPage" },
  { title: "提交时间", key: "submitTime" },
  { title: "操作", key: "action", width: 120 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "自由表单")}
      pageTitle="自由表单"
      actions={[
        { label: "导出EXCEL", variant: "primary" },
        { label: "字段管理", variant: "primary" },
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
