"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("会员CRM", "线下VIP");

const TABS = [
  { key: "members", label: "线下VIP" },
  { key: "contracts", label: "合同管理" },
];

export default function LoveUserVipUnderlinePage() {
  const [tab, setTab] = useState("members");
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />
      <div className="mb-4 flex border-b border-[#f0f0f0]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm ${tab === t.key ? "border-b-2 border-[#3658f7] text-[#3658f7]" : "text-[#666]"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "members" ? (
        <ContentCrud
          breadcrumb={[]}
          pageTitle=""
          domain="offline_vip"
          columns={[
            { title: "会员姓名", key: "title" },
            { title: "手机号", key: "phone" },
            { title: "所属红娘", key: "matchmaker" },
            { title: "缴费金额", key: "amount" },
            { title: "到期时间", key: "expire" },
            { title: "状态", key: "status" },
          ]}
          fields={[
            { key: "title", label: "会员姓名", type: "text", required: true },
            { key: "phone", label: "手机号", type: "text" },
            { key: "matchmaker", label: "所属红娘", type: "text" },
            { key: "amount", label: "缴费金额(元)", type: "number" },
            { key: "expire", label: "到期时间", type: "text" },
            { key: "detail", label: "备注", type: "textarea" },
          ]}
          addLabel="添加线下VIP会员"
        />
      ) : (
        <ContentCrud
          breadcrumb={[]}
          pageTitle=""
          domain="vip_contract"
          columns={[
            { title: "合同编号", key: "title" },
            { title: "会员姓名", key: "member" },
            { title: "金额", key: "amount" },
            { title: "签订时间", key: "created_at" },
            { title: "状态", key: "status" },
          ]}
          fields={[]}
          readOnly
        />
      )}
    </div>
  );
}
