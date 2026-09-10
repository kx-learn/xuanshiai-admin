"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "互动消息功能设置");

const DEFAULTS = {
  "like_enabled": true,
  "greet_enabled": true,
  "gift_notice_enabled": true,
  "daily_push_limit": 20,
  "quiet_hours": ""
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_interactive_function"
      name="互动消息功能设置"
      defaults={DEFAULTS}
      sections={[ {
        title: "消息开关",
        fields: [
          { key: "like_enabled", label: "点赞通知", type: "switch" },
          { key: "greet_enabled", label: "打招呼通知", type: "switch" },
          { key: "gift_notice_enabled", label: "礼物通知", type: "switch" },
        ],
      }, {
        title: "频率控制",
        fields: [
          { key: "daily_push_limit", label: "每日推送上限", type: "number" },
          { key: "quiet_hours", label: "免打扰时段(如 22:00-08:00)", type: "text" },
        ],
      }
      ]}
    />
  );
}