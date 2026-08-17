"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "规则名称", key: "ruleName" },
  { title: "关键词", key: "keyword" },
  { title: "回复类型", key: "replyType", width: 80, align: "center" },
  { title: "回复内容", key: "replyContent" },
  { title: "状态", key: "status", width: 80, align: "center" },
  { title: "操作", key: "action", width: 140, align: "center" },
];

const data: Record<string, unknown>[] = [];

export default function WechatAutoreplyPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "自动回复")}
      pageTitle="自动回复"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
