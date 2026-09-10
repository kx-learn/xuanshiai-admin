"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "自由表单");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="自由表单"
      domain="free_form"
      columns={[
        { title: "表单名称", key: "title" },
        { title: "创建时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "表单名称", type: "text", required: true },
        { key: "fields_json", label: "表单字段(名称用逗号分隔)", type: "textarea", required: false },
      ]}
      addLabel="添加表单"
    />
  );
}