"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  Inbox,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { resolveMediaUrl } from "@/lib/admin-api";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type {
  OfflineVipCreatePayload,
  OfflineVipItem,
  OfflineVipOption,
  OfflineVipOptions,
  OfflineVipProgress,
  OfflineVipStatistics,
  OfflineVipUpdatePayload,
} from "@/lib/admin-endpoints";
import { pickAndUploadImage, showConfigToast } from "@/lib/platform-config";

type StatCard = { value: string; label: string; color: string };

const emptyStats: OfflineVipStatistics = {
  store_count: 0, vip_count: 0, serving_count: 0, expiring_count: 0, expired_count: 0,
  paid_count: 0, promise_meet_total: 0, promise_meet_month: 0, refund_risk_count: 0, refunded_count: 0,
};

const statusTabs: { key: "all" | OfflineVipProgress; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "matching", label: "匹配推荐中" },
  { key: "dating", label: "约会进行中" },
  { key: "deep", label: "深度接触" },
  { key: "in_love", label: "已经恋爱" },
  { key: "met_parents", label: "已见父母" },
  { key: "paused", label: "暂停服务" },
  { key: "breakup", label: "恋爱分手" },
  { key: "married", label: "已经领证" },
];

const columns = [
  { title: "ID", width: 70 },
  { title: "会员", width: 160 },
  { title: "签约日期", width: 110 },
  { title: "服务套餐", width: 120 },
  { title: "服务进度", width: 120 },
  { title: "最近跟进", width: 130 },
  { title: "合同金额", width: 100 },
  { title: "红娘", width: 90 },
  { title: "电子合同", width: 100 },
  { title: "备注信息", width: 140 },
];

const emptyOptions: OfflineVipOptions = {
  sales_matchmakers: [], service_matchmakers: [], promoters: [], packages: [],
};

const pad = (value: number) => String(value).padStart(2, "0");

const dateOnly = (value?: string | null) => {
  if (!value) return "—";
  const text = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "—";
};

const dateTime = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}:${pad(parsed.getSeconds())}`;
};

type FormState = {
  memberLookup: string;
  memberLabel: string;
  salesMatchmakerId: string;
  serviceMatchmakerId: string;
  promoterId: string;
  signDate: string;
  serviceStart: string;
  serviceEnd: string;
  packageName: string;
  contractAmount: string;
  promiseCount: string;
  successCount: string;
  progress: OfflineVipProgress | "";
  remark: string;
  attachUrls: string[];
};

const emptyForm: FormState = {
  memberLookup: "", memberLabel: "", salesMatchmakerId: "", serviceMatchmakerId: "", promoterId: "",
  signDate: "", serviceStart: "", serviceEnd: "", packageName: "", contractAmount: "",
  promiseCount: "0", successCount: "0", progress: "", remark: "", attachUrls: [],
};

export default function LoveUserVipUnderlinePage() {
  const [activeTab, setActiveTab] = useState<"all" | OfflineVipProgress>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [options, setOptions] = useState<OfflineVipOptions>(emptyOptions);
  const [stats, setStats] = useState<OfflineVipStatistics>(emptyStats);
  const [rows, setRows] = useState<OfflineVipItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 筛选区
  const [filterServiceId, setFilterServiceId] = useState("");
  const [filterSalesId, setFilterSalesId] = useState("");
  const [filterPromoterId, setFilterPromoterId] = useState("");
  const [filterSignStart, setFilterSignStart] = useState("");
  const [filterSignEnd, setFilterSignEnd] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");

  const [form, setForm] = useState<FormState>(emptyForm);

  const statCards: StatCard[] = useMemo(
    () => [
      { value: `${stats.store_count}家`, label: "门店", color: "#fa8c16" },
      { value: `${stats.vip_count}位`, label: "线下VIP", color: "#13c2c2" },
      { value: `${stats.serving_count}位`, label: "服务中", color: "#52c41a" },
      { value: `${stats.expiring_count}位`, label: "即将到期", color: "#8c8c8c" },
      { value: `${stats.expired_count}位`, label: "服务到期", color: "#3658f7" },
      { value: `${stats.paid_count}位`, label: "有偿费", color: "#52c41a" },
      { value: `${stats.promise_meet_total}位`, label: "总计安排见面", color: "#722ed1" },
      { value: `${stats.promise_meet_month}位`, label: "本月已安排", color: "#13c2c2" },
      { value: `${stats.refund_risk_count}位`, label: "有退费风险", color: "#13c2c2" },
      { value: `${stats.refunded_count}位`, label: "已退费", color: "#ff4d4f" },
    ],
    [stats],
  );

  const loadList = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.offlineVipList({
        page,
        page_size: pageSize,
        progress: activeTab === "all" ? undefined : activeTab,
        service_matchmaker_id: filterServiceId ? Number(filterServiceId) : undefined,
        sales_matchmaker_id: filterSalesId ? Number(filterSalesId) : undefined,
        promoter_id: filterPromoterId ? Number(filterPromoterId) : undefined,
        sign_start: filterSignStart || undefined,
        sign_end: filterSignEnd || undefined,
        keyword: submittedKeyword || undefined,
      });
      setRows(result.items ?? []);
      setTotal(result.total ?? 0);
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "线下VIP列表加载失败", "error");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, filterServiceId, filterSalesId, filterPromoterId, filterSignStart, filterSignEnd, submittedKeyword]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await adminEndpoints.offlineVipStatistics());
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "统计加载失败", "error");
    }
  }, []);

  const loadOptions = useCallback(async () => {
    try {
      setOptions(await adminEndpoints.offlineVipOptions());
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "下拉选项加载失败", "error");
    }
  }, []);

  useEffect(() => { void loadList(); }, [loadList]);
  useEffect(() => { void loadStats(); void loadOptions(); }, [loadStats, loadOptions]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const resetForm = () => setForm(emptyForm);

  const openCreate = () => {
    setEditing(false);
    setEditingId(null);
    resetForm();
    setDrawerOpen(true);
  };

  const openEdit = (row: OfflineVipItem) => {
    setEditing(true);
    setEditingId(row.id);
    setForm({
      memberLookup: "",
      memberLabel: `${row.nickname ?? "—"} (${row.member_code})`,
      salesMatchmakerId: row.sales_matchmaker_id ? String(row.sales_matchmaker_id) : "",
      serviceMatchmakerId: row.service_matchmaker_id ? String(row.service_matchmaker_id) : "",
      promoterId: row.promoter_id ? String(row.promoter_id) : "",
      signDate: row.sign_date ? row.sign_date.slice(0, 10) : "",
      serviceStart: row.service_start ? row.service_start.slice(0, 10) : "",
      serviceEnd: row.service_end ? row.service_end.slice(0, 10) : "",
      packageName: row.package_name ?? "",
      contractAmount: row.contract_amount ?? "",
      promiseCount: String(row.promise_meet_count ?? 0),
      successCount: String(row.success_meet_count ?? 0),
      progress: row.progress,
      remark: row.remark ?? "",
      attachUrls: row.attach_urls ?? [],
    });
    setDrawerOpen(true);
  };

  const handleUpload = (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    pickAndUploadImage(
      file,
      (url) => {
        setForm((prev) => ({ ...prev, attachUrls: [...prev.attachUrls, url] }));
        setUploading(false);
      },
      (message) => {
        showConfigToast(message, "error");
        setUploading(false);
      },
    );
  };

  const submit = async () => {
    if (!editing) {
      if (!form.memberLookup.trim()) {
        showConfigToast("请填写会员账号（昵称/手机/姓名/编号）", "error");
        return;
      }
      if (!form.salesMatchmakerId) {
        showConfigToast("请选择销售红娘", "error");
        return;
      }
      if (!form.serviceMatchmakerId) {
        showConfigToast("请选择服务红娘", "error");
        return;
      }
      if (!form.signDate) {
        showConfigToast("请选择签约日期", "error");
        return;
      }
      if (!form.packageName) {
        showConfigToast("请选择套餐类型", "error");
        return;
      }
    }
    setSaving(true);
    try {
      if (editing && editingId !== null) {
        const body: OfflineVipUpdatePayload = {
          sales_matchmaker_id: form.salesMatchmakerId ? Number(form.salesMatchmakerId) : null,
          service_matchmaker_id: form.serviceMatchmakerId ? Number(form.serviceMatchmakerId) : null,
          promoter_id: form.promoterId ? Number(form.promoterId) : null,
          sign_date: form.signDate || null,
          service_start: form.serviceStart || null,
          service_end: form.serviceEnd || null,
          package_name: form.packageName || null,
          contract_amount: form.contractAmount || "0",
          promise_meet_count: Number(form.promiseCount || 0),
          success_meet_count: Number(form.successCount || 0),
          progress: form.progress || undefined,
          remark: form.remark || null,
          attach_urls: form.attachUrls,
        };
        await adminEndpoints.updateOfflineVip(editingId, body);
        showConfigToast("保存成功", "ok");
      } else {
        const body: OfflineVipCreatePayload = {
          lookup: form.memberLookup.trim(),
          lookup_by: /^\d{6,}$/.test(form.memberLookup.trim()) ? "phone" : "nickname",
          sales_matchmaker_id: form.salesMatchmakerId ? Number(form.salesMatchmakerId) : null,
          service_matchmaker_id: form.serviceMatchmakerId ? Number(form.serviceMatchmakerId) : null,
          promoter_id: form.promoterId ? Number(form.promoterId) : null,
          sign_date: form.signDate || null,
          service_start: form.serviceStart || null,
          service_end: form.serviceEnd || null,
          package_name: form.packageName || null,
          contract_amount: form.contractAmount || "0",
          promise_meet_count: Number(form.promiseCount || 0),
          success_meet_count: Number(form.successCount || 0),
          remark: form.remark || null,
          attach_urls: form.attachUrls,
        };
        await adminEndpoints.createOfflineVip(body);
        showConfigToast("添加成功", "ok");
      }
      setDrawerOpen(false);
      resetForm();
      await Promise.all([loadList(), loadStats()]);
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "提交失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const renderOptions = (list: OfflineVipOption[]) =>
    list.map((item) => (
      <option key={item.id} value={String(item.id)}>
        {item.extra ? `${item.name}（${item.extra}）` : item.name}
      </option>
    ));

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={getBreadcrumb("会员CRM", "线下VIP")} />

      <section className="lvip-card">
        <div className="lvip-head">
          <div className="lvip-tabs">
            <button type="button" className="lvip-tab active">
              线下VIP
            </button>
            <button type="button" className="lvip-tab">
              约会管理
            </button>
            <button type="button" className="lvip-tab">
              合同管理
            </button>
          </div>
          <div className="lvip-tools">
            <button type="button" className="lvip-btn primary" onClick={openCreate}>
              <Plus className="size-3.5" />
              添加线下VIP会员
            </button>
            <button type="button" className="lvip-btn primary">
              <BarChart3 className="size-3.5" />
              业绩报表
            </button>
            <button type="button" className="lvip-btn primary" onClick={() => window.print()}>
              <Download className="size-3.5" />
              导出EXCEL
            </button>
          </div>
        </div>

        <div className="lvip-notice">
          <div className="lvip-notice-title">
            <span className="lvip-notice-icon">!</span>
            须知
          </div>
          <p>
            线下VIP会员是指您在线下门店付费签约的1对1客户，在这里，您可以为每位签约客户制定可视化的服务计划，让进度一目了然，助您高效、规范地完成服务，打造卓越的客户体验。
          </p>
          <p>
            <b>集中管理：</b>将所有线下VIP客户信息统一归档，高效维护。　
            <b>计划服务：</b>为每位客户制定专属的、可执行的服务计划。　
            <b>流程可视化：</b>实时跟踪服务进度，让管理更直观、更规范。
          </p>
          <p>
            每条VIP信息可多次发起合同，在“财务管理-电子合同-合同管理”中可见您发起的合同内容和状态。
          </p>
        </div>

        <div className="lvip-stats">
          {statCards.map((card) => (
            <div key={card.label} className="lvip-stat">
              <span className="lvip-stat-bar" style={{ background: card.color }} />
              <div className="lvip-stat-value">{card.value}</div>
              <div className="lvip-stat-label">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="lvip-subtabs">
          <div className="lvip-subtabs-list">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => { setActiveTab(tab.key); setPage(1); }}
                className={`lvip-subtab ${activeTab === tab.key ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button type="button" className="lvip-subtabs-set" aria-label="设置">
            <Settings className="size-4" />
          </button>
        </div>
        <div className="lvip-subtabs-line" />

        <div className="lvip-filters">
          <label className="lvip-select">
            <select value={filterServiceId} onChange={(event) => { setFilterServiceId(event.target.value); setPage(1); }}>
              <option value="">全部服务红娘</option>
              {renderOptions(options.service_matchmakers)}
            </select>
            <span className="lvip-caret" />
          </label>
          <label className="lvip-select">
            <select value={filterSalesId} onChange={(event) => { setFilterSalesId(event.target.value); setPage(1); }}>
              <option value="">全部销售红娘</option>
              {renderOptions(options.sales_matchmakers)}
            </select>
            <span className="lvip-caret" />
          </label>
          <label className="lvip-select">
            <select value={filterPromoterId} onChange={(event) => { setFilterPromoterId(event.target.value); setPage(1); }}>
              <option value="">推广红娘</option>
              {options.promoters.map((item) => (
                <option key={item.id} value={String(item.id)}>{item.name}</option>
              ))}
            </select>
            <span className="lvip-caret" />
          </label>
          <div className="lvip-daterange">
            <label className="lvip-date">
              <input
                type="date"
                aria-label="签单开始"
                value={filterSignStart}
                onChange={(event) => { setFilterSignStart(event.target.value); setPage(1); }}
              />
              <CalendarDays className="size-3.5" />
            </label>
            <span className="lvip-arrow">→</span>
            <label className="lvip-date">
              <input
                type="date"
                aria-label="签单结束"
                value={filterSignEnd}
                onChange={(event) => { setFilterSignEnd(event.target.value); setPage(1); }}
              />
              <CalendarDays className="size-3.5" />
            </label>
          </div>
          <div className="lvip-searchbox">
            <span className="lvip-search-label">按昵称搜</span>
            <input
              type="text"
              placeholder="请输入"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") { setSubmittedKeyword(keyword.trim()); setPage(1); } }}
            />
          </div>
          <button type="button" className="lvip-btn primary" onClick={() => { setSubmittedKeyword(keyword.trim()); setPage(1); }}>
            <Search className="size-3.5" />
            搜索
          </button>
        </div>

        <div className="lvip-table-wrap">
          <table className="lvip-table">
            <colgroup>
              {columns.map((col) => (
                <col key={col.title} style={{ width: col.width }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.title}>{col.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="lvip-empty">
                      <Inbox className="lvip-empty-icon" strokeWidth={1.2} />
                      <span>加载中…</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <div className="lvip-empty">
                      <Inbox className="lvip-empty-icon" strokeWidth={1.2} />
                      <span>暂无数据</span>
                    </div>
                  </td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>
                    <button
                      type="button"
                      className="lvip-link"
                      onClick={() => openEdit(row)}
                      title="点击编辑该线下VIP会员"
                    >
                      {row.nickname ?? "—"}（{row.member_code}）
                    </button>
                  </td>
                  <td>{dateOnly(row.sign_date)}</td>
                  <td>{row.package_name ?? "—"}</td>
                  <td>{row.progress_label}</td>
                  <td className="whitespace-nowrap">{dateTime(row.last_follow_at)}</td>
                  <td>¥{row.contract_amount}</td>
                  <td>{row.service_matchmaker_name ?? row.sales_matchmaker_name ?? "—"}</td>
                  <td>{row.contract_status_label}</td>
                  <td>{row.remark ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="member-followup-pagination">
          <span>共 {total} 条</span>
          <div>
            <button
              type="button"
              aria-label="上一页"
              className="pagination-arrow previous"
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            ><i /></button>
            <button type="button" className="pagination-number active">{page}</button>
            <button
              type="button"
              aria-label="下一页"
              className="pagination-arrow next"
              disabled={page >= totalPages}
              onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            ><i /></button>
          </div>
        </footer>
      </section>

      {drawerOpen && (
        <div className="lvip-mask" onClick={() => setDrawerOpen(false)}>
          <div
            className="lvip-panel"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lvip-panel-head">
              <div className="flex items-center gap-2">
                <span className="lvip-panel-x" onClick={() => setDrawerOpen(false)}>
                  ✕
                </span>
                <h2>{editing ? "编辑线下VIP会员服务信息" : "添加线下VIP会员服务信息"}</h2>
              </div>
              <div className="lvip-panel-actions">
                <button
                  type="button"
                  className="lvip-panel-cancel"
                  onClick={() => setDrawerOpen(false)}
                >
                  关闭
                </button>
                <button type="button" className="lvip-panel-submit" disabled={saving} onClick={submit}>
                  {saving ? "提交中…" : "确定提交"}
                </button>
              </div>
            </div>
            <div className="lvip-panel-body">
              <div className="lvip-drawer-notice">
                <span className="lvip-drawer-notice-icon">!</span>
                超级红娘可以从平台所有会员中录入和管理线下VIP信息，普通红娘仅能录入和管理自己名下会员
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>会员账号
                </div>
                <div className="lvip-field-control">
                  <input
                    className="lvip-input"
                    placeholder="请输入昵称/手机/姓名/编号"
                    value={editing ? form.memberLabel : form.memberLookup}
                    readOnly={editing}
                    onChange={(event) => setForm((prev) => ({ ...prev, memberLookup: event.target.value }))}
                  />
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>销售红娘
                </div>
                <div className="lvip-field-control">
                  <label className="lvip-select block">
                    <select
                      value={form.salesMatchmakerId}
                      onChange={(event) => setForm((prev) => ({ ...prev, salesMatchmakerId: event.target.value }))}
                    >
                      <option value="" />
                      {renderOptions(options.sales_matchmakers)}
                    </select>
                    <span className="lvip-caret" />
                  </label>
                </div>
              </div>

              <div className="lvip-inline-notice">
                <span className="lvip-inline-icon">i</span>
                销售业绩将计入到此所选择的销售红娘名下
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>服务红娘
                </div>
                <div className="lvip-field-control">
                  <label className="lvip-select block">
                    <select
                      value={form.serviceMatchmakerId}
                      onChange={(event) => setForm((prev) => ({ ...prev, serviceMatchmakerId: event.target.value }))}
                    >
                      <option value="" />
                      {renderOptions(options.service_matchmakers)}
                    </select>
                    <span className="lvip-caret" />
                  </label>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>签约日期
                </div>
                <div className="lvip-field-control">
                  <label className="lvip-date block">
                    <input
                      type="date"
                      aria-label="签约日期"
                      value={form.signDate}
                      onChange={(event) => setForm((prev) => ({ ...prev, signDate: event.target.value }))}
                    />
                    <CalendarDays className="size-3.5" />
                  </label>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>服务时间
                </div>
                <div className="lvip-field-control">
                  <div className="lvip-daterange grow">
                    <label className="lvip-date">
                      <input
                        type="date"
                        aria-label="服务开始日期"
                        value={form.serviceStart}
                        onChange={(event) => setForm((prev) => ({ ...prev, serviceStart: event.target.value }))}
                      />
                      <CalendarDays className="size-3.5" />
                    </label>
                    <span className="lvip-arrow">→</span>
                    <label className="lvip-date">
                      <input
                        type="date"
                        aria-label="服务结束日期"
                        value={form.serviceEnd}
                        onChange={(event) => setForm((prev) => ({ ...prev, serviceEnd: event.target.value }))}
                      />
                      <CalendarDays className="size-3.5" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">
                  <span className="req">*</span>套餐类型
                </div>
                <div className="lvip-field-control">
                  <label className="lvip-select block">
                    <select
                      value={form.packageName}
                      onChange={(event) => setForm((prev) => ({ ...prev, packageName: event.target.value }))}
                    >
                      <option value="" />
                      {options.packages.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                    <span className="lvip-caret" />
                  </label>
                  <button type="button" className="lvip-link">
                    套餐管理
                  </button>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">合同金额</div>
                <div className="lvip-field-control">
                  <div className="lvip-input-with-unit">
                    <input
                      className="lvip-input"
                      value={form.contractAmount}
                      onChange={(event) => setForm((prev) => ({ ...prev, contractAmount: event.target.value }))}
                    />
                    <span className="lvip-unit">元</span>
                  </div>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">承诺约见人数</div>
                <div className="lvip-field-control">
                  <div className="lvip-input-with-unit">
                    <input
                      className="lvip-input"
                      value={form.promiseCount}
                      onChange={(event) => setForm((prev) => ({ ...prev, promiseCount: event.target.value }))}
                    />
                    <span className="lvip-unit">人</span>
                  </div>
                </div>
              </div>

              <div className="lvip-field">
                <div className="lvip-field-label">已成功约见</div>
                <div className="lvip-field-control">
                  <div className="lvip-input-with-unit">
                    <input
                      className="lvip-input"
                      value={form.successCount}
                      onChange={(event) => setForm((prev) => ({ ...prev, successCount: event.target.value }))}
                    />
                    <span className="lvip-unit">人</span>
                  </div>
                </div>
              </div>

              <div className="lvip-hint">
                <p>1、约会状态为“已见面”，才会被计入到“成功见面”的次数中</p>
                <p>
                  2、您可以在这里直接修改该客户“成功见面”的次数，修改提交后系统中将直接以该数字为准
                </p>
                <p>3、修改本数字之后，后续将在本数字基础上累加计算“成功见面”次数</p>
                <p>4、每次人工修改“成功约见次数”均会生成记录</p>
              </div>

              <div className="lvip-field top">
                <div className="lvip-field-label">备注信息</div>
                <div className="lvip-field-control">
                  <div className="lvip-textarea-wrap">
                    <textarea
                      maxLength={200}
                      value={form.remark}
                      onChange={(event) => setForm((prev) => ({ ...prev, remark: event.target.value }))}
                    />
                    <span className="lvip-textarea-ph">仅限200字</span>
                  </div>
                </div>
              </div>

              <div className="lvip-field top">
                <div className="lvip-field-label">图片附件</div>
                <div className="lvip-field-control">
                  <label className="lvip-upload">
                    + 上传图片{form.attachUrls.length > 0 ? `（已上传 ${form.attachUrls.length} 张）` : ""}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading}
                      onChange={(event) => {
                        handleUpload(event.target.files?.[0]);
                        event.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="lvip-inline-notice">
                <span className="lvip-inline-icon">i</span>
                您可以上传纸质合同图片或收款图片
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
