"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "送礼物");

const TABS = [
  { key: "gifts", label: "礼物管理" },
  { key: "records", label: "赠送礼物" },
];

export default function LoveGiftWrapPage() {
  const [tab, setTab] = useState("gifts");
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
      {tab === "gifts" ? (
        <ContentCrud
          breadcrumb={[]}
          pageTitle=""
          domain="gift"
          columns={[
            { title: "礼物名称", key: "title" },
            { title: "价格(元)", key: "amount" },
            { title: "图标", key: "image_url" },
            { title: "排序", key: "sort" },
            { title: "状态", key: "status" },
          ]}
          fields={[
            { key: "title", label: "礼物名称", type: "text", required: true },
            { key: "amount", label: "价格(元)", type: "number" },
            { key: "image_url", label: "礼物图标", type: "image" },
          ]}
          addLabel="添加礼物"
        />
      ) : (
        <ContentCrud
          breadcrumb={[]}
          pageTitle=""
          domain="gift_record"
          columns={[
            { title: "礼物", key: "title" },
            { title: "赠送人", key: "from_user" },
            { title: "接收人", key: "to_user" },
            { title: "金额", key: "amount" },
            { title: "时间", key: "created_at" },
          ]}
          fields={[]}
          readOnly
        />
      )}
    </div>
  );
}
