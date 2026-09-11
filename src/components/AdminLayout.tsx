"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Bell,
  Cloud,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Coins,
  CreditCard,
  CircleUserRound,
  GraduationCap,
  HeartHandshake,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Gift,
  Monitor,
  Search,
  Settings,
  Smartphone,
  Store,
  Users,
  Video,
} from "lucide-react";
import CloudMaterialModal from "@/components/CloudMaterialModal";
import MatchmakerClassModal from "@/components/MatchmakerClassModal";
import UpdateReportModal from "@/components/UpdateReportModal";
import UseSystemModal from "@/components/UseSystemModal";
import RechargeModal from "@/components/RechargeModal";
import ChangePasswordModal from "@/components/ChangePasswordModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";
import { getAdminToken } from "@/lib/admin-api";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { logoutAdmin } from "@/lib/admin-auth";

type Item = { label: string; href: string };
type MenuItem = { label: string; href?: string; children?: Item[] };
type Group = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
};

const groups: Group[] = [
  { label: "平台账号", icon: Users, items: [{ label: "账号管理", href: "/reg-user-all" }, { label: "登录日志", href: "/reg-user-log" }] },
  { label: "客源线索", icon: ClipboardList, items: [{ label: "线索管理", href: "/love-customer-list" }, { label: "数据报表", href: "/love-customer-statistics" }, { label: "跟进全览", href: "/customer-follow-up" }, { label: "功能配置", href: "/love-customer-config" }] },
  { label: "会员CRM", icon: HeartHandshake, items: [{ label: "资料管理", href: "/love-user-list" }, { label: "线上VIP", href: "/love-user-vip" }, { label: "线下VIP", href: "/love-user-vip-underline" }, { label: "会员认证", href: "/love-user-auth" }, { label: "内容核查", href: "/content-verify" }, { label: "线上行为", href: "/love-user-behavior" }, { label: "数据报表", href: "/love-user-statistics" }, { label: "跟进全览", href: "/love-user-follow-up" }] },
  { label: "会员服务", icon: HeartHandshake, items: [{ label: "红娘牵线", href: "/vip-line-record" }, { label: "约见申请", href: "/love-interview" }, { label: "约会管理", href: "/love-appointment" }, { label: "推广管理", href: "/love-promotion" }] },
  { label: "总店红娘", icon: Users, items: [{ label: "红娘管理", href: "/love-matchmaker-list" }, { label: "分派配置", href: "/love-matchmaker-apportion2" }, { label: "分成配置", href: "/love-matchmaker-distribution" }, { label: "分成明细", href: "/love-matchmaker-distribution-details" }] },
  { label: "分店管理", icon: Store, items: [{ label: "分站配置", href: "/branch-config" }, { label: "门店管理", href: "/mendian-list" }, { label: "分店红娘", href: "/branch-matchmaker-list" }, { label: "分店报表", href: "/branch-report-list" }, { label: "分成明细", href: "/branch-distribution-list" }] },
  { label: "推广红娘", icon: Coins, items: [{ label: "红娘管理", href: "/poplove-matchmaker-list" }, { label: "分成配置", href: "/poplove-matchmaker-distribution" }, { label: "分成明细", href: "/poplove-matchmaker-distribution-details" }] },
  { label: "合伙红娘", icon: Users, items: [{ label: "功能配置", href: "/love-partner-config" }, { label: "分成配置", href: "/love-partner-bonus-config" }, { label: "合伙人管理", href: "/love-partner-list" }, { label: "团队关系", href: "/love-partner-relation" }, { label: "分成明细", href: "/love-partner-bonus-details" }] },
  { label: "活动报名", icon: CalendarDays, items: [{ label: "参数配置", href: "/active-config" }, { label: "活动管理", href: "/active-list" }, { label: "报名管理", href: "/active-signupmanager" }, { label: "互选活动", children: [{ label: "活动管理", href: "/mutual-selection-list" }, { label: "互选记录", href: "/mutual-selection-record" }] }] },
  { label: "商家联盟", icon: Store, items: [{ label: "运营方案", href: "/active-alliance" }, { label: "功能配置", href: "/merchant-alliance-config" }, { label: "商家管理", href: "/merchant-management" }, { label: "商品管理", href: "/merchant-product" }, { label: "订单管理", href: "/merchant-order" }] },
  { label: "短视频", icon: Video, items: [{ label: "参数配置", href: "/short-video-config" }, { label: "视频管理", href: "/short-video-list" }, { label: "红包记录", href: "/short-video-red-packet" }, { label: "评论管理", href: "/short-video-comment" }, { label: "会员主页", href: "/short-video-homepage" }, { label: "打赏管理", href: "/short-video-tip" }] },
  { label: "运营工具", icon: LayoutGrid, items: [
    { label: "自由收款", href: "/free-pay" },
    { label: "红娘喜讯", children: [{ label: "栏目配置", href: "/xixun-menu" }, { label: "喜讯管理", href: "/xixun-list" }, { label: "锦旗管理", href: "/xixun-banner" }] },
    { label: "搭子社群", children: [{ label: "栏目配置", href: "/group-menu" }, { label: "社群管理", href: "/group-list" }, { label: "报名管理", href: "/group-signup" }] },
    { label: "互动消息", children: [{ label: "功能设置", href: "/interact-config" }, { label: "内容设置", href: "/interact-content" }, { label: "消息记录", href: "/interact-record" }] },
    { label: "销售匹配库", href: "/sales-match" },
    { label: "内容单页", href: "/single-page" },
    { label: "超级获客", children: [{ label: "落地页", href: "/customer-landing" }, { label: "自由表单", href: "/free-form" }] },
    { label: "批量资料卡", href: "/tool-lovecard" },
    { label: "会员分区", href: "/tool-theme" },
    { label: "短信群发", href: "/sms-group" },
    { label: "送礼物", href: "/love-gift-wrap" },
    { label: "推文助手", href: "/generate-tool" },
    { label: "吸粉二维码", href: "/qrcode-wrap" },
    { label: "积分商城", children: [{ label: "礼品管理", href: "/gift-list" }, { label: "兑换管理", href: "/gift-exchange" }] },
  ] },
  { label: "财务管理", icon: Coins, items: [
    { label: "系统配置", href: "/finance-config" },
    { label: "收入明细", href: "/system-finance-order" },
    { label: "积分明细", href: "/system-credit-history" },
    { label: "余额提现", href: "/system-cashout-history" },
    { label: "统计报表", href: "/finance-statistic" },
    { label: "电子合同", children: [{ label: "合同管理", href: "/e-contract-list" }, { label: "模板管理", href: "/e-contract-template" }, { label: "印章管理", href: "/e-contract-yinzhang" }, { label: "合同配置", href: "/e-contract-config" }] },
  ] },
  { label: "系统管理", icon: Settings, items: [
    { label: "系统配置", href: "/system-setting-basic" },
    { label: "广告管理", href: "/system-setting-adconfig" },
    { label: "电话外呼", children: [{ label: "外呼平台", href: "/outbound-call-platform" }, { label: "外呼状态", href: "/out-call-list" }, { label: "呼叫记录", href: "/out-call-record" }] },
    { label: "短信系统", children: [{ label: "签名配置", href: "/sms-signature" }, { label: "通知配置", href: "/sms-notices" }, { label: "短信群发", href: "/sms-group" }, { label: "发送记录", href: "/sms-record" }] },
    { label: "后台账号", children: [{ label: "添加账号", href: "/system-setting-admin-user-add" }, { label: "账号管理", href: "/system-setting-admin-user" }, { label: "权限分组", href: "/system-setting-admin-group" }] },
    { label: "系统日志", href: "/system-setting-admin-log" },
  ] },
  { label: "平台配置", icon: LayoutGrid, items: [{ label: "基本配置", href: "/platform-config-basic" }, { label: "导航配置", href: "/platform-navconfig" }, { label: "平台布局", href: "/platform-page" }, { label: "权限配置", href: "/power-config" }, { label: "内容配置", href: "/platform-content" }, { label: "基础数据", href: "/platform-base" }, { label: "收费配置", href: "/platform-payconfig" }] },
  { label: "公众号", icon: MessageCircle, items: [{ label: "参数配置", href: "/wechat-config" }, { label: "关注粉丝", href: "/wechat-fans" }, { label: "菜单配置", href: "/wechat-menu" }, { label: "自动回复", href: "/wechat-autoreply" }, { label: "模板消息", href: "/wechat-template" }, { label: "消息群发", href: "/wechat-send" }] },
  { label: "小程序", icon: MessageCircle, items: [{ label: "参数配置", href: "/miniprogram-config" }] },
];

const utilityLinks: Array<Item & { icon: React.ComponentType<{ className?: string }> }> = [
  { label: "应用中心", href: "/plugin-center", icon: LayoutGrid },
  { label: "婚创学苑", href: "/operate-center", icon: CalendarDays },
];

const quickNav: Item[] = [
  { label: "客源线索", href: "/love-customer-list" },
  { label: "会员管理", href: "/love-user-list" },
  { label: "牵线管理", href: "/vip-line-record" },
  { label: "会员匹配", href: "/love-matchmaker-list" },
  { label: "线下会员", href: "/love-user-vip-underline" },
  { label: "约会管理", href: "/love-appointment" },
  { label: "会员分区", href: "/tool-theme" },
  { label: "活动报名", href: "/active-signupmanager" },
  { label: "推广红娘", href: "/poplove-matchmaker-list" },
  { label: "服务红娘", href: "/love-matchmaker-list" },
  { label: "收入明细", href: "/system-finance-order" },
  { label: "短信充值", href: "/sms-group" },
];

const serviceGroup: Group = {
  label: "官方服务",
  icon: MessageCircle,
  items: [
    { label: "工单反馈", href: "/system-feedback" },
    { label: "软件授权", href: "/system-empower" },
  ] as Item[],
};

function findInItems(items: MenuItem[], pathname: string): MenuItem | undefined {
  for (const item of items) {
    if (item.href === pathname) return item;
    if (item.children?.some((child) => child.href === pathname)) return item;
  }
  return undefined;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [accountName, setAccountName] = useState("管理员");
  const [cloudOpen, setCloudOpen] = useState(false);
  const [classOpen, setClassOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [useSystemOpen, setUseSystemOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const activeGroup = useMemo(() => {
    const inGroups = groups.find((group) => findInItems(group.items, pathname) || (group.label === "平台账号" && pathname === "/reg-user-cancel"));
    if (inGroups) return inGroups;
    if (serviceGroup.items.some((item) => pathname === item.href)) return serviceGroup;
    return undefined;
  }, [pathname]);
  const activeSub = activeGroup ? findInItems(activeGroup.items, pathname) : undefined;
  const [openGroups, setOpenGroups] = useState<string[]>(activeGroup ? [activeGroup.label] : ["平台账号"]);
  const [openSubGroups, setOpenSubGroups] = useState<string[]>(() => activeSub?.children ? [activeSub.label] : []);

  useEffect(() => {
    if (!getAdminToken()) {
      router.replace("/login");
      return;
    }
    adminEndpoints.me()
      .then((result) => {
        setAccountName(String(result.account?.display_name ?? result.account?.username ?? "管理员"));
        setAuthReady(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    if (activeGroup) setOpenGroups((current) => current.includes(activeGroup.label) ? current : [...current, activeGroup.label]);
  }, [activeGroup]);

  useEffect(() => {
    if (activeSub?.children) setOpenSubGroups((current) => current.includes(activeSub.label) ? current : [...current, activeSub.label]);
  }, [activeSub]);

  const toggleSub = (label: string) => setOpenSubGroups((current) => current.includes(label) ? current.filter((l) => l !== label) : [...current, label]);

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f4f6fa] text-sm text-[#8c96a8]">正在验证管理员身份...</div>;
  }

  const sidebarWidth = collapsed ? 64 : 224;

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#333]">
      <header className="fixed inset-x-0 top-0 z-40 h-[58px] bg-[#272d45] text-white shadow-sm">
        <div className="flex h-full items-center gap-1 px-2 lg:px-4">
          <Link href="/home" aria-label="首页" className="flex w-[78px] shrink-0 items-center"><span className="font-serif text-[22px] font-bold italic leading-none text-[#6e92f6]">163R</span></Link>
          <div className="translate-x-2 hidden items-center gap-1 whitespace-nowrap text-[11px] font-medium text-[#d9dceb] xl:flex"><span>⌘ 当前版本：V9.0</span><button type="button" onClick={() => setReportOpen(true)} className="rounded bg-[#3d455f] px-2 py-1.5">更新报告</button><Link href="/system-feedback" className="rounded bg-[#3d455f] px-2 py-1.5">工单反馈</Link><button type="button" onClick={() => setUseSystemOpen(true)} className="rounded bg-[#3d455f] px-2 py-1.5">用好系统</button><button type="button" onClick={() => setRechargeOpen(true)} className="rounded bg-[#3d455f] px-2 py-1.5">充值</button></div>
          <div className="ml-auto flex min-w-0 items-center gap-1 whitespace-nowrap"><button type="button" onClick={() => setClassOpen(true)} className="hidden items-center gap-1 rounded bg-[#3d5cf1] px-2 py-1.5 text-[11px] font-semibold sm:inline-flex"><Bell className="h-3 w-3" />红娘课堂</button><Link href="/operate-center" className="hidden items-center gap-1 rounded bg-[#4a62ed] px-2 py-1.5 text-[11px] font-semibold md:inline-flex"><Gift className="h-3 w-3" />婚创学苑</Link><button type="button" onClick={() => setCloudOpen(true)} className="hidden items-center gap-1 rounded bg-[#eb3d7d] px-2 py-1.5 text-[11px] font-semibold lg:inline-flex"><Cloud className="h-3 w-3" />云端图库</button><div className="relative hidden xl:block" onMouseEnter={() => setNavOpen(true)} onMouseLeave={() => setNavOpen(false)}><label className="flex h-7 w-[250px] shrink-0 items-center gap-1.5 rounded-full bg-[#3c435c] px-2.5 text-[#aeb4c8]"><input className="min-w-0 flex-1 whitespace-nowrap bg-transparent text-[11px] outline-none placeholder:text-[#aeb4c8]" placeholder="输入会员昵称/手机号/编号/姓名" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { router.push(`/love-user-list?keyword=${encodeURIComponent(searchKeyword)}`); setNavOpen(false); } }} /><button type="button" onClick={() => { router.push(`/love-user-list?keyword=${encodeURIComponent(searchKeyword)}`); setNavOpen(false); }} className="shrink-0" aria-label="搜索"><Search className="h-3 w-3 shrink-0" /></button></label><div className={`quicknav-panel ${navOpen ? "quicknav-visible" : ""}`}><div className="quicknav-title">快捷导航</div><div className="quicknav-grid">{quickNav.map((q) => <Link key={q.label} href={q.href} className="quicknav-item">{q.label}</Link>)}</div></div></div><div className="hidden items-center gap-1.5 text-[11px] text-[#e0e2eb] lg:flex"><span className="inline-flex items-center gap-1"><Smartphone className="h-3 w-3" />手机版</span><span className="inline-flex items-center gap-1"><Monitor className="h-3 w-3" />电脑版</span><a href="https://www.xuanshiai.com/crm/user/login?redirect=/home" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1"><HeartHandshake className="h-3 w-3" />红娘工作台</a></div><div className="relative flex shrink-0 items-center" onMouseEnter={() => setProfileOpen(true)} onMouseLeave={() => setProfileOpen(false)}><button className="flex shrink-0 items-center gap-1 text-[11px]"><CircleUserRound className="h-5 w-5 text-[#d8d9df]" /><span>{accountName}</span><ChevronDown className="h-3 w-3" /></button><div className={`profile-panel ${profileOpen ? "profile-visible" : ""}`}><Link href="/system-setting-admin-user-edit" className="profile-item">绑定手机</Link><Link href="/system-feedback" className="profile-item">绑定微信</Link><button type="button" className="profile-item" onClick={() => setChangePwdOpen(true)}>修改密码</button><button type="button" className="profile-item" onClick={() => { setProfileOpen(false); setLogoutConfirmOpen(true); }}>退出登录</button></div></div></div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-[58px] z-30 border-r border-[#e7eaf0] bg-white transition-[width]" style={{ width: sidebarWidth }}>
        <nav className="sidebar-scroll h-[calc(100%-40px)] overflow-y-auto py-2">
          <Link href="/home" className={cn("mx-2 mb-1 flex items-center rounded px-3 py-2 text-sm hover:bg-[#f3f6ff]", pathname === "/home" ? "bg-[#edf2ff] text-[#3658f7]" : "text-[#555]", collapsed && "justify-center px-0")} title={collapsed ? "概览" : undefined}>
            <BarChart3 className="h-4 w-4 shrink-0" />{!collapsed && <span className="ml-3">概览</span>}
          </Link>
          {groups.map((group) => {
            const Icon = group.icon;
            const expanded = openGroups.includes(group.label) && !collapsed;
            return <div key={group.label}>
              <button onClick={() => setOpenGroups((current) => current.includes(group.label) ? current.filter((label) => label !== group.label) : [...current, group.label])} className={cn("mx-2 flex w-[calc(100%-16px)] items-center rounded px-3 py-2 text-sm text-[#555] hover:bg-[#f3f6ff]", collapsed && "justify-center px-0")} title={collapsed ? group.label : undefined}>
                <Icon className="h-4 w-4 shrink-0" />{!collapsed && <><span className="ml-3 flex-1 text-left">{group.label}</span>{expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</>}
              </button>
              {expanded && <div className="pb-1">{group.items.map((item) => {
                const isParent = !!item.children;
                if (!isParent) {
                  return <Link key={item.label} href={item.href!} className={cn("block py-2 pl-11 pr-3 text-[13px] text-[#666] hover:text-[#3658f7]", (pathname === item.href || (pathname === "/reg-user-cancel" && item.href === "/reg-user-all")) && "bg-[#edf2ff] font-medium text-[#3658f7]")}>{item.label}</Link>;
                }
                const subExpanded = !collapsed && openSubGroups.includes(item.label);
                const isActiveParent = activeSub?.label === item.label;
                return (
                  <div key={item.label}>
                    <button onClick={() => toggleSub(item.label)} className={cn("flex w-full items-center py-2 pl-11 pr-3 text-left text-[13px] hover:text-[#3658f7]", isActiveParent ? "bg-[#f0f5ff] font-medium text-[#3658f7]" : "text-[#666]")}>
                      <span className="flex-1">{item.label}</span>
                      {subExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                    </button>
                    {subExpanded && <div>{item.children!.map((child) => <Link key={child.href} href={child.href} className={cn("block py-2 pl-[70px] pr-3 text-[13px] text-[#666] hover:text-[#3658f7]", pathname === child.href && "bg-[#edf2ff] font-medium text-[#3658f7]")}>{child.label}</Link>)}</div>}
                  </div>
                );
              })}</div>}
            </div>;
          })}
          <div className="mt-2 border-t border-[#f0f2f5] pt-2">
            {utilityLinks.map(({ label, href, icon: Icon }) => <Link key={href} href={href} className={cn("mx-2 mb-1 flex items-center rounded px-3 py-2 text-sm hover:bg-[#f3f6ff]", pathname === href ? "bg-[#edf2ff] text-[#3658f7]" : "text-[#555]", collapsed && "justify-center px-0")} title={collapsed ? label : undefined}><Icon className="h-4 w-4 shrink-0" />{!collapsed && <span className="ml-3">{label}</span>}</Link>)}
            {(() => {
              const Icon = serviceGroup.icon;
              const expanded = openGroups.includes(serviceGroup.label) && !collapsed;
              return (
                <div>
                  <button onClick={() => setOpenGroups((current) => current.includes(serviceGroup.label) ? current.filter((label) => label !== serviceGroup.label) : [...current, serviceGroup.label])} className={cn("mx-2 flex w-[calc(100%-16px)] items-center rounded px-3 py-2 text-sm text-[#555] hover:bg-[#f3f6ff]", collapsed && "justify-center px-0")} title={collapsed ? serviceGroup.label : undefined}>
                    <Icon className="h-4 w-4 shrink-0" />{!collapsed && <><span className="ml-3 flex-1 text-left">{serviceGroup.label}</span>{expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</>}
                  </button>
                  {expanded && <div className="pb-1">{serviceGroup.items.map((item) => <Link key={item.href} href={item.href!} className={cn("block py-2 pl-11 pr-3 text-[13px] text-[#666] hover:text-[#3658f7]", pathname === item.href && "bg-[#edf2ff] font-medium text-[#3658f7]")}>{item.label}</Link>)}</div>}
                </div>
              );
            })()}
          </div>
        </nav>
        <button onClick={() => setCollapsed((value) => !value)} className="flex h-10 w-full items-center justify-center border-t border-[#f0f0f0] text-[#999] hover:text-[#3658f7]" aria-label="折叠侧边栏"><Menu className="h-4 w-4" /></button>
      </aside>

      <main className="min-h-screen pt-[58px] transition-[margin]" style={{ marginLeft: sidebarWidth }}>
        <div className="p-6">{children}</div>
      </main>

      <CloudMaterialModal open={cloudOpen} onClose={() => setCloudOpen(false)} />
      <MatchmakerClassModal open={classOpen} onClose={() => setClassOpen(false)} />
      <UpdateReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
      <UseSystemModal open={useSystemOpen} onClose={() => setUseSystemOpen(false)} />
      <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} />
      <ChangePasswordModal open={changePwdOpen} onClose={() => setChangePwdOpen(false)} />
      <ConfirmDialog
        open={logoutConfirmOpen}
        message="您确定要退出登录吗？"
        onCancel={() => setLogoutConfirmOpen(false)}
        onConfirm={() => {
          setLogoutConfirmOpen(false);
          void logoutAdmin().then(() => router.replace("/login"));
        }}
      />
    </div>
  );
}
