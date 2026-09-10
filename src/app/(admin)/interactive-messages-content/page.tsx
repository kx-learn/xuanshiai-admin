"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "互动消息内容设置");

const DEFAULTS = {
  "templates": []
};

export default function Page() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_interactive_content"
      name="互动消息内容设置"
      defaults={DEFAULTS}
      sections={[ {
        title: "消息文案模板",
        fields: [
          { key: "templates", label: "模板列表", type: "objects", itemFields: [{ key: "name", label: "模板名", type: "text" }, { key: "content", label: "文案内容", type: "text" }] },
        ],
      }
      ]}
    />
  );
}