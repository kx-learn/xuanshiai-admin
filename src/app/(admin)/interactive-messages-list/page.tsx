"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "消息记录");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="消息记录"
      domain="interactive_message"
      columns={[
        { title: "消息类型", key: "title" },
        { title: "发送者", key: "from_user" },
        { title: "接收者", key: "to_user" },
        { title: "时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
      ]}
      readOnly
    />
  );
}