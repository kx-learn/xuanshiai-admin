"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("活动报名", "参数配置");

const DEFAULTS = {
  "categories": [
    "专场活动",
    "会面小聚",
    "相亲大会",
    "政企联谊",
    "免费活动"
  ],
  "banner_url": null,
  "signup_tip": "线下活动规则",
  "allow_cancel": true,
  "max_signups_per_user": 1
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_active"
      name="参数配置"
      defaults={DEFAULTS}
      sections={[ {
        title: "活动分类",
        fields: [
          { key: "categories", label: "分类标签", type: "tags" },
        ],
      }, {
        title: "参数配置",
        fields: [
          { key: "banner_url", label: "活动宣传图", type: "image" },
          { key: "signup_tip", label: "用户协议须知", type: "html" },
          { key: "allow_cancel", label: "允许用户取消报名", type: "switch" },
          { key: "max_signups_per_user", label: "每人限报活动数", type: "number" },
        ],
      }
      ]}
    />
  );
}