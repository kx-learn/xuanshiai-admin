"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("商家联盟", "商家管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="商家管理"
      domain="merchant"
      columns={[
        { title: "商家名称", key: "title" },
        { title: "联系方式", key: "subtitle" },
        { title: "商家图", key: "image_url" },
        { title: "状态", key: "status" },
        { title: "创建时间", key: "created_at" },
      ]}
      fields={[
        { key: "title", label: "商家名称", type: "text", required: true },
        { key: "subtitle", label: "联系方式", type: "text", required: false },
        { key: "image_url", label: "商家图(300*300)", type: "image", required: false },
        { key: "detail", label: "商家介绍", type: "textarea", required: false },
      ]}
      addLabel="添加商家"
    />
  );
}