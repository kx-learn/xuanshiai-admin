"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("分店管理", "分店红娘");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="分店红娘"
      domain="branch_matchmaker"
      columns={[
        { title: "红娘姓名", key: "title" },
        { title: "所属分店", key: "store" },
        { title: "手机号", key: "phone" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "红娘姓名", type: "text", required: true },
        { key: "store", label: "所属分店", type: "text", required: false },
        { key: "phone", label: "手机号", type: "text", required: false },
        { key: "detail", label: "备注", type: "textarea", required: false },
      ]}
      addLabel="添加红娘"
    />
  );
}