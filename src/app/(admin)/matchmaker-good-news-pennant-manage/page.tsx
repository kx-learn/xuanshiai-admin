"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "锦旗管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="锦旗管理"
      domain="good_news_pennant"
      columns={[
        { title: "赠送人", key: "title" },
        { title: "赠给", key: "to_user" },
        { title: "锦旗内容", key: "content" },
        { title: "时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "赠送人", type: "text", required: true },
        { key: "to_user", label: "赠给", type: "text", required: false },
        { key: "content", label: "锦旗内容", type: "textarea", required: false },
        { key: "image_url", label: "锦旗图片", type: "image", required: false },
      ]}
      addLabel="添加锦旗"
    />
  );
}