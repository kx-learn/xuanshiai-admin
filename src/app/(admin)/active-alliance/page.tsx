"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("活动报名", "运营方案");

const DEFAULTS = {
  "content_html": "",
  "enabled": true
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_active_alliance"
      name="运营方案"
      defaults={DEFAULTS}
      sections={[ {
        title: "运营方案内容",
        fields: [
          { key: "enabled", label: "启用", type: "switch" },
          { key: "content_html", label: "方案正文", type: "html" },
        ],
      }
      ]}
    />
  );
}