"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "红娘喜讯栏目配置");

const DEFAULTS = {
  "title": "红娘喜讯",
  "description": "Ta们都是在我们的介绍撮合下，从相识、到恋爱、到见父母、到订婚、到结婚生子！",
  "share_cover_mode": "default",
  "share_cover_url": null,
  "banner_url": null,
  "view_url": "/subpages/xixun/index",
  "categories": [
    "牵手成功",
    "恋爱生活",
    "已见父母",
    "已订婚",
    "已领证",
    "已办婚礼",
    "婚后生活",
    "锦旗飘扬"
  ],
  "category_icons": [],
  "blessings": []
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_good_news"
      name="红娘喜讯栏目配置"
      defaults={DEFAULTS}
      sections={[ {
        title: "栏目设置",
        fields: [
          { key: "title", label: "栏目标题", type: "text" },
          { key: "description", label: "栏目描述", type: "textarea" },
          { key: "share_cover_url", label: "分享封面(300*300)", type: "image" },
          { key: "banner_url", label: "宣传头图", type: "image" },
        ],
      }, {
        title: "喜讯分类",
        fields: [
          { key: "categories", label: "分类(按顺序展示)", type: "tags" },
        ],
      }, {
        title: "祝福语管理",
        fields: [
          { key: "blessings", label: "祝福语", type: "tags" },
        ],
      }
      ]}
    />
  );
}