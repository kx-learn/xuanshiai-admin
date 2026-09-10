"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "喜讯管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="喜讯管理"
      domain="good_news"
      columns={[
        { title: "会员昵称", key: "title" },
        { title: "喜讯分类", key: "category" },
        { title: "照片", key: "image_url" },
        { title: "时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "会员昵称", type: "text", required: true },
        { key: "category", label: "喜讯分类", type: "text", required: false },
        { key: "content", label: "喜讯内容", type: "textarea", required: false },
        { key: "image_url", label: "照片", type: "image", required: false },
      ]}
      addLabel="添加喜讯"
    />
  );
}