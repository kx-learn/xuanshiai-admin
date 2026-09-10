"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "红包记录");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="红包记录"
      domain="video_red_packet"
      columns={[
        { title: "视频", key: "title" },
        { title: "发红包人", key: "sender" },
        { title: "金额", key: "amount" },
        { title: "时间", key: "created_at" },
      ]}
      fields={[
      ]}
      readOnly
    />
  );
}