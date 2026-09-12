export type BreadcrumbItem = { label: string; href?: string; children?: { label: string; href: string }[] };

const groups: Record<string, { label: string; href: string; children: { label: string; href: string }[] }> = {
  platform: { label: "平台账号", href: "/reg-user-all", children: [{ label: "账号管理", href: "/reg-user-all" }, { label: "登录日志", href: "/reg-user-log" }] },
  customer: { label: "客源线索", href: "/love-customer-list", children: [{ label: "线索管理", href: "/love-customer-list" }, { label: "数据报表", href: "/love-customer-statistics" }] },
  member: { label: "会员CRM", href: "/love-user-list", children: [{ label: "资料管理", href: "/love-user-list" }, { label: "会员认证", href: "/love-user-auth" }, { label: "内容核查", href: "/content-verify" }] },
  service: { label: "会员服务", href: "/vip-line-record", children: [{ label: "红娘牵线", href: "/vip-line-record" }, { label: "约见申请", href: "/love-interview" }, { label: "约会管理", href: "/love-appointment" }, { label: "推广管理", href: "/love-promotion" }] },
  totalstore: { label: "总店红娘", href: "/love-matchmaker-list", children: [{ label: "红娘管理", href: "/love-matchmaker-list" }, { label: "分派配置", href: "/love-matchmaker-apportion2" }, { label: "分成配置", href: "/love-matchmaker-distribution" }, { label: "分成明细", href: "/love-matchmaker-distribution-details" }] },
  promote: { label: "推广红娘", href: "/poplove-matchmaker-list", children: [{ label: "红娘管理", href: "/poplove-matchmaker-list" }, { label: "分成配置", href: "/poplove-matchmaker-distribution" }, { label: "分成明细", href: "/poplove-matchmaker-distribution-details" }] },
  branch: { label: "分店管理", href: "/branch-config", children: [{ label: "分站配置", href: "/branch-config" }, { label: "门店管理", href: "/mendian-list" }, { label: "分店红娘", href: "/branch-matchmaker-list" }, { label: "分店报表", href: "/branch-report-list" }, { label: "分成明细", href: "/branch-distribution-list" }] },
  partner: { label: "合伙红娘", href: "/love-partner-list", children: [{ label: "功能配置", href: "/love-partner-config" }, { label: "分成配置", href: "/love-partner-bonus-config" }, { label: "合伙人管理", href: "/love-partner-list" }, { label: "团队关系", href: "/love-partner-relation" }, { label: "分成明细", href: "/love-partner-bonus-details" }] },
  finance: { label: "财务管理", href: "/finance-config", children: [{ label: "系统配置", href: "/finance-config" }, { label: "收入明细", href: "/system-finance-order" }, { label: "统计报表", href: "/finance-statistic" }] },
  platformconfig: { label: "平台配置", href: "/platform-config-basic", children: [{ label: "基本配置", href: "/platform-config-basic" }, { label: "导航配置", href: "/platform-navconfig" }, { label: "平台布局", href: "/platform-page" }, { label: "权限配置", href: "/power-config" }, { label: "内容配置", href: "/platform-content" }, { label: "基础数据", href: "/platform-base" }, { label: "收费配置", href: "/platform-payconfig" }] },
  system: { label: "系统管理", href: "/system-setting-basic", children: [{ label: "系统配置", href: "/system-setting-basic" }, { label: "广告管理", href: "/system-setting-adconfig" }, { label: "外呼平台", href: "/outbound-call-platform" }, { label: "外呼状态", href: "/out-call-list" }, { label: "呼叫记录", href: "/out-call-record" }, { label: "签名配置", href: "/sms-signature" }, { label: "通知配置", href: "/sms-notices" }, { label: "短信群发", href: "/sms-group" }, { label: "发送记录", href: "/sms-record" }, { label: "添加账号", href: "/system-setting-admin-user-add" }, { label: "账号管理", href: "/system-setting-admin-user" }, { label: "权限分组", href: "/system-setting-admin-group" }, { label: "系统日志", href: "/system-setting-admin-log" }] },
};

export function getBreadcrumb(groupKey: string, pageLabel: string): BreadcrumbItem[] {
  const group = groups[groupKey] ?? Object.values(groups).find((item) => item.label === groupKey);
  return [{ label: "首页", href: "/" }, ...(group ? [{ ...group }] : []), { label: pageLabel }];
}
