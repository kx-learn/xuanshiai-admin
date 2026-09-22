"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ChevronDown, Inbox, Plus, X } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { MeetingRecordItem, MeetingRecordStatus, MeetingStatistics } from "@/lib/admin-endpoints";

/* ---------- 常量 ---------- */
const PAGE_SIZE = 20;

const RECORD_STATUS_LABEL: Record<MeetingRecordStatus, string> = {
  SCHEDULED: "待见面",
  REMINDED: "已提醒",
  CHECKED_IN: "已见面",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  NO_SHOW: "未见面",
};
const ALL_STATUSES = Object.keys(RECORD_STATUS_LABEL) as MeetingRecordStatus[];
/** 计入「成功见面」的状态 */
const MET_STATUSES = new Set<MeetingRecordStatus>(["CHECKED_IN", "COMPLETED"]);
/** 允许被 admin 修改的状态（后端无强约束，但已终态的不建议再动） */
const TERMINAL_STATUSES = new Set<MeetingRecordStatus>(["COMPLETED", "CANCELLED", "NO_SHOW"]);
/** 取消/未见面这类需要说明原因 */
const CANCEL_STATUSES = new Set<MeetingRecordStatus>(["CANCELLED", "NO_SHOW"]);

type Candidate = { id: number; nickname: string | null; phone: string | null; gender?: string | null };
type MatchmakerOption = { id: number; nickname: string | null; phone?: string | null };

const fmt = (value?: string | null) => (value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-");

function MiniSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" className={`lvi-switch ${on ? "on" : ""}`} onClick={onToggle} aria-pressed={on}>
      <span className="lvi-switch-label">{on ? "开启" : "关闭"}</span>
      <span className="lvi-switch-dot" />
    </button>
  );
}

export default function Page() {
  /* ── 筛选与列表 ── */
  const [keyword, setKeyword] = useState("");
  const [server, setServer] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [metFilter, setMetFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rows, setRows] = useState<MeetingRecordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<MeetingStatistics>({
    total_arranged: 0, total_met: 0, month_arranged: 0, month_waiting: 0, month_met: 0, month_not_met: 0,
  });
  const [matchmakers, setMatchmakers] = useState<MatchmakerOption[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  /* ── 添加约会 ── */
  const [addOpen, setAddOpen] = useState(false);
  const [smsOn, setSmsOn] = useState(true);
  const [memberVisible, setMemberVisible] = useState(true);
  const [maleQuery, setMaleQuery] = useState("");
  const [femaleQuery, setFemaleQuery] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [met, setMet] = useState(false);

  /* ── 更新状态 ── */
  const [editRow, setEditRow] = useState<MeetingRecordItem | null>(null);
  const [editStatus, setEditStatus] = useState<MeetingRecordStatus>("SCHEDULED");
  const [editCancelReason, setEditCancelReason] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [editLocation, setEditLocation] = useState("");

  /* ── 反馈查看 ── */
  const [feedbackRow, setFeedbackRow] = useState<MeetingRecordItem | null>(null);
  const [feedback, setFeedback] = useState<Record<string, unknown>[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const [result, summary] = await Promise.all([
        adminEndpoints.meetings({
          page: targetPage,
          page_size: PAGE_SIZE,
          search: keyword.trim() || undefined,
          organizer_id: server || undefined,
          status: statusFilter || undefined,
          met: metFilter || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        }),
        adminEndpoints.meetingStatistics().catch(() => null),
      ]);
      setRows(result.items ?? []);
      setTotal(result.total ?? 0);
      setPage(targetPage);
      setSelected([]);
      if (summary) setStats(summary);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [keyword, server, statusFilter, metFilter, fromDate, toDate]);

  useEffect(() => { void load(1); }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const options = await adminEndpoints.meetingRequestOptions();
        setMatchmakers(options.matchmakers ?? []);
        setCandidates(options.candidates ?? []);
      } catch {
        /* 下拉字典失败不阻断主列表 */
      }
    })();
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const allChecked = rows.length > 0 && rows.every((row) => selected.includes(row.id));
  const toggleAll = () => setSelected(allChecked ? [] : rows.map((row) => row.id));
  const toggleOne = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  const statCards = [
    { value: stats.total_arranged, unit: "人", label: "总安排见面", color: "#3658f7" },
    { value: stats.total_met, unit: "人", label: "总成功见面", color: "#52c41a" },
    { value: stats.month_arranged, unit: "人", label: "本月已安排", color: "#13c2c2" },
    { value: stats.month_waiting, unit: "人", label: "本月待见面", color: "#722ed1" },
    { value: stats.month_met, unit: "人", label: "本月已见面", color: "#fa8c16" },
    { value: stats.month_not_met, unit: "人", label: "本月未见面", color: "#ff4d4f" },
  ];

  /** 昵称/手机/编号 -> 会员ID */
  const resolveMember = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return null;
    const matched = candidates.find((item) =>
      (item.nickname ?? "") === trimmed || (item.phone ?? "") === trimmed || String(item.id) === trimmed);
    return matched?.id ?? null;
  };

  const submitAdd = async () => {
    const fromId = resolveMember(maleQuery);
    const toId = resolveMember(femaleQuery);
    if (!fromId || !toId) { setMessage("请从下拉提示中选择有效的男方与女方会员"); return; }
    if (!organizerId) { setMessage("请选择服务红娘"); return; }
    setSubmitting(true);
    setMessage("");
    try {
      await adminEndpoints.createMeetingDirect({
        from_user_id: fromId,
        to_user_id: toId,
        organizer_id: Number(organizerId),
        scheduled_at: scheduledAt ? `${scheduledAt.replace("T", " ")}:00` : undefined,
        location: location.trim() || undefined,
        member_visible: memberVisible,
        sms_remind: smsOn,
        met,
      });
      setAddOpen(false);
      setMaleQuery(""); setFemaleQuery(""); setOrganizerId("");
      setLocation(""); setScheduledAt(""); setMet(false);
      await load(1);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "添加约会失败");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── 更新约会状态 ── */
  const openEdit = (row: MeetingRecordItem) => {
    setEditRow(row);
    setEditStatus(row.status);
    setEditCancelReason(row.cancel_reason ?? "");
    setEditScheduledAt(row.scheduled_at ? row.scheduled_at.slice(0, 16).replace(" ", "T") : "");
    setEditLocation(row.location ?? "");
  };

  const submitEdit = async () => {
    if (!editRow) return;
    if (CANCEL_STATUSES.has(editStatus) && !editCancelReason.trim()) {
      setMessage("取消或标记未见面时必须填写原因");
      return;
    }
    const body: {
      status?: MeetingRecordStatus;
      cancel_reason?: string;
      scheduled_at?: string;
      location?: string;
    } = {};
    if (editStatus !== editRow.status) body.status = editStatus;
    if (editCancelReason.trim() !== (editRow.cancel_reason ?? "")) body.cancel_reason = editCancelReason.trim();
    if (editScheduledAt && editScheduledAt !== (editRow.scheduled_at ?? "").slice(0, 16).replace(" ", "T")) {
      body.scheduled_at = `${editScheduledAt.replace("T", " ")}:00`;
    }
    if (editLocation.trim() && editLocation.trim() !== (editRow.location ?? "")) body.location = editLocation.trim();
    if (Object.keys(body).length === 0) { setMessage("没有需要更新的内容"); return; }
    setSubmitting(true);
    setMessage("");
    try {
      await adminEndpoints.updateMeeting(editRow.id, body);
      setEditRow(null);
      await load(safePage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新失败");
    } finally {
      setSubmitting(false);
    }
  };

  /** 批量设为已完成（计入成功见面） */
  const completeSelected = async () => {
    const targets = rows.filter((row) => selected.includes(row.id) && !TERMINAL_STATUSES.has(row.status));
    if (targets.length === 0) {
      setMessage("所选记录中无可标记完成的约会");
      return;
    }
    setSubmitting(true);
    setMessage("");
    const failed: string[] = [];
    for (const row of targets) {
      try {
        await adminEndpoints.updateMeeting(row.id, { status: "COMPLETED" });
      } catch (error) {
        failed.push(`#${row.id} ${error instanceof Error ? error.message : "失败"}`);
      }
    }
    setSubmitting(false);
    setSelected([]);
    await load(safePage);
    if (failed.length > 0) setMessage(`部分更新失败：${failed.join("；")}`);
  };

  const removeRow = async (row: MeetingRecordItem) => {
    if (typeof window !== "undefined" && !window.confirm(`确认删除约会记录 #${row.id}？`)) return;
    try {
      await adminEndpoints.meetingDelete(row.id);
      await load(safePage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  };

  const openFeedback = async (row: MeetingRecordItem) => {
    setFeedbackRow(row);
    setFeedbackLoading(true);
    setFeedback([]);
    try {
      const list = await adminEndpoints.meetingFeedback(row.id);
      setFeedback(Array.isArray(list) ? list : []);
    } catch {
      setFeedback([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={getBreadcrumb("会员服务", "约会管理")} />

      <section className="lvi-card">
        {/* 卡片头 */}
        <div className="lvi-head">
          <h2 className="lvi-title">约会管理</h2>
          <button type="button" className="lvi-btn primary" onClick={() => setAddOpen(true)}>
            <Plus size={14} />
            添加约会
          </button>
        </div>

        {/* 须知 */}
        <div className="lvi-notice">
          <div className="lvi-notice-title">
            <span className="lvi-notice-icon">i</span>
            <span>须知</span>
          </div>
          <p>
            约会管理是集推介下门店VIP会员信息管理、约会安排、服务记录、查询、约会提醒、约会反馈等功能一体的智能办公系统，能够大大提升推介门店线下服务的规范性、效率性；有效改进用户体验感，提升服务专业度。
          </p>
          <p>
            红娘可以在这里对每次的线下约见服务进行录入，让每次服务都清晰可查，并可以根据时间发送短信提醒：签约的双方。
            会员在自己的“会员中心-我的约会”中可以看到自己每次约见服务记录，并可以对每次约会的情况进行反馈，对约会对的对方进行打分、反馈维系交往的意愿，也可以对红娘的服务进行打分评价。
          </p>
          <p>会员的所有反馈仅红娘可见，不对外展示。</p>
        </div>

        {/* 统计卡 */}
        <div className="lap-stats">
          {statCards.map((s) => (
            <div className="lap-stat" key={s.label}>
              <span className="lap-stat-bar" style={{ background: s.color }} />
              <div className="lap-stat-value">
                {s.value}
                <em>{s.unit}</em>
              </div>
              <div className="lap-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* 筛选 */}
        <div className="lvi-filters">
          <input
            type="text"
            className="lvi-search-input wide"
            placeholder="请输入昵称/编号/手机/姓名"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") void load(1); }}
          />
          <button type="button" className="lvi-btn primary" onClick={() => void load(1)}>
            搜索
          </button>
          <div className="lvi-daterange">
            <label className="lvi-date">
              <input type="date" aria-label="开始日期" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <CalendarDays size={14} />
            </label>
            <span className="lvi-arrow">→</span>
            <label className="lvi-date">
              <input type="date" aria-label="结束日期" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              <CalendarDays size={14} />
            </label>
          </div>
          <label className="lvi-select">
            <select value={server} onChange={(e) => setServer(e.target.value)}>
              <option value="">全部服务红娘</option>
              {matchmakers.map((item) => (
                <option key={item.id} value={item.id}>{item.nickname || `红娘 #${item.id}`}</option>
              ))}
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
          <label className="lvi-select">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setMetFilter(""); }}>
              <option value="">全部约会状态</option>
              {ALL_STATUSES.map((key) => (
                <option key={key} value={key}>{RECORD_STATUS_LABEL[key]}</option>
              ))}
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
          <label className="lvi-select">
            <select value={metFilter} onChange={(e) => { setMetFilter(e.target.value); setStatusFilter(""); }}>
              <option value="">全部见面状态</option>
              <option value="wait">待见面</option>
              <option value="met">已见面</option>
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
        </div>

        {/* 表格 */}
        <div className="lvi-table-wrap">
          <table className="lvi-table lap-table">
            <colgroup>
              <col style={{ width: 44 }} />
              <col style={{ width: 70 }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: 90 }} />
              <col style={{ width: "auto" }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 190 }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" aria-label="全选本页" checked={allChecked} onChange={toggleAll} />
                </th>
                <th>单号</th>
                <th>男方</th>
                <th>女方</th>
                <th>会员端</th>
                <th>约见详情</th>
                <th>本次约见服务红娘</th>
                <th>状态</th>
                <th>会员反馈</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`选择约会 ${row.id}`}
                      checked={selected.includes(row.id)}
                      onChange={() => toggleOne(row.id)}
                    />
                  </td>
                  <td className="lvi-td-id">{row.id}</td>
                  <td className="lvi-person">{row.from_nickname || (row.from_user_id ? `用户${row.from_user_id}` : "-")}</td>
                  <td className="lvi-person">{row.to_nickname || (row.to_user_id ? `用户${row.to_user_id}` : "-")}</td>
                  <td>{row.member_visible ? "显示" : "隐藏"}</td>
                  <td>{`${fmt(row.scheduled_at)} · ${row.location || "待确定"}`}</td>
                  <td className="lvi-matchmaker">{row.organizer_name || `红娘 #${row.organizer_id}`}</td>
                  <td>
                    <span className={`lvi-status ${MET_STATUSES.has(row.status) ? "done" : "pending"}`}>
                      {RECORD_STATUS_LABEL[row.status] ?? row.status}
                    </span>
                    {row.cancel_reason ? <span className="lvi-cancel-reason">{row.cancel_reason}</span> : null}
                  </td>
                  <td>
                    {row.feedback_count > 0 ? (
                      <button type="button" className="lvi-link" onClick={() => void openFeedback(row)}>
                        {row.feedback_count} 条
                      </button>
                    ) : "-"}
                  </td>
                  <td>
                    <div className="lvi-actions">
                      <button type="button" className="lvi-link" onClick={() => openEdit(row)}>
                        更新状态
                      </button>
                      <button type="button" className="lvi-link" onClick={() => void removeRow(row)}>
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="lap-empty">
              <Inbox className="lap-empty-icon" />
              <span>{loading ? "加载中…" : "暂无数据"}</span>
            </div>
          )}
        </div>

        {/* 分页 */}
        {rows.length > 0 && (
          <div className="lvi-pager">
            <span className="lvi-pager-total">共 {total} 条</span>
            <button
              type="button"
              className="au-page-btn"
              disabled={safePage <= 1 || loading}
              onClick={() => void load(Math.max(1, safePage - 1))}
            >
              <i className="au-chevron left" />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === pageCount || Math.abs(n - safePage) <= 1)
              .map((n, i, arr) => (
                <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {i > 0 && arr[i - 1] !== n - 1 && <span className="lvi-pager-total">…</span>}
                  <button
                    type="button"
                    className={"au-page-num" + (n === safePage ? " active" : "")}
                    onClick={() => void load(n)}
                  >
                    {n}
                  </button>
                </span>
              ))}
            <button
              type="button"
              className="au-page-btn"
              disabled={safePage >= pageCount || loading}
              onClick={() => void load(Math.min(pageCount, safePage + 1))}
            >
              <i className="au-chevron right" />
            </button>
          </div>
        )}

        {message && <p className="lvi-side-hint" style={{ color: "#ff4d4f" }}>{message}</p>}
      </section>

      {/* 批量操作条 */}
      {selected.length > 0 && (
        <div className="lvi-bulkbar">
          <span className="lvi-bulkbar-count">已选 {selected.length} 项</span>
          <button type="button" className="lvi-btn primary" disabled={submitting} onClick={() => void completeSelected()}>
            批量标记已完成
          </button>
          <button type="button" className="lvi-btn" onClick={() => setSelected([])}>
            取消选择
          </button>
        </div>
      )}

      {/* Drawer：更新约会状态 */}
      {editRow && (
        <>
          <div className="lvi-mask" onClick={() => setEditRow(null)} />
          <aside className="lvi-panel" role="dialog" aria-modal="true" aria-label="更新约会状态">
            <header className="lvi-panel-head">
              <h2>更新约会状态</h2>
              <div className="lvi-panel-actions">
                <button type="button" className="lvi-panel-close plain" onClick={() => setEditRow(null)}>
                  关闭
                </button>
                <button type="button" className="lvi-panel-submit" disabled={submitting} onClick={() => void submitEdit()}>
                  {submitting ? "提交中…" : "确定提交"}
                </button>
              </div>
            </header>
            <div className="lvi-panel-body">
              <div className="lvi-field">
                <span className="lvi-field-label">约会单号</span>
                <div className="lvi-field-control">
                  <span className="lvi-static">#{editRow.id}</span>
                  <span className="lvi-side-hint">当前状态：{RECORD_STATUS_LABEL[editRow.status] ?? editRow.status}</span>
                </div>
              </div>
              <div className="lvi-field">
                <span className="lvi-field-label">约会双方</span>
                <div className="lvi-field-control">
                  <div className="lvi-tag-input">
                    <span className="lvi-tag">{editRow.from_nickname || `用户${editRow.from_user_id ?? "-"}`}</span>
                    <span className="lvi-tag">{editRow.to_nickname || `用户${editRow.to_user_id ?? "-"}`}</span>
                  </div>
                </div>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">
                  <b className="req">*</b>约会状态
                </span>
                <div className="lvi-field-control column">
                  <label className="lvi-select block">
                    <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as MeetingRecordStatus)}>
                      {ALL_STATUSES.map((key) => (
                        <option key={key} value={key}>{RECORD_STATUS_LABEL[key]}</option>
                      ))}
                    </select>
                    <ChevronDown className="lvi-caret" />
                  </label>
                  {MET_STATUSES.has(editStatus) && (
                    <div className="lvi-inline-notice">
                      <span className="lvi-inline-icon">i</span>
                      <span>设为“已见面/已完成”后会计入服务“成功”次数，会员可提交反馈</span>
                    </div>
                  )}
                  {CANCEL_STATUSES.has(editStatus) && (
                    <div className="lvi-inline-notice">
                      <span className="lvi-inline-icon">i</span>
                      <span>取消或标记未见面时必须填写原因</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">
                  {CANCEL_STATUSES.has(editStatus) ? <b className="req">*</b> : null}
                  取消/未见面原因
                </span>
                <div className="lvi-field-control">
                  <input
                    className="lvi-input"
                    placeholder={CANCEL_STATUSES.has(editStatus) ? "请填写原因（必填）" : "选填"}
                    value={editCancelReason}
                    onChange={(e) => setEditCancelReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">见面时间</span>
                <div className="lvi-field-control">
                  <label className="lvi-date block">
                    <input
                      type="datetime-local"
                      aria-label="见面时间"
                      value={editScheduledAt}
                      onChange={(e) => setEditScheduledAt(e.target.value)}
                    />
                    <CalendarDays size={14} />
                  </label>
                </div>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">见面地点</span>
                <div className="lvi-field-control">
                  <input
                    className="lvi-input"
                    placeholder="示例：XXX咖啡馆"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Drawer：会员反馈 */}
      {feedbackRow && (
        <>
          <div className="lvi-mask" onClick={() => setFeedbackRow(null)} />
          <aside className="lvi-panel" role="dialog" aria-modal="true" aria-label="会员反馈">
            <header className="lvi-panel-head">
              <h2>会员反馈</h2>
              <div className="lvi-panel-actions">
                <button type="button" className="lvi-panel-close" onClick={() => setFeedbackRow(null)}>
                  关闭
                </button>
              </div>
            </header>
            <div className="lvi-panel-body">
              <p className="lvi-side-hint" style={{ whiteSpace: "normal" }}>
                约会 #{feedbackRow.id} · {feedbackRow.from_nickname || "-"} 与 {feedbackRow.to_nickname || "-"}
              </p>
              {feedbackLoading ? (
                <p className="lvi-side-hint">加载中…</p>
              ) : feedback.length === 0 ? (
                <div className="lap-empty">
                  <Inbox className="lap-empty-icon" />
                  <span>暂无反馈</span>
                </div>
              ) : (
                feedback.map((item, index) => (
                  <div className="lvi-feedback-item" key={String(item.id ?? index)}>
                    {Object.entries(item).map(([key, value]) => (
                      <div className="lvi-feedback-row" key={key}>
                        <span className="lvi-feedback-key">{key}</span>
                        <span className="lvi-feedback-val">{value === null || value === undefined || value === "" ? "-" : String(value)}</span>
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}

      {/* Drawer：添加约会 */}
      {addOpen && (
        <>
          <div className="lvi-mask" onClick={() => setAddOpen(false)} />
          <aside className="lvi-panel" role="dialog" aria-modal="true" aria-label="添加约会">
            <header className="lvi-panel-head">
              <h2>添加约会</h2>
              <div className="lvi-panel-actions">
                <button type="button" className="lvi-panel-close plain" onClick={() => setAddOpen(false)}>
                  关闭
                </button>
                <button type="button" className="lvi-panel-submit" disabled={submitting} onClick={() => void submitAdd()}>
                  {submitting ? "提交中…" : "确定提交"}
                </button>
              </div>
            </header>
            <div className="lvi-panel-body">
              <div className="lvi-field">
                <span className="lvi-field-label">
                  <b className="req">*</b>男方
                </span>
                <div className="lvi-field-control">
                  <input
                    className="lvi-input"
                    list="lap-male-candidates"
                    placeholder="请输入昵称/编号/手机"
                    value={maleQuery}
                    onChange={(e) => setMaleQuery(e.target.value)}
                  />
                  <datalist id="lap-male-candidates">
                    {candidates.map((item) => (
                      <option key={item.id} value={item.nickname ?? `用户${item.id}`} label={`编号：${item.id}${item.phone ? ` / ${item.phone}` : ""}`} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="lvi-field">
                <span className="lvi-field-label">
                  <b className="req">*</b>女方
                </span>
                <div className="lvi-field-control">
                  <input
                    className="lvi-input"
                    list="lap-female-candidates"
                    placeholder="请输入昵称/编号/手机"
                    value={femaleQuery}
                    onChange={(e) => setFemaleQuery(e.target.value)}
                  />
                  <datalist id="lap-female-candidates">
                    {candidates.map((item) => (
                      <option key={item.id} value={item.nickname ?? `用户${item.id}`} label={`编号：${item.id}${item.phone ? ` / ${item.phone}` : ""}`} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="lvi-drawer-notice">
                <span className="lvi-drawer-notice-icon">i</span>
                <span>请仔细核对账号姓名，一经提交，无法修改和删除。</span>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">见面地点</span>
                <div className="lvi-field-control">
                  <input className="lvi-input" placeholder="示例：XXX咖啡馆" value={location} onChange={(e) => setLocation(e.target.value)} />
                  <span className="lvi-side-hint">留空则显示为：待确定</span>
                </div>
              </div>
              <div className="lvi-field">
                <span className="lvi-field-label">见面时间</span>
                <div className="lvi-field-control">
                  <label className="lvi-date block">
                    <input type="datetime-local" aria-label="见面时间" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                    <CalendarDays size={14} />
                  </label>
                  <span className="lvi-side-hint">留空则显示为：待确定</span>
                </div>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">短信提醒</span>
                <div className="lvi-field-control column">
                  <MiniSwitch on={smsOn} onToggle={() => setSmsOn((v) => !v)} />
                  <div className="lvi-inline-notice">
                    <span className="lvi-inline-icon">i</span>
                    <span>开启后在提交本约见后即给双方发送约会短信提醒</span>
                  </div>
                </div>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">会员端</span>
                <div className="lvi-field-control column">
                  <MiniSwitch on={memberVisible} onToggle={() => setMemberVisible((v) => !v)} />
                  <div className="lvi-inline-notice">
                    <span className="lvi-inline-icon">i</span>
                    <span>
                      当设置为“隐藏”的时候，在客户的“会员中心-我的约会”中则不显示本条约会记录（不影响次数统计）
                    </span>
                  </div>
                </div>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">
                  <b className="req">*</b>服务红娘
                </span>
                <div className="lvi-field-control">
                  <label className="lvi-select block">
                    <select value={organizerId} onChange={(e) => setOrganizerId(e.target.value)}>
                      <option value="">请选择服务红娘</option>
                      {matchmakers.map((item) => (
                        <option key={item.id} value={item.id}>{item.nickname || `红娘 #${item.id}`}</option>
                      ))}
                    </select>
                    <ChevronDown className="lvi-caret" />
                  </label>
                </div>
              </div>

              <div className="lvi-field top">
                <span className="lvi-field-label">
                  <b className="req">*</b>见面状态
                </span>
                <div className="lvi-field-control column">
                  <label className="lvi-select block">
                    <select value={met ? "met" : "wait"} onChange={(e) => setMet(e.target.value === "met")}>
                      <option value="wait">待见面</option>
                      <option value="met">已见面</option>
                    </select>
                    <ChevronDown className="lvi-caret" />
                  </label>
                  <div className="lvi-inline-notice">
                    <span className="lvi-inline-icon">i</span>
                    <span>只有状态设为“已见面”才会计入到服务“成功”的次数中</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
