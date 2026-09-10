"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "社群管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="社群管理"
      domain="community_group"
      columns={[
        { title: "社群名称", key: "title" },
        { title: "群主", key: "owner" },
        { title: "成员数", key: "members" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "社群名称", type: "text", required: true },
        { key: "owner", label: "群主", type: "text", required: false },
        { key: "detail", label: "社群简介", type: "textarea", required: false },
      ]}
      addLabel="添加社群"
    />
  );
}