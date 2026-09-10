"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("会员CRM", "推广管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="推广管理"
      domain="popularize_record"
      columns={[
        { title: "会员", key: "title" },
        { title: "推广渠道", key: "channel" },
        { title: "奖励金额", key: "amount" },
        { title: "时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "会员", type: "text", required: true },
        { key: "channel", label: "推广渠道", type: "text", required: false },
        { key: "amount", label: "奖励金额(元)", type: "number", required: false },
      ]}
      addLabel="录入推广"
    />
  );
}