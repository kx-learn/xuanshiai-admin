"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "打赏管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="打赏管理"
      domain="video_tip"
      columns={[
        { title: "视频", key: "title" },
        { title: "打赏人", key: "from_user" },
        { title: "金额", key: "amount" },
        { title: "时间", key: "created_at" },
      ]}
      fields={[
      ]}
      readOnly
    />
  );
}