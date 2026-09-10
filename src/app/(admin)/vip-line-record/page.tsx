"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Download, Settings } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

/* ---------- 统计 ---------- */
const stats: { value: string; label: string; bar: string }[] = [
  { value: "52", label: "全部牵线", bar: "#3658f7" },
  { value: "3", label: "待牵线", bar: "#fa8c16" },
  { value: "5", label: "牵线中", bar: "#13c2c2" },
  { value: "30", label: "牵线成功", bar: "#52c41a" },
  { value: "11", label: "牵线失败", bar: "#3658f7" },
  { value: "3", label: "未支付", bar: "#722ed1" },
];

/* ---------- 表格数据 ---------- */
type LineRow = {
  id: string;
  from: { nick: string; code: string; gender: string; age: string; real: string; promise: boolean; g: string };
  to: { nick: string; code: string; gender: string; age: string; real: string; promise: boolean; g: string };
  matchmaker: string;
  status: "成功" | "失败";
  created: string;
  finished: string;
  operator: string[];
};

const rows: LineRow[] = [
  {
    id: "52",
    from: { nick: "普浩芸", code: "G396140", gender: "女", age: "20岁", real: "已实名", promise: false, g: "a" },
    to: { nick: "薛家乐", code: "G895945", gender: "男", age: "28岁", real: "已实名", promise: false, g: "g" },
    matchmaker: "",
    status: "成功",
    created: "2026-09-01 14:48:42",
    finished: "2026-09-01 14:48:54",
    operator: ["11l"],
  },
  {
    id: "51",
    from: { nick: "柳雅琼", code: "G847150", gender: "女", age: "27岁", real: "已实名", promise: false, g: "d" },
    to: { nick: "廉心平", code: "G8124065", gender: "男", age: "27岁", real: "已实名", promise: true, g: "h" },
    matchmaker: "芸希老师",
    status: "失败",
    created: "2026-07-15 17:57:48",
    finished: "2026-07-16 00:00:05",
    operator: ["后台", "admin"],
  },
  {
    id: "50",
    from: { nick: "李金强", code: "B976071", gender: "男", age: "36岁", real: "已实名", promise: true, g: "c" },
    to: { nick: "朱颖", code: "G714715", gender: "女", age: "21岁", real: "已实名", promise: false, g: "i" },
    matchmaker: "",
    status: "失败",
    created: "2026-07-09 10:09:03",
    finished: "2026-07-10 00:00:03",
    operator: ["后台", "admin"],
  },
  {
    id: "49",
    from: { nick: "张瑞", code: "B241050", gender: "男", age: "42岁", real: "已实名", promise: true, g: "e" },
    to: { nick: "杨俊芳", code: "G777211", gender: "女", age: "22岁", real: "已实名", promise: false, g: "j" },
    matchmaker: "",
    status: "失败",
    created: "2026-07-09 08:39:22",
    finished: "2026-07-10 00:00:03",
    operator: ["后台", "admin"],
  },
];

function splitTime(value: string) {
  const [date, time] = value.split(" ");
  return { date, time };
}

/* ---------- 会员单元 ---------- */
function LineMember({ m }: { m: LineRow["from"] }) {
  return (
    <div className="vlr-member">
      <span className={`vlr-avatar vlr-g-${m.g}`}>
        <i className="vlr-age-badge">
          {m.gender}
          {m.age}
        </i>
      </span>
      <div className="vlr-member-info">
        <div className="vlr-member-nick">{m.nick}</div>
        <div className="vlr-member-tags">
          <span className="vlr-tag-real">
            <b className="vlr-tag-check">✓</b>
            {m.real}
          </span>
          <span className={m.promise ? "vlr-tag-promise on" : "vlr-tag-promise"}>
            {m.promise && <b className="vlr-tag-check">✓</b>}
            {m.promise ? "已签承诺书" : "未签承诺书"}
          </span>
        </div>
        <div className="vlr-member-code">编号：{m.code}</div>
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

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={getBreadcrumb("会员服务", "红娘牵线")} />

      <section className="vlr-card">
        {/* 须知 */}
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

        {/* 统计卡 */}
        <div className="vlr-stats">
          {stats.map((item) => (
            <div className="vlr-stat" key={item.label}>
              <span className="vlr-stat-bar" style={{ background: item.bar }} />
              <div className="vlr-stat-value">{item.value}</div>
              <div className="vlr-stat-label">{item.label}</div>
            </div>
          ))}
        </div>

        {/* 卡片头 */}
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
            <button type="button" className="vlr-btn primary">
              <Download size={15} />
              导出EXCEL
            </button>
          </div>
        </div>

        {/* 筛选 */}
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
          <button type="button" className="vlr-btn primary">
            搜索
          </button>
        </div>

        {/* 表格 */}
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
              {rows.map((row) => {
                const created = splitTime(row.created);
                const finished = splitTime(row.finished);
                return (
                  <tr key={row.id}>
                    <td className="vlr-td-id">{row.id}</td>
                    <td>
                      <LineMember m={row.from} />
                    </td>
                    <td>
                      <LineMember m={row.to} />
                    </td>
                    <td className="vlr-matchmaker">{row.matchmaker || ""}</td>
                    <td>
                      <span className="vlr-pay">已支付</span>
                    </td>
                    <td>
                      {row.status === "成功" ? (
                        <span className="vlr-status success">
                          成功
                          <ChevronDown size={13} />
                        </span>
                      ) : (
                        <span className="vlr-status fail">
                          失败
                          <i className="vlr-status-warn">!</i>
                        </span>
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
                        {row.operator.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                        {row.operator.length > 1 && (
                          <button type="button" className="vlr-del">
                            删除
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drawer：添加牵线记录 */}
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
                <button type="button" className="vlr-panel-submit">
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
                  <input className="vlr-input" placeholder="请输入编号/姓名/手机号/昵称" />
                </div>
              </div>
              <div className="vlr-field">
                <span className="vlr-field-label">
                  <b className="req">*</b>被牵线会员
                </span>
                <div className="vlr-field-control">
                  <input className="vlr-input" placeholder="请输入编号/姓名/手机号/昵称" />
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
                <button type="button" className="vlr-panel-submit">
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
