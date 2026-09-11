"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Download, Upload } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

type Range = "all" | "today" | "yesterday" | "threeDays" | "thisWeek" | "lastWeek" | "thisMonth" | "lastMonth";

type FollowRow = {
  id: number;
  name: string;
  code: string;
  matchmaker: string;
  time: string;
  content: string;
  note?: string;
  grad: string;
};

const ranges: { key: Range; label: string }[] = [
  { key: "all", label: "红娘" },
  { key: "today", label: "今天（2026.09.10）" },
  { key: "yesterday", label: "昨天" },
  { key: "threeDays", label: "最近3天" },
  { key: "thisWeek", label: "本周" },
  { key: "lastWeek", label: "上周" },
  { key: "thisMonth", label: "本月" },
  { key: "lastMonth", label: "上月" },
];

const rows: FollowRow[] = [
  { id: 1, name: "III| 普浩芸", code: "G396140", matchmaker: "后台管理员", time: "2026-09-01 14:48:54", content: "与会员：薛家乐 (Lemon/B965945)，2026年09月01日牵线成功", note: "注：本条记录由系统自动生成", grad: "a" },
  { id: 2, name: "Lemon|薛家乐", code: "B965945", matchmaker: "芸希老师", time: "2026-09-01 14:48:54", content: "与会员：普浩芸 (III/G396140)，2026年09月01日牵线成功", note: "注：本条记录由系统自动生成", grad: "b" },
  { id: 3, name: "尔尔", code: "G522362", matchmaker: "依依", time: "2026-08-21 11:22:31", content: "放入弃海，原因：测试", grad: "c" },
  { id: 4, name: "出现1|张瑞", code: "B241050", matchmaker: "琴琴", time: "2026-07-03 15:54:17", content: "与会员：7晚梨不吃梨 (G470213/13793519292)，2026年07月03日牵线成功", note: "注：本条记录由系统自动生成", grad: "d" },
  { id: 5, name: "7晚梨不吃梨|王艺如", code: "G470213", matchmaker: "芸希老师", time: "2026-07-03 15:54:17", content: "与会员：出现1 (B241050/13285288888)，2026年07月03日牵线成功", note: "注：本条记录由系统自动生成", grad: "e" },
];

function inRange(text: string, range: Range) {
  if (range === "all" || !text) return true;
  const value = new Date(`${text.slice(0, 10)}T00:00:00`);
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

export default function LoveUserFollowUpPage() {
  const router = useRouter();
  const [range, setRange] = useState<Range>("all");
  const [intent, setIntent] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const counts = useMemo(
    () => ranges.reduce<Record<Range, number>>((all, item) => ({ ...all, [item.key]: rows.filter((row) => inRange(row.time, item.key)).length }), {} as Record<Range, number>),
    [],
  );

  const visibleRows = rows.filter((row) => {
    if (!inRange(row.time, range)) return false;
    if (submittedKeyword && !`${row.name}${row.code}`.includes(submittedKeyword)) return false;
    if (from && row.time.slice(0, 10) < from) return false;
    if (to && row.time.slice(0, 10) > to) return false;
    return true;
  });

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
            onClick={() => setRange(item.key)}
          >
            {item.key === "all" ? (
              <>
                <strong>全部 <i /></strong>
                <span>{item.label}</span>
              </>
            ) : (
              <>
                <strong>{counts[item.key]} <small>条</small></strong>
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
            <select aria-label="客户意向" value={intent} onChange={(event) => setIntent(event.target.value)}>
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
              onKeyDown={(event) => { if (event.key === "Enter") setSubmittedKeyword(keyword.trim()); }}
              placeholder="输入会员昵称/姓名/编号"
            />
            <button type="button" onClick={() => setSubmittedKeyword(keyword.trim())}>搜索</button>
          </div>
          <label className="date-range-picker member-followup-date">
            <span className="dr-field">
              {!from && <span className="dr-placeholder">开始日期</span>}
              <input aria-label="开始日期" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
            </span>
            <span aria-hidden className="dr-arrow">→</span>
            <span className="dr-field">
              {!to && <span className="dr-placeholder">结束日期</span>}
              <input aria-label="结束日期" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
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
              {visibleRows.length === 0 ? (
                <tr><td colSpan={5} className="member-followup-empty">暂无数据</td></tr>
              ) : visibleRows.map((row) => (
                <tr key={row.id}>
                  <td className="member-followup-member">
                    <div className="member-followup-member-cell">
                      <span className={`member-followup-avatar member-followup-avatar-${row.grad}`} />
                      <div>
                        <b>{row.name}</b>
                        <span>{row.code}</span>
                      </div>
                    </div>
                  </td>
                  <td>{row.matchmaker}</td>
                  <td className="whitespace-nowrap">{row.time}</td>
                  <td className="member-followup-content">
                    <p>{row.content}</p>
                    {row.note && <p className="member-followup-note">{row.note}</p>}
                  </td>
                  <td className="member-followup-actions">
                    <button type="button">查看会员资料</button>
                    <button type="button">查看全部跟进</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="member-followup-pagination">
          <span>共 {visibleRows.length} 条</span>
          <div>
            <button type="button" aria-label="上一页" className="pagination-arrow previous" disabled><i /></button>
            <button type="button" className="pagination-number active">1</button>
            <button type="button" aria-label="下一页" className="pagination-arrow next" disabled><i /></button>
            <label className="member-followup-page-size">
              <select aria-label="每页条数" defaultValue="20">
                <option value="20">20 条/页</option>
                <option value="50">50 条/页</option>
                <option value="100">100 条/页</option>
              </select>
              <i />
            </label>
          </div>
        </footer>
      </section>
    </div>
  );
}
