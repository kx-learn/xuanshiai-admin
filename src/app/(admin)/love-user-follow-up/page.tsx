"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Download, Upload } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import MemberQuickProfileDrawer from "@/components/MemberQuickProfileDrawer";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { MemberFollowUpRow, MemberFollowUpSummary } from "@/lib/admin-endpoints";
import { resolveMediaUrl } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

type Range = "all" | "today" | "yesterday" | "threeDays" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

const ranges: { key: Range; label: string }[] = [
  { key: "all", label: "红娘" },
  { key: "today", label: "今天" },
  { key: "yesterday", label: "昨天" },
  { key: "threeDays", label: "最近3天" },
  { key: "thisWeek", label: "本周" },
  { key: "lastWeek", label: "上周" },
  { key: "thisMonth", label: "本月" },
  { key: "lastMonth", label: "上月" },
];

const emptySummary: MemberFollowUpSummary = {
  all: 0, today: 0, yesterday: 0, three_days: 0, this_week: 0, last_week: 0, this_month: 0, last_month: 0,
};

const summaryKey: Record<Range, keyof MemberFollowUpSummary> = {
  all: "all",
  today: "today",
  yesterday: "yesterday",
  threeDays: "three_days",
  thisWeek: "this_week",
  lastWeek: "last_week",
  thisMonth: "this_month",
  lastMonth: "last_month",
};

const avatarGrads = ["a", "b", "c", "d", "e"];

const pad = (value: number) => String(value).padStart(2, "0");
const dateStr = (value: Date) => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

/** 把时间范围快捷项换算为后端接受的 start_date / end_date（左闭右闭，按天） */
function rangeToDates(range: Range): { start?: string; end?: string } {
  if (range === "all") return {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayMs = 86_400_000;
  const shift = (days: number) => new Date(today.getTime() + days * dayMs);
  if (range === "today") return { start: dateStr(today), end: dateStr(today) };
  if (range === "yesterday") {
    const yesterday = shift(-1);
    return { start: dateStr(yesterday), end: dateStr(yesterday) };
  }
  if (range === "threeDays") return { start: dateStr(shift(-2)), end: dateStr(today) };
  const monday = new Date(today.getTime() - ((today.getDay() + 6) % 7) * dayMs);
  if (range === "thisWeek") return { start: dateStr(monday), end: dateStr(shift(6)) };
  if (range === "lastWeek") return { start: dateStr(shift(-7)), end: dateStr(shift(-1)) };
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  if (range === "thisMonth") return { start: dateStr(thisMonth), end: dateStr(today) };
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  return { start: dateStr(lastMonthStart), end: dateStr(lastMonthEnd) };
}

function formatTime(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
}

export default function LoveUserFollowUpPage() {
  const router = useRouter();
  const [range, setRange] = useState<Range>("all");
  const [intent, setIntent] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState<MemberFollowUpRow[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<MemberFollowUpSummary>(emptySummary);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<MemberFollowUpRow | null>(null);

  const dateRange = useMemo(() => rangeToDates(range), [range]);
  const effectiveStart = from || dateRange.start;
  const effectiveEnd = to || dateRange.end;

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.memberFollowUpList({
        page,
        page_size: pageSize,
        keyword: submittedKeyword || undefined,
        intention_level: intent ? Number(intent) : undefined,
        start_date: effectiveStart,
        end_date: effectiveEnd,
      });
      setRows(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "跟进记录加载失败", "error");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, submittedKeyword, intent, effectiveStart, effectiveEnd]);

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await adminEndpoints.memberFollowUpSummary());
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "跟进统计加载失败", "error");
    }
  }, []);

  useEffect(() => { void loadRows(); }, [loadRows]);
  useEffect(() => { void loadSummary(); }, [loadSummary]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="member-followup-page">
      <AdminBreadcrumb items={getBreadcrumb("会员CRM", "跟进全览")} />
      <section className="member-followup-notice">
        <b>须知</b>
        <span>您可以在本页面查看所有的跟进记录，方便平台管理人员快捷直观的了解和阅览跟进情况</span>
      </section>

      <section className="member-followup-metrics" aria-label="跟进时间统计">
        {ranges.map((item) => (
          <button
            type="button"
            key={item.key}
            className={`member-followup-metric ${range === item.key ? "active" : ""}`}
            onClick={() => { setRange(item.key); setFrom(""); setTo(""); setPage(1); }}
          >
            {item.key === "all" ? (
              <>
                <strong>全部 <i /></strong>
                <span>{item.label}</span>
              </>
            ) : (
              <>
                <strong>{summary[summaryKey[item.key]]} <small>条</small></strong>
                <span>{item.label}</span>
              </>
            )}
          </button>
        ))}
      </section>

      <section className="admin-card member-followup-card">
        <header className="member-followup-header">
          <h1>跟进全览</h1>
          <div className="member-followup-tools">
            <button type="button" onClick={() => window.print()}><Download size={15} />导出EXCEL</button>
            <button type="button" onClick={() => router.push("/love-user-follow-up-import")}><Upload size={15} />导入历史跟进</button>
          </div>
        </header>

        <div className="member-followup-filters">
          <label className="member-followup-select">
            <select
              aria-label="客户意向"
              value={intent}
              onChange={(event) => { setIntent(event.target.value); setPage(1); }}
            >
              <option value="">客户意向：不限</option>
              <option value="1">意向较低</option>
              <option value="2">意向一般</option>
              <option value="3">意向较高</option>
            </select>
            <i />
          </label>
          <div className="member-followup-search">
            <input
              aria-label="搜索会员"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") { setSubmittedKeyword(keyword.trim()); setPage(1); } }}
              placeholder="输入会员昵称/姓名/编号"
            />
            <button type="button" onClick={() => { setSubmittedKeyword(keyword.trim()); setPage(1); }}>搜索</button>
          </div>
          <label className="date-range-picker member-followup-date">
            <span className="dr-field">
              {!from && <span className="dr-placeholder">开始日期</span>}
              <input aria-label="开始日期" type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} />
            </span>
            <span aria-hidden className="dr-arrow">→</span>
            <span className="dr-field">
              {!to && <span className="dr-placeholder">结束日期</span>}
              <input aria-label="结束日期" type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} />
            </span>
            <CalendarDays size={16} />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="member-followup-table">
            <thead>
              <tr>
                <th>跟进会员</th>
                <th>跟进红娘</th>
                <th>跟进时间</th>
                <th>跟进内容</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="member-followup-empty">加载中…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="member-followup-empty">暂无数据</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  <td className="member-followup-member">
                    <div className="member-followup-member-cell">
                      {row.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="member-followup-avatar" src={resolveMediaUrl(row.avatar)} alt="" />
                      ) : (
                        <span className={`member-followup-avatar member-followup-avatar-${avatarGrads[row.user_id % avatarGrads.length]}`} />
                      )}
                      <div>
                        <b>{row.nickname ?? "—"}</b>
                        <span>{row.member_code}</span>
                      </div>
                    </div>
                  </td>
                  <td>{row.matchmaker_name}</td>
                  <td className="whitespace-nowrap">{formatTime(row.created_at)}</td>
                  <td className="member-followup-content">
                    <p>{row.content}</p>
                    {row.note && <p className="member-followup-note">{row.note}</p>}
                  </td>
                  <td className="member-followup-actions">
                    <button type="button" onClick={() => setProfile(row)}>查看会员资料</button>
                    <button type="button" onClick={() => setProfile(row)}>查看全部跟进</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="member-followup-pagination">
          <span>共 {total} 条</span>
          <div>
            <button
              type="button"
              aria-label="上一页"
              className="pagination-arrow previous"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            ><i /></button>
            <button type="button" className="pagination-number active">{page}</button>
            <button
              type="button"
              aria-label="下一页"
              className="pagination-arrow next"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            ><i /></button>
            <label className="member-followup-page-size">
              <select
                aria-label="每页条数"
                value={pageSize}
                onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}
              >
                <option value="20">20 条/页</option>
                <option value="50">50 条/页</option>
                <option value="100">100 条/页</option>
              </select>
              <i />
            </label>
          </div>
        </footer>
      </section>

      {profile && (
        <MemberQuickProfileDrawer
          memberId={profile.user_id}
          nickname={profile.nickname}
          memberCode={profile.member_code}
          onClose={() => setProfile(null)}
        />
      )}
    </div>
  );
}
