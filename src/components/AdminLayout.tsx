"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, ChevronDown, ChevronRight, Menu, Settings, Users, Heart, Store, Wallet, MessageCircle, Calendar, Video, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminToken } from "@/lib/admin-api";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { logoutAdmin } from "@/lib/admin-auth";

type Item = { label: string; href: string };
type Group = { label: string; icon: React.ComponentType<{ className?: string }>; items: Item[] };
const groups: Group[] = [
  { label: "概览", icon: BarChart3, items: [{ label: "账号管理", href: "/reg-user-all" }, { label: "登录日志", href: "/reg-user-log" }] },
  { label: "客源线索", icon: Users, items: [{ label: "线索管理", href: "/love-customer-list" }, { label: "数据报表", href: "/love-customer-statistics" }, { label: "跟进全览", href: "/customer-follow-up" }] },
  { label: "会员 CRM", icon: Heart, items: [{ label: "资料管理", href: "/love-user-list" }, { label: "会员认证", href: "/love-user-auth" }, { label: "内容核查", href: "/content-verify" }, { label: "会员统计", href: "/love-user-statistics" }] },
  { label: "红娘与门店", icon: Store, items: [{ label: "红娘管理", href: "/love-matchmaker-list" }, { label: "分店管理", href: "/mendian-list" }, { label: "分配配置", href: "/love-matchmaker-apportion" }] },
  { label: "活动与商户", icon: Calendar, items: [{ label: "活动管理", href: "/active-list" }, { label: "报名管理", href: "/active-signupmanager" }, { label: "商户管理", href: "/merchant-management" }, { label: "订单管理", href: "/merchant-order" }] },
  { label: "短视频", icon: Video, items: [{ label: "视频管理", href: "/short-video-list" }, { label: "评论管理", href: "/short-video-comment" }] },
  { label: "财务管理", icon: Wallet, items: [{ label: "收入明细", href: "/system-finance-order" }, { label: "统计报表", href: "/finance-statistic" }, { label: "财务配置", href: "/finance-config" }] },
  { label: "运营工具", icon: Wrench, items: [{ label: "内容单页", href: "/single-page" }, { label: "推文助手", href: "/generate-tool" }] },
  { label: "公众号", icon: MessageCircle, items: [{ label: "粉丝管理", href: "/wechat-fans" }, { label: "菜单配置", href: "/wechat-menu" }, { label: "自动回复", href: "/wechat-autoreply" }] },
  { label: "系统管理", icon: Settings, items: [{ label: "系统配置", href: "/system-setting-basic" }, { label: "管理员", href: "/system-setting-admin-user" }, { label: "系统日志", href: "/system-setting-admin-log" }] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    if (!getAdminToken()) { router.replace("/login"); return; }
    adminEndpoints.me().then(() => setAuthReady(true)).catch(() => router.replace("/login"));
  }, [router]);
  useEffect(() => { setOpen(groups.find((group) => group.items.some((item) => pathname === item.href))?.label ?? "概览"); }, [pathname]);
  if (!authReady) return <div className="flex min-h-screen items-center justify-center bg-[#f4f5f9] text-sm text-[#8993a4]">正在验证管理员身份...</div>;
  const width = collapsed ? 64 : 224;
  return <div className="min-h-screen bg-[#f4f5f9] text-[#333]"><header className="fixed inset-x-0 top-0 z-40 h-12 bg-[#1f2b3d] text-white"><div className="flex h-full items-center px-4"><div className="w-52 text-base font-semibold">寻爱管理后台</div><div className="text-xs text-white/60">会员与运营管理平台</div><div className="ml-auto flex items-center text-xs text-white/75"><span>管理员</span><button onClick={() => logoutAdmin().then(() => router.replace("/login"))} className="ml-4 text-white/60 hover:text-white">退出登录</button></div></div></header><aside className="fixed bottom-0 left-0 top-12 z-30 border-r border-[#e8e8e8] bg-white transition-[width]" style={{ width }}><div className="sidebar-scroll h-[calc(100%-40px)] overflow-y-auto py-2">{groups.map((group) => { const Icon = group.icon; const expanded = open === group.label && !collapsed; return <div key={group.label}><button onClick={() => setOpen(expanded ? null : group.label)} className={cn("flex w-full items-center px-4 py-2 text-sm text-[#555] hover:bg-[#f5f7ff]", collapsed && "justify-center px-0")} title={collapsed ? group.label : undefined}><Icon className="h-4 w-4 shrink-0" />{!collapsed && <><span className="ml-3 flex-1 text-left">{group.label}</span>{expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</>}</button>{expanded && <div className="pb-1">{group.items.map((item) => <Link key={item.href} href={item.href} className={cn("block py-2 pl-11 pr-3 text-sm text-[#666] hover:text-[#3658f7]", pathname === item.href && "bg-[#edf2ff] font-medium text-[#3658f7]")}>{item.label}</Link>)}</div>}</div>})}</div><button onClick={() => setCollapsed(!collapsed)} className="flex h-10 w-full items-center justify-center border-t border-[#f0f0f0] text-[#999] hover:text-[#3658f7]" aria-label="切换侧边栏"><Menu className="h-4 w-4" /></button></aside><main className="min-h-screen pt-12 transition-[margin]" style={{ marginLeft: width }}><div className="p-6">{children}</div></main></div>;
}
