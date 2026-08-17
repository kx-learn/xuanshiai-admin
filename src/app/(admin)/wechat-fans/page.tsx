"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "编号", key: "id", width: 70 },
  { title: "头像", key: "avatar", width: 60 },
  { title: "昵称", key: "nickname" },
  { title: "性别", key: "gender", width: 60, align: "center" },
  { title: "关注时间", key: "followTime" },
  { title: "标签", key: "tags" },
  { title: "操作", key: "action", width: 100, align: "center" },
];

const data: Record<string, unknown>[] = [];

export default function WechatFansPage() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("公众号", "关注粉丝")}
      pageTitle="关注粉丝"
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
