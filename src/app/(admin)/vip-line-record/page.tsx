"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Download, Settings } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

/* ---------- 统计（按 match_records 真实聚合） ---------- */
type Stat = { value: number; label: string; bar: string };

/* ---------- 行类型 ---------- */
type LineRow = {
  id: number;
  from_user_id: number;
  to_user_id: number;
  from_nickname: string | null;
  to_nickname: string | null;
  status: number;
  created_at: string;
  responded_at: string | null;
  matchmaker_id: number | null;
};

const STATUS_LABEL: Record<number, string> = {
  0: "待处理",
  1: "成功",
  2: "失败",
  3: "已关闭",
};

const formatTime = (value: string | null) => {
  if (!value) return { date: "-", time: "" };
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
  };
};

/* ---------- 会员单元（保持原 DOM 与类名） ---------- */
function LineMember({
  nick,
  code,
  gender,
  age,
  real,
  promise,
  g,
}: {
  nick: string;
  code: string;
  gender: string;
  age: string;
  real: string;
  promise: boolean;
  g: string;
}) {
  return (
    <div className="vlr-member">
      <span className={`vlr-avatar vlr-g-${g}`}>
        <i className="vlr-age-badge">
          {gender}
          {age}
        </i>
      </span>
      <div className="vlr-member-info">
        <div className="vlr-member-nick">{nick}</div>
        <div className="vlr-member-tags">
          <span className="vlr-tag-real">
            <b className="vlr-tag-check">✓</b>
            {real}
          </span>
          <span className={promise ? "vlr-tag-promise on" : "vlr-tag-promise"}>
            {promise && <b className="vlr-tag-check">✓</b>}
            {promise ? "已签承诺书" : "未签承诺书"}
          </span>
        </div>
        <div className="vlr-member-code">编号：{code}</div>
      </div>
    </div>
  );
}

export default function Page() {
  const [operator, setOperator] = useState("");
  const [server, setServer] = useState("");
  const [searchBy, setSearchBy] = useState("nick");
  const [keyword, setKeyword] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [lineResult, setLineResult] = useState<"success" | "fail">("success");
  const [rows, setRows] = useState<LineRow[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---------- 加载 ---------- */
  const loadData = async () => {
    setLoading(true);
    try {
      const page = await adminEndpoints.matchRecords({ page: 1, page_size: 100 });
      const items = (page as { items: LineRow[] }).items;
      setRows(items);
      const total = items.length;
      const success = items.filter((r) => r.status === 1).length;
      const fail = items.filter((r) => r.status === 2).length;
      const pending = items.filter((r) => r.status === 0).length;
      const closed = items.filter((r) => r.status === 3).length;
      const matchmaking = items.filter((r) => r.matchmaker_id != null).length;
      const next: Stat[] = [
        { value: total, label: "全部牵线", bar: "#3658f7" },
        { value: pending, label: "待牵线", bar: "#fa8c16" },
        { value: matchmaking, label: "牵线中", bar: "#13c2c2" },
        { value: success, label: "牵线成功", bar: "#52c41a" },
        { value: fail, label: "牵线失败", bar: "#ff4d4f" },
        { value: closed, label: "已关闭", bar: "#722ed1" },
      ];
      setStats(next);
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "加载失败", "error");
      setRows([]);
      setStats([
        { value: 0, label: "全部牵线", bar: "#3658f7" },
        { value: 0, label: "待牵线", bar: "#fa8c16" },
        { value: 0, label: "牵线中", bar: "#13c2c2" },
        { value: 0, label: "牵线成功", bar: "#52c41a" },
        { value: 0, label: "牵线失败", bar: "#ff4d4f" },
        { value: 0, label: "已关闭", bar: "#722ed1" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- 抽屉提交 ---------- */
  const handleSubmit = async () => {
    const fromInput = (document.getElementById("vlr-from-input") as HTMLInputElement | null)?.value.trim();
    const toInput = (document.getElementById("vlr-to-input") as HTMLInputElement | null)?.value.trim();
    if (!fromInput || !toInput) {
      showConfigToast("请输入牵线会员与被牵线会员编号", "error");
      return;
    }
    try {
      await adminEndpoints.createMatchRecord({
        from_love_user_id: Number(fromInput),
        to_love_user_id: Number(toInput),
        create_time: new Date().toISOString(),
        complete_time: new Date().toISOString(),
        line_status: lineResult === "success" ? 1 : 2,
      });
      showConfigToast("已提交", "ok");
      setAddOpen(false);
      await loadData();
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "提交失败", "error");
    }
  };

  /* ---------- 模板下载：CSV（前后端都支持，不用 npm 依赖） ---------- */
  const downloadTemplate = () => {
    const csv = "\uFEFF申请会员编号,被牵会员编号,申请时间,完成时间,结果\nG396140,G895945,2026-09-01 14:48:42,2026-09-01 14:48:54,成功";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "红娘牵线导入模板.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={getBreadcrumb("会员服务", "红娘牵线")} />

      <section className="vlr-card">
        <div className="vlr-notice">
          <div className="vlr-notice-title">
            <span className="vlr-notice-icon">i</span>
            <span>须知</span>
          </div>
          <p>
            会员提交牵线申请后可扣除1次牵线服务次数，若牵线状态最终设置为失败，则自动退回该次牵线服务次数；牵线失败必须填写说明原因。
          </p>
          <p>
            红娘收到会员的牵线申请后人工联系双方，促成被牵线方同意交换微信即被视为牵线成功，红娘将双方微信互推，同时在会员资料详情页中申请人可以见到该会员的微信号。若未达成双方自愿交换微信则被视为牵线失败。
          </p>
        </div>

        {/* 统计卡 - 来自 match_records 实时聚合 */}
        <div className="vlr-stats">
          {stats.map((item) => (
            <div className="vlr-stat" key={item.label}>
              <span className="vlr-stat-bar" style={{ background: item.bar }} />
              <div className="vlr-stat-value">{item.value}</div>
              <div className="vlr-stat-label">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="vlr-head">
          <h2 className="vlr-title">红娘牵线</h2>
          <div className="vlr-tools">
            <span className="vlr-auto-tip">超时自动·牵线失败【已开启】</span>
            <button type="button" className="vlr-icon-btn" aria-label="超时自动牵线失败设置">
              <Settings size={16} />
            </button>
            <button type="button" className="vlr-btn primary" onClick={() => setAddOpen(true)}>
              添加牵线记录
            </button>
            <button type="button" className="vlr-btn primary" onClick={downloadTemplate}>
              <Download size={15} />
              下载模板
            </button>
          </div>
        </div>

        <div className="vlr-filters">
          <label className="vlr-select">
            <select value={operator} onChange={(e) => setOperator(e.target.value)}>
              <option value="">全部操作人</option>
            </select>
            <ChevronDown className="vlr-caret" />
          </label>
          <label className="vlr-select">
            <select value={server} onChange={(e) => setServer(e.target.value)}>
              <option value="">全部服务红娘</option>
            </select>
            <ChevronDown className="vlr-caret" />
          </label>
          <div className="vlr-daterange">
            <label className="vlr-date">
              <input type="text" placeholder="开始日期" readOnly />
              <CalendarDays size={14} />
            </label>
            <span className="vlr-arrow">→</span>
            <label className="vlr-date">
              <input type="text" placeholder="结束日期" readOnly />
              <CalendarDays size={14} />
            </label>
          </div>
          <label className="vlr-select">
            <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
              <option value="nick">按申请人昵称搜</option>
              <option value="code">按编号搜</option>
            </select>
            <ChevronDown className="vlr-caret" />
          </label>
          <input
            type="text"
            className="vlr-search-input"
            placeholder="请输入"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="button" className="vlr-btn primary" onClick={() => undefined}>
            搜索
          </button>
        </div>

        <div className="vlr-table-wrap">
          <table className="vlr-table">
            <colgroup>
              <col style={{ width: 56 }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 90 }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>申请牵线人</th>
                <th>牵线对象</th>
                <th>牵线红娘</th>
                <th>支付状态</th>
                <th>牵线状态</th>
                <th>申请时间</th>
                <th>完成时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="h-40 text-center text-sm text-[#999]">
                    加载中...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="h-40 text-center text-sm text-[#999]">
                    暂无数据
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const created = formatTime(row.created_at);
                  const finished = formatTime(row.responded_at);
                  const statusLabel = STATUS_LABEL[row.status] ?? "-";
                  const isSuccess = row.status === 1;
                  const isFail = row.status === 2;
                  return (
                    <tr key={row.id}>
                      <td className="vlr-td-id">{row.id}</td>
                      <td>
                        <LineMember
                          nick={row.from_nickname ?? `#${row.from_user_id}`}
                          code={`U${String(row.from_user_id).padStart(6, "0")}`}
                          gender=""
                          age=""
                          real="已绑定"
                          promise={false}
                          g="a"
                        />
                      </td>
                      <td>
                        <LineMember
                          nick={row.to_nickname ?? `#${row.to_user_id}`}
                          code={`U${String(row.to_user_id).padStart(6, "0")}`}
                          gender=""
                          age=""
                          real="已绑定"
                          promise={false}
                          g="b"
                        />
                      </td>
                      <td className="vlr-matchmaker">{row.matchmaker_id ? `红娘 #${row.matchmaker_id}` : ""}</td>
                      <td>
                        <span className="vlr-pay">已记账</span>
                      </td>
                      <td>
                        {isSuccess ? (
                          <span className="vlr-status success">
                            {statusLabel}
                            <ChevronDown size={13} />
                          </span>
                        ) : isFail ? (
                          <span className="vlr-status fail">
                            {statusLabel}
                            <i className="vlr-status-warn">!</i>
                          </span>
                        ) : (
                          <span className="vlr-status pending">{statusLabel}</span>
                        )}
                      </td>
                      <td className="vlr-time">
                        <span>{created.date}</span>
                        <span>{created.time}</span>
                      </td>
                      <td className="vlr-time">
                        <span>{finished.date}</span>
                        <span>{finished.time}</span>
                      </td>
                      <td>
                        <div className="vlr-operator">
                          <span>后台</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drawer：添加牵线记录（保留原 DOM 与类名） */}
      {addOpen && (
        <>
          <div className="vlr-mask" onClick={() => setAddOpen(false)} />
          <aside className="vlr-panel" role="dialog" aria-modal="true" aria-label="添加牵线记录">
            <header className="vlr-panel-head">
              <h2>添加牵线记录</h2>
              <div className="vlr-panel-actions">
                <button type="button" className="vlr-panel-cancel" onClick={() => setAddOpen(false)}>
                  取消
                </button>
                <button type="button" className="vlr-panel-submit" onClick={handleSubmit}>
                  确定提交
                </button>
              </div>
            </header>
            <div className="vlr-panel-body">
              <div className="vlr-field">
                <span className="vlr-field-label">
                  <b className="req">*</b>牵线会员
                </span>
                <div className="vlr-field-control">
                  <input id="vlr-from-input" className="vlr-input" placeholder="请输入编号/姓名/手机号/昵称" />
                </div>
              </div>
              <div className="vlr-field">
                <span className="vlr-field-label">
                  <b className="req">*</b>被牵线会员
                </span>
                <div className="vlr-field-control">
                  <input id="vlr-to-input" className="vlr-input" placeholder="请输入编号/姓名/手机号/昵称" />
                </div>
              </div>
              <div className="vlr-field">
                <span className="vlr-field-label">
                  <b className="req">*</b>牵线申请时间
                </span>
                <div className="vlr-field-control">
                  <label className="vlr-date block">
                    <input type="text" placeholder="请选择牵线申请时间" readOnly />
                    <CalendarDays size={14} />
                  </label>
                </div>
              </div>
              <div className="vlr-field">
                <span className="vlr-field-label">
                  <b className="req">*</b>牵线完成时间
                </span>
                <div className="vlr-field-control">
                  <label className="vlr-date block">
                    <input type="text" placeholder="请选择牵线完成时间" readOnly />
                    <CalendarDays size={14} />
                  </label>
                </div>
              </div>
              <div className="vlr-field top">
                <span className="vlr-field-label">
                  <b className="req">*</b>牵线结果
                </span>
                <div className="vlr-field-control">
                  <div className="vlr-radio-group">
                    <label className="vlr-radio">
                      <input
                        type="radio"
                        name="vlr-result"
                        checked={lineResult === "success"}
                        onChange={() => setLineResult("success")}
                      />
                      <span>牵线成功（从牵线会员的账号中扣除1次牵线次数）</span>
                    </label>
                    <label className="vlr-radio">
                      <input
                        type="radio"
                        name="vlr-result"
                        checked={lineResult === "fail"}
                        onChange={() => setLineResult("fail")}
                      />
                      <span>牵线失败（不扣除牵线次数）</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="vlr-panel-submit-row">
                <button type="button" className="vlr-panel-submit" onClick={handleSubmit}>
                  确定提交
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
