"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "内容单页");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="内容单页"
      domain="single_page"
      columns={[
        { title: "页面标题", key: "title" },
        { title: "创建时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "页面标题", type: "text", required: true },
        { key: "content", label: "页面正文", type: "textarea", required: false },
        { key: "image_url", label: "封面图", type: "image", required: false },
      ]}
      addLabel="添加单页"
    />
  );
}