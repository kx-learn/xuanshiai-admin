"use client";

import { useState } from "react";
import { X, Download, Camera } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("活动报名", "报名管理");

const STATS = [
  { label: "报名总数", value: "57", unit: "人", color: "#c4cad6" },
  { label: "首次报名", value: "50", unit: "人", color: "#fa8c16" },
  { label: "待审", value: "9", unit: "人", color: "#2bb673" },
  { label: "审核通过", value: "46", unit: "人", color: "#52c41a" },
  { label: "未通过", value: "2", unit: "人", color: "#ff4d4f" },
  { label: "报名费", value: "2352", unit: "元", color: "#3658f7" },
  { label: "未签到", value: "57", unit: "人", color: "#13c2c2" },
  { label: "已签到", value: "0", unit: "人", color: "#722ed1" },
  { label: "活动入库", value: "17", unit: "人", color: "#eb2f96" },
];

interface Row {
  id: number;
  name: string;
  member: boolean;
  meta: string;
  realname: boolean;
  phone: string;
  signupTimes: number;
  payStatus: string;
  audit: string;
  payAmount?: string;
}

const rows: Row[] = [
  { id: 60, name: "刺猬 / 范浩然", member: false, meta: "2006年(20岁) / 大专 / 5-8千元 / 未婚\n报名: 单身青年 免费择偶竞争力评分", realname: true, phone: "13880942587", signupTimes: 1, payStatus: "免费", audit: "待审" },
  { id: 59, name: "速发明老师 / 帅哥", member: true, meta: "2007年(19岁) / 175cm / 本科 / 年入百万 / 未婚\n报名: 单身青年 免费择偶竞争力评分", realname: true, phone: "19550630339", signupTimes: 1, payStatus: "免费", audit: "待审" },
  { id: 58, name: "～ / 啊", member: false, meta: "2006年(20岁) / 本科 / 年入百万 / 未婚\n报名: 单身青年 免费择偶竞争力评分", realname: true, phone: "13590149114", signupTimes: 1, payStatus: "免费", audit: "待审" },
  { id: 57, name: "颜 / 张毓麟", member: true, meta: "1997年(29岁) / 173cm / 本科 / 1-2万元 / 未婚\n报名: 单身青年 免费择偶竞争力评分", realname: true, phone: "13151401977 / 420602199706********", signupTimes: 1, payStatus: "免费", audit: "待审" },
  { id: 56, name: "来来禾 / 禾", member: true, meta: "1997年(29岁) / 166cm / 硕士 / 8千-1万元 / 未婚\n报名: 单身青年 免费择偶竞争力评分", realname: false, phone: "18921410368", signupTimes: 1, payStatus: "未支付", payAmount: "98.00元", audit: "待审" },
];

const columns = ["ID", "报名会员", "实名认证", "手机", "第几次报名", "在线缴费", "报名审核", "推广红娘", "操作"];

export default function ActiveSignupmanagerPage() {
  const [activity, setActivity] = useState("活动：全部");
  const [signupTab, setSignupTab] = useState("全部");
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [name, setName] = useState("范浩然");
  const [gender, setGender] = useState("男");
  const [age, setAge] = useState("20");
  const [phone, setPhone] = useState("13880942587");

  const openEdit = (r: Row) => {
    setEditRow(r);
    setName(r.name.split(" / ")[1] || r.name);
    setPhone(r.phone);
    setEditOpen(true);
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 活动筛选 */}
      <div className="sm-activity-row">
        <select className="sm-activity-select">
          <option>活动：全部</option>
        </select>
      </div>

      {/* 统计卡片 */}
      <div className="sm-stats-row">
        {STATS.map((s) => (
          <div className="sm-stat" key={s.label} style={{ borderTop: `3px solid ${s.color}` }}>
            <div className="sm-stat-value" style={{ color: s.color }}>{s.value}<span className="sm-stat-unit">{s.unit}</span></div>
            <div className="sm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 报名管理卡片 */}
      <div className="finord-card sm-card">
        <div className="sm-head">
          <h2 className="sm-title">报名管理</h2>
          <div className="sm-head-actions">
            <button className="finord-btn finord-btn-primary sm-export-card-btn">📇 导出报名资料卡片</button>
            <button className="finord-btn finord-btn-primary sm-export-btn"><Download size={14} /> 导出EXCEL</button>
          </div>
        </div>

        {/* 筛选条 */}
        <div className="sm-filters">
          <div className="sm-filters-row">
            <select className="sm-select"><option>性别：全部</option><option>男</option><option>女</option></select>
            <select className="sm-select"><option>审核：全部</option><option>待审</option><option>通过</option><option>未通过</option></select>
            <select className="sm-select"><option>支付：全部</option><option>免费</option><option>已支付</option><option>未支付</option></select>
            <select className="sm-select"><option>签到：全部</option><option>已签到</option><option>未签到</option></select>
            <label className="sm-radio">
              <input type="radio" name="signupTab" value="全部" checked={signupTab === "全部"} onChange={() => setSignupTab("全部")} />
              <span>全部</span>
            </label>
            <label className="sm-radio">
              <input type="radio" name="signupTab" value="首次报名" checked={signupTab === "首次报名"} onChange={() => setSignupTab("首次报名")} />
              <span>首次报名</span>
            </label>
            <span className="sm-text-muted">开始日期</span>
            <input className="sm-date" type="date" />
            <span className="sm-text-muted">结束日期</span>
            <input className="sm-date" type="date" />
            <select className="sm-select"><option>按昵称搜</option><option>按手机搜</option></select>
            <input className="sm-input" placeholder="请输入" />
            <button className="finord-btn finord-btn-primary sm-search-btn">搜索</button>
          </div>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table sm-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="sm-row-content">
                      <input type="checkbox" className="sm-check" />
                      <span className="sm-id">{r.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="sm-member">
                      <div className="sm-avatar">
                        <span className="sm-avatar-gender">男</span>
                      </div>
                      <div className="sm-member-info">
                        <div className="sm-member-name">
                          {r.name}
                          {r.member && <span className="sm-member-badge">会员</span>}
                        </div>
                        <div className="sm-member-meta">
                          {r.meta.split("\n").map((line, i) => <div key={i}>{line}</div>)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`sm-realname ${r.realname ? "yes" : "no"}`}>{r.realname ? "已实名" : "未实名"}</span>
                  </td>
                  <td className="sm-phone">{r.phone}</td>
                  <td>
                    <div className="sm-times">
                      <div>第{r.signupTimes}次</div>
                      <a className="finord-link sm-times-link">复制</a>
                    </div>
                  </td>
                  <td>
                    <div className="sm-pay">
                      <span className={`sm-pay-status ${r.payStatus === "未支付" ? "todo" : ""}`}>{r.payStatus}</span>
                      {r.payAmount && <div className="sm-pay-amount">{r.payAmount}</div>}
                    </div>
                  </td>
                  <td>
                    <span className="sm-audit">{r.audit}</span>
                  </td>
                  <td className="sm-cell-empty">-</td>
                  <td>
                    <div className="sm-ops">
                      <button className="finord-btn finord-btn-primary sm-edit-btn" onClick={() => openEdit(r)}>修改报名</button>
                      {r.realname ? (
                        <a className="finord-link">查看资料</a>
                      ) : (
                        <button className="finord-btn finord-btn-primary sm-import-btn">资料入库</button>
                      )}
                      <a className="finord-link sm-op-del">删除</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editOpen && (
        <EditSignupDrawer
          onClose={() => setEditOpen(false)}
          row={editRow}
          name={name} setName={setName}
          gender={gender} setGender={setGender}
          age={age} setAge={setAge}
          phone={phone} setPhone={setPhone}
        />
      )}
    </div>
  );
}

function EditSignupDrawer({ onClose, row, name, setName, gender, setGender, age, setAge, phone, setPhone }: {
  onClose: () => void;
  row: Row | null;
  name: string; setName: (v: string) => void;
  gender: string; setGender: (v: string) => void;
  age: string; setAge: (v: string) => void;
  phone: string; setPhone: (v: string) => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel sm-edit-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">修改报名</span>
          </div>
          <div className="sm-head-actions">
            <button className="finord-btn sm-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 头像 */}
          <div className="sm-edit-row sm-edit-top">
            <div className="sm-edit-avatar">
              <div className="sm-edit-avatar-img" />
              <button type="button" className="sm-edit-avatar-btn"><Camera size={14} /> 上传图片</button>
            </div>
          </div>

          {/* 姓名 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">＊姓名</span>
            <input className="sm-edit-input-wide" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* 性别 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">＊性别</span>
            <div className="sm-edit-options">
              {["男", "女"].map((o) => (
                <label key={o} className={`sm-edit-radio ${gender === o ? "active" : ""}`}>
                  <input type="radio" name="gender" value={o} checked={gender === o} onChange={() => setGender(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 年龄 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">＊年龄</span>
            <div className="sm-edit-inline">
              <input className="sm-edit-input-num" value={age} onChange={(e) => setAge(e.target.value)} />
              <span className="sm-edit-unit">岁</span>
            </div>
          </div>

          {/* 身高 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">＊身高</span>
            <div className="sm-edit-inline">
              <input className="sm-edit-input-num" />
              <span className="sm-edit-unit">CM</span>
            </div>
          </div>

          {/* 手机 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">＊手机</span>
            <input className="sm-edit-input-wide" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {/* 学历 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">学历</span>
            <div className="sm-edit-link-row">
              <span>大专</span>
              <a className="finord-link">修改</a>
            </div>
          </div>

          {/* 收入 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">收入</span>
            <div className="sm-edit-link-row">
              <span>5-8千元</span>
              <a className="finord-link">修改</a>
            </div>
          </div>

          {/* 婚况 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">婚况</span>
            <div className="sm-edit-link-row">
              <span>未婚</span>
              <a className="finord-link">修改</a>
            </div>
          </div>

          {/* 单位 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">单位</span>
            <input className="sm-edit-input-wide" />
          </div>

          {/* 身份证 */}
          <div className="sm-edit-row sm-edit-top">
            <span className="sm-edit-label">身份证</span>
            <div className="sm-edit-idcard">
              <div className="sm-edit-idcard-img">420602199706********</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}