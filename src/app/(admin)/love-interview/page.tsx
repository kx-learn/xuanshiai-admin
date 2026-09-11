"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

/* ---------- 表格数据 ---------- */
type Row = {
  id: string;
  from: string;
  fromCode: string;
  to: string;
  toCode: string;
  time: string;
  matchmaker: string;
  status: "待处理" | "已处理";
};

const rows: Row[] = [
  { id: "17", from: "lll", fromCode: "G396140", to: "Lemon", toCode: "B965945", time: "2026-09-01 14:49:30", matchmaker: "", status: "待处理" },
  { id: "15", from: "rasin", fromCode: "G847150", to: "一个好人", toCode: "B124065", time: "2026-07-16 07:52:47", matchmaker: "芸希老师", status: "待处理" },
  { id: "14", from: "出现1", fromCode: "B241050", to: "余生请指教", toCode: "G519122", time: "2026-07-09 09:42:45", matchmaker: "", status: "待处理" },
  { id: "13", from: "q~nd~N", fromCode: "B134461", to: "你芝士甘薯么呢", toCode: "G674881", time: "2026-06-28 13:58:35", matchmaker: "琴琴", status: "已处理" },
  { id: "12", from: "毛毛", fromCode: "G765914", to: "q~nd~N", toCode: "B134461", time: "2026-06-27 11:04:06", matchmaker: "芸希老师", status: "已处理" },
  { id: "11", from: "Z", fromCode: "G583088", to: "出现", toCode: "B118408", time: "2026-06-04 14:58:00", matchmaker: "芸希老师", status: "已处理" },
  { id: "10", from: "出现", fromCode: "B118408", to: "Z", toCode: "G583088", time: "2026-06-04 14:29:14", matchmaker: "芸希老师", status: "已处理" },
  { id: "9", from: "出现", fromCode: "B118408", to: "Suntod", toCode: "G107039", time: "2026-06-03 14:51:50", matchmaker: "芸希老师", status: "已处理" },
  { id: "8", from: "别偷我橘子", fromCode: "B329794", to: "乐乐", toCode: "G893895", time: "2026-05-31 16:22:57", matchmaker: "芸希老师", status: "已处理" },
  { id: "7", from: "别偷我橘子", fromCode: "B329794", to: "芒果", toCode: "G964781", time: "2026-05-31 16:19:53", matchmaker: "芸希老师", status: "已处理" },
  { id: "6", from: "芒果", fromCode: "G964781", to: "别偷我橘子", toCode: "B329794", time: "2026-05-31 16:19:50", matchmaker: "芸希老师", status: "已处理" },
];

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
  const [addOpen, setAddOpen] = useState(false);
  const [smsOn, setSmsOn] = useState(true);
  const [memberVisible, setMemberVisible] = useState(true);

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
          <button type="button" className="lvi-btn primary">
            搜索
          </button>
          <div className="lvi-daterange">
            <label className="lvi-date">
              <input type="text" placeholder="开始日期" readOnly />
              <CalendarDays size={14} />
            </label>
            <span className="lvi-arrow">→</span>
            <label className="lvi-date">
              <input type="text" placeholder="结束日期" readOnly />
              <CalendarDays size={14} />
            </label>
          </div>
          <label className="lvi-select">
            <select value={server} onChange={(e) => setServer(e.target.value)}>
              <option value="">服务红娘：不限</option>
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
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="lvi-td-id">{row.id}</td>
                  <td className="lvi-person">
                    {row.from}
                    <span>（编号：{row.fromCode}）</span>
                  </td>
                  <td className="lvi-person">
                    {row.to}
                    <span>（编号：{row.toCode}）</span>
                  </td>
                  <td className="lvi-time">{row.time}</td>
                  <td className="lvi-matchmaker">{row.matchmaker}</td>
                  <td>
                    <span className={`lvi-status ${row.status === "待处理" ? "pending" : "done"}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>
                    <div className="lvi-actions">
                      <button type="button" className="lvi-link" onClick={() => setAddOpen(true)}>
                        添加约会记录
                      </button>
                      <button type="button" className="lvi-link">
                        删除记录
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drawer：添加约会 */}
      {addOpen && (
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
                      Lemon
                      <button type="button" className="lvi-tag-x" aria-label="移除 Lemon">
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
                      lll
                      <button type="button" className="lvi-tag-x" aria-label="移除 lll">
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
                  <input className="lvi-input" placeholder="示例：XXX咖啡馆" />
                  <span className="lvi-side-hint">留空则显示为：待确定</span>
                </div>
              </div>
              <div className="lvi-field">
                <span className="lvi-field-label">见面时间</span>
                <div className="lvi-field-control">
                  <label className="lvi-date block">
                    <input type="text" placeholder="请选择见面时间" readOnly />
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
                    <select defaultValue="">
                      <option value="">请选择服务红娘</option>
                    </select>
                    <ChevronDown className="lvi-caret" />
                  </label>
                </div>
              </div>

              <div className="lvi-field">
                <span className="lvi-field-label">见面状态</span>
                <div className="lvi-field-control column">
                  <label className="lvi-select block">
                    <select defaultValue="wait">
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
              <button type="button" className="lvi-panel-submit">
                确定提交
              </button>
            </footer>
          </aside>
        </>
      )}
    </div>
  );
}
