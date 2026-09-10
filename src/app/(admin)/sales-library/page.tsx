"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "销售匹配库");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="销售匹配库"
      domain="sales_library"
      columns={[
        { title: "库名称", key: "title" },
        { title: "选人上限", key: "max_select" },
        { title: "创建时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "库名称", type: "text", required: true },
        { key: "max_select", label: "选人上限", type: "number", required: false },
        { key: "detail", label: "库说明", type: "textarea", required: false },
      ]}
      addLabel="创建销售匹配库"
    />
  );
}