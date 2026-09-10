"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("分店管理", "分店报表");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="分店报表"
      domain="branch_report"
      columns={[
        { title: "分店", key: "title" },
        { title: "订单数", key: "order_count" },
        { title: "订单额", key: "order_amount" },
        { title: "分成金额", key: "commission" },
        { title: "日期", key: "created_at" },
      ]}
      fields={[
      ]}
      readOnly
    />
  );
}