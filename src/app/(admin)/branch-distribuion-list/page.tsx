"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("分店管理", "分成明细");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="分成明细"
      domain="branch_distribution"
      columns={[
        { title: "分店", key: "title" },
        { title: "分成金额", key: "amount" },
        { title: "关联订单", key: "order" },
        { title: "时间", key: "created_at" },
      ]}
      fields={[
      ]}
      readOnly
    />
  );
}