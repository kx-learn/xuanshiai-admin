"use client";

import ConfigForm from "@/components/ConfigForm";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("分店管理", "分站配置");

const notice = (
  <div className="ecl-notice">
    <div className="ecl-notice-body">
      <span className="ecl-notice-ic">i</span>
      <div className="ecl-notice-text">
        <div className="ecl-notice-title">须知</div>
        <p>分站是按照会员的&quot;现居地&quot;为依据进行划分，当访客进入到对应&quot;地区&quot;的分站，则平台首页中只显示出&quot;现居地&quot;为该地区的会员</p>
        <p>默认情况下进入分站显示所有地区的会员，访客可以手动通过点击右上角的区域自行切换到指定区域，切换后只显示出&quot;现居地&quot;为该地区的会员</p>
        <p>分站可以开启&quot;自动跳转&quot;来实现自动切换到指定区域，当系统识别出访客的IP归属地与分站为同一地区的时候将进入平台首页的时候会自动跳转到该地区分站</p>
        <p>分站模式支持全部模式、指定区域两种模式，可以在两种模式之间自由切换；全国模式不支持自动跳转和自定义分站名称文字</p>
      </div>
    </div>
  </div>
);

const DEFAULTS = {
  current_site: "",
  sites: [],
};

export default function BranchConfigPage() {
  return (
    <ConfigForm
      breadcrumb={breadcrumb}
      namespace="tools_branch"
      name="分站配置"
      defaults={DEFAULTS}
      notice={notice}
      sections={[ {
        title: "分站模式",
        fields: [
          { key: "current_site", label: "当前模式", type: "text", placeholder: "留空为全国模式，填写地区名即为指定地区模式", hint: "全国模式不支持自动跳转和自定义分站名称文字" },
        ],
      }, {
        title: "分站列表",
        fields: [
          { key: "sites", label: "分站", type: "objects", itemFields: [
            { key: "region", label: "分站地区", type: "text", width: 120 },
            { key: "name", label: "显示名称", type: "text", width: 140 },
            { key: "link", label: "链接", type: "text", width: 220 },
            { key: "qrcode_url", label: "链接/二维码", type: "image" },
            { key: "auto_jump", label: "自动跳转", type: "switch" },
          ] },
        ],
      } ]}
    />
  );
}
