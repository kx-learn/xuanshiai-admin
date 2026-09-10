"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("推广红娘", "分成明细");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="分成明细"
      domain="promoter_distribution"
      columns={[
        { title: "推广红娘", key: "title" },
        { title: "分成金额", key: "amount" },
        { title: "关联订单", key: "order" },
        { title: "时间", key: "created_at" },
      ]}
      fields={[
        { key: "title", label: "推广红娘", type: "text", required: true },
        { key: "amount", label: "分成金额(元)", type: "number", required: false },
        { key: "order", label: "关联订单", type: "text", required: false },
      ]}
      addLabel="录入一笔分成"
    />
  );
}