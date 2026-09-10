"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "礼品管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="礼品管理"
      domain="gift"
      columns={[
        { title: "礼品名称", key: "title" },
        { title: "所需积分", key: "amount" },
        { title: "库存", key: "stock" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "礼品名称", type: "text", required: true },
        { key: "amount", label: "所需积分", type: "number", required: false },
        { key: "stock", label: "库存", type: "number", required: false },
        { key: "image_url", label: "礼品图", type: "image", required: false },
        { key: "detail", label: "礼品介绍", type: "textarea", required: false },
      ]}
      addLabel="添加礼品"
    />
  );
}