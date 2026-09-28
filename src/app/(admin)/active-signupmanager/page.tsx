"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Download, Camera } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type ActivityOption, type ActivitySignupItem, type ActivitySignupStatistics } from "@/lib/admin-endpoints";
import { pickAndUploadImage, showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("活动报名", "报名管理");

const AUDIT_TEXT: Record<number, string> = { 0: "待审", 1: "审核通过", 2: "已取消", 3: "未通过" };
const AUDIT_CLASS: Record<number, string> = { 0: "todo", 1: "", 2: "", 3: "fail" };
const PAY_TEXT: Record<string, string> = { free: "免费", paid: "已支付", unpaid: "未支付" };

const EMPTY_STATS: ActivitySignupStatistics = {
  total: 0, first_signup: 0, pending: 0, approved: 0, rejected: 0,
  fee_amount: "0.00", not_checked_in: 0, checked_in: 0, in_crm: 0,
};

export default function ActiveSignupmanagerPage() {
  const [activities, setActivities] = useState<ActivityOption[]>([]);
  const [activityId, setActivityId] = useState("");
  const [signupTab, setSignupTab] = useState("全部");
  const [gender, setGender] = useState("全部");
  const [audit, setAudit] = useState("全部");
  const [pay, setPay] = useState("全部");
  const [checkin, setCheckin] = useState("全部");
  const [searchBy, setSearchBy] = useState("按昵称搜");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<ActivitySignupItem[]>([]);
  const [stats, setStats] = useState<ActivitySignupStatistics>(EMPTY_STATS);
  const [editRow, setEditRow] = useState<ActivitySignupItem | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    adminEndpoints.activitySignupOptions().then(setActivities).catch(() => undefined);
  }, []);

  const loadStats = useCallback(async (id?: number) => {
    try {
      setStats(await adminEndpoints.activitySignupStatistics(id));
    } catch {
      setStats(EMPTY_STATS);
    }
  }, []);

  const loadRows = useCallback(async (id?: number, nextPage = page, nextPageSize = pageSize) => {
    try {
      const res = await adminEndpoints.activitySignups(id, {
        page: nextPage,
        page_size: nextPageSize,
        first_signup: signupTab === "首次报名",
        status: audit === "待审" ? 0 : audit === "通过" ? 1 : audit === "未通过" ? 3 : undefined,
        gender: gender === "全部" ? undefined : gender,
        pay_status: pay === "全部" ? undefined : pay === "免费" ? "free" : pay === "已支付" ? "paid" : "unpaid",
        checked_in: checkin === "全部" ? undefined : checkin === "已签到",
        keyword: search.trim() || undefined,
        search_by: searchBy === "按手机搜" ? "phone" : "nickname",
        signup_from: dateFrom || undefined,
        signup_to: dateTo || undefined,
      });
      setRows(res.items);
      setTotal(res.total);
      setSelected([]);
    } catch (e) {
      setRows([]);
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    }
  }, [audit, checkin, dateFrom, dateTo, gender, page, pageSize, pay, search, searchBy, signupTab]);

  useEffect(() => {
    const id = activityId ? Number(activityId) : undefined;
    loadStats(id);
    void loadRows(id, page, pageSize);
  }, [activityId, loadStats, loadRows, page, pageSize]);

  const filtered = rows;
  const allSelected = rows.length > 0 && selected.length === rows.length;

  const statItems = [
    { label: "报名总数", value: String(stats.total), unit: "人", color: "#c4cad6" },
    { label: "首次报名", value: String(stats.first_signup), unit: "人", color: "#fa8c16" },
    { label: "待审", value: String(stats.pending), unit: "人", color: "#2bb673" },
    { label: "审核通过", value: String(stats.approved), unit: "人", color: "#52c41a" },
    { label: "未通过", value: String(stats.rejected), unit: "人", color: "#ff4d4f" },
    { label: "报名费", value: stats.fee_amount, unit: "元", color: "#3658f7" },
    { label: "未签到", value: String(stats.not_checked_in), unit: "人", color: "#13c2c2" },
    { label: "已签到", value: String(stats.checked_in), unit: "人", color: "#722ed1" },
    { label: "活动入库", value: String(stats.in_crm), unit: "人", color: "#eb2f96" },
  ];

  const exportExcel = () => {
    adminEndpoints.exportActivitySignups({ activity_id: activityId ? Number(activityId) : undefined })
      .catch((e) => showConfigToast(e instanceof Error ? e.message : "导出失败", "error"));
  };

  const removeSignup = async (r: ActivitySignupItem) => {
    if (!window.confirm(`确定删除该报名记录（ID ${r.id}）？`)) return;
    try {
      await adminEndpoints.deleteActivitySignup(r.id);
      showConfigToast("删除成功", "ok");
      if (activityId) loadRows(Number(activityId));
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const columns = ["ID", "报名会员", "实名认证", "手机", "第几次报名", "在线缴费", "报名审核", "推广红娘", "操作"];

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 活动筛选 */}
      <div className="sm-activity-row">
        <select className="sm-activity-select" value={activityId} onChange={(e) => setActivityId(e.target.value)}>
          <option value="">活动：全部</option>
          {activities.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
      </div>

      {/* 统计卡片 */}
      <div className="sm-stats-row">
        {statItems.map((s) => (
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
            <button className="finord-btn finord-btn-primary sm-export-btn" onClick={exportExcel}><Download size={14} /> 导出EXCEL</button>
          </div>
        </div>

        {/* 筛选条 */}
        <div className="sm-filters">
          <div className="sm-filters-row">
            <select className="sm-select" value={gender} onChange={(e) => setGender(e.target.value)}><option>全部</option><option>男</option><option>女</option></select>
            <select className="sm-select" value={audit} onChange={(e) => setAudit(e.target.value)}><option>全部</option><option>待审</option><option>通过</option><option>未通过</option></select>
            <select className="sm-select" value={pay} onChange={(e) => setPay(e.target.value)}><option>全部</option><option>免费</option><option>已支付</option><option>未支付</option></select>
            <select className="sm-select" value={checkin} onChange={(e) => setCheckin(e.target.value)}><option>全部</option><option>已签到</option><option>未签到</option></select>
            <label className="sm-radio">
              <input type="radio" name="signupTab" value="全部" checked={signupTab === "全部"} onChange={() => setSignupTab("全部")} />
              <span>全部</span>
            </label>
            <label className="sm-radio">
              <input type="radio" name="signupTab" value="首次报名" checked={signupTab === "首次报名"} onChange={() => setSignupTab("首次报名")} />
              <span>首次报名</span>
            </label>
            <span className="sm-text-muted">开始日期</span>
            <input className="sm-date" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span className="sm-text-muted">结束日期</span>
            <input className="sm-date" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            <select className="sm-select" value={searchBy} onChange={(e) => setSearchBy(e.target.value)}><option>按昵称搜</option><option>按手机搜</option></select>
            <input className="sm-input" placeholder="请输入" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="finord-btn finord-btn-primary sm-search-btn" onClick={() => loadRows(activityId ? Number(activityId) : undefined)}>搜索</button>
          </div>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table sm-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))} /></th>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const meta = [
                  r.gender ? `${r.gender} / ${r.age ?? "-"}岁` : "",
                  r.height ? `${r.height}cm` : "",
                  r.education || "",
                  r.income || "",
                  r.marriage_status || "",
                ].filter(Boolean).join(" / ");
                return (
                  <tr key={r.id}>
                    <td><input type="checkbox" aria-label={`选择报名 ${r.id}`} checked={selected.includes(r.id)} onChange={() => setSelected((current) => current.includes(r.id) ? current.filter((id) => id !== r.id) : [...current, r.id])} /></td>
                    <td>
                      <div className="sm-row-content">
                        <input type="checkbox" className="sm-check" />
                        <span className="sm-id">{r.id}</span>
                      </div>
                    </td>
                    <td>
                      <div className="sm-member">
                        <div className="sm-avatar">
                          <span className="sm-avatar-gender">{r.gender || "-"}</span>
                        </div>
                        <div className="sm-member-info">
                          <div className="sm-member-name">
                            {r.nickname || r.real_name || `会员${r.user_id}`}
                            {r.is_member && <span className="sm-member-badge">会员</span>}
                          </div>
                          <div className="sm-member-meta">
                            <div>{meta || "暂无资料"}</div>
                            <div>报名: {r.activity_title || "-"}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`sm-realname ${r.is_realname ? "yes" : "no"}`}>{r.is_realname ? "已实名" : "未实名"}</span>
                    </td>
                    <td className="sm-phone">{r.phone || "-"}</td>
                    <td>
                      <div className="sm-times">
                        <div>第{r.signup_times ?? 1}次</div>
                        <a className="finord-link sm-times-link" onClick={() => r.phone && navigator.clipboard?.writeText(r.phone)}>复制</a>
                      </div>
                    </td>
                    <td>
                      <div className="sm-pay">
                        <span className={`sm-pay-status ${r.pay_status === "unpaid" ? "todo" : ""}`}>{PAY_TEXT[r.pay_status] || "免费"}</span>
                        {r.pay_amount > 0 && <div className="sm-pay-amount">{r.pay_amount.toFixed(2)}元</div>}
                      </div>
                    </td>
                    <td>
                      <span className={`sm-audit ${AUDIT_CLASS[r.status] || ""}`}>{AUDIT_TEXT[r.status] || "待审"}</span>
                    </td>
                    <td className="sm-cell-empty">{r.promoter_name || "-"}</td>
                    <td>
                      <div className="sm-ops">
                        <button className="finord-btn finord-btn-primary sm-edit-btn" onClick={() => setEditRow(r)}>修改报名</button>
                        {r.is_realname ? (
                          <a className="finord-link">查看资料</a>
                        ) : (
                          <button className="finord-btn finord-btn-primary sm-import-btn">资料入库</button>
                        )}
                        <a className="finord-link sm-op-del" onClick={() => removeSignup(r)}>删除</a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={columns.length + 1} style={{ textAlign: "center", padding: "32px 0", color: "#98a2b3" }}>
                  暂无数据
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      </div>

      {editRow && (
        <EditSignupDrawer
          row={editRow}
          onClose={() => setEditRow(null)}
          onSaved={() => { setEditRow(null); if (activityId) loadRows(Number(activityId)); }}
        />
      )}
    </div>
  );
}

function EditSignupDrawer({ row, onClose, onSaved }: { row: ActivitySignupItem; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(row.real_name || row.nickname || "");
  const [gender, setGender] = useState(row.gender || "男");
  const [age, setAge] = useState(String(row.age ?? ""));
  const [height, setHeight] = useState(String(row.height ?? ""));
  const [phone, setPhone] = useState(row.phone || "");
  const [education, setEducation] = useState(row.education || "");
  const [income, setIncome] = useState(row.income || "");
  const [marriage, setMarriage] = useState(row.marriage_status || "");
  const [company, setCompany] = useState(row.company || "");
  const [avatar, setAvatar] = useState<string | null>(row.avatar);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await adminEndpoints.updateActivitySignup(row.id, {
        real_name: name || undefined,
        gender: gender || undefined,
        age: age ? Number(age) : undefined,
        height: height ? Number(height) : undefined,
        phone: phone || undefined,
        education: education || undefined,
        income: income || undefined,
        marriage_status: marriage || undefined,
        company: company || undefined,
        avatar: avatar || undefined,
      });
      showConfigToast("提交成功", "ok");
      onSaved();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "提交失败", "error");
    } finally {
      setSaving(false);
    }
  };

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
            <button className="finord-btn finord-btn-primary" onClick={submit} disabled={saving}>{saving ? "提交中…" : "确定提交"}</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 头像 */}
          <div className="sm-edit-row sm-edit-top">
            <div className="sm-edit-avatar">
              <div className="sm-edit-avatar-img">
                {avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="头像" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                )}
              </div>
              <label className="sm-edit-avatar-btn"><Camera size={14} /> 上传图片
                <input type="file" accept="image/*" hidden onChange={(e) => pickAndUploadImage(e.target.files?.[0], setAvatar, (m) => showConfigToast(m, "error"))} />
              </label>
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
              <input className="sm-edit-input-num" value={height} onChange={(e) => setHeight(e.target.value)} />
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
              <input className="sm-edit-input-wide" value={education} onChange={(e) => setEducation(e.target.value)} />
            </div>
          </div>

          {/* 收入 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">收入</span>
            <div className="sm-edit-link-row">
              <input className="sm-edit-input-wide" value={income} onChange={(e) => setIncome(e.target.value)} />
            </div>
          </div>

          {/* 婚况 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">婚况</span>
            <div className="sm-edit-link-row">
              <input className="sm-edit-input-wide" value={marriage} onChange={(e) => setMarriage(e.target.value)} />
            </div>
          </div>

          {/* 单位 */}
          <div className="sm-edit-row">
            <span className="sm-edit-label">单位</span>
            <input className="sm-edit-input-wide" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>

          {/* 身份证 */}
          <div className="sm-edit-row sm-edit-top">
            <span className="sm-edit-label">身份证</span>
            <div className="sm-edit-idcard">
              <div className="sm-edit-idcard-img">{row.id_card || "未填写"}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
