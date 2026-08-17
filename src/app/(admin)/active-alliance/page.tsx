"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef, type ActionButton } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "更新内容", key: "content", width: 500 },
  { title: "更新时间", key: "time", width: 180 },
];

const data: Record<string, unknown>[] = [];

const actions: ActionButton[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("商家联盟", "运营方案")}
      pageTitle="运营方案"
      searchFields={[
        { label: "关键词", type: "input", placeholder: "输入关键词搜索", width: 200 },
      ]}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
