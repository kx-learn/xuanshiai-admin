"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { MeetingRequestRecord, MeetingRequestReviewStatus, MeetingRequestStatus } from "@/lib/admin-endpoints";

/* ---------- 常量 ---------- */
const PAGE_SIZE = 20;

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "", label: "全部" },
  { key: "pending", label: "待处理" },
  { key: "done", label: "已处理" },
];

const STATUS_LABEL: Record<MeetingRequestStatus, string> = {
  SUBMITTED: "待处理",
  CONTACTED: "已联系",
  ACCEPTED: "已接受",
  DECLINED: "已拒绝",
  CLOSED: "已关闭",
};

/** 状态标记只分「待处理 / 已处理」两类，与列表上的状态分组筛选口径一致 */
const DONE_STATUSES = new Set<MeetingRequestStatus>(["ACCEPTED", "DECLINED", "CLOSED"]);
/** 后端只允许 SUBMITTED / CONTACTED / ACCEPTED 被修改，其余返回 409 */
const EDITABLE_STATUSES = new Set<MeetingRequestStatus>(["SUBMITTED", "CONTACTED", "ACCEPTED"]);

type MatchmakerOption = { id: number; nickname: string | null; phone?: string | null };

const fmt = (value?: string | null) => (value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-");

/** 审核弹层可选的流转动作，按当前状态给出合法去向 */
const REVIEW_ACTIONS: Record<MeetingRequestStatus, MeetingRequestReviewStatus[]> = {
  SUBMITTED: ["CONTACTED", "ACCEPTED", "DECLINED", "CLOSED"],
  CONTACTED: ["ACCEPTED", "DECLINED", "CLOSED"],
  ACCEPTED: ["DECLINED", "CLOSED"],
  DECLINED: [],
  CLOSED: [],
};

const REVIEW_ACTION_LABEL: Record<MeetingRequestReviewStatus, string> = {
  CONTACTED: "标记已联系",
  ACCEPTED: "通过申请",
  DECLINED: "拒绝申请",
  CLOSED: "关闭申请",
};

/** 拒绝 / 关闭必须填写原因（后端 422），且会退还已扣次数 */
const REASON_REQUIRED = new Set<MeetingRequestReviewStatus>(["DECLINED", "CLOSED"]);

function MiniSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      className={`lvi-switch ${on ? "on" : ""}`}
      onClick={onToggle}
      aria-pressed={on}
    >
      <span className="lvi-switch-label">{on ? "开启" : "关闭"}</span>
      <span className="lvi-switch-dot" />
    </button>
  );
}

export default function Page() {
  /* ── 列表状态 ── */
  const [searchBy, setSearchBy] = useState("nick");
  const [keyword, setKeyword] = useState("");
  const [server, setServer] = useState("");
  const [statusGroup, setStatusGroup] = useState("");
  const [exactStatus, setExactStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rows, setRows] = useState<MeetingRequestRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [matchmakers, setMatchmakers] = useState<MatchmakerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  /* ── 审核弹层 ── */
  const [reviewRow, setReviewRow] = useState<MeetingRequestRecord | null>(null);
  const [reviewAction, setReviewAction] = useState<MeetingRequestReviewStatus>("CONTACTED");
  const [reviewReason, setReviewReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── 排期弹层 ── */
  const [addOpen, setAddOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<MeetingRequestRecord | null>(null);
  const [smsOn, setSmsOn] = useState(true);
  const [memberVisible, setMemberVisible] = useState(true);
  const [organizerId, setOrganizerId] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [metStatus, setMetStatus] = useState<"wait" | "met">("wait");

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const result = await adminEndpoints.meetingRequests({
        page: targetPage,
        page_size: PAGE_SIZE,
        status: exactStatus || undefined,
        status_group: statusGroup || undefined,
        search_value: keyword.trim() || undefined,
        matchmaker_id: server || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      });
      setRows(result.items ?? []);
      setTotal(result.total ?? 0);
      setPage(targetPage);
      setSelected([]);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [statusGroup, exactStatus, keyword, server, fromDate, toDate]);

  useEffect(() => { void load(1); }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const options = await adminEndpoints.meetingRequestOptions();
        setMatchmakers(options.matchmakers ?? []);
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

  /* ── 审核 ── */
  const openReview = (row: MeetingRequestRecord) => {
    const actions = REVIEW_ACTIONS[row.status];
    if (actions.length === 0) {
      setMessage(`该申请已是「${STATUS_LABEL[row.status]}」，无法再修改`);
      return;
    }
    setReviewRow(row);
    setReviewAction(actions[0]);
    setReviewReason("");
  };

  const submitReview = async () => {
    if (!reviewRow) return;
    if (REASON_REQUIRED.has(reviewAction) && !reviewReason.trim()) {
      setMessage("拒绝或关闭申请必须填写原因");
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      await adminEndpoints.updateMeetingRequest(reviewRow.id, {
        status: reviewAction,
        reason: reviewReason.trim() || undefined,
      });
      setReviewRow(null);
      await load(safePage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "审核失败");
    } finally {
      setSubmitting(false);
    }
  };

  /** 批量通过：仅对「可修改」的申请生效，其余后端会逐个 409，这里先本地过滤 */
  const approveSelected = async () => {
    const targets = rows.filter((row) => selected.includes(row.id) && EDITABLE_STATUSES.has(row.status));
    if (targets.length === 0) {
      setMessage("所选申请中无可通过的记录（已拒绝/已关闭的申请不可再修改）");
      return;
    }
    setSubmitting(true);
    setMessage("");
    const failed: string[] = [];
    for (const row of targets) {
      try {
        await adminEndpoints.updateMeetingRequest(row.id, { status: "ACCEPTED" });
      } catch (error) {
        failed.push(`#${row.id} ${error instanceof Error ? error.message : "失败"}`);
      }
    }
    setSubmitting(false);
    setSelected([]);
    await load(safePage);
    if (failed.length > 0) setMessage(`部分通过失败：${failed.join("；")}`);
  };

  /* ── 排期 ── */
  const openAdd = (row: MeetingRequestRecord) => {
    if (row.status !== "ACCEPTED") {
      setMessage("只有已接受的约见申请才能安排约会，请先通过审核");
      return;
    }
    setActiveRow(row);
    setOrganizerId(row.matchmaker_id ? String(row.matchmaker_id) : "");
    setLocation("");
    setScheduledAt("");
    setSmsOn(true);
    setMemberVisible(true);
    setMetStatus("wait");
    setAddOpen(true);
  };

  const submitAdd = async () => {
    if (!activeRow) return;
    if (!organizerId) { setMessage("请选择服务红娘"); return; }
    if (!scheduledAt) { setMessage("请选择见面时间"); return; }
    setSubmitting(true);
    setMessage("");
    try {
      const record = await adminEndpoints.scheduleMeeting(activeRow.id, {
        organizer_id: Number(organizerId),
        scheduled_at: scheduledAt.replace("T", " ") + ":00",
        location: location.trim() || "待确定",
        member_visible: memberVisible,
        sms_remind: smsOn,
      });
      // 「已见面」在排期后补一次状态更新，计入成功见面次数
      if (metStatus === "met" && record?.id) {
        await adminEndpoints.updateMeeting(record.id, { status: "COMPLETED" });
      }
      setAddOpen(false);
      await load(safePage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "安排约会失败");
    } finally {
      setSubmitting(false);
    }
  };

  const removeRow = async (row: MeetingRequestRecord) => {
    if (typeof window !== "undefined" && !window.confirm(`确认删除约见申请 #${row.id}？`)) return;
    try {
      await adminEndpoints.meetingRequestDelete(row.id);
      await load(safePage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  };

  const reviewActions = useMemo(() => (reviewRow ? REVIEW_ACTIONS[reviewRow.status] : []), [reviewRow]);

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={getBreadcrumb("会员服务", "约见申请")} />

      <section className="lvi-card">
        {/* 须知 */}
        <div className="lvi-notice">
          <div className="lvi-notice-title">
            <span className="lvi-notice-icon">i</span>
            <span>须知</span>
          </div>
          <p>
            在这里可以看到所有会员在平台上点击“申请安排见面”提交的记录，平台和红娘可以通过这些信息进行精准销售或牵线服务，利用本功能可大大提升将会员引导到线下门店面谈的成功率。
          </p>
          <p>
            处理流程：待处理 → 已联系 → 已接受 → 安排约会；拒绝或关闭申请时必须填写原因，系统会退还该会员已扣的牵线次数。
          </p>
        </div>

        {/* 卡片头 */}
        <div className="lvi-head">
          <h2 className="lvi-title">约见申请</h2>
          <div className="lvi-subtabs" style={{ border: 0, margin: 0 }}>
            {STATUS_TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={"lvi-subtab" + (statusGroup === item.key ? " active" : "")}
                onClick={() => { setStatusGroup(item.key); setExactStatus(""); }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 筛选 */}
        <div className="lvi-filters">
          <label className="lvi-select">
            <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
              <option value="nick">按提交人昵称搜</option>
              <option value="code">按编号搜</option>
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
          <input
            type="text"
            className="lvi-search-input"
            placeholder="请输入"
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
              <option value="">服务红娘：不限</option>
              {matchmakers.map((item) => (
                <option key={item.id} value={item.id}>{item.nickname || `红娘 #${item.id}`}</option>
              ))}
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
          <label className="lvi-select">
            <select value={exactStatus} onChange={(e) => { setExactStatus(e.target.value); setStatusGroup(""); }}>
              <option value="">精确状态：不限</option>
              {(Object.keys(STATUS_LABEL) as MeetingRequestStatus[]).map((key) => (
                <option key={key} value={key}>{STATUS_LABEL[key]}</option>
              ))}
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
        </div>

        {/* 表格 */}
        <div className="lvi-table-wrap">
          <table className="lvi-table">
            <colgroup>
              <col style={{ width: 44 }} />
              <col style={{ width: 60 }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 200 }} />
            </colgroup>
            <thead>
              <tr>
                <th>
                  <input type="checkbox" aria-label="全选本页" checked={allChecked} onChange={toggleAll} />
                </th>
                <th>ID</th>
                <th>提交人</th>
                <th>想问约</th>
                <th>提交时间</th>
                <th>红娘</th>
                <th>状态标记</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="lvi-td-id" style={{ textAlign: "center" }}>
                    {loading ? "加载中…" : "暂无数据"}
                  </td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`选择申请 ${row.id}`}
                      checked={selected.includes(row.id)}
                      onChange={() => toggleOne(row.id)}
                    />
                  </td>
                  <td className="lvi-td-id">{row.id}</td>
                  <td className="lvi-person">
                    {row.user_nickname || `用户${row.user_id}`}
                    <span>（编号：{row.user_member_code || row.user_id}）</span>
                  </td>
                  <td className="lvi-person">
                    {row.target_nickname || `用户${row.target_user_id}`}
                    <span>（编号：{row.target_member_code || row.target_user_id}）</span>
                  </td>
                  <td className="lvi-time">{fmt(row.created_at)}</td>
                  <td className="lvi-matchmaker">{row.matchmaker_name || ""}</td>
                  <td>
                    <span className={`lvi-status ${DONE_STATUSES.has(row.status) ? "done" : "pending"}`}>
                      {STATUS_LABEL[row.status] ?? row.status}
                    </span>
                  </td>
                  <td>
                    <div className="lvi-actions">
                      <button type="button" className="lvi-link" onClick={() => openReview(row)}>
                        处理申请
                      </button>
                      <button type="button" className="lvi-link" onClick={() => openAdd(row)}>
                        安排约会
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
          <button type="button" className="lvi-btn primary" disabled={submitting} onClick={() => void approveSelected()}>
            批量通过
          </button>
          <button type="button" className="lvi-btn" onClick={() => setSelected([])}>
            取消选择
          </button>
        </div>
      )}

      {/* Drawer：处理申请 */}
      {reviewRow && (
        <>
          <div className="lvi-mask" onClick={() => setReviewRow(null)} />
          <aside className="lvi-panel" role="dialog" aria-modal="true" aria-label="处理约见申请">
            <header className="lvi-panel-head">
              <h2>处理约见申请</h2>
              <div className="lvi-panel-actions">
                <button type="button" className="lvi-panel-close plain" onClick={() => setReviewRow(null)}>
                  关闭
                </button>
                <button type="button" className="lvi-panel-submit" disabled={submitting} onClick={() => void submitReview()}>
                  {submitting ? "提交中…" : "确定提交"}
                </button>
              </div>
            </header>
            <div className="lvi-panel-body">
              <div className="lvi-field">
                <span className="lvi-field-label">申请单号</span>
                <div className="lvi-field-control">
                  <span className="lvi-static">#{reviewRow.id}</span>
                  <span className="lvi-side-hint">
                    当前状态：{STATUS_LABEL[reviewRow.status] ?? reviewRow.status}
                  </span>
                </div>
              </div>
              <div className="lvi-field">
                <span className="lvi-field-label">提交人</span>
                <div className="lvi-field-control">
                  <div className="lvi-tag-input">
                    <span className="lvi-tag">
                      {reviewRow.user_nickname || `用户${reviewRow.user_id}`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="lvi-field">
                <span className="lvi-field-label">想问约</span>
                <div className="lvi-field-control">
                  <div className="lvi-tag-input">
                    <span className="lvi-tag">
                      {reviewRow.target_nickname || `用户${reviewRow.target_user_id}`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">
                  <b className="req">*</b>处理结果
                </span>
                <div className="lvi-field-control column">
                  <label className="lvi-select block">
                    <select
                      value={reviewAction}
                      onChange={(e) => setReviewAction(e.target.value as MeetingRequestReviewStatus)}
                    >
                      {reviewActions.map((action) => (
                        <option key={action} value={action}>{REVIEW_ACTION_LABEL[action]}</option>
                      ))}
                    </select>
                    <ChevronDown className="lvi-caret" />
                  </label>
                  {reviewAction === "ACCEPTED" && (
                    <div className="lvi-inline-notice">
                      <span className="lvi-inline-icon">i</span>
                      <span>通过后需再点“安排约会”才会生成约会记录</span>
                    </div>
                  )}
                  {REASON_REQUIRED.has(reviewAction) && (
                    <div className="lvi-inline-notice">
                      <span className="lvi-inline-icon">i</span>
                      <span>拒绝或关闭申请必须填写原因，提交后将退还该会员已扣次数</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="lvi-field top">
                <span className="lvi-field-label">
                  {REASON_REQUIRED.has(reviewAction) ? <b className="req">*</b> : null}
                  处理原因
                </span>
                <div className="lvi-field-control">
                  <input
                    className="lvi-input"
                    placeholder={REASON_REQUIRED.has(reviewAction) ? "请填写拒绝/关闭原因（必填）" : "选填"}
                    value={reviewReason}
                    onChange={(e) => setReviewReason(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Drawer：安排约会 */}
      {addOpen && activeRow && (
        <>
          <div className="lvi-mask" onClick={() => setAddOpen(false)} />
          <aside className="lvi-panel" role="dialog" aria-modal="true" aria-label="安排约会">
            <header className="lvi-panel-head">
              <h2>安排约会</h2>
              <div className="lvi-panel-actions">
                <button type="button" className="lvi-panel-close" onClick={() => setAddOpen(false)}>
                  关闭
                </button>
              </div>
            </header>
            <div className="lvi-panel-body">
              <div className="lvi-field">
                <span className="lvi-field-label">
                  <b className="req">*</b>男方
                </span>
                <div className="lvi-field-control">
                  <div className="lvi-tag-input">
                    <span className="lvi-tag">
                      {activeRow.user_nickname || `用户${activeRow.user_id}`}
                      <button type="button" className="lvi-tag-x" aria-label="移除" onClick={() => setActiveRow(null)}>
                        <X size={12} />
                      </button>
                    </span>
                  </div>
                </div>
              </div>
              <div className="lvi-field">
                <span className="lvi-field-label">
                  <b className="req">*</b>女方
                </span>
                <div className="lvi-field-control">
                  <div className="lvi-tag-input">
                    <span className="lvi-tag">
                      {activeRow.target_nickname || `用户${activeRow.target_user_id}`}
                      <button type="button" className="lvi-tag-x" aria-label="移除" onClick={() => setActiveRow(null)}>
                        <X size={12} />
                      </button>
                    </span>
                  </div>
                </div>
              </div>

              <div className="lvi-drawer-notice">
                <span className="lvi-drawer-notice-icon">i</span>
                <span>请仔细核对账号姓名，一经提交，无法修改和删除。</span>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">
                  <b className="req">*</b>见面地点
                </span>
                <div className="lvi-field-control">
                  <input className="lvi-input" placeholder="示例：XXX咖啡馆" value={location} onChange={(e) => setLocation(e.target.value)} />
                  <span className="lvi-side-hint">留空则显示为：待确定</span>
                </div>
              </div>
              <div className="lvi-field">
                <span className="lvi-field-label">
                  <b className="req">*</b>见面时间
                </span>
                <div className="lvi-field-control">
                  <label className="lvi-date block">
                    <input type="datetime-local" aria-label="见面时间" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
                    <CalendarDays size={14} />
                  </label>
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
                      当设置为“隐藏”的时候，在客户的“会员中心-我的约会”中将不显示本条约会记录（不影响次数统计）
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

              <div className="lvi-field">
                <span className="lvi-field-label">见面状态</span>
                <div className="lvi-field-control column">
                  <label className="lvi-select block">
                    <select value={metStatus} onChange={(e) => setMetStatus(e.target.value as "wait" | "met")}>
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

            <footer className="lvi-panel-foot">
              <button type="button" className="lvi-panel-submit" disabled={submitting} onClick={() => void submitAdd()}>
                {submitting ? "提交中…" : "确定提交"}
              </button>
            </footer>
          </aside>
        </>
      )}
    </div>
  );
}
