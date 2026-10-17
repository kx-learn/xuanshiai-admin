"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Download, PackageOpen, Upload } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import MemberQuickProfileDrawer from "@/components/MemberQuickProfileDrawer";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { MemberCallRecordRow, MemberFollowUpRow, MemberFollowUpSummary } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

type Range = "all" | "today" | "yesterday" | "threeDays" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";
type FollowTab = "record" | "call";

const ranges: { key: Range; label: string }[] = [
  { key: "all", label: "全部" },
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

const pad = (value: number) => String(value).padStart(2, "0");
const dateStr = (value: Date) => `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;

/** 时间范围快捷项 -> 后端 start_date / end_date（左闭右闭，按天） */
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

function fmt(value?: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
}

function fmtDuration(seconds: number | null) {
  if (seconds === null || seconds === undefined) return "—";
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes}分${pad(rest)}秒` : `${rest}秒`;
}

export default function CustomerFollowUpPage() {
  const router = useRouter();
  const [followTab, setFollowTab] = useState<FollowTab>("record");
  const [range, setRange] = useState<Range>("all");
  const [intent, setIntent] = useState("");
  const [wechatAdded, setWechatAdded] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState<MemberFollowUpRow[]>([]);
  const [callRows, setCallRows] = useState<MemberCallRecordRow[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<MemberFollowUpSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MemberFollowUpRow | null>(null);

  const dateRange = useMemo(() => rangeToDates(range), [range]);
  const effectiveStart = from || dateRange.start;
  const effectiveEnd = to || dateRange.end;

  const loadRows = useCallback(async () => {
    setLoading(true);
    try {
      if (followTab === "call") {
        const result = await adminEndpoints.memberCallRecordsOverview({
          page,
          page_size: pageSize,
          keyword: submittedKeyword || undefined,
          start_date: effectiveStart,
          end_date: effectiveEnd,
        });
        setCallRows(result.items ?? []);
        setTotal(result.total ?? 0);
      } else {
        const result = await adminEndpoints.memberFollowUpList({
          page,
          page_size: pageSize,
          keyword: submittedKeyword || undefined,
          intention_level: intent ? Number(intent) : undefined,
          wechat_added: wechatAdded === "" ? undefined : Number(wechatAdded),
          start_date: effectiveStart,
          end_date: effectiveEnd,
        });
        setRows(result.items ?? []);
        setTotal(result.total ?? 0);
      }
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "跟进记录加载失败", "error");
      setRows([]);
      setCallRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [followTab, page, pageSize, submittedKeyword, intent, wechatAdded, effectiveStart, effectiveEnd]);

  const loadSummary = useCallback(async () => {
    try {
      setSummary(await adminEndpoints.memberFollowUpSummary());
    } catch {
      setSummary(emptySummary);
    }
  }, []);

  useEffect(() => { void loadRows(); }, [loadRows]);
  useEffect(() => { void loadSummary(); }, [loadSummary]);

  const search = () => { setSubmittedKeyword(keyword.trim()); setPage(1); };

  const exportRows = () => {
    const source = followTab === "call" ? callRows : rows;
    if (!source.length) {
      showConfigToast("当前没有可导出的记录", "error");
      return;
    }
    const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const header = followTab === "call"
      ? ["会员编号", "会员昵称", "拨打人", "通话时间", "通话方向", "通话状态", "通话时长(秒)", "备注"]
      : ["会员编号", "会员昵称", "跟进红娘", "跟进时间", "跟进方式", "跟进内容"];
    const body = followTab === "call"
      ? (source as MemberCallRecordRow[]).map((row) => [
          row.member_code,
          row.nickname,
          row.matchmaker_name,
          fmt(row.created_at),
          row.direction_label,
          row.status_label,
          row.duration_seconds,
          row.remark,
        ])
      : (source as MemberFollowUpRow[]).map((row) => [
          row.member_code,
          row.nickname,
          row.matchmaker_name,
          fmt(row.created_at),
          row.method_label,
          row.content,
        ]);
    const csv = [header.map(escape).join(","), ...body.map((cells) => cells.map(escape).join(","))].join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${followTab === "call" ? "通话记录" : "跟进记录"}-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showConfigToast("导出成功", "ok");
  };

  return (
    <div className="follow-up-page">
      <AdminBreadcrumb items={getBreadcrumb("客源线索", "跟进全览")} />
      <section className="mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]"><h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2><p>您可以在本页面查看所有的跟进记录，方便平台管理员快捷直观的了解和浏览跟进情况</p></section>
      <div className="follow-metrics">
        {ranges.map((item) => (
          <button
            type="button"
            key={item.key}
            className={`follow-metric${range === item.key ? " active" : ""}`}
            onClick={() => { setRange(item.key); setFrom(""); setTo(""); setPage(1); }}
          >
            <strong>{item.key === "all" ? total : summary[summaryKey[item.key]]} <small>条</small></strong>
            <small>{item.label}</small>
          </button>
        ))}
      </div>
      <section className="admin-card overflow-hidden">
        <header className="follow-header"><h2>跟进全览</h2><div><button type="button" onClick={exportRows}><Download size={15} />导出EXCEL</button><button type="button" onClick={() => router.push("/love-user-follow-up-import")}><Upload size={15} />导入历史跟进</button></div></header>
        <div className="follow-filters">
          <div className="follow-tabs" role="tablist">
            {([["record", "跟进记录"], ["call", "通话记录"]] as [FollowTab, string][]).map(([value, label]) => (
              <button
                key={value}
                role="tab"
                aria-selected={followTab === value}
                className={`follow-tab${followTab === value ? " active" : ""}`}
                onClick={() => { setFollowTab(value); setPage(1); }}
              >
                {label}
              </button>
            ))}
          </div>
          {followTab === "record" ? (
            <>
              <select aria-label="客户意向" value={intent} onChange={(e) => { setIntent(e.target.value); setPage(1); }}>
                <option value="">客户意向：不限</option>
                <option value="1">意向较低</option>
                <option value="2">意向一般</option>
                <option value="3">意向较高</option>
              </select>
              <select aria-label="加微信结果" value={wechatAdded} onChange={(e) => { setWechatAdded(e.target.value); setPage(1); }}>
                <option value="">加上了吗?</option>
                <option value="0">未添加</option>
                <option value="1">已加上</option>
                <option value="2">没加上</option>
              </select>
            </>
          ) : null}
          <input
            aria-label="搜索会员"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") search(); }}
            placeholder="请输入会员昵称/姓名/手机"
          />
          <button type="button" className="search-btn" onClick={search}>搜索</button>
          <label className="date-filter date-range-picker">
            <span className="dr-field">
              {!from && <span className="dr-placeholder">开始日期</span>}
              <input aria-label="开始日期" type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} />
            </span>
            <span aria-hidden className="dr-arrow">→</span>
            <span className="dr-field">
              {!to && <span className="dr-placeholder">结束日期</span>}
              <input aria-label="结束日期" type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} />
            </span>
            <CalendarDays size={16} />
          </label>
        </div>
        <div className="overflow-x-auto">
          {followTab === "call" ? (
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-[#fafafa] text-[#666]"><tr>{["会员", "拨打人", "通话时间", "方向", "状态", "时长", "备注"].map((x) => <th key={x} className="border-b px-3 py-3 text-left font-normal">{x}</th>)}</tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="p-10 text-center text-[#999]">加载中...</td></tr>
                ) : callRows.length === 0 ? (
                  <tr><td colSpan={7} className="p-10 text-center text-[#999]"><PackageOpen size={40} className="mx-auto mb-2" />暂无数据</td></tr>
                ) : callRows.map((x) => (
                  <tr key={x.id} className="border-b hover:bg-[#fafcff]">
                    <td className="px-3 py-3">
                      <div className="font-medium">{x.nickname || "—"}</div>
                      <div className="text-xs text-[#999]">{x.member_code}</div>
                    </td>
                    <td className="px-3 py-3">{x.matchmaker_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-[#777]">{fmt(x.created_at)}</td>
                    <td className="px-3 py-3">{x.direction_label}</td>
                    <td className="px-3 py-3">{x.status_label}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-[#777]">{fmtDuration(x.duration_seconds)}</td>
                    <td className="px-3 py-3">{x.remark || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-[#fafafa] text-[#666]"><tr>{["跟进会员", "跟进红娘", "跟进时间", "跟进内容", "操作"].map((x) => <th key={x} className="border-b px-3 py-3 text-left font-normal">{x}</th>)}</tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-10 text-center text-[#999]">加载中...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-[#999]"><PackageOpen size={40} className="mx-auto mb-2" />暂无数据</td></tr>
                ) : rows.map((x) => (
                  <tr key={x.id} className="border-b hover:bg-[#fafcff]">
                    <td className="px-3 py-3">
                      <div className="font-medium">{x.nickname || "—"}</div>
                      <div className="text-xs text-[#999]">{x.member_code}</div>
                    </td>
                    <td className="px-3 py-3">{x.matchmaker_name}</td>
                    <td className="px-3 py-3 whitespace-nowrap text-xs text-[#777]">{fmt(x.created_at)}</td>
                    <td className="px-3 py-3">
                      <div>{x.content || "—"}</div>
                      <div className="text-xs text-[#3658f7]">{x.method_label}{x.intention_level ? ` · 意向${({ 1: "较低", 2: "一般", 3: "较高" } as Record<number, string>)[x.intention_level] ?? ""}` : ""}</div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-[#3658f7]"><button type="button" onClick={() => setProfile(x)}>详情</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
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
