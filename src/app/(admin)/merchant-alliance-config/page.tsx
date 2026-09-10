"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("商家联盟", "功能配置");

const DEFAULTS = {
  "categories": [],
  "enabled": true,
  "join_tip": ""
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_merchant_alliance"
      name="功能配置"
      defaults={DEFAULTS}
      sections={[ {
        title: "功能配置",
        fields: [
          { key: "enabled", label: "启用商家联盟", type: "switch" },
          { key: "categories", label: "商品分类", type: "tags" },
          { key: "join_tip", label: "入驻说明", type: "html" },
        ],
      }
      ]}
    />
  );
}