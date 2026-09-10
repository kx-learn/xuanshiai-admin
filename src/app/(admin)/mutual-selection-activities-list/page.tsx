"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("活动报名", "互选活动管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="互选活动管理"
      domain="mutual_activity"
      columns={[
        { title: "名称", key: "title" },
        { title: "地点", key: "subtitle" },
        { title: "状态", key: "status" },
        { title: "创建时间", key: "created_at" },
      ]}
      fields={[
        { key: "title", label: "活动名称", type: "text", required: true },
        { key: "subtitle", label: "活动地点", type: "text", required: false },
        { key: "image_url", label: "活动图标", type: "image", required: false },
        { key: "detail", label: "活动说明", type: "textarea", required: false },
      ]}
      addLabel="创建活动"
    />
  );
}