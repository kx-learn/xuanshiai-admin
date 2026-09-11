"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type {
  MemberStatDistItem,
  MemberStatGrowthRow,
  MemberStatPreferenceReport,
  MemberStatisticsReport,
} from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

type TabKey = "growth" | "follow" | "intention" | "basic" | "requirement" | "browse" | "popularity";
type Dist = { label: string; pct: number; count: number; pctText?: string };
type GrowthRow = { date: string; m: number; f: number; vip: number; apply: number; failed: number; success: number };

const tabs: { key: TabKey; label: string }[] = [
  { key: "growth", label: "会员增长统计" },
  { key: "follow", label: "会员跟进统计" },
  { key: "intention", label: "会员意向统计" },
  { key: "basic", label: "会员基本状况统计" },
  { key: "requirement", label: "会员择偶要求统计" },
  { key: "browse", label: "浏览统计" },
  { key: "popularity", label: "人气统计" },
];

const DONUT_COLORS = ["#4a6cf7", "#52c41a", "#fa8c16", "#ff4d4f", "#9254de", "#13c2c2"];
const AVATARS = [
  "linear-gradient(135deg,#f5c6d0,#e58aa8)",
  "linear-gradient(135deg,#c9d6f7,#8aa3e8)",
  "linear-gradient(135deg,#f8d8b0,#e8a95c)",
  "linear-gradient(135deg,#bfe6d4,#6fc39b)",
  "linear-gradient(135deg,#d9cdf5,#a58ae0)",
  "linear-gradient(135deg,#f7d0c2,#e88e6c)",
];

// 会员基本状况：环形图面板与后端 basic_groups 的 key 一一对应
const BASIC_DONUTS: { key: string; title: string; cols: 1 | 2 }[] = [
  { key: "gender", title: "性别统计", cols: 1 },
  { key: "marriage", title: "婚况统计", cols: 1 },
  { key: "age", title: "年龄统计", cols: 2 },
  { key: "education", title: "学历统计", cols: 2 },
  { key: "house", title: "房产统计", cols: 2 },
  { key: "car", title: "车辆统计", cols: 2 },
  { key: "income", title: "收入统计", cols: 2 },
  { key: "realname", title: "实名统计", cols: 1 },
];

// 会员基本状况：条形面板（取前 5，相亲状态展示全量）
const BASIC_BARS: { key: string; title: string; limit?: number }[] = [
  { key: "occupation", title: "最多的职业（前5）", limit: 5 },
  { key: "hometown", title: "籍贯最多的地区（前5）", limit: 5 },
  { key: "residence", title: "现居地最多的地区（前5）", limit: 5 },
  { key: "dating_status", title: "会员相亲状态" },
];

// 会员择偶要求：环形图面板与后端 requirements 的 key 一一对应
const REQUIREMENT_DONUTS: { key: keyof MemberStatPreferenceReport; title: string; cols: 1 | 2 }[] = [
  { key: "age", title: "年龄要求", cols: 1 },
  { key: "marriage", title: "婚况要求", cols: 1 },
  { key: "height", title: "身高要求", cols: 1 },
  { key: "education", title: "学历要求", cols: 1 },
  { key: "housing", title: "住房要求", cols: 1 },
  { key: "smoking", title: "抽烟要求", cols: 1 },
  { key: "drinking", title: "喝酒要求", cols: 1 },
  { key: "goal", title: "结婚要求", cols: 1 },
];

const pctText = (item: Dist) => item.pctText ?? `${item.pct.toFixed(2)}%`;

// 后端分布 [{label,value}] → 页面分布 [{label,count,pct}]
function toDist(items: MemberStatDistItem[] | undefined): Dist[] {
  const list = items ?? [];
  const total = list.reduce((sum, item) => sum + item.value, 0) || 1;
  return list.map((item) => ({ label: item.label, count: item.value, pct: (item.value / total) * 100 }));
}

// 日报/月报/年报：按日期聚合（后端返回按天，月/年在前端汇总）
function groupGrowth(rows: MemberStatGrowthRow[], period: "daily" | "monthly" | "yearly"): GrowthRow[] {
  const toRow = (row: MemberStatGrowthRow): GrowthRow => ({
    date: row.date,
    m: row.male_count,
    f: row.female_count,
    vip: row.vip_count,
    apply: row.apply_count,
    failed: row.failed_count,
    success: row.success_count,
  });
  if (period === "daily") return rows.map(toRow);
  const acc = new Map<string, GrowthRow>();
  rows.forEach((row) => {
    const key = period === "monthly" ? row.date.slice(0, 7) : row.date.slice(0, 4);
    const cur = acc.get(key) ?? { date: key, m: 0, f: 0, vip: 0, apply: 0, failed: 0, success: 0 };
    cur.m += row.male_count;
    cur.f += row.female_count;
    cur.vip += row.vip_count;
    cur.apply += row.apply_count;
    cur.failed += row.failed_count;
    cur.success += row.success_count;
    acc.set(key, cur);
  });
  return Array.from(acc.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
}

function PanelTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="ustat-panel-title"><i aria-hidden />{children}</h3>;
}

function DonutPanel({ title, items, cols = 2 }: { title: string; items: Dist[]; cols?: 1 | 2 }) {
  const total = items.reduce((sum, item) => sum + item.pct, 0) || 1;
  let acc = 0;
  const segments = items.map((item, index) => {
    const start = acc;
    acc += (item.pct / total) * 360;
    return `${DONUT_COLORS[index % DONUT_COLORS.length]} ${start}deg ${acc}deg`;
  });
  return (
    <section className="ustat-panel">
      <PanelTitle>{title}</PanelTitle>
      <div className="ustat-donut">
        <div className="ustat-donut-ring" style={{ background: `conic-gradient(${segments.join(",")})` }}>
          <span className="ustat-donut-hole" />
        </div>
      </div>
      <div className={`ustat-legend${cols === 2 ? " cols2" : ""}`}>
        {items.length === 0 ? (
          <div className="ustat-legend-item"><span className="ustat-legend-label">暂无数据</span></div>
        ) : items.map((item, index) => (
          <div className="ustat-legend-item" key={item.label}>
            <i className="ustat-legend-dot" style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }} />
            <span className="ustat-legend-label">{item.label}</span>
            <span className="ustat-legend-pct">{pctText(item)}</span>
            <span className="ustat-legend-num">{item.count}人</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BarPanel({ title, rows }: { title: string; rows: Dist[] }) {
  const max = Math.max(...rows.map((row) => row.pct), 0.001);
  return (
    <section className="ustat-panel">
      <PanelTitle>{title}</PanelTitle>
      <div className="ustat-bars">
        {rows.length === 0 ? (
          <div className="ustat-bar-row"><span className="ustat-bar-label">暂无数据</span></div>
        ) : rows.map((row) => (
          <div className="ustat-bar-row" key={row.label}>
            <span className="ustat-bar-label" title={row.label}>{row.label}</span>
            <span className="ustat-bar-track">
              <span className="ustat-bar-fill" style={{ width: `${Math.max(2, (row.pct / max) * 100)}%` }} />
            </span>
            <span className="ustat-bar-pct">{pctText(row)}</span>
            <span className="ustat-bar-num">{row.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function valueNode(value: number, unit = "") {
  return <b className={value > 0 ? "ustat-num-pos" : "ustat-num-zero"}>{value}{unit}</b>;
}

export default function LoveUserStatisticsPage() {
  const [tab, setTab] = useState<TabKey>("growth");
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("daily");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [report, setReport] = useState<MemberStatisticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminEndpoints.memberStatistics({});
      setReport(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "数据报表加载失败";
      setError(message);
      showConfigToast(message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = report?.groups;
  const metrics = report?.metrics;

  const growthRows = useMemo(
    () => (groups ? groupGrowth(groups.growth, period) : []),
    [groups, period],
  );

  const intentionRows = useMemo(() => {
    const items = groups?.intention_report ?? [];
    const total = items.reduce((sum, item) => sum + item.count, 0) || 1;
    const maxCount = items.reduce((max, item) => Math.max(max, item.count), 0);
    return items.map((item) => ({
      label: item.label,
      count: item.count,
      pct: (item.count / total) * 100,
      hot: item.count === maxCount && maxCount > 0,
    }));
  }, [groups]);

  const preference = groups?.requirements?.[gender];

  const content = () => {
    if (loading) {
      return (
        <div className="ustat-notice">
          <span className="ustat-notice-label"><i className="ustat-notice-icon">i</i>提示</span>
          <span>数据加载中…</span>
        </div>
      );
    }

    if (error || !groups || !metrics) {
      return (
        <div className="ustat-notice">
          <span className="ustat-notice-label"><i className="ustat-notice-icon">i</i>提示</span>
          <span>{error ?? "暂无数据"}</span>
        </div>
      );
    }

    if (tab === "growth") {
      return (
        <div>
          <div className="ustat-metrics">
            <div className="ustat-metric">
              <span className="ustat-metric-label">总人数(人)</span>
              <b className="ustat-metric-value">{metrics.total_members}</b>
            </div>
            <div className="ustat-metric">
              <span className="ustat-metric-label">单日新增最高(人)</span>
              <span className="ustat-metric-main">
                <span className="ustat-metric-date">{metrics.max_daily_date || "—"}</span>
                <b className="ustat-metric-value">{metrics.max_daily_members}</b>
              </span>
            </div>
            <div className="ustat-metric">
              <span className="ustat-metric-label">单月新增最高(人)</span>
              <span className="ustat-metric-main">
                <span className="ustat-metric-date">{metrics.max_monthly_month || "—"}</span>
                <b className="ustat-metric-value">{metrics.max_monthly_members}</b>
              </span>
            </div>
          </div>

          <div className="ustat-radios">
            {([["daily", "日报"], ["monthly", "月报"], ["yearly", "年报"]] as ["daily" | "monthly" | "yearly", string][]).map(([key, label]) => (
              <label className="ustat-radio" key={key}>
                <input type="radio" name="ustat-period" checked={period === key} onChange={() => setPeriod(key)} />
                {label}
              </label>
            ))}
          </div>

          <div className="ustat-table-wrap">
            <table className="ustat-table">
              <thead>
                <tr>
                  <th>日期(周期)</th>
                  <th>新增会员</th>
                  <th>新增VIP会员</th>
                  <th>新申请红娘牵线数</th>
                  <th>失败牵线数</th>
                  <th>成功牵线数</th>
                </tr>
              </thead>
              <tbody>
                {growthRows.length === 0 ? (
                  <tr><td className="ustat-time" colSpan={6}>暂无数据</td></tr>
                ) : growthRows.map((row) => (
                  <tr key={row.date}>
                    <td className="ustat-time">{row.date}</td>
                    <td>
                      <span className="ustat-mf"><span>男: {valueNode(row.m)}</span><span>女: {valueNode(row.f)}</span></span>
                    </td>
                    <td>{valueNode(row.vip)}</td>
                    <td>{valueNode(row.apply)}</td>
                    <td>{valueNode(row.failed)}</td>
                    <td>{valueNode(row.success)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (tab === "follow") {
      return (
        <div className="ustat-table-wrap">
          <table className="ustat-table follow">
            <thead>
              <tr>
                <th>红娘</th>
                <th>名下会员</th>
                <th>从未跟进</th>
                <th>超3天未跟进</th>
                <th>超7天未跟进</th>
                <th>超15天未跟进</th>
                <th>超30天未跟进</th>
                <th>跟进总条数</th>
                <th>本月跟进条数</th>
              </tr>
            </thead>
            <tbody>
              {groups.follow_report.length === 0 ? (
                <tr><td className="ustat-strong" colSpan={9}>暂无数据</td></tr>
              ) : groups.follow_report.map((row) => (
                <tr key={row.matchmaker}>
                  <td className="ustat-strong">{row.matchmaker}</td>
                  <td>{row.member_count}</td>
                  <td>{row.never_followed}</td>
                  <td>{row.over_3_days}</td>
                  <td>{row.over_7_days}</td>
                  <td>{row.over_15_days}</td>
                  <td>{row.over_30_days}</td>
                  <td>{row.follow_count}条</td>
                  <td>{row.month_follow_count}条</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (tab === "intention") {
      return (
        <div className="ustat-table-wrap">
          <table className="ustat-table">
            <thead>
              <tr>
                <th>客户意向</th>
                <th>客源数量</th>
                <th>占比</th>
              </tr>
            </thead>
            <tbody>
              {intentionRows.map((row) => (
                <tr key={row.label}>
                  <td className={row.hot ? "ustat-intent-hot" : ""}>{row.label}</td>
                  <td>
                    <span className="ustat-intent-cell">
                      <span className="ustat-intent-count">{row.count}条</span>
                      <span className="ustat-intent-track" />
                      {row.hot && <span className="ustat-badge-hot">最多</span>}
                    </span>
                  </td>
                  <td>{row.pct.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (tab === "basic") {
      return (
        <div className="ustat-blocks">
          <div className="ustat-grid c4">
            {BASIC_DONUTS.map((panel) => (
              <DonutPanel
                key={panel.title}
                title={panel.title}
                items={toDist(groups.basic_groups[panel.key])}
                cols={panel.cols}
              />
            ))}
          </div>
          <div className="ustat-grid c4">
            {BASIC_BARS.map((panel) => (
              <BarPanel
                key={panel.title}
                title={panel.title}
                rows={toDist(groups.basic_groups[panel.key]).slice(0, panel.limit ?? undefined)}
              />
            ))}
          </div>
        </div>
      );
    }

    if (tab === "requirement") {
      const jobRows = toDist(preference?.occupation).slice(0, 10);
      const jobMax = Math.max(...jobRows.map((row) => row.count), 1);
      return (
        <div className="ustat-blocks">
          <div className="ustat-radios">
            <label className="ustat-radio">
              <input type="radio" name="ustat-gender" checked={gender === "male"} onChange={() => setGender("male")} />
              男生择偶要求统计
            </label>
            <label className="ustat-radio">
              <input type="radio" name="ustat-gender" checked={gender === "female"} onChange={() => setGender("female")} />
              女生择偶要求统计
            </label>
          </div>
          <div className="ustat-grid c4">
            {REQUIREMENT_DONUTS.map((panel) => (
              <DonutPanel
                key={panel.title}
                title={panel.title}
                items={toDist(preference?.[panel.key])}
                cols={panel.cols}
              />
            ))}
          </div>
          <section className="ustat-panel">
            <PanelTitle>择偶职业前10</PanelTitle>
            <div className="ustat-bars">
              {jobRows.length === 0 ? (
                <div className="ustat-bar-row"><span className="ustat-bar-label">暂无数据</span></div>
              ) : jobRows.map((row, index) => (
                <div className="ustat-bar-row" key={row.label}>
                  <span className="ustat-bar-label">{row.label}</span>
                  <span className="ustat-bar-track">
                    <span className="ustat-bar-fill" style={{ width: `${Math.max(2, (row.count / jobMax) * 100)}%` }} />
                  </span>
                  <span className="ustat-bar-select">{row.count}人选择</span>
                  <span className="ustat-bar-pct">{pctText(row)}</span>
                  {index === 0 && <span className="ustat-badge-hot">最受欢迎</span>}
                </div>
              ))}
            </div>
          </section>
        </div>
      );
    }

    if (tab === "browse") {
      return (
        <div>
          <div className="ustat-datebar">
            <span className="ustat-date-field">
              <input type="text" value={report.from_date} placeholder="开始日期" readOnly />
            </span>
            <ArrowRight size={14} className="ustat-date-arrow" />
            <span className="ustat-date-field">
              <input type="text" value={report.to_date} placeholder="结束日期" readOnly />
            </span>
            <CalendarDays size={15} className="ustat-date-icon" />
          </div>
          <div className="ustat-table-wrap">
            <table className="ustat-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>平台首页浏览次数</th>
                  <th>资料页浏览次数</th>
                  <th>被浏览最多的资料页</th>
                </tr>
              </thead>
              <tbody>
                {groups.browse_report.length === 0 ? (
                  <tr><td className="ustat-time" colSpan={4}>暂无数据</td></tr>
                ) : groups.browse_report.map((row) => (
                  <tr key={row.date}>
                    <td className="ustat-time">{row.date}</td>
                    <td>{row.home_views}</td>
                    <td>{row.profile_views}</td>
                    <td>
                      {row.popular_member && row.popular_member !== "-" ? (
                        <span className="ustat-browse-top">
                          <button type="button" className="ustat-link">{row.popular_member}</button>
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    const popularityGroups: { title: string; unit: string; rows: { name: string; count: number }[] }[] = [
      { title: "人气女会员排行（浏览量前10）", unit: "被浏览", rows: (groups.popularity_female ?? []).map((item) => ({ name: item.label, count: item.value })) },
      { title: "人气男会员排行（浏览量前10）", unit: "被浏览", rows: (groups.popularity_male ?? []).map((item) => ({ name: item.label, count: item.value })) },
      { title: "最受欢迎女会员排行（被申请牵线数前10）", unit: "被申请", rows: (groups.apply_female ?? []).map((item) => ({ name: item.label, count: item.value })) },
      { title: "最受欢迎男会员排行（被申请牵线数前10）", unit: "被申请", rows: (groups.apply_male ?? []).map((item) => ({ name: item.label, count: item.value })) },
    ];

    return (
      <div>
        <div className="ustat-notice">
          <span className="ustat-notice-label"><i className="ustat-notice-icon">i</i>须知</span>
          <span>统计范围为您的平台中状态为“公开相亲”的会员</span>
        </div>
        <div className="ustat-grid c4">
          {popularityGroups.map((group, groupIndex) => (
            <section className="ustat-panel" key={group.title}>
              <PanelTitle>{group.title}</PanelTitle>
              <div className="ustat-rank-list">
                {group.rows.length === 0 ? (
                  <div className="ustat-rank-item"><span className="ustat-rank-name">暂无数据</span></div>
                ) : group.rows.map((row, index) => (
                  <div className="ustat-rank-item" key={`${groupIndex}-${row.name}-${index}`}>
                    <span className={`ustat-rank-no${index < 3 ? ` g${index + 1}` : " plain"}`}>{index + 1}</span>
                    <span className="ustat-rank-avatar" style={{ background: AVATARS[(groupIndex + index) % AVATARS.length] }} />
                    <span className="ustat-rank-name" title={row.name}>{row.name}</span>
                    <span className="ustat-rank-count">{group.unit}{row.count}次</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1600px]">
      <AdminBreadcrumb items={[{ label: "会员CRM" }, { label: "数据报表" }]} />
      <div className="ustat-card">
        <div className="ustat-tabs">
          {tabs.map((item) => (
            <button type="button" key={item.key} onClick={() => setTab(item.key)} className={`ustat-tab${tab === item.key ? " active" : ""}`}>
              {item.label}
            </button>
          ))}
        </div>
        {content()}
      </div>
    </div>
  );
}
