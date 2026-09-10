"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "参数配置");

const DEFAULTS = {
  "red_packet_enabled": true,
  "comment_enabled": true,
  "tip_enabled": true,
  "publish_review": false,
  "banner_url": null,
  "daily_publish_limit": 5
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_short_video"
      name="参数配置"
      defaults={DEFAULTS}
      sections={[ {
        title: "功能开关",
        fields: [
          { key: "red_packet_enabled", label: "视频红包", type: "switch" },
          { key: "comment_enabled", label: "评论区", type: "switch" },
          { key: "tip_enabled", label: "打赏", type: "switch" },
          { key: "publish_review", label: "发布需审核", type: "switch" },
        ],
      }, {
        title: "展示参数",
        fields: [
          { key: "banner_url", label: "栏目头图", type: "image" },
          { key: "daily_publish_limit", label: "每日发布上限", type: "number" },
        ],
      }
      ]}
    />
  );
}