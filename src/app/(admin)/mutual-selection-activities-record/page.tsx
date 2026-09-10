"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("活动报名", "互选记录");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="互选记录"
      domain="mutual_signup"
      columns={[
        { title: "活动", key: "title" },
        { title: "会员A", key: "name" },
        { title: "会员B", key: "other" },
        { title: "时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "活动名称", type: "text", required: true },
        { key: "name", label: "会员A", type: "text", required: true },
        { key: "other", label: "会员B", type: "text", required: true },
        { key: "remark", label: "备注", type: "textarea", required: false },
      ]}
      addLabel="录入互选"
    />
  );
}