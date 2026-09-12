"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronDown, Inbox, Plus } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { MeetingStatistics } from "@/lib/admin-endpoints";

/* ---------- 类型 ---------- */
type MeetingRow = {
  id: number;
  request_id: number;
  organizer_id: number;
  scheduled_at: string;
  location: string;
  status: "SCHEDULED" | "REMINDED" | "CHECKED_IN" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  member_visible: number;
  sms_remind: number;
  from_user_id: number | null;
  from_nickname: string | null;
  to_user_id: number | null;
  to_nickname: string | null;
  organizer_name: string | null;
  feedback_count: number;
};

type Candidate = { id: number; nickname: string | null; phone: string | null; gender: string | null };
type MatchmakerOption = { id: number; nickname: string | null; phone: string | null };

const RECORD_STATUS_LABEL: Record<MeetingRow["status"], string> = {
  SCHEDULED: "待见面",
  REMINDED: "已提醒",
  CHECKED_IN: "已见面",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
  NO_SHOW: "未见面",
};
const MET_STATUSES = new Set(["CHECKED_IN", "COMPLETED"]);
const fmt = (value: string) => (value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-");

function MiniSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button type="button" className={`lvi-switch ${on ? "on" : ""}`} onClick={onToggle} aria-pressed={on}>
      <span className="lvi-switch-label">{on ? "开启" : "关闭"}</span>
      <span className="lvi-switch-dot" />
    </button>
  );
}

export default function Page() {
  const [gender, setGender] = useState("");
  const [keyword, setKeyword] = useState("");
  const [server, setServer] = useState("");
  const [meetStatus, setMeetStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [rows, setRows] = useState<MeetingRow[]>([]);
  const [stats, setStats] = useState<MeetingStatistics>({
    total_arranged: 0, total_met: 0, month_arranged: 0, month_waiting: 0, month_met: 0, month_not_met: 0,
  });
  const [matchmakers, setMatchmakers] = useState<MatchmakerOption[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [smsOn, setSmsOn] = useState(true);
  const [memberVisible, setMemberVisible] = useState(true);
  const [maleQuery, setMaleQuery] = useState("");
  const [femaleQuery, setFemaleQuery] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [location, setLocation] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [met, setMet] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, summary] = await Promise.all([
        adminEndpoints.meetings({
          page: 1,
          page_size: 100,
          search: keyword.trim() || undefined,
          organizer_id: server || undefined,
          met: meetStatus || undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        }) as Promise<{ items: MeetingRow[] }>,
        adminEndpoints.meetingStatistics() as Promise<MeetingStatistics>,
      ]);
      setRows(page.items ?? []);
      setStats(summary);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [keyword, server, meetStatus, fromDate, toDate]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    void (async () => {
      try {
        const options = (await adminEndpoints.meetingRequestOptions()) as {
          matchmakers?: MatchmakerOption[];
          candidates?: Candidate[];
        };
        setMatchmakers(options.matchmakers ?? []);
        setCandidates(options.candidates ?? []);
      } catch {
        /* 下拉字典失败不阻断主列表 */
      }
    })();
  }, []);

  const statCards = useMemo(() => ([
    { value: stats.total_arranged, unit: "人", label: "总安排见面", color: "#3658f7" },
    { value: stats.total_met, unit: "人", label: "总成功见面", color: "#52c41a" },
    { value: stats.month_arranged, unit: "人", label: "本月已安排", color: "#13c2c2" },
    { value: stats.month_waiting, unit: "人", label: "本月待见面", color: "#722ed1" },
    { value: stats.month_met, unit: "人", label: "本月已见面", color: "#fa8c16" },
    { value: stats.month_not_met, unit: "人", label: "本月未见面", color: "#ff4d4f" },
  ]), [stats]);

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
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "添加约会失败");
    } finally {
      setSubmitting(false);
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
          <label className="lvi-select">
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">男方</option>
              <option value="female">女方</option>
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
          <input
            type="text"
            className="lvi-search-input wide"
            placeholder="请输入昵称/编号/手机/姓名"
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
              <option value="">全部服务红娘</option>
              {matchmakers.map((item) => (
                <option key={item.id} value={item.id}>{item.nickname || `红娘 #${item.id}`}</option>
              ))}
            </select>
            <ChevronDown className="lvi-caret" />
          </label>
          <label className="lvi-select">
            <select value={meetStatus} onChange={(e) => setMeetStatus(e.target.value)}>
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
              <col style={{ width: 130 }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: 110 }} />
              <col style={{ width: "auto" }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 140 }} />
            </colgroup>
            <thead>
              <tr>
                <th>单号</th>
                <th>男方</th>
                <th>女方</th>
                <th>会员端</th>
                <th>约见详情</th>
                <th>本次约见服务红娘</th>
                <th>状态</th>
                <th>会员反馈</th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 && rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.from_nickname || (row.from_user_id ? `用户${row.from_user_id}` : "-")}</td>
                  <td>{row.to_nickname || (row.to_user_id ? `用户${row.to_user_id}` : "-")}</td>
                  <td>{row.member_visible ? "显示" : "隐藏"}</td>
                  <td>{`${fmt(row.scheduled_at)} · ${row.location || "待确定"}`}</td>
                  <td>{row.organizer_name || `红娘 #${row.organizer_id}`}</td>
                  <td>{RECORD_STATUS_LABEL[row.status] ?? row.status}</td>
                  <td>{row.feedback_count > 0 ? `${row.feedback_count} 条` : "-"}</td>
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
        {message && <p className="lvi-side-hint" style={{ color: "#ff4d4f" }}>{message}</p>}
      </section>

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
                  <label className="lvi-select combo">
                    <select defaultValue="nick">
                      <option value="nick">按昵称</option>
                      <option value="code">按编号</option>
                    </select>
                    <ChevronDown className="lvi-caret" />
                  </label>
                  <input
                    className="lvi-input"
                    list="lap-male-candidates"
                    placeholder="请输入"
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
                  <label className="lvi-select combo">
                    <select defaultValue="nick">
                      <option value="nick">按昵称</option>
                      <option value="code">按编号</option>
                    </select>
                    <ChevronDown className="lvi-caret" />
                  </label>
                  <input
                    className="lvi-input"
                    list="lap-female-candidates"
                    placeholder="请输入"
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
