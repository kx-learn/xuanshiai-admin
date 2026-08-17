"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "群发内容", key: "content" },
  { title: "目标人群", key: "targetGroup" },
  { title: "发送时间", key: "sendTime" },
  { title: "状态", key: "status", width: 80, align: "center" },
  { title: "操作", key: "action", width: 140, align: "center" },
];

const data: Record<string, unknown>[] = [];

export default function WechatSendPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "消息群发")}
      pageTitle="消息群发"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
