"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "落地页");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="落地页"
      domain="landing_page"
      columns={[
        { title: "落地页名称", key: "title" },
        { title: "创建时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "落地页名称", type: "text", required: true },
        { key: "content", label: "落地页内容", type: "textarea", required: false },
        { key: "image_url", label: "头图", type: "image", required: false },
      ]}
      addLabel="创建落地页"
    />
  );
}