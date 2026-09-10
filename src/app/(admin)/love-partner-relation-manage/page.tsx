"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("合伙红娘", "团队关系");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="团队关系"
      domain="partner_relation"
      columns={[
        { title: "团队名称", key: "title" },
        { title: "队长", key: "leader" },
        { title: "创建时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "团队名称", type: "text", required: true },
        { key: "leader", label: "队长", type: "text", required: true },
        { key: "detail", label: "团队成员(逗号分隔)", type: "textarea", required: false },
      ]}
      addLabel="添加团队"
    />
  );
}