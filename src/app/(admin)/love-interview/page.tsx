"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";

/* ---------- 类型 ---------- */
type MeetingRequestRow = {
  id: number;
  user_id: number;
  target_user_id: number;
  matchmaker_id: number | null;
  status: "SUBMITTED" | "CONTACTED" | "ACCEPTED" | "DECLINED" | "CLOSED";
  note: string;
  created_at: string;
  user_nickname: string | null;
  user_member_code: string | null;
  target_nickname: string | null;
  target_member_code: string | null;
  matchmaker_name: string | null;
};

type MatchmakerOption = { id: number; nickname: string | null; phone: string | null };

const DONE_STATUSES = new Set(["ACCEPTED", "DECLINED", "CLOSED"]);
const statusLabel = (status: MeetingRequestRow["status"]) => (DONE_STATUSES.has(status) ? "已处理" : "待处理");
const fmt = (value: string) => new Date(value).toLocaleString("zh-CN", { hour12: false });

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
  const [searchBy, setSearchBy] = useState("nick");
  const [keyword, setKeyword] = useState("");
  const [server, setServer] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rows, setRows] = useState<MeetingRequestRow[]>([]);
  const [matchmakers, setMatchmakers] = useState<MatchmakerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [activeRow, setActiveRow] = useState<MeetingRequestRow | null>(null);
  const [smsOn, setSmsOn] = useState(true);
  const [memberVisible, setMemberVisible] = useState(true);
  const [organizerId, setOrganizerId] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [metStatus, setMetStatus] = useState<"wait" | "met">("wait");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = (await adminEndpoints.meetingRequests({
        page: 1,
        page_size: 100,
        status_group: status || undefined,
        search_value: keyword.trim() || undefined,
        matchmaker_id: server || undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      })) as { items: MeetingRequestRow[] };
      setRows(page.items ?? []);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [status, keyword, server, fromDate, toDate]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const options = (await adminEndpoints.meetingRequestOptions()) as { matchmakers?: MatchmakerOption[] };
        setMatchmakers(options.matchmakers ?? []);
      } catch {
        /* 下拉字典失败不阻断主列表 */
      }
    })();
  }, []);

  const openAdd = (row: MeetingRequestRow) => {
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
      const record = (await adminEndpoints.scheduleMeeting(activeRow.id, {
        organizer_id: Number(organizerId),
        scheduled_at: scheduledAt.replace("T", " ") + ":00",
        location: location.trim() || "待确定",
        member_visible: memberVisible,
        sms_remind: smsOn,
      })) as { id: number };
      if (metStatus === "met" && record?.id) {
        await adminEndpoints.updateMeeting(record.id, { status: "COMPLETED" });
      }
      setAddOpen(false);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "添加约会失败");
    } finally {
      setSubmitting(false);
    }
  };

  const removeRow = async (row: MeetingRequestRow) => {
    if (typeof window !== "undefined" && !window.confirm(`确认删除约见申请 #${row.id}？`)) return;
    try {
      await adminEndpoints.meetingRequestDelete(row.id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  };

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
        </div>

        {/* 卡片头 */}
        <div className="lvi-head">
          <h2 className="lvi-title">约见申请</h2>
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
          />
          <button type="button" className="lvi-btn primary" onClick={() => void load()}>
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
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">状态：不限</option>
              <option value="pending">待处理</option>
              <option value="done">已处理</option>
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
        </div>

        {/* 表格 */}
        <div className="lvi-table-wrap">
          <table className="lvi-table">
            <colgroup>
              <col style={{ width: 60 }} />
              <col style={{ width: "24%" }} />
              <col style={{ width: "24%" }} />
              <col style={{ width: 190 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 220 }} />
            </colgroup>
            <thead>
              <tr>
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
                <tr><td colSpan={7} className="lvi-td-id" style={{ textAlign: "center" }}>{loading ? "加载中…" : "暂无数据"}</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
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
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td>
                    <div className="lvi-actions">
                      <button type="button" className="lvi-link" onClick={() => openAdd(row)}>
                        添加约会记录
                      </button>
                      <button type="button" className="lvi-link" onClick={() => void removeRow(row)}>
                        删除记录
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {message && <p className="lvi-side-hint" style={{ color: "#ff4d4f" }}>{message}</p>}
      </section>

      {/* Drawer：添加约会 */}
      {addOpen && activeRow && (
        <>
          <div className="lvi-mask" onClick={() => setAddOpen(false)} />
          <aside className="lvi-panel" role="dialog" aria-modal="true" aria-label="添加约会">
            <header className="lvi-panel-head">
              <h2>添加约会</h2>
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
