"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "会员分区");

const notice = (
  <div className="ecl-notice">
    <div className="ecl-notice-body">
      <span className="ecl-notice-ic">◇</span>
      <div className="ecl-notice-text">
        <div className="ecl-notice-title">须知</div>
        <p>会员分区功能可帮助您的企业快速建立各种主题的会员聚合页面，将会员按照性格特征进行分类集中展示，能够给会员快速的引导入口，增强关注度和流量导入。还可以通过专区功能轻松创建互动活动</p>
      </div>
    </div>
  </div>
);

const DEFAULTS = {
  zones: [],
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_member_zone"
      name="会员分区"
      defaults={DEFAULTS}
      notice={notice}
      sections={[ {
        title: "会员分区",
        fields: [
          { key: "zones", label: "分区列表", type: "objects", itemFields: [
            { key: "name", label: "分区名称", type: "text", width: 180 },
            { key: "link", label: "链接", type: "text", width: 220 },
            { key: "status", label: "启用", type: "switch" },
          ] },
        ],
      } ]}
    />
  );
}
