"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

import ListPage, { type ColumnDef } from "@/components/ListPage";

const columns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "分享封面", key: "shareCover" },
  { title: "标识", key: "identifier" },
  { title: "分享内容", key: "shareContent" },
  { title: "二维码有效期", key: "qrcodeValidity" },
  { title: "生成时间", key: "createTime" },
  { title: "推送次数", key: "pushCount" },
  { title: "带来关注", key: "followCount" },
  { title: "二维码", key: "qrcode" },
  { title: "操作", key: "action", width: 160 },
];

const data: Record<string, unknown>[] = [];

export default function Page() {
  return (
    <ListPage
      breadcrumb={getBreadcrumb("运营工具", "二维码管理")}
      pageTitle="二维码管理"
      actions={[
        { label: "添加二维码", variant: "primary" },
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
