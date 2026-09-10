"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "评论管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="评论管理"
      domain="video_comment"
      columns={[
        { title: "评论内容", key: "title" },
        { title: "评论人", key: "author" },
        { title: "时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "评论内容", type: "textarea", required: true },
        { key: "author", label: "评论人", type: "text", required: true },
      ]}
      addLabel="添加评论"
    />
  );
}