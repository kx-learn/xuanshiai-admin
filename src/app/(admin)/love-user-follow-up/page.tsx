"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import DateRangePicker from "@/components/DateRangePicker";
import AdminPagination from "@/components/AdminPagination";
import MemberQuickProfileDrawer from "@/components/MemberQuickProfileDrawer";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { MemberFollowUpRow, MemberFollowUpSummary } from "@/lib/admin-endpoints";
import { adminApi, resolveMediaUrl } from "@/lib/admin-api";
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
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkIntention, setBulkIntention] = useState("");
  const [bulkSaving, setBulkSaving] = useState(false);

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
      // 换页/筛选后，跨页残留的勾选无法再操作，收敛到当前页的可见行
      const visible = new Set((result.items ?? []).map((item) => item.id));
      setSelected((current) => current.filter((id) => visible.has(id)));
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

  /**
   * 批量标记选中会员的客户意向。
   * 后端没有跟进记录级的批量接口，改走会员维度的单条更新
   * `PATCH /admin/matchmaker/members/{id}`（intention_level 1低 2中 3高，空=清除），
   * 同一会员的多条跟进只更新一次。
   */
  const bulkMarkIntention = async () => {
    if (!selected.length) return;
    // "0" 是页面上的「清除意向」选项，映射为 null（后端 intention_level 只接受 1/2/3 或 null）
    const level = bulkIntention === "" || bulkIntention === "0" ? null : Number(bulkIntention);
    const userIds = Array.from(new Set(rows.filter((row) => selected.includes(row.id)).map((row) => row.user_id)));
    if (!userIds.length) return;
    const label = level === null ? "清除客户意向" : (level === 1 ? "低意向" : level === 2 ? "中意向" : "高意向");
    if (!window.confirm(`确定将选中的 ${userIds.length} 位会员的客户意向标记为「${label}」吗？`)) return;
    setBulkSaving(true);
    let done = 0;
    let failed = 0;
    for (const userId of userIds) {
      try {
        await adminApi(`admin/matchmaker/members/${userId}`, { method: "PATCH", body: { intention_level: level } });
        done += 1;
      } catch {
        failed += 1;
      }
    }
    setBulkSaving(false);
    if (failed === 0) {
      showConfigToast(`已更新 ${done} 位会员`, "ok");
      setSelected([]);
      setBulkIntention("");
    } else {
      showConfigToast(`${done} 位已更新，${failed} 位失败`, "error");
    }
    await loadRows();
  };

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const exportRows = () => {
    if (!rows.length) {
      showConfigToast("当前没有可导出的跟进记录", "error");
      return;
    }
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      ["会员编号", "会员昵称", "跟进红娘", "跟进时间", "跟进内容", "备注"].map(escape).join(","),
      ...rows.map((row) => [
        row.member_code,
        row.nickname,
        row.matchmaker_name,
        formatTime(row.created_at),
        row.content,
        row.note,
      ].map(escape).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `会员跟进-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showConfigToast("导出成功", "ok");
  };

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
            <button type="button" onClick={exportRows}><Download size={15} />导出EXCEL</button>
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
          <DateRangePicker
            startValue={from}
            endValue={to}
            onStartChange={(value) => { setFrom(value); setPage(1); }}
            onEndChange={(value) => { setTo(value); setPage(1); }}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="member-followup-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))} /></th>
                <th>跟进会员</th>
                <th>跟进红娘</th>
                <th>跟进时间</th>
                <th>跟进内容</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="member-followup-empty">加载中…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="member-followup-empty">暂无数据</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className={selected.includes(row.id) ? "selected" : undefined}>
                  <td><input type="checkbox" aria-label={`选择跟进记录 ${row.id}`} checked={selected.includes(row.id)} onChange={() => setSelected((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])} /></td>
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

        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />

        {selected.length > 0 && (
          <div className="lead-bulk-toolbar fixed bottom-0 right-0 left-56 z-[45] flex min-h-[54px] flex-wrap items-center gap-2.5 border-t border-[#e3e7ef] bg-white px-[18px] py-2 text-[13px] text-[#46516b] shadow-[0_-2px_10px_rgba(24,40,80,.12)]">
            <span>已选择 <b>{selected.length}</b> 项</span>
            <select
              aria-label="批量标记客户意向"
              className="h-9 rounded border border-[#dfe3ea] bg-white px-4 text-[13px] text-[#667085] disabled:opacity-50"
              value={bulkIntention}
              disabled={bulkSaving}
              onChange={(event) => setBulkIntention(event.target.value)}
            >
              <option value="">标记客户意向</option>
              <option value="3">高意向</option>
              <option value="2">中意向</option>
              <option value="1">低意向</option>
              <option value="0">清除意向</option>
            </select>
            <button
              type="button"
              className="h-9 whitespace-nowrap rounded border border-[#3658f7] bg-[#3658f7] px-4 text-[13px] text-white disabled:opacity-50"
              disabled={bulkSaving || bulkIntention === ""}
              onClick={() => void bulkMarkIntention()}
            >
              {bulkSaving ? "提交中…" : "应用"}
            </button>
            <button
              type="button"
              className="h-9 whitespace-nowrap rounded border border-[#3658f7] bg-[#3658f7] px-4 text-[13px] text-white disabled:opacity-50"
              disabled={bulkSaving}
              onClick={() => { setSelected([]); setBulkIntention(""); }}
            >
              取消选择
            </button>
          </div>
        )}
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
