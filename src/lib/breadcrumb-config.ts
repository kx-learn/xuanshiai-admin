export type BreadcrumbItem = { label: string; href?: string; children?: { label: string; href: string }[] };

const groups: Record<string, { label: string; href: string; children: { label: string; href: string }[] }> = {
  platform: { label: "平台账号", href: "/reg-user-all", children: [{ label: "账号管理", href: "/reg-user-all" }, { label: "登录日志", href: "/reg-user-log" }] },
  customer: { label: "客源线索", href: "/love-customer-list", children: [{ label: "线索管理", href: "/love-customer-list" }, { label: "数据报表", href: "/love-customer-statistics" }] },
  member: { label: "会员CRM", href: "/love-user-list", children: [{ label: "资料管理", href: "/love-user-list" }, { label: "会员认证", href: "/love-user-auth" }, { label: "内容核查", href: "/content-verify" }] },
  finance: { label: "财务管理", href: "/finance-config", children: [{ label: "系统配置", href: "/finance-config" }, { label: "收入明细", href: "/system-finance-order" }, { label: "统计报表", href: "/finance-statistic" }] },
  system: { label: "系统管理", href: "/system-setting-basic", children: [{ label: "系统配置", href: "/system-setting-basic" }, { label: "账号管理", href: "/system-setting-admin-user" }, { label: "系统日志", href: "/system-setting-admin-log" }] },
};

export function getBreadcrumb(groupKey: string, pageLabel: string): BreadcrumbItem[] {
  const group = groups[groupKey];
  return [{ label: "首页", href: "/" }, ...(group ? [{ ...group }] : []), { label: pageLabel }];
}
