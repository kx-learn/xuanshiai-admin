"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "搭子社群栏目配置");

const DEFAULTS = {
  "title": "搭子社群",
  "description": "兴趣搭子、活动搭子，找同频的人。",
  "share_cover_url": null,
  "categories": []
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_column_config"
      name="搭子社群栏目配置"
      defaults={DEFAULTS}
      sections={[ {
        title: "栏目设置",
        fields: [
          { key: "title", label: "栏目标题", type: "text" },
          { key: "description", label: "栏目描述", type: "textarea" },
          { key: "share_cover_url", label: "分享封面(300*300)", type: "image" },
          { key: "categories", label: "社群分类", type: "tags" },
        ],
      }
      ]}
    />
  );
}