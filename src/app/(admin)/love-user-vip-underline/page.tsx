"use client";

import dynamic from "next/dynamic";
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
import AdminPagination from "@/components/AdminPagination";
import DateRangePicker from "@/components/DateRangePicker";
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
import { VIP_SERVICE_STATUS, VIP_SERVICE_STATUS_VALUE } from "@/lib/filter-options";

type StatCard = {
  value: string;
  label: string;
  color: string;
  /** 有对应筛选维度的卡片可点击；没有对应参数的保持纯展示 */
  onClick?: () => void;
};

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
const ALL_SUBTAB_KEYS = statusTabs.map((tab) => tab.key);
/** 「服务进度」子 Tab 的显示偏好存在本机：后台没有保存这类界面偏好的接口。 */
const SUBTAB_KEY = "xuanshiai_offline_vip_subtabs";
const loadVisibleSubtabs = (): string[] => {
  try {
    const raw = window.localStorage.getItem(SUBTAB_KEY);
    if (!raw) return ALL_SUBTAB_KEYS;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return ALL_SUBTAB_KEYS;
    // 过滤掉已不存在的旧键，且「全部」始终保留
    const kept = ALL_SUBTAB_KEYS.filter((key) => key === "all" || parsed.includes(key));
    return kept.length ? kept : ALL_SUBTAB_KEYS;
  } catch {
    return ALL_SUBTAB_KEYS;
  }
};
const saveVisibleSubtabs = (keys: readonly string[]) => {
  try {
    window.localStorage.setItem(SUBTAB_KEY, JSON.stringify(keys));
  } catch {
    // 隐私模式下写不进去，退回到当前会话生效即可
  }
};

const columns = [
  { title: "ID", width: 70 },  { title: "会员", width: 160 },
  { title: "签约日期", width: 110 },
  { title: "服务套餐", width: 120 },
  { title: "服务进度", width: 120 },
  { title: "最近跟进", width: 130 },
  { title: "合同金额", width: 100 },
  { title: "红娘", width: 90 },
  { title: "电子合同", width: 100 },
  { title: "备注信息", width: 140 },
];

/** 表头文案 → 后端 column_sort 白名单键；未列出的列不提供排序。 */
type ColumnSortKey = "sign_date" | "package" | "progress" | "last_follow" | "amount" | "matchmaker" | "id";
const COLUMN_SORT_KEY: Record<string, ColumnSortKey> = {
  ID: "id",
  签约日期: "sign_date",
  服务套餐: "package",
  服务进度: "progress",
  最近跟进: "last_follow",
  合同金额: "amount",
  红娘: "matchmaker",
};

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

/* 页内子页面（不跳路由，动态加载避免循环依赖） */
const LoveAppointmentPage = dynamic(() => import("../love-appointment/page"), { ssr: false });
const EContractListPage = dynamic(() => import("../e-contract-list/page"), { ssr: false });

type LvipTab = "vip" | "appointment" | "contract";

export default function LoveUserVipUnderlinePage() {
  const [tab, setTab] = useState<LvipTab>("vip");
  const [activeTab, setActiveTab] = useState<"all" | OfflineVipProgress>("all");
  const [searchType, setSearchType] = useState("按昵称搜");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [subtabSettingsOpen, setSubtabSettingsOpen] = useState(false);
  const [visibleSubtabs, setVisibleSubtabs] = useState<string[]>(ALL_SUBTAB_KEYS);
  const [columnSort, setColumnSort] = useState<ColumnSortKey | "">("");
  const [selected, setSelected] = useState<number[]>([]);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [options, setOptions] = useState<OfflineVipOptions>(emptyOptions);
  const [stats, setStats] = useState<OfflineVipStatistics>(emptyStats);
  const [rows, setRows] = useState<OfflineVipItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 筛选区
  const [filterServiceId, setFilterServiceId] = useState("");
  const [filterSalesId, setFilterSalesId] = useState("");
  const [filterPromoterId, setFilterPromoterId] = useState("");
  const [filterSignStart, setFilterSignStart] = useState("");
  const [filterSignEnd, setFilterSignEnd] = useState("");
  const [filterServiceStatus, setFilterServiceStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");

  const [form, setForm] = useState<FormState>(emptyForm);

  const statCards: StatCard[] = useMemo(
    () => [
      // 「门店」是另一个维度（组织），列表没有对应筛选参数
      { value: `${stats.store_count}家`, label: "门店", color: "#fa8c16" },
      { value: `${stats.vip_count}位`, label: "线下VIP", color: "#13c2c2",
        onClick: () => { setActiveTab("all"); setFilterServiceStatus(""); setPage(1); } },
      { value: `${stats.serving_count}位`, label: "服务中", color: "#52c41a",
        onClick: () => { setFilterServiceStatus("服务期内"); setPage(1); } },
      { value: `${stats.expiring_count}位`, label: "即将到期", color: "#8c8c8c" },
      { value: `${stats.expired_count}位`, label: "服务到期", color: "#3658f7",
        onClick: () => { setFilterServiceStatus("已过期"); setPage(1); } },
      { value: `${stats.paid_count}位`, label: "有偿费", color: "#52c41a" },
      { value: `${stats.promise_meet_total}位`, label: "总计安排见面", color: "#722ed1" },
      { value: `${stats.promise_meet_month}位`, label: "本月已安排", color: "#13c2c2" },
      { value: `${stats.refund_risk_count}位`, label: "有退费风险", color: "#13c2c2",
        onClick: () => { setFilterServiceStatus("无退费风险"); setPage(1); } },
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
        // 服务状态与 progress（服务进度）是两套维度，独立参数
        service_status: filterServiceStatus ? VIP_SERVICE_STATUS_VALUE[filterServiceStatus] : undefined,
        // 表头点击排序：未点表头时不传，沿用后端默认排序
        column_sort: columnSort || undefined,
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
  }, [page, pageSize, activeTab, filterServiceId, filterSalesId, filterPromoterId, filterSignStart, filterSignEnd, submittedKeyword, filterServiceStatus, columnSort]);

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
  useEffect(() => { setVisibleSubtabs(loadVisibleSubtabs()); }, []);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  const exportRows = () => {
    if (!rows.length) {
      showConfigToast("当前没有可导出的线下VIP记录", "error");
      return;
    }
    const esc = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      ["会员", "签约日期", "服务套餐", "服务进度", "最近跟进", "合同金额", "红娘", "电子合同", "备注信息"].map(esc).join(","),
      ...rows.map((row) => [
        `${row.nickname ?? ""}（${row.member_code}）`,
        dateOnly(row.sign_date),
        row.package_name,
        row.progress_label,
        dateTime(row.last_follow_at),
        row.contract_amount,
        row.service_matchmaker_name ?? row.sales_matchmaker_name,
        row.contract_status_label,
        row.remark,
      ].map(esc).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `线下VIP-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showConfigToast("导出成功", "ok");
  };

  const resetForm = () => setForm(emptyForm);

  /** 业绩报表：按当前筛选结果汇总，与列表导出的逐行明细互补。 */
  const exportPerformance = () => {
    if (!rows.length) {
      showConfigToast("当前没有可汇总的线下VIP记录", "error");
      return;
    }
    const esc = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const amountOf = (value: unknown) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };
    // 按服务红娘（无则销售红娘）分组统计签约数与合同金额
    const groups = new Map<string, { count: number; amount: number }>();
    for (const row of rows) {
      const name = row.service_matchmaker_name ?? row.sales_matchmaker_name ?? "未分配";
      const current = groups.get(name) ?? { count: 0, amount: 0 };
      current.count += 1;
      current.amount += amountOf(row.contract_amount);
      groups.set(name, current);
    }
    const totalAmount = rows.reduce((sum, row) => sum + amountOf(row.contract_amount), 0);
    const summary = [
      ["指标", "数值"].map(esc).join(","),
      ["线下VIP总数", stats.vip_count].map(esc).join(","),
      ["服务中", stats.serving_count].map(esc).join(","),
      ["即将到期", stats.expiring_count].map(esc).join(","),
      ["已过期", stats.expired_count].map(esc).join(","),
      ["有偿费", stats.paid_count].map(esc).join(","),
      ["承诺约见总数", stats.promise_meet_total].map(esc).join(","),
      ["承诺约见本月", stats.promise_meet_month].map(esc).join(","),
      ["有退费风险", stats.refund_risk_count].map(esc).join(","),
      ["已退费", stats.refunded_count].map(esc).join(","),
      ["当前筛选记录数", rows.length].map(esc).join(","),
      ["当前筛选合同金额合计", totalAmount.toFixed(2)].map(esc).join(","),
      "",
      ["红娘", "签约数", "合同金额合计"].map(esc).join(","),
      ...[...groups.entries()]
        .sort((a, b) => b[1].amount - a[1].amount)
        .map(([name, item]) => [name, item.count, item.amount.toFixed(2)].map(esc).join(",")),
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿", summary], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `线下VIP业绩报表-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    showConfigToast(`报表已导出：${rows.length} 条记录，${groups.size} 位红娘`, "ok");
  };

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

      <section className="lvip-card" style={tab === "vip" ? undefined : { display: "none" }}>
        <div className="lvip-head">
          <div className="lvip-tabs">
            <button type="button" className={`lvip-tab ${tab === "vip" ? "active" : ""}`} onClick={() => setTab("vip")}>
              线下VIP
            </button>
            <button type="button" className={`lvip-tab ${tab === "appointment" ? "active" : ""}`} onClick={() => setTab("appointment")}>
              约会管理
            </button>
            <button type="button" className={`lvip-tab ${tab === "contract" ? "active" : ""}`} onClick={() => setTab("contract")}>
              合同管理
            </button>
          </div>
          <div className="lvip-tools">
            <button type="button" className="lvip-btn primary" onClick={openCreate}>
              <Plus className="size-3.5" />
              添加线下VIP会员
            </button>
            <button type="button" className="lvip-btn primary" onClick={exportPerformance}>
              <BarChart3 className="size-3.5" />
              业绩报表
            </button>
            <button type="button" className="lvip-btn primary" onClick={exportRows}>
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
            <div
              key={card.label}
              className={`lvip-stat ${card.onClick ? "cursor-pointer hover:opacity-80" : ""}`}
              onClick={card.onClick}
              role={card.onClick ? "button" : undefined}
              tabIndex={card.onClick ? 0 : undefined}
              title={card.onClick ? `点击按「${card.label}」筛选列表` : undefined}
              onKeyDown={
                card.onClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        card.onClick?.();
                      }
                    }
                  : undefined
              }
            >
              <span className="lvip-stat-bar" style={{ background: card.color }} />
              <div className="lvip-stat-value">{card.value}</div>
              <div className="lvip-stat-label">{card.label}</div>
            </div>
          ))}
        </div>

        <div className="lvip-subtabs">
          <div className="lvip-subtabs-list">
            {statusTabs.filter((tab) => visibleSubtabs.includes(tab.key)).map((tab) => (
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
          <button
            type="button"
            className="lvip-subtabs-set"
            aria-label="设置"
            onClick={() => setSubtabSettingsOpen((v) => !v)}
            title="设置显示哪些服务进度子 Tab"
          >
            <Settings className="size-4" />
          </button>
        </div>
        {subtabSettingsOpen && (
          <div className="mb-2 rounded border border-[#e5e7eb] bg-[#fafafa] p-3 text-xs">
            <div className="mb-2 flex items-center gap-3">
              <span className="text-[#8c8c8c]">勾选要在上方显示的服务进度子 Tab（保存在本机浏览器）</span>
              <button
                type="button"
                className="text-[#3658f7]"
                onClick={() => {
                  const keys = statusTabs.map((item) => item.key);
                  setVisibleSubtabs(keys);
                  saveVisibleSubtabs(keys);
                }}
              >
                全选
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {statusTabs.map((item) => {
                // 「全部」是兜底视图，不允许隐藏，否则列表可能没有任何 Tab 可选。
                const locked = item.key === "all";
                return (
                  <label key={item.key} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={visibleSubtabs.includes(item.key)}
                      disabled={locked}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...visibleSubtabs, item.key]
                          : visibleSubtabs.filter((key) => key !== item.key);
                        // 始终保持与 statusTabs 一致的顺序，避免勾选顺序影响展示顺序
                        const ordered = statusTabs.map((t) => t.key).filter((key) => next.includes(key));
                        setVisibleSubtabs(ordered);
                        saveVisibleSubtabs(ordered);
                        if (!ordered.includes(activeTab as typeof ordered[number])) {
                          setActiveTab("all");
                          setPage(1);
                        }
                      }}
                    />
                    {item.label}
                  </label>
                );
              })}
            </div>
          </div>
        )}
        <div className="lvip-subtabs-line" />

        <div className="lvip-filters">
          {/* 「线下VIP：是/不是」暂不接线：/admin/offline-vips 没有对应参数，
              本页本身就是线下VIP列表，后端也无「是否VIP」维度可筛。 */}
          <label className="lvip-select">
            <select defaultValue="">
              <option value="">线下VIP：不限</option>
              <option value="yes">线下VIP：是</option>
              <option value="no">线下VIP：不是</option>
            </select>
            <span className="lvip-caret" />
          </label>
          <label className="lvip-select">
            <select
              value={filterServiceStatus}
              onChange={(event) => { setFilterServiceStatus(event.target.value); setPage(1); }}
            >
              <option value="">服务状态：不限</option>
              {VIP_SERVICE_STATUS.filter((o) => o !== "不限").map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <span className="lvip-caret" />
          </label>
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
          <DateRangePicker
            startValue={filterSignStart}
            endValue={filterSignEnd}
            onStartChange={(value) => { setFilterSignStart(value); setPage(1); }}
            onEndChange={(value) => { setFilterSignEnd(value); setPage(1); }}
            className="w-[260px]"
          />
          <div className="lvip-searchbox">
            <label className="lvip-select">
              <select value={searchType} onChange={(event) => setSearchType(event.target.value)}>
                <option>按昵称搜</option>
                <option>按编号搜</option>
                <option>按姓名搜</option>
                <option>按手机搜</option>
                <option>按套餐搜</option>
              </select>
              <span className="lvip-caret" />
            </label>
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
                <th><input type="checkbox" aria-label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((row) => row.id))} /></th>
                {columns.map((col) => {
                  // 表头排序只对后端 COLUMN_SORT_SQL 白名单里的列开放。
                  const sortKey = COLUMN_SORT_KEY[col.title];
                  if (!sortKey) return <th key={col.title}>{col.title}</th>;
                  const active = columnSort === sortKey;
                  return (
                    <th key={col.title}>
                      <button
                        type="button"
                        onClick={() => { setColumnSort(sortKey); setPage(1); }}
                        className={`flex items-center gap-1 ${active ? "text-[#3658f7]" : ""}`}
                        title={`按${col.title}排序`}
                      >
                        {col.title}
                        <span className="text-[10px] text-[#bfbfbf]">{active ? "▼" : "↕"}</span>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1}>
                    <div className="lvip-empty">
                      <Inbox className="lvip-empty-icon" strokeWidth={1.2} />
                      <span>加载中…</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1}>
                    <div className="lvip-empty">
                      <Inbox className="lvip-empty-icon" strokeWidth={1.2} />
                      <span>暂无数据</span>
                    </div>
                  </td>
                </tr>
              ) : rows.map((row) => (
                <tr key={row.id} className={selected.includes(row.id) ? "selected" : undefined}>
                  <td><input type="checkbox" aria-label={`选择线下VIP会员 ${row.id}`} checked={selected.includes(row.id)} onChange={() => setSelected((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])} /></td>
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

        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      </section>

      {tab === "appointment" && (
        <div className="subpage-embed">
          <LoveAppointmentPage />
        </div>
      )}
      {tab === "contract" && (
        <div className="subpage-embed">
          <EContractListPage />
        </div>
      )}

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
                  <button type="button" className="lvip-link" onClick={() => setPackagesOpen((v) => !v)}>
                    套餐管理
                  </button>
                </div>
                {packagesOpen && (
                  <div className="mt-2 rounded border border-[#e5e7eb] bg-[#fafafa] p-3 text-xs">
                    <div className="mb-2 text-[#8c8c8c]">
                      套餐类型取自已有线下VIP记录中出现过的名称，外加系统预置的四档。
                      增删套餐请直接在「线下VIP」列表里新增或编辑记录的套餐类型。
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {options.packages.map((item) => (
                        <span key={item} className="border border-[#d9d9d9] bg-white px-2 py-1">
                          {item}
                          {item === form.packageName ? <b className="ml-1 text-[#3658f7]">当前</b> : null}
                        </span>
                      ))}
                    </div>
                    {options.packages.length === 0 ? <div className="text-[#8c8c8c]">暂无可用套餐</div> : null}
                  </div>
                )}
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
