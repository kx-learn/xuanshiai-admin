"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("合伙红娘", "分成配置");

const DEFAULTS = {
  "mode": "ratio",
  "default_ratio": 0,
  "levels": []
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_partner_bonus"
      name="分成配置"
      defaults={DEFAULTS}
      sections={[ {
        title: "分成规则",
        fields: [
          { key: "mode", label: "分成模式(ratio/amount)", type: "text" },
          { key: "default_ratio", label: "默认分成比例(%)", type: "number" },
          { key: "levels", label: "分成级别", type: "objects", itemFields: [{ key: "name", label: "级别名", type: "text" }, { key: "ratio", label: "比例(%)", type: "number" }, { key: "reward", label: "额外奖励(元)", type: "number" }] },
        ],
      }
      ]}
    />
  );
}