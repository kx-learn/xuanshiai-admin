"use client";

import { useEffect, useState } from "react";
import { CircleHelp, TrendingUp, Users, UserRoundCheck, WalletCards } from "lucide-react";
import { adminEndpoints } from "@/lib/admin-endpoints";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import DashboardCharts from "@/components/DashboardCharts";

const fallback = { member_count: 0, vip_count: 0, matchmaker_count: 0, pending_service_count: 0, active_service_count: 0, pending_certification_count: 0, today_new_member_count: 0 };

export default function HomePage() {
  const [stats, setStats] = useState<Record<string, unknown>>(fallback);
  useEffect(() => { adminEndpoints.dashboardStats().then(setStats).catch(() => setStats(fallback)); }, []);
  const cards = [
    { label: "平台会员", value: stats.member_count, icon: Users, color: "#3658f7" },
    { label: "有效 VIP", value: stats.vip_count, icon: WalletCards, color: "#fa8c16" },
    { label: "服务红娘", value: stats.matchmaker_count, icon: UserRoundCheck, color: "#52c41a" },
    { label: "待处理服务", value: stats.pending_service_count, icon: TrendingUp, color: "#eb2f96" },
    { label: "进行中服务", value: stats.active_service_count, icon: TrendingUp, color: "#13c2c2" },
    { label: "待审核认证", value: stats.pending_certification_count, icon: CircleHelp, color: "#722ed1" },
    { label: "今日新增会员", value: stats.today_new_member_count, icon: Users, color: "#1677ff" },
  ];
  return <div><AdminBreadcrumb items={[{ label: "概览" }]} /><div className="mb-4 flex items-center justify-between"><div><h1 className="text-xl font-medium">运营概览</h1><p className="mt-1 text-xs text-[#9aa3b2]">实时查看会员、红娘与服务业务状态</p></div><span className="text-xs text-[#9aa3b2]">数据来自红娘后台接口</span></div>
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[#edf0f4] bg-[#edf0f4] md:grid-cols-4 xl:grid-cols-7">{cards.map(({ label, value, icon: Icon, color }) => <div key={label} className="bg-white px-4 py-5"><div className="flex items-center justify-between text-xs text-[#8c96a8]"><span>{label}</span><Icon className="h-4 w-4" style={{ color }} /></div><div className="mt-3 text-2xl font-semibold text-[#1f2b3d]">{String(value ?? 0)}</div></div>)}</div>
    <div className="mt-4"><DashboardCharts /></div>
  </div>;
}
