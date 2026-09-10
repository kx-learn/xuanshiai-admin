"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "吸粉二维码");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="吸粉二维码"
      domain="fan_qrcode"
      columns={[
        { title: "名称", key: "title" },
        { title: "到期时间", key: "expire" },
        { title: "创建时间", key: "created_at" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "二维码名称", type: "text", required: true },
        { key: "image_url", label: "二维码图片", type: "image", required: false },
        { key: "expire", label: "到期时间", type: "text", required: false },
      ]}
      addLabel="添加二维码"
    />
  );
}