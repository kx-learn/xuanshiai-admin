"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("客源线索", "功能配置");

const DEFAULTS = {
  "auto_assign": false,
  "protect_days": 30,
  "follow_up_tip": "",
  "abandon_days": 15,
  "daily_new_limit": 10
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_customer_leads"
      name="功能配置"
      defaults={DEFAULTS}
      sections={[ {
        title: "分配规则",
        fields: [
          { key: "auto_assign", label: "新客源自动分配", type: "switch" },
          { key: "daily_new_limit", label: "每人每日新客源上限", type: "number" },
        ],
      }, {
        title: "跟进与保护",
        fields: [
          { key: "protect_days", label: "客源保护天数", type: "number" },
          { key: "abandon_days", label: "未跟进自动弃海(天)", type: "number" },
          { key: "follow_up_tip", label: "跟进要求说明", type: "textarea" },
        ],
      }
      ]}
    />
  );
}