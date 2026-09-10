"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("商家联盟", "订单管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="订单管理"
      domain="merchant_order"
      columns={[
        { title: "商品", key: "title" },
        { title: "购买人", key: "buyer" },
        { title: "金额", key: "amount" },
        { title: "下单时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
      ]}
      readOnly
    />
  );
}