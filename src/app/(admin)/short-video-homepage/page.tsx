"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "会员主页");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="会员主页"
      domain="video_homepage"
      columns={[
        { title: "会员昵称", key: "title" },
        { title: "粉丝数", key: "fans" },
        { title: "创建时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "会员昵称", type: "text", required: true },
        { key: "image_url", label: "头像", type: "image", required: false },
        { key: "detail", label: "主页简介", type: "textarea", required: false },
      ]}
      addLabel="添加主页"
    />
  );
}