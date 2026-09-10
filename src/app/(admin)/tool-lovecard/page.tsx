"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "批量资料卡");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="批量资料卡"
      domain="lovecard_batch"
      columns={[
        { title: "任务名称", key: "title" },
        { title: "创建时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "任务名称", type: "text", required: true },
        { key: "content", label: "资料卡内容", type: "textarea", required: false },
        { key: "image_url", label: "模版图", type: "image", required: false },
      ]}
      addLabel="新建批量生成"
    />
  );
}