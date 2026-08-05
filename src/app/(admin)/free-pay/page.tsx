"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 80 },
  { title: "收款项目名称", key: "name" },
  { title: "收款类目", key: "category" },
  { title: "收款金额", key: "amount" },
  { title: "推广红娘奖励", key: "promoteReward" },
  { title: "服务红娘奖励", key: "serviceReward" },
  { title: "在聚合页面", key: "showOnAggregate" },
  { title: "收款订单", key: "orders" },
  { title: "查看", key: "viewLink" },
  { title: "操作", key: "action", width: 160 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "自由收款")}
      pageTitle="自由收款"
      tabs={[
        { key: "free-pay", label: "自由收款" },
        { key: "pay-order", label: "收款订单" },
      ]}
      actions={[
        { label: "添加收款类目", variant: "primary" },
        { label: "添加收款项目", variant: "primary" },
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
