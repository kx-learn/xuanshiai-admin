"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "自定义栏目名称", key: "columnName" },
  { title: "栏目首页分享标题", key: "shareTitle" },
  { title: "栏目首页分享摘要", key: "shareDesc" },
  { title: "普通会员发布视频", key: "normalPost" },
  { title: "认证会员发布视频", key: "verifiedPost" },
  { title: "免审核白名单", key: "whitelist" },
  { title: "操作", key: "action", width: 120 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("短视频", "短视频配置")}
      pageTitle="短视频配置"
      actions={[
        { label: "确定提交", variant: "primary" },
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
