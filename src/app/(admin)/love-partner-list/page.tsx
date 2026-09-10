"use client";

import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("合伙红娘", "合伙人管理");

export default function Page() {
  return (
    <ContentCrud
      breadcrumb={breadcrumb}
      pageTitle="合伙人管理"
      domain="partner"
      columns={[
        { title: "姓名", key: "title" },
        { title: "手机号", key: "phone" },
        { title: "所属团队", key: "team" },
        { title: "累计收益", key: "amount" },
        { title: "状态", key: "status" },
      ]}
      fields={[
        { key: "title", label: "姓名", type: "text", required: true },
        { key: "phone", label: "手机号", type: "text", required: false },
        { key: "team", label: "所属团队", type: "text", required: false },
        { key: "amount", label: "累计收益(元)", type: "number", required: false },
        { key: "detail", label: "备注", type: "textarea", required: false },
      ]}
      addLabel="添加合伙人"
    />
  );
}