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
import { useSweepAngle } from "@/hooks/useSweepAngle";
import { adminEndpoints, type AdminDashboardReport, type AnnouncementItem, type AcademyCategory } from "@/lib/admin-endpoints";

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

/* ---------- 会员登记来源占比 ---------- */
const SOURCE_COLORS = ["#3658f7", "#f5a623", "#f0506e", "#8b5cf6", "#22c55e", "#4b8cf7"];
const MEMBER_SOURCES = [
  { name: "自己注册", percent: 66.7 },
  { name: "批量导入", percent: 15.2 },
  { name: "找搭子", percent: 7.5 },
  { name: "红娘添加", percent: 4.1 },
  { name: "活动入库", percent: 2.7 },
  { name: "后台添加", percent: 2.2 },
];

/* ---------- 光荣榜 ---------- */
const HONOR_ROWS = [
  { label: "线上牵线", value: "49", unit: "次", color: "#3658f7" },
  { label: "牵线成功", value: "30", unit: "对", color: "#f5a623" },
  { label: "安排约见", value: "0", unit: "次", color: "#f56c6c" },
  { label: "线下活动", value: "0", unit: "场", color: "#8b5cf6" },
  { label: "成功脱单", value: "2", unit: "人", color: "#22c55e" },
];

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

export default function HomePage() {
  const [report, setReport] = useState<AdminDashboardReport>(emptyReport);
  const [loaded, setLoaded] = useState(false);
  const [month, setMonth] = useState({ member: 0, lead: 0, online: 0, offline: 0 });
  const [operatorName, setOperatorName] = useState("管理员");
  const [smsRemaining, setSmsRemaining] = useState(0);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [guides, setGuides] = useState<AcademyCategory[]>([]);
  const [trendDays, setTrendDays] = useState<7 | 15>(7);
  /* 图表进场动画开关：首帧为 false，hydration 后再置 true，强制图表重新挂载以播放动画（进入/刷新页面均生效） */
  const [chartsReady, setChartsReady] = useState(false);
  /* 环形图扫过进度 0→1：从 12 点位置顺时针扫一整圈形成完整圆环 */
  const pieSweep = useSweepAngle(chartsReady && loaded);

  useEffect(() => {
    const timer = window.setTimeout(() => setChartsReady(true), 80);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
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
    { label: "平台用户", value: `${report.metrics.platform_user_count}`, unit: "人", delta: `+${month.member}人`, icon: Users, color: "#5a72ef", bg: "#eef1ff" },
    { label: "公众号粉丝", value: `${report.metrics.wechat_fan_count}`, unit: "人", delta: "+0人", icon: MessageCircle, color: "#ff9a44", bg: "#fff3e8" },
    { label: "客源线索", value: `${report.metrics.lead_count}`, unit: "条", delta: `+${month.lead}条`, icon: ClipboardList, color: "#9270e8", bg: "#f2edff" },
    { label: "会员总数", value: `${report.metrics.member_count}`, unit: "人", delta: `+${month.member}人`, icon: Heart, color: "#eb5f75", bg: "#ffecef" },
    { label: "红娘团队", value: `${report.metrics.matchmaker_count}`, unit: "人", delta: "+0人", icon: UserRound, color: "#ff9a44", bg: "#fff3e8" },
    { label: "线上总收入", value: `${fmtMoney(report.metrics.online_income)}`, unit: "元", delta: `+${fmtMoney(month.online)}元`, icon: Wallet, color: "#eb5f75", bg: "#ffecef" },
    { label: "线下总收入", value: `${fmtMoney(report.metrics.offline_income)}`, unit: "元", delta: `+${fmtMoney(month.offline)}元`, icon: Wallet, color: "#4bb6a2", bg: "#e9f8f4" },
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
  const trendEmpty = memberTrend.every((t) => t.count === 0);

  /* ---------- 会员登记来源占比 ---------- */
  const sourceRows = MEMBER_SOURCES.map((item, i) => ({ ...item, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }));

  /* ---------- 会员男女占比 ---------- */
  const gender = report.member_gender;
  const genderTotal = num(gender.male) + num(gender.female);
  const genderData = [
    { name: "男会员", value: num(gender.male), percent: genderTotal ? `${Math.round((num(gender.male) / genderTotal) * 100)}%` : "0%", color: "#3658f7" },
    { name: "女会员", value: num(gender.female), percent: genderTotal ? `${Math.round((num(gender.female) / genderTotal) * 100)}%` : "0%", color: "#f0506e" },
  ];
  const genderDiff = Math.abs(num(gender.male) - num(gender.female));

  /* ---------- 耗材余量（短信取自后端，实名/合同/婚况暂无对应接口，暂用固定值） ---------- */
  const materials = [
    { label: "实名", value: "786", unit: "次", art: "card" as const },
    { label: "短信", value: `${smsRemaining}`, unit: "条", art: "chat" as const },
    { label: "合同", value: "150", unit: "次", art: "card" as const },
    { label: "婚况", value: "1", unit: "次", art: "chat" as const },
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
      rows.push({ tag: cat.matchmaker_class_enabled ? "必看" : "新上", title: cat.name, date: "", color: cat.matchmaker_class_enabled ? "#f0506e" : "#f5a623" });
      cat.children?.forEach((child) => rows.push({ tag: "新上", title: child.name, date: "", color: "#f5a623" }));
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
                <div className="ov-stat-value">{card.value}<em>{card.unit}</em></div>
                <div className="ov-stat-delta">本月 <em>{card.delta}</em></div>
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
            <div className="ov-unit">单位：元</div>
            {trendEmpty ? (
              <div className="ov-empty">
                <svg className="ov-empty-icon" viewBox="0 0 48 48" aria-hidden="true">
                  <rect x="7" y="12" width="34" height="26" rx="5" />
                  <path d="M7 21h10.5l2.5-4h8l2.5 4H41" />
                </svg>
                <span className="ov-empty-text">暂无数据</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart key={`trend-${trendDays}-${chartsReady ? (loaded ? "on" : "empty") : "boot"}`} data={memberTrend}>
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
                  <Area type="monotone" dataKey="count" stroke="#5a72ef" strokeWidth={2} fill="url(#ovTrendGradient)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 会员登记来源占比 */}
        <div className="ov-card ov-mid-source">
          <div className="ov-card-head"><h2>会员登记来源占比</h2></div>
          <div className="ov-card-body ov-source-body">
            <div className="ov-donut">
              <ResponsiveContainer width="100%" height={104}>
                <PieChart key={`pie-share-${chartsReady ? (loaded ? "on" : "empty") : "boot"}`}>
                  <Pie data={sourceRows} cx="50%" cy="50%" innerRadius={34} outerRadius={50} paddingAngle={1} dataKey="percent" startAngle={90} endAngle={90 - 360 * pieSweep} isAnimationActive={false}>
                    {sourceRows.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="ov-donut-center"><span className="ov-donut-center-label">登记总数</span><strong>{report.metrics.member_count}人</strong></div>
            </div>
            <div className="ov-source-legend">
              {sourceRows.map((item) => (
                <div className="ov-source-row" key={item.name}>
                  <span className="ov-source-dot" style={{ background: item.color }} />
                  <span className="ov-source-name">{item.name}</span>
                  <span className="ov-source-percent" style={{ color: item.color }}>{item.percent}%</span>
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
              <ResponsiveContainer width="100%" height={104}>
                <PieChart key={`pie-gender-${chartsReady ? (loaded ? "on" : "empty") : "boot"}`}>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={34} outerRadius={50} paddingAngle={1} dataKey="value" startAngle={90} endAngle={90 - 360 * pieSweep} isAnimationActive={false}>
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
                    <span className="ov-gender-title">{item.name} <em className="ov-gender-percent" style={{ color: item.color }}>{item.percent}</em></span>
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
            {HONOR_ROWS.map((item) => (
              <div className="ov-honor-row" key={item.label}>
                <span className="ov-honor-label">{item.label}</span>
                <span className="ov-honor-value" style={{ color: item.color }}>{item.value}<i>{item.unit}</i></span>
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
                <strong className="ov-mat-value">{item.value}<em>{item.unit}</em></strong>
                <svg className="ov-mat-art" viewBox="0 0 48 48" aria-hidden="true">
                  {item.art === "card" ? (
                    <>
                      <rect x="5" y="10" width="30" height="22" rx="4" className="ov-mat-art-fill" />
                      <circle cx="15" cy="19" r="4" className="ov-mat-art-ink" />
                      <path d="M9 28c1.6-3.4 4-5 6-5s4.4 1.6 6 5Z" className="ov-mat-art-ink" />
                      <rect x="24" y="16" width="9" height="2.4" rx="1.2" className="ov-mat-art-ink" />
                      <rect x="24" y="21" width="9" height="2.4" rx="1.2" className="ov-mat-art-ink" />
                      <rect x="34" y="18" width="10" height="20" rx="3" className="ov-mat-art-fill" />
                    </>
                  ) : (
                    <>
                      <path d="M6 12h22a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4h-9l-7 5v-5H6a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z" className="ov-mat-art-fill" />
                      <circle cx="11" cy="22" r="1.8" className="ov-mat-art-ink" />
                      <circle cx="17" cy="22" r="1.8" className="ov-mat-art-ink" />
                      <circle cx="23" cy="22" r="1.8" className="ov-mat-art-ink" />
                      <rect x="32" y="18" width="14" height="18" rx="4" className="ov-mat-art-fill" />
                    </>
                  )}
                </svg>
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
