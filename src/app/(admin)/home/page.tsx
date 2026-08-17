"use client";

import { useEffect, useState } from "react";
import { CircleHelp } from "lucide-react";
import { adminEndpoints } from "@/lib/admin-endpoints";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import DashboardCharts from "@/components/DashboardCharts";
import PendingReviews from "@/components/PendingReviews";

const fallback: Record<string, unknown> = {};

function asRecord(value: unknown) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function recentDateRange() {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date())
    .reduce<Record<string, string>>((result, part) => ({ ...result, [part.type]: part.value }), {});
  const today = new Date(Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)));
  const from = new Date(today);
  from.setUTCDate(from.getUTCDate() - 14);
  return { from: from.toISOString().slice(0, 10), to: today.toISOString().slice(0, 10) };
}

function normalizeDashboard(payload: Record<string, unknown>) {
  const metrics = asRecord(payload.metrics);
  const trends = Array.isArray(payload.trends) ? payload.trends.map(asRecord) : [];
  const incomeRank = Array.isArray(payload.income_rank) ? payload.income_rank.map(asRecord) : [];

  return {
    ...metrics,
    member_trends: trends.map((item) => ({ date: item.date, count: item.member_count })),
    lead_trends: trends.map((item) => ({ date: item.date, count: item.lead_count })),
    online_income_trends: trends.map((item) => ({ date: item.date, amount: item.online_paid_amount })),
    offline_income_trends: trends.map((item) => ({ date: item.date, amount: item.offline_paid_amount })),
    revenue_share: incomeRank.map((item) => ({ name: item.product_type, percent: item.proportion })),
    pending: asRecord(payload.pending),
  } satisfies Record<string, unknown>;
}

function normalizeLegacyDashboard(payload: Record<string, unknown>) {
  return {
    member_count: payload.member_count,
    online_vip_count: payload.vip_count,
    service_matchmaker_count: payload.matchmaker_count,
    member_trends: payload.today_new_member_count === undefined ? [] : [{ date: "今天", count: payload.today_new_member_count }],
    pending: {
      match_request: payload.pending_service_count,
      member_review: payload.pending_certification_count,
    },
  } satisfies Record<string, unknown>;
}

const overviewItems = [
  { key: "online_days", label: "上线时间\n(天)" },
  { key: "platform_user_count", label: "平台用户\n(人)" },
  { key: "wechat_fan_count", label: "公众号粉\n丝(人)" },
  { key: "customer_lead_count", label: "客源线索\n(条)" },
  { key: "member_count", label: "相亲会员\n(人)" },
  { key: "male_member_count", label: "男会员\n(人)" },
  { key: "female_member_count", label: "女会员\n(人)" },
  { key: "online_vip_count", label: "线上\nVIP(人)" },
  { key: "offline_vip_count", label: "线下\nVIP(人)" },
  { key: "online_income", label: "线上收益(元)" },
  { key: "offline_income", label: "线下收益\n(元)" },
  { key: "service_matchmaker_count", label: "服务红娘\n(人)" },
  { key: "promotion_matchmaker_count", label: "推广红娘\n(人)" },
  { key: "successful_match_count", label: "成功脱单\n(人)" },
] as const;

function displayValue(value: unknown) {
  if (value === undefined || value === null) return "--";
  if (typeof value === "number") return new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 2 }).format(value);
  return String(value);
}

export default function HomePage() {
  const [stats, setStats] = useState<Record<string, unknown>>(fallback);

  useEffect(() => {
    const range = recentDateRange();
    adminEndpoints.dashboard(range)
      .then((payload) => setStats(normalizeDashboard(payload)))
      .catch(() => adminEndpoints.dashboardStats().then((payload) => setStats(normalizeLegacyDashboard(payload))).catch(() => setStats(fallback)));
  }, []);

  return (
    <div className="dashboard-page">
      <AdminBreadcrumb items={[{ label: "首页", href: "/home" }, { label: "概览" }]} />
      <section className="dashboard-overview" aria-label="运营概览">
        {overviewItems.map(({ key, label }, index) => (
          <div className="dashboard-metric" key={key}>
            <div className="dashboard-metric-value">{displayValue(stats[key])}{index === 0 && <CircleHelp className="h-3.5 w-3.5 text-[#8d96a5]" />}</div>
            <div className="dashboard-metric-label">{label.split("\n").map((line) => <span key={line}>{line}</span>)}</div>
          </div>
        ))}
      </section>
      <PendingReviews pending={stats.pending as Record<string, unknown> | undefined} />
      <DashboardCharts stats={stats} />
    </div>
  );
}
