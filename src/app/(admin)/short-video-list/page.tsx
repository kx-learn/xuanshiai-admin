"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "视频管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="视频管理"
      domain="short_video"
      columns={[
        { title: "标题", key: "title" },
        { title: "发布者", key: "author" },
        { title: "发布时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "视频标题", type: "text", required: true },
        { key: "author", label: "发布者", type: "text", required: false },
        { key: "video_url", label: "视频地址", type: "text", required: false },
        { key: "image_url", label: "封面图", type: "image", required: false },
        { key: "detail", label: "视频简介", type: "textarea", required: false },
      ]}
      addLabel="添加视频"
    />
  );
}