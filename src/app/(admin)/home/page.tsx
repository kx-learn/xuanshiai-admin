"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users, MessageCircle, ClipboardList, Heart, UserRound, Wallet,
  FilePlus2, PartyPopper,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints, type AdminDashboardReport, type AnnouncementItem, type AcademyCategory } from "@/lib/admin-endpoints";
import { getAdminToken } from "@/lib/admin-api";

/* ---------- 问候 ---------- */
function greeting() {
  const hour = new Date().getHours();
  if (hour < 6) return "凌晨好";
  if (hour < 12) return "上午好";
  if (hour < 14) return "中午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

/* ---------- 工具 ---------- */
function num(value: unknown) {
  return Number(value ?? 0) || 0;
}
function fmtMoney(value: unknown) {
  return num(value).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
}
function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shortDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[2]}-${m[3]}` : iso;
}

/* ---------- 收入构成中文标签 ---------- */
const PRODUCT_LABELS: Record<string, string> = {
  vip: "VIP会员",
  offline_vip: "线下VIP",
  gift: "送礼物",
  points: "积分充值",
  balance: "余额充值",
  promoter_join_fee: "推广红娘入伙费",
  partner_join_fee: "合伙红娘入伙费",
  activity: "活动报名",
  tip: "短视频打赏",
  unknown: "其他",
};
const RANK_COLORS = ["#f07b78", "#5a72ef", "#7e92f5", "#f4bd56", "#92cf69"];

const emptyReport: AdminDashboardReport = {
  from_date: "",
  to_date: "",
  metrics: {
    member_count: 0, platform_user_count: 0, wechat_fan_count: 0, online_days: 0,
    lead_count: 0, customer_lead_count: 0, vip_count: 0, online_vip_count: 0, offline_vip_count: 0,
    matchmaker_count: 0, service_matchmaker_count: 0, promotion_matchmaker_count: 0,
    successful_match_count: 0, male_member_count: 0, female_member_count: 0,
    pending_withdrawal_count: 0, online_income: "0", offline_income: "0",
  },
  pending: { withdrawal: 0, matchmaker_application: 0, matchmaker_service: 0, match_application: 0, report: 0 },
  member_gender: { male: 0, female: 0, unspecified: 0 },
  income_rank: [],
  trends: [],
};

const quickBtns = [
  { label: "录入线索", icon: ClipboardList, href: "/love-customer-list" },
  { label: "录入资料", icon: FilePlus2, href: "/love-user-list" },
  { label: "发布活动", icon: PartyPopper, href: "/active-list" },
];

/* ---------- 调试登录（local-demo-token）模式下的演示数据 ---------- */
function buildDemoReport(): AdminDashboardReport {
  const today = new Date();
  const trends = Array.from({ length: 15 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (14 - i));
    return { date: toISO(d), member_count: i === 14 ? 1 : 0, lead_count: 0, paid_count: 0, paid_amount: "0", online_paid_amount: "0", offline_paid_amount: "0", net_amount: "0" };
  });
  return {
    ...emptyReport,
    metrics: {
      ...emptyReport.metrics,
      platform_user_count: 746, member_count: 640, wechat_fan_count: 0, lead_count: 9,
      matchmaker_count: 1, service_matchmaker_count: 1, online_income: "4126.8", offline_income: "0",
      male_member_count: 406, female_member_count: 234, successful_match_count: 69,
    },
    pending: { withdrawal: 5, matchmaker_application: 0, matchmaker_service: 3, match_application: 3, report: 0 },
    member_gender: { male: 406, female: 234, unspecified: 0 },
    income_rank: [
      { product_type: "promoter_join_fee", income: "3528.8", proportion: "85.50" },
      { product_type: "vip", income: "598", proportion: "14.50" },
    ],
    trends,
  };
}
const demoAnnouncements: AnnouncementItem[] = [
  { id: 1, version_id: null, category: "新功能", title: "新增了客户结婚状态查询功能", title_color: null, title_bold: false, top: false, sort_order: 5, link_to: null, created_at: "2026-07-08 10:00:00", read: false },
  { id: 2, version_id: null, category: "细节改进", title: "会员资料页进行了全新改版", title_color: null, title_bold: false, top: false, sort_order: 4, link_to: null, created_at: "2026-07-08 09:30:00", read: false },
  { id: 3, version_id: null, category: "功能升级", title: "新增了账号注销功能", title_color: null, title_bold: false, top: false, sort_order: 3, link_to: null, created_at: "2026-07-08 09:00:00", read: false },
  { id: 4, version_id: null, category: "新功能", title: "线上互动活动使用指南", title_color: null, title_bold: false, top: false, sort_order: 2, link_to: null, created_at: "2026-06-25 15:00:00", read: false },
  { id: 5, version_id: null, category: "BUG修复", title: "修复了活动管理中封面图太小导致图标过小的问题", title_color: null, title_bold: false, top: false, sort_order: 1, link_to: null, created_at: "2026-09-08 18:00:00", read: false },
];
const demoGuides: AcademyCategory[] = [
  { id: 1, parent_id: null, name: "销售匹配库(眼缘库)使用教程", description: null, sort: 1, enabled: true, matchmaker_class_enabled: false, children: [] },
  { id: 2, parent_id: null, name: "账号申请注销流程", description: null, sort: 2, enabled: true, matchmaker_class_enabled: false, children: [] },
  { id: 3, parent_id: null, name: "会员资料页设计效果图展示", description: null, sort: 3, enabled: true, matchmaker_class_enabled: false, children: [] },
  { id: 4, parent_id: null, name: "客户结婚状态查询使用流程", description: null, sort: 4, enabled: true, matchmaker_class_enabled: false, children: [] },
  { id: 5, parent_id: null, name: "云端素材库使用、改图小技巧", description: null, sort: 5, enabled: true, matchmaker_class_enabled: false, children: [] },
];

export default function HomePage() {
  const [demo] = useState(() => typeof window !== "undefined" && getAdminToken() === "local-demo-token");
  const [report, setReport] = useState<AdminDashboardReport>(() => (typeof window !== "undefined" && getAdminToken() === "local-demo-token" ? buildDemoReport() : emptyReport));
  const [loaded, setLoaded] = useState(() => typeof window !== "undefined" && getAdminToken() === "local-demo-token");
  const [month, setMonth] = useState({ member: 0, lead: 0, online: 0, offline: 0 });
  const [operatorName, setOperatorName] = useState(() => (typeof window !== "undefined" && getAdminToken() === "local-demo-token" ? "shushu" : "管理员"));
  const [smsRemaining, setSmsRemaining] = useState(() => (typeof window !== "undefined" && getAdminToken() === "local-demo-token" ? 9410 : 0));
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() => (typeof window !== "undefined" && getAdminToken() === "local-demo-token" ? demoAnnouncements : []));
  const [guides, setGuides] = useState<AcademyCategory[]>(() => (typeof window !== "undefined" && getAdminToken() === "local-demo-token" ? demoGuides : []));
  const [trendDays, setTrendDays] = useState<7 | 15>(15);

  useEffect(() => {
    if (demo) return; // 调试登录：无有效后端 token，使用演示数据
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const trendStart = new Date(today);
    trendStart.setDate(trendStart.getDate() - 14);
    const from = trendStart < monthStart ? trendStart : monthStart;

    adminEndpoints.dashboard({ from: toISO(from), to: toISO(today) })
      .then((data) => {
        setReport(data);
        setLoaded(true);
        const ms = toISO(monthStart);
        const monthTrends = (data.trends ?? []).filter((t) => t.date >= ms);
        setMonth({
          member: monthTrends.reduce((sum, t) => sum + num(t.member_count), 0),
          lead: monthTrends.reduce((sum, t) => sum + num(t.lead_count), 0),
          online: monthTrends.reduce((sum, t) => sum + num(t.online_paid_amount), 0),
          offline: monthTrends.reduce((sum, t) => sum + num(t.offline_paid_amount), 0),
        });
      })
      .catch(() => {});
    adminEndpoints.bootstrap()
      .then((data) => {
        setOperatorName(data?.operator?.name || "管理员");
        setSmsRemaining(num(data?.header?.sms?.remaining_count));
      })
      .catch(() => {});

    adminEndpoints.announcements({ page: 1, page_size: 5 })
      .then((data) => setAnnouncements(data?.items ?? []))
      .catch(() => {});

    adminEndpoints.academyCategories()
      .then((data) => setGuides(data ?? []))
      .catch(() => {});
  }, []);

  /* ---------- 统计卡 ---------- */
  const statCards = [
    { label: "平台用户", value: `${report.metrics.platform_user_count}人`, delta: `本月 +${month.member}人`, icon: Users, color: "#5a72ef", bg: "#eef1ff" },
    { label: "公众号粉丝", value: `${report.metrics.wechat_fan_count}人`, delta: "本月 +0人", icon: MessageCircle, color: "#ff9a44", bg: "#fff3e8" },
    { label: "客源线索", value: `${report.metrics.lead_count}条`, delta: `本月 +${month.lead}条`, icon: ClipboardList, color: "#9270e8", bg: "#f2edff" },
    { label: "会员总数", value: `${report.metrics.member_count}人`, delta: `本月 +${month.member}人`, icon: Heart, color: "#eb5f75", bg: "#ffecef" },
    { label: "红娘团队", value: `${report.metrics.matchmaker_count}人`, delta: "本月 +0人", icon: UserRound, color: "#ff9a44", bg: "#fff3e8" },
    { label: "线上总收入", value: `${fmtMoney(report.metrics.online_income)}元`, delta: `本月 +${fmtMoney(month.online)}元`, icon: Wallet, color: "#eb5f75", bg: "#ffecef" },
    { label: "线下总收入", value: `${fmtMoney(report.metrics.offline_income)}元`, delta: `本月 +${fmtMoney(month.offline)}元`, icon: Wallet, color: "#4bb6a2", bg: "#e9f8f4" },
  ];

  /* ---------- 待审工作（后端 pending 映射，无对应项为 0） ---------- */
  const pendingItems = [
    { label: "会员承诺", count: 0 },
    { label: "房产认证", count: 0 },
    { label: "学历认证", count: 0 },
    { label: "其他认证", count: 0 },
    { label: "资料待审", count: 0 },
    { label: "活动报名", count: 0 },
    { label: "待牵线", count: report.pending.match_application },
    { label: "约见申请", count: report.pending.matchmaker_service },
    { label: "提现申请", count: report.pending.withdrawal },
    { label: "账号注销", count: 0 },
    { label: "投诉举报", count: report.pending.report },
  ];

  /* ---------- 会员增长趋势 ---------- */
  const memberTrend = useMemo(
    () => (report.trends ?? []).slice(-trendDays).map((t) => ({
      date: shortDate(t.date),
      count: num(t.member_count),
    })),
    [report.trends, trendDays],
  );

  /* ---------- 收入构成占比 ---------- */
  const incomeShare = useMemo(
    () => (report.income_rank ?? []).map((item, i) => ({
      name: PRODUCT_LABELS[item.product_type] ?? item.product_type,
      value: num(item.income),
      percent: `${num(item.proportion).toFixed(2)}%`,
      color: RANK_COLORS[i % RANK_COLORS.length],
    })),
    [report.income_rank],
  );
  const incomeTotal = incomeShare.reduce((sum, item) => sum + item.value, 0);

  /* ---------- 会员男女占比 ---------- */
  const gender = report.member_gender;
  const genderTotal = num(gender.male) + num(gender.female);
  const genderData = [
    { name: "男会员", value: num(gender.male), percent: genderTotal ? `${Math.round((num(gender.male) / genderTotal) * 100)}%` : "0%", color: "#5a72ef" },
    { name: "女会员", value: num(gender.female), percent: genderTotal ? `${Math.round((num(gender.female) / genderTotal) * 100)}%` : "0%", color: "#f07b78" },
  ];
  const genderDiff = Math.abs(num(gender.male) - num(gender.female));

  /* ---------- 光荣榜（后端真实运营指标） ---------- */
  const honorList = [
    { label: "线上牵线", value: `${report.metrics.successful_match_count}次`, color: "#5a72ef" },
    { label: "线上VIP", value: `${report.metrics.online_vip_count}人`, color: "#ff9a44" },
    { label: "线下VIP", value: `${report.metrics.offline_vip_count}人`, color: "#4bb6a2" },
    { label: "服务红娘", value: `${report.metrics.service_matchmaker_count}人`, color: "#4bb6a2" },
    { label: "推广红娘", value: `${report.metrics.promotion_matchmaker_count}人`, color: "#ff9a44" },
  ];

  /* ---------- 耗材余量（短信来自后端，其余暂无统计） ---------- */
  const materials = [
    { label: "实名", value: "0次", color: "#5a72ef" },
    { label: "短信", value: `${smsRemaining}条`, color: "#4bb6a2" },
    { label: "合同", value: "0次", color: "#5a72ef" },
    { label: "情况", value: "0次", color: "#ff9a44" },
  ];

  /* ---------- 系统更新（后端公告） ---------- */
  const updates = announcements.map((item) => ({
    tag: item.category || "公告",
    title: item.title,
    date: shortDate(item.created_at),
  }));

  /* ---------- 使用帮助（后端学苑栏目） ---------- */
  const helps = useMemo(() => {
    const rows: { tag: string; title: string; date: string; color: string }[] = [];
    guides.forEach((cat) => {
      rows.push({ tag: cat.matchmaker_class_enabled ? "红娘课堂" : "教学", title: cat.name, date: "", color: "#eb5f75" });
      cat.children?.forEach((child) => rows.push({ tag: "教学", title: child.name, date: "", color: "#eb5f75" }));
    });
    return rows.slice(0, 5);
  }, [guides]);

  return (
    <div className="ov-page">
      <AdminBreadcrumb items={[{ label: "首页", href: "/home" }, { label: "概览" }]} />

      {/* 问候行 */}
      <div className="ov-greet">
        <div className="ov-greet-left"><span className="ov-wave">😊</span><span className="ov-greet-text">{greeting()}，{operatorName}!</span></div>
        <div className="ov-greet-actions">
          {quickBtns.map((btn) => {
            const Icon = btn.icon;
            return <Link key={btn.label} href={btn.href} className="ov-greet-btn"><Icon className="ov-greet-btn-icon" />{btn.label}</Link>;
          })}
        </div>
      </div>

      {/* 统计卡 */}
      <section className="ov-stats">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div className="ov-stat" key={card.label}>
              <span className="ov-stat-icon" style={{ background: card.bg, color: card.color }}><Icon /></span>
              <div className="ov-stat-info">
                <div className="ov-stat-label">{card.label}</div>
                <div className="ov-stat-value">{card.value}</div>
                <div className="ov-stat-delta">{card.delta}</div>
              </div>
            </div>
          );
        })}
      </section>

      {/* 待审工作 */}
      <section className="ov-card ov-pending">
        <div className="ov-card-head"><h2>待审工作</h2></div>
        <div className="ov-pending-grid">
          {pendingItems.map((item) => (
            <div className="ov-pending-item" key={item.label}>
              <span className="ov-pending-label">{item.label}</span>
              <strong className="ov-pending-count">{item.count}</strong>
              <span className="ov-pending-btn">去处理</span>
            </div>
          ))}
        </div>
      </section>

      {/* 中部：图表 + 光荣榜 */}
      <section className="ov-mid">
        {/* 会员增长趋势 */}
        <div className="ov-card ov-mid-trend">
          <div className="ov-card-head">
            <h2>会员增长趋势</h2>
            <div className="ov-tab-group">
              <button type="button" className={`ov-tab ${trendDays === 7 ? "active" : ""}`} onClick={() => setTrendDays(7)}>7天</button>
              <button type="button" className={`ov-tab ${trendDays === 15 ? "active" : ""}`} onClick={() => setTrendDays(15)}>15天</button>
            </div>
          </div>
          <div className="ov-card-body">
            <div className="ov-unit">单位：人</div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart key={loaded ? "trend-loaded" : "trend-empty"} data={memberTrend}>
                <defs>
                  <linearGradient id="ovTrendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5a72ef" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#5a72ef" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#999" }} axisLine={{ stroke: "#f0f0f0" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#999" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 4, border: "1px solid #f0f0f0", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                <Area type="monotone" dataKey="count" stroke="#5a72ef" strokeWidth={2} fill="url(#ovTrendGradient)" isAnimationActive animationDuration={1800} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 收入构成占比 */}
        <div className="ov-card ov-mid-source">
          <div className="ov-card-head"><h2>收入构成占比</h2></div>
          <div className="ov-card-body ov-source-body">
            <div className="ov-donut">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart key={loaded ? "pie-share-loaded" : "pie-share-empty"}>
                  <Pie data={incomeShare} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={2} dataKey="value" isAnimationActive animationDuration={1800}>
                    {incomeShare.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="ov-donut-center"><span className="ov-donut-center-label">总收入</span><strong>{fmtMoney(incomeTotal)}元</strong></div>
            </div>
            <div className="ov-source-legend">
              {incomeShare.length === 0 && <div className="ov-source-empty">暂无收入数据</div>}
              {incomeShare.map((item) => (
                <div className="ov-source-row" key={item.name}>
                  <span className="ov-source-dot" style={{ background: item.color }} />
                  <span className="ov-source-name">{item.name}</span>
                  <span className="ov-source-percent">{item.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 会员男女占比 */}
        <div className="ov-card ov-mid-gender">
          <div className="ov-card-head"><h2>会员男女占比</h2></div>
          <div className="ov-card-body ov-source-body">
            <div className="ov-donut">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart key={loaded ? "pie-gender-loaded" : "pie-gender-empty"}>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={2} dataKey="value" isAnimationActive animationDuration={1800}>
                    {genderData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="ov-donut-center"><span className="ov-donut-center-label">男女相差</span><strong>{genderDiff}人</strong></div>
            </div>
            <div className="ov-source-legend">
              {genderData.map((item) => (
                <div className="ov-gender-row" key={item.name}>
                  <span className="ov-gender-dot" style={{ background: item.color }} />
                  <div className="ov-gender-info">
                    <span className="ov-gender-title">{item.name} <em className="ov-gender-percent">{item.percent}</em></span>
                    <span className="ov-gender-value">{item.value}人</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 光荣榜 */}
        <div className="ov-card ov-mid-honor">
          <div className="ov-card-head"><h2>光荣榜</h2></div>
          <div className="ov-card-body ov-honor-body">
            {honorList.map((item) => (
              <div className="ov-honor-row" key={item.label}>
                <span className="ov-honor-label" style={{ color: item.color }}>{item.label}</span>
                <span className="ov-honor-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部：耗材余量 + 系统更新 + 使用帮助 */}
      <section className="ov-bottom">
        {/* 耗材余量 */}
        <div className="ov-card ov-mat">
          <div className="ov-card-head">
            <h2>耗材余量</h2>
            <Link href="/sms-group" className="ov-mat-charge">在线充值</Link>
          </div>
          <div className="ov-card-body ov-mat-grid">
            {materials.map((item) => (
              <div className="ov-mat-item" key={item.label}>
                <span className="ov-mat-label">{item.label}</span>
                <strong className="ov-mat-value">{item.value}</strong>
                <span className="ov-mat-icon" style={{ background: item.color }} />
              </div>
            ))}
          </div>
        </div>

        {/* 系统更新 */}
        <div className="ov-card ov-update">
          <div className="ov-card-head">
            <h2>系统更新</h2>
            <Link href="/system-setting-admin-log" className="ov-more">更多</Link>
          </div>
          <div className="ov-card-body ov-update-list">
            {updates.length === 0 && <div className="ov-source-empty">暂无更新公告</div>}
            {updates.map((item) => (
              <div className="ov-update-row" key={item.title}>
                <span className="ov-update-tag">{item.tag}</span>
                <span className="ov-update-title">{item.title}</span>
                <span className="ov-update-date">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 使用帮助 */}
        <div className="ov-card ov-help">
          <div className="ov-card-head">
            <h2>使用帮助</h2>
            <Link href="/use-system" className="ov-more">更多</Link>
          </div>
          <div className="ov-card-body ov-help-list">
            {helps.length === 0 && <div className="ov-source-empty">暂无帮助内容</div>}
            {helps.map((item) => (
              <div className="ov-help-row" key={item.title}>
                <span className="ov-help-tag" style={{ background: item.color }}>{item.tag}</span>
                <span className="ov-help-title">{item.title}</span>
                <span className="ov-help-date">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
