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

const data: Record<string, unknown>[] = [
  {
    id: 1,
    shareCover: "预览",
    identifier: "123",
    shareContent: "标题：南京单身摘要：给你发一个高颜值对象链接：sdfghjk",
    qrcodeValidity: "生效中有效期至：2026-08-02 11:40:09",
    createTime: "2026-07-03 11:40:10",
    pushCount: "1",
    followCount: "0",
    qrcode: "查看",
  },
];

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
      pagination={{ current: 1, pageSize: 10, total: 1 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
