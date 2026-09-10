"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("商家联盟", "商品管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="商品管理"
      domain="merchant_product"
      columns={[
        { title: "商品名称", key: "title" },
        { title: "原价值", key: "amount" },
        { title: "合作优惠价", key: "price" },
        { title: "状态", key: "status" },
        { title: "创建时间", key: "created_at" },
      ]}
      fields={[
        { key: "title", label: "商品名称", type: "text", required: true },
        { key: "amount", label: "原价值(元)", type: "number", required: false },
        { key: "price", label: "合作优惠价(元)", type: "number", required: false },
        { key: "image_url", label: "商品图(800*800)", type: "image", required: false },
        { key: "detail", label: "商品介绍", type: "textarea", required: false },
      ]}
      addLabel="添加商品"
    />
  );
}