"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("合伙红娘", "功能配置");

const DEFAULTS = {
  "content_html": "",
  "enabled": true,
  "apply_tip": ""
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_love_partner"
      name="功能配置"
      defaults={DEFAULTS}
      sections={[ {
        title: "功能配置",
        fields: [
          { key: "enabled", label: "启用合伙红娘", type: "switch" },
          { key: "apply_tip", label: "加盟须知", type: "textarea" },
          { key: "content_html", label: "合作说明(富文本)", type: "html" },
        ],
      }
      ]}
    />
  );
}