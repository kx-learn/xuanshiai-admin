"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "兑换管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="兑换管理"
      domain="gift_exchange"
      columns={[
        { title: "礼品", key: "title" },
        { title: "兑换人", key: "user" },
        { title: "兑换时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
      ]}
      readOnly
    />
  );
}