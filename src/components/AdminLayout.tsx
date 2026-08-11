"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Coins,
  HeartHandshake,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Search,
  Settings,
  Store,
  Users,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminToken } from "@/lib/admin-api";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { logoutAdmin } from "@/lib/admin-auth";

type Item = { label: string; href: string };
type Group = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Item[];
};

const groups: Group[] = [
  { label: "平台账号", icon: Users, items: [{ label: "账号管理", href: "/reg-user-all" }, { label: "登录日志", href: "/reg-user-log" }] },
  { label: "客源线索", icon: ClipboardList, items: [{ label: "线索管理", href: "/love-customer-list" }, { label: "数据报表", href: "/love-customer-statistics" }, { label: "跟进总览", href: "/customer-follow-up" }] },
  { label: "会员 CRM", icon: HeartHandshake, items: [{ label: "资料管理", href: "/love-user-list" }, { label: "线上 VIP", href: "/love-user-vip" }, { label: "会员认证", href: "/love-user-auth" }, { label: "内容核查", href: "/content-verify" }, { label: "会员统计", href: "/love-user-statistics" }] },
  { label: "会员服务", icon: HeartHandshake, items: [{ label: "服务申请", href: "/love-interview" }, { label: "预约管理", href: "/love-appointment" }, { label: "服务商品", href: "/love-partner-config" }] },
  { label: "总店红娘", icon: Users, items: [{ label: "红娘管理", href: "/love-matchmaker-list" }, { label: "服务分配", href: "/love-matchmaker-distribution" }, { label: "分配明细", href: "/love-matchmaker-distribution-details" }] },
  { label: "分店管理", icon: Store, items: [{ label: "门店管理", href: "/mendian-list" }, { label: "分店红娘", href: "/branch-matchmaker-list" }, { label: "分店报表", href: "/branch-report-list" }] },
  { label: "推广红娘", icon: Coins, items: [{ label: "推广管理", href: "/vip-popularize-record" }, { label: "推广明细", href: "/love-partner-bonus-details" }] },
  { label: "合伙红娘", icon: Users, items: [{ label: "合伙人管理", href: "/love-partner-list" }, { label: "团队关系", href: "/love-partner-relation" }, { label: "分成配置", href: "/love-partner-bonus-config" }] },
  { label: "活动报名", icon: CalendarDays, items: [{ label: "活动管理", href: "/active-list" }, { label: "报名管理", href: "/active-signupmanager" }, { label: "互选记录", href: "/mutual-selection-record" }] },
  { label: "商家联盟", icon: Store, items: [{ label: "运营方案", href: "/active-alliance" }, { label: "功能配置", href: "/merchant-alliance-config" }, { label: "商家管理", href: "/merchant-management" }, { label: "商品管理", href: "/merchant-product" }, { label: "订单管理", href: "/merchant-order" }] },
  { label: "短视频", icon: Video, items: [{ label: "视频管理", href: "/short-video-list" }, { label: "评论管理", href: "/short-video-comment" }, { label: "打赏记录", href: "/short-video-tip" }] },
  { label: "运营工具", icon: LayoutGrid, items: [{ label: "内容单页", href: "/single-page" }, { label: "推文助手", href: "/generate-tool" }, { label: "应用中心", href: "/plugin-center" }] },
  { label: "财务管理", icon: Coins, items: [{ label: "财务订单", href: "/system-finance-order" }, { label: "财务统计", href: "/finance-statistic" }, { label: "提现审核", href: "/system-cashout-history" }, { label: "分成配置", href: "/finance-config" }] },
  { label: "系统管理", icon: Settings, items: [{ label: "基础设置", href: "/system-setting-basic" }, { label: "管理员", href: "/system-setting-admin-user" }, { label: "系统日志", href: "/system-setting-admin-log" }] },
  { label: "公众号", icon: MessageCircle, items: [{ label: "粉丝管理", href: "/wechat-fans" }, { label: "菜单配置", href: "/wechat-menu" }, { label: "自动回复", href: "/wechat-autoreply" }] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [accountName, setAccountName] = useState("管理员");
  const activeGroup = useMemo(() => groups.find((group) => group.items.some((item) => pathname === item.href)), [pathname]);
  const [open, setOpen] = useState(activeGroup?.label ?? "平台账号");

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
    if (activeGroup) setOpen(activeGroup.label);
  }, [activeGroup]);

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f4f6fa] text-sm text-[#8c96a8]">正在验证管理员身份...</div>;
  }

  const sidebarWidth = collapsed ? 64 : 224;

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#333]">
      <header className="fixed inset-x-0 top-0 z-40 h-12 bg-[#1f2b3d] text-white">
        <div className="flex h-full items-center px-4">
          <Link href="/home" className={cn("shrink-0 text-[15px] font-semibold tracking-wide", collapsed ? "w-12" : "w-52")}>婚恋运营管理系统</Link>
          {!collapsed && <span className="text-xs text-white/55">为婚恋行业发展提供科技赋能</span>}
          <div className="ml-auto flex items-center gap-4 text-xs text-white/75">
            <span className="hidden md:inline-flex items-center gap-1.5"><CircleHelp className="h-3.5 w-3.5" />帮助中心</span>
            <span className="hidden md:inline-flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" />工单反馈</span>
            <span>{accountName}</span>
            <button className="inline-flex items-center gap-1 text-white/60 hover:text-white" onClick={() => logoutAdmin().then(() => router.replace("/login"))}><LogOut className="h-3.5 w-3.5" />退出</button>
          </div>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-12 z-30 border-r border-[#e7eaf0] bg-white transition-[width]" style={{ width: sidebarWidth }}>
        <nav className="sidebar-scroll h-[calc(100%-40px)] overflow-y-auto py-2">
          <Link href="/home" className={cn("mx-2 mb-1 flex items-center rounded px-3 py-2 text-sm hover:bg-[#f3f6ff]", pathname === "/home" ? "bg-[#edf2ff] text-[#3658f7]" : "text-[#555]", collapsed && "justify-center px-0")} title={collapsed ? "概览" : undefined}>
            <BarChart3 className="h-4 w-4 shrink-0" />{!collapsed && <span className="ml-3">概览</span>}
          </Link>
          {groups.map((group) => {
            const Icon = group.icon;
            const expanded = open === group.label && !collapsed;
            return <div key={group.label}>
              <button onClick={() => setOpen(expanded ? "" : group.label)} className={cn("mx-2 flex w-[calc(100%-16px)] items-center rounded px-3 py-2 text-sm text-[#555] hover:bg-[#f3f6ff]", collapsed && "justify-center px-0")} title={collapsed ? group.label : undefined}>
                <Icon className="h-4 w-4 shrink-0" />{!collapsed && <><span className="ml-3 flex-1 text-left">{group.label}</span>{expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</>}
              </button>
              {expanded && <div className="pb-1">{group.items.map((item) => <Link key={item.href} href={item.href} className={cn("block py-2 pl-11 pr-3 text-[13px] text-[#666] hover:text-[#3658f7]", pathname === item.href && "bg-[#edf2ff] font-medium text-[#3658f7]")}>{item.label}</Link>)}</div>}
            </div>;
          })}
        </nav>
        <button onClick={() => setCollapsed((value) => !value)} className="flex h-10 w-full items-center justify-center border-t border-[#f0f0f0] text-[#999] hover:text-[#3658f7]" aria-label="折叠侧边栏"><Menu className="h-4 w-4" /></button>
      </aside>

      <main className="min-h-screen pt-12 transition-[margin]" style={{ marginLeft: sidebarWidth }}>
        <div className="border-b border-[#e9ecf2] bg-white px-6 py-2.5">
          <div className="flex items-center gap-4 text-xs text-[#8c96a8]">
            <span className="font-medium text-[#333]">红娘课堂</span>
            <Link href="/operate-center" className="hover:text-[#3658f7]">婚创学苑</Link>
            <span className="ml-auto inline-flex items-center gap-2 rounded border border-[#e1e5ec] px-2 py-1 text-[#8c96a8]"><Search className="h-3.5 w-3.5" />输入会员昵称/手机/编号/姓名</span>
            <Link href="/crm/home" className="text-[#3658f7]">红娘工作台</Link>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
