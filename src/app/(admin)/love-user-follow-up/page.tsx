"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Download, Upload } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminApi } from "@/lib/admin-api";
import MemberQuickProfileDrawer from "@/components/MemberQuickProfileDrawer";

type FollowUp = Record<string, unknown>;
type ApiPage = { items?: FollowUp[]; data?: FollowUp[]; total?: number } | FollowUp[];
type Range = "all" | "today" | "yesterday" | "threeDays" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

const ranges: { key: Range; label: string }[] = [
  { key: "all", label: "全部" }, { key: "today", label: "今天" }, { key: "yesterday", label: "昨天" }, { key: "threeDays", label: "最近3天" },
  { key: "thisWeek", label: "本周" }, { key: "lastWeek", label: "上周" }, { key: "thisMonth", label: "本月" }, { key: "lastMonth", label: "上月" },
];
const string = (value: unknown) => value === undefined || value === null || value === "" ? "-" : String(value);
const keyFor = (row: FollowUp, index: number, page: number) => String(row.id ?? row.follow_up_id ?? row.followup_id ?? `${page}-${index}`);
const dateText = (row: FollowUp) => String(row.created_at ?? row.follow_at ?? row.follow_time ?? "").slice(0, 10);
const memberName = (row: FollowUp) => string(row.member_nickname ?? row.nickname ?? row.member_name ?? row.user_name);
const memberCode = (row: FollowUp) => string(row.member_code ?? row.member_no ?? row.user_code ?? row.member_id ?? row.user_id);
const matchmaker = (row: FollowUp) => string(row.matchmaker_name ?? row.matchmaker_nickname ?? row.follow_by_name ?? row.creator_name ?? row.matchmaker);
const followTime = (row: FollowUp) => string(row.created_at ?? row.follow_at ?? row.follow_time);
const content = (row: FollowUp) => string(row.content ?? row.follow_content ?? row.remark ?? row.note);

function inRange(text: string, range: Range) {
  if (range === "all" || !text) return true;
  const value = new Date(`${text}T00:00:00`);
  if (Number.isNaN(value.getTime())) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const dayMs = 86_400_000;
  if (range === "today") return day.getTime() === today.getTime();
  if (range === "yesterday") return day.getTime() === today.getTime() - dayMs;
  if (range === "threeDays") return day >= new Date(today.getTime() - 2 * dayMs) && day <= today;
  if (range === "thisWeek" || range === "lastWeek") {
    const monday = new Date(today.getTime() - ((today.getDay() + 6) % 7) * dayMs);
    const start = range === "thisWeek" ? monday : new Date(monday.getTime() - 7 * dayMs);
    return day >= start && day < new Date(start.getTime() + 7 * dayMs);
  }
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const start = range === "thisMonth" ? thisMonth : new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const end = range === "thisMonth" ? new Date(today.getFullYear(), today.getMonth() + 1, 1) : thisMonth;
  return day >= start && day < end;
}
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export default function LoveUserFollowUpPage() {
  const [rows, setRows] = useState<FollowUp[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("all");
  const [intent, setIntent] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [quickMember, setQuickMember] = useState<{ id: number; nickname: string; memberCode: string; tab: "profile" | "follow" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query: Record<string, string | number> = { page, page_size: pageSize };
      if (submittedKeyword) query.search = submittedKeyword;
      if (intent) query.intention_level = intent;
      if (from) query.start_date = from;
      if (to) query.end_date = to;
      const result = await adminApi<ApiPage>("admin/members/follow-ups", { query });
      const items = Array.isArray(result) ? result : Array.isArray(result.items) ? result.items : Array.isArray(result.data) ? result.data : [];
      setRows(items);
      setTotal(Array.isArray(result) ? result.length : Number(result.total ?? items.length));
    } catch { setRows([]); setTotal(0); } finally { setLoading(false); }
  }, [from, intent, page, pageSize, submittedKeyword, to]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setSelected([]); }, [page, pageSize, range]);

  const visibleRows = useMemo(() => rows.filter((row) => inRange(dateText(row), range)), [range, rows]);
  const counts = useMemo(() => ranges.reduce<Record<Range, number>>((all, item) => ({ ...all, [item.key]: rows.filter((row) => inRange(dateText(row), item.key)).length }), {} as Record<Range, number>), [rows]);
  const keys = visibleRows.map((row, index) => keyFor(row, index, page));
  const allSelected = keys.length > 0 && keys.every((key) => selected.includes(key));
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const todayLabel = `今天（${new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()).replaceAll("/", ".")}）`;
  const setAll = (checked: boolean) => setSelected((current) => checked ? [...new Set([...current, ...keys])] : current.filter((key) => !keys.includes(key)));
  const viewMember = (row: FollowUp, tab: "profile" | "follow") => {
    const rawId = row.member_id ?? row.user_id ?? row.memberId;
    const id = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) return;
    setQuickMember({ id, nickname: memberName(row), memberCode: memberCode(row), tab });
  };

  return <div className="member-followup-page">
    <AdminBreadcrumb items={getBreadcrumb("会员CRM", "跟进全览")} />
    <section className="member-followup-notice"><b>须知</b><span>您可以在本页面查看所有的跟进记录，方便平台管理人员快捷直观的了解和阅览跟进情况</span></section>
    <section className="member-followup-metrics" aria-label="跟进时间统计">{ranges.map((item) => <button type="button" key={item.key} className={`member-followup-metric ${range === item.key ? "active" : ""}`} onClick={() => { setRange(item.key); setPage(1); }}>{item.key === "all" ? <><strong>全部 <i /></strong><span>红娘</span></> : <><strong>{counts[item.key]} <small>条</small></strong><span>{item.key === "today" ? todayLabel : item.label}</span></>}</button>)}</section>
    <section className="admin-card member-followup-card">
      <header className="member-followup-header"><h1>跟进全览</h1><div className="member-followup-tools"><button type="button" onClick={() => window.print()}><Download size={15} />导出EXCEL</button><button type="button" onClick={() => undefined}><Upload size={15} />导入历史跟进</button></div></header>
      <div className="member-followup-filters"><label className="member-followup-select"><select aria-label="客户意向" value={intent} onChange={(event) => { setIntent(event.target.value); setPage(1); }}><option value="">客户意向：不限</option><option value="1">意向较低</option><option value="2">意向一般</option><option value="3">意向较高</option></select><i /></label><div className="member-followup-search"><input aria-label="搜索会员" value={keyword} onChange={(event) => setKeyword(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { setSubmittedKeyword(keyword.trim()); setPage(1); } }} placeholder="请输入会员昵称/姓名/手机/编号" /><button type="button" onClick={() => { setSubmittedKeyword(keyword.trim()); setPage(1); }}>搜 索</button></div><label className="member-followup-date"><input aria-label="开始日期" type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPage(1); }} /><span>至</span><input aria-label="结束日期" type="date" value={to} onChange={(event) => { setTo(event.target.value); setPage(1); }} /><CalendarDays size={16} /></label><button type="button" className="member-followup-reset" onClick={() => { setIntent(""); setKeyword(""); setSubmittedKeyword(""); setFrom(""); setTo(""); setRange("all"); setPage(1); }}>重置</button></div>
      <div className="overflow-x-auto"><table className="member-followup-table"><thead><tr><th className="select-column"><input aria-label="全选当前页" type="checkbox" checked={allSelected} onChange={(event) => setAll(event.target.checked)} /></th><th>跟进会员</th><th>跟进红娘</th><th>跟进时间</th><th>跟进内容</th><th>操作</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="member-followup-empty">加载中...</td></tr> : visibleRows.length === 0 ? <tr><td colSpan={6} className="member-followup-empty">暂无数据</td></tr> : visibleRows.map((row, index) => { const key = keys[index]; return <tr key={key}><td className="select-column"><input aria-label={`选择第 ${index + 1} 条跟进`} type="checkbox" checked={selected.includes(key)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, key] : current.filter((item) => item !== key))} /></td><td className="member-followup-member"><b>{memberName(row)}</b><span>{memberCode(row)}</span></td><td>{matchmaker(row)}</td><td className="whitespace-nowrap">{followTime(row)}</td><td className="member-followup-content">{content(row)}</td><td className="member-followup-actions"><button type="button" onClick={() => viewMember(row, "profile")}>查看会员资料</button><button type="button" onClick={() => viewMember(row, "follow")}>查看全部跟进</button></td></tr>; })}</tbody></table></div>
      {selected.length > 0 && <div className="member-followup-bulk"><span>已选 {selected.length} 条</span><button type="button" onClick={() => window.print()}>批量导出</button><button type="button" className="member-followup-clear" onClick={() => setSelected([])}>取消选择</button></div>}
      <footer className="member-followup-pagination"><span>共 {total} 条</span><div><button type="button" aria-label="上一页" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="pagination-arrow previous"><i /></button>{pageNumbers(page, totalPages).map((item, index) => item === "…" ? <span className="pagination-ellipsis" key={`${item}-${index}`}>…</span> : <button type="button" key={item} onClick={() => setPage(item)} className={`pagination-number ${page === item ? "active" : ""}`}>{item}</button>)}<button type="button" aria-label="下一页" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} className="pagination-arrow next"><i /></button><label className="member-followup-page-size"><select aria-label="每页条数" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value={20}>20 条/页</option><option value={50}>50 条/页</option><option value={100}>100 条/页</option></select><i /></label></div></footer>
    </section>
    {quickMember && <MemberQuickProfileDrawer memberId={quickMember.id} nickname={quickMember.nickname} memberCode={quickMember.memberCode} initialTab={quickMember.tab} onClose={() => setQuickMember(null)} />}
  </div>;
}
