"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "礼物名称", key: "giftName" },
  { title: "礼物单位", key: "unit" },
  { title: "礼物图片", key: "image" },
  { title: "销量统计", key: "salesStats" },
  { title: "所需积分", key: "requiredPoints" },
  { title: "奖励积分", key: "rewardPoints" },
  { title: "排序", key: "sort" },
  { title: "操作", key: "action", width: 120 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "礼物管理")}
      pageTitle="礼物管理"
      tabs={[
        { key: "gift-manage", label: "礼物管理" },
        { key: "send-gift", label: "赠送礼物" },
      ]}
      actions={[
        { label: "添加礼物", variant: "primary" },
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
