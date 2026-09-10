"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import ConfigForm from "@/components/ConfigForm";
import ContentCrud from "@/components/ContentCrud";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "自由收款");

const TABS = [
  { key: "config", label: "自由收款" },
  { key: "orders", label: "收款订单" },
];

const DEFAULTS = {
  categories: [],
  items: [],
  qrcode_url: null,
  remark: "",
};

export default function FreePayPage() {
  const [tab, setTab] = useState("config");
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
      {tab === "config" ? (
        <ConfigForm
          breadcrumb={[]}
          namespace="tools_free_pay"
          name="自由收款配置"
          defaults={DEFAULTS}
          sections={[
            {
              title: "收款设置",
              fields: [
                { key: "categories", label: "收款类目", type: "tags" },
                { key: "items", label: "收款项目", type: "objects", itemFields: [
                  { key: "name", label: "项目名", type: "text" },
                  { key: "price", label: "金额(元)", type: "number" },
                  { key: "image_url", label: "配图(750*350)", type: "image" },
                ] },
                { key: "qrcode_url", label: "收款二维码", type: "image" },
                { key: "remark", label: "备注说明", type: "textarea" },
              ],
            },
          ]}
        />
      ) : (
        <ContentCrud
          breadcrumb={[]}
          pageTitle="收款订单"
          domain="free_pay_order"
          columns={[
            { title: "收款项目", key: "title" },
            { title: "付款人", key: "payer" },
            { title: "金额", key: "amount" },
            { title: "付款时间", key: "created_at" },
            { title: "状态", key: "status" },
          ]}
          fields={[]}
          readOnly
        />
      )}
    </div>
  );
}
