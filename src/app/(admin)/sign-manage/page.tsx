"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "报名管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="报名管理"
      domain="group_signup"
      columns={[
        { title: "社群", key: "title" },
        { title: "报名人", key: "name" },
        { title: "手机号", key: "phone" },
        { title: "报名时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "社群名称", type: "text", required: true },
        { key: "name", label: "报名人", type: "text", required: true },
        { key: "phone", label: "手机号", type: "text", required: false },
      ]}
      addLabel="添加报名"
    />
  );
}