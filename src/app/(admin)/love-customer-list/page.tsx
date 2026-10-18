"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, FileDown, PackageOpen, Plus, Search } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { CustomerLeadOptions } from "@/lib/admin-endpoints";
import AdminPagination from "@/components/AdminPagination";
import DateRangePicker from "@/components/DateRangePicker";
import {
  FilterSelect,
  FilterMultiSelect,
  RangeSliderFilter,
  RegionCascaderFilter,
} from "@/components/LeadFilterControls";
import MemberQuickProfileDrawer from "@/components/MemberQuickProfileDrawer";

import {
  ACCOUNT_BIND_MODE,
  ACCOUNT_BIND_MODE_VALUE,
  LEAD_AUDIT_STATUS,
  LEAD_EDUCATION,
  LEAD_INTENT_LEVEL,
  LEAD_MARRIAGE,
  LEAD_OCCUPATION,
  LEAD_SOURCE,
  LEAD_TAGS,
  RECORD_ORDER,
  RECORD_ORDER_VALUE,
  WECHAT_ADDED_VALUE,
  XIANGQIN_STATUS_CLOSE,
  XIANGQIN_STATUS_VALUE,
} from "@/lib/filter-options";

type Lead = {
  id: number;
  name: string;
  phone: string | null;
  wechat: string | null;
  source: string;
  intention_level: 1 | 2 | 3;
  status: string;
  audit_status: string;
  matchmaker_id: number | null;
  organization_id: number | null;
  next_follow_at: string | null;
  remark: string | null;
  created_by: number;
  converted_user_id: number | null;
  created_at: string;
};
type Page = {
  items: Lead[];
  page: number;
  page_size: number;
  total: number;
  has_more: boolean;
};
const empty: Page = {
  items: [],
  page: 1,
  page_size: 20,
  total: 0,
  has_more: false,
};
const statuses: Record<string, string> = {
  NEW: "待联系",
  CONTACTED: "已联系",
  INTENDED: "有意向",
  CONVERTED: "已入库",
  LOST: "已弃海",
  CLOSED: "已关闭",
};
const intent = (n: number) => ["", "低", "中", "高"][n] || "-";
/** 原站「客源状态」文案（截图口径）。后端 /customer-leads 目前只认 NEW/CONTACTED/... 枚举，
 *  暂按语义近似映射，待后端补原站枚举后替换 LEAD_STATUS_BY_TEXT 即可。 */
const LEAD_STATUS_BY_TEXT: Record<string, string> = {
  未设置: "NEW",
  找对象中: "CONTACTED",
  接触中: "INTENDED",
  已到门店: "CONVERTED",
  恋爱中: "CONVERTED",
  已结婚: "CLOSED",
};
const leadStatusText = (enumValue: string) =>
  Object.keys(LEAD_STATUS_BY_TEXT).find((key) => LEAD_STATUS_BY_TEXT[key] === enumValue) ?? "";
type QuickRow = { name: string; gender: "男" | "女"; phone: string; wechat: string; desc: string; source: string };
const emptyQuickRow = (): QuickRow => ({ name: "", gender: "男", phone: "", wechat: "", desc: "", source: "" });
const NICK_A = ["爱笑", "温柔", "阳光", "元气", "暖心", "文艺", "俏皮", "知性", "浪漫", "安静"];
const NICK_B = ["小天使", "小星球", "向日葵", "柠檬", "月光", "清风", "小鹿", "星辰", "桃子", "海豚"];
const genNickname = () => `${NICK_A[Math.floor(Math.random() * NICK_A.length)]}${NICK_B[Math.floor(Math.random() * NICK_B.length)]}${Math.floor(Math.random() * 90) + 10}`;
const daysSince = (date: string) => Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
const isToday = (date: string) => {
  const d = new Date(date);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};

type AbandonLogRow = { id: number; lead_id: number; reason: string; abandoned_by: number; abandoned_at: string; restored_by: number | null; restored_at: string | null };
const logFmt = (v: string | null) => (v ? new Date(v).toLocaleString("zh-CN", { hour12: false }) : "-");

export default function Page() {
  const [data, setData] = useState<Page>(empty),
    [loading, setLoading] = useState(true),
    [keyword, setKeyword] = useState(""),
    [status, setStatus] = useState(""),
    [source, setSource] = useState(""),
    [message, setMessage] = useState("");
  const [total, setTotal] = useState(0);
  const [abandonCount, setAbandonCount] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  /** 「更多选项」里有后端参数的 4 项；key 与接口 query 参数同名，界面存中文文案 */
  const [moreFilters, setMoreFilters] = useState<Record<string, string>>({});
  /** 顶部筛选（原站同款自定义下拉） */
  const [filterAudit, setFilterAudit] = useState("");
  const [filterAssign, setFilterAssign] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterStored, setFilterStored] = useState("");
  const [filterPromoter, setFilterPromoter] = useState("");
  /** 更多选项筛选 */
  const [filterIntent, setFilterIntent] = useState("");
  const [filterAge, setFilterAge] = useState<[number, number] | null>(null);
  const [filterHeight, setFilterHeight] = useState<[number, number] | null>(null);
  const [filterOccupation, setFilterOccupation] = useState("");
  const [filterEducation, setFilterEducation] = useState("");
  const [filterHometown, setFilterHometown] = useState("");
  const [filterResidence, setFilterResidence] = useState("");
  const [filterMarriage, setFilterMarriage] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  /** 录入管理员（admin/matchmaker/accounts 实际数据） */
  const [adminNames, setAdminNames] = useState<string[]>([]);
  /** 下拉字典（/customer-leads/options），行内「分派跟进」用它的 matchmakers */
  const [leadOptions, setLeadOptions] = useState<CustomerLeadOptions | null>(null);
  const [viewMode, setViewMode] = useState<"professional" | "simple">("professional");
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [smartOpen, setSmartOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsTab, setStatsTab] = useState<"follow"|"intent"|"source"|"status"|"delta"|"split"|"promoter">("follow");
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [leadTab, setLeadTab] = useState<"list" | "abandon" | "log">("list");
  const [abandonLeads, setAbandonLeads] = useState<Lead[]>([]);
  const [abandonLoading, setAbandonLoading] = useState(false);
  const [logRows, setLogRows] = useState<AbandonLogRow[]>([]);
  const [logLeads, setLogLeads] = useState<Record<number, string>>({});
  const [logLoading, setLogLoading] = useState(false);
  const [logKeyword, setLogKeyword] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [logBy, setLogBy] = useState("");
  const [logFrom, setLogFrom] = useState("");
  const [logTo, setLogTo] = useState("");
  const [logWaitOnly, setLogWaitOnly] = useState(false);
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(20);
  /** 推广红娘筛选：从推广红娘列表的「明细」跳转时由 ?promoter_id= 预填 */
  const [promoterId, setPromoterId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickRows, setQuickRows] = useState<QuickRow[]>([emptyQuickRow()]);
  const [createSource, setCreateSource] = useState("抖音");
  const createNameRef = useRef<HTMLInputElement>(null);
  const createPhoneRef = useRef<HTMLInputElement>(null);
  const createWechatRef = useRef<HTMLInputElement>(null);
  const createDescRef = useRef<HTMLTextAreaElement>(null);
  const [detailMember, setDetailMember] = useState<{ id: number; nickname?: string | null; memberCode?: string | null } | null>(null);
  const router = useRouter();
  const [simpleSetOpen, setSimpleSetOpen] = useState(false);
  const [simpleFields, setSimpleFields] = useState([
    { key: "mark", name: "标记" },
    { key: "id", name: "客源ID" },
    { key: "call", name: "称呼" },
    { key: "name", name: "姓名" },
    { key: "gender", name: "性别" },
    { key: "birth", name: "出生" },
    { key: "marry", name: "婚况" },
    { key: "edu", name: "学历" },
    { key: "height", name: "身高" },
    { key: "job", name: "职业" },
    { key: "source", name: "来源" },
    { key: "enter", name: "录入" },
    { key: "follow", name: "跟进" },
    { key: "status", name: "状态" },
    { key: "audit", name: "审核" },
    { key: "intent", name: "意向" },
    { key: "tag", name: "标签" },
    { key: "inlib", name: "入库状态" },
    { key: "desc", name: "描述" },
    { key: "ops", name: "操作" },
  ]);
  const [fixTop, setFixTop] = useState(0);
  const [fixBottom, setFixBottom] = useState(0);
  const moveSimple = (idx: number, dir: -1 | 1) => {
    setSimpleFields((arr) => {
      const next = [...arr];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return next;
      const tmp = next[idx];
      next[idx] = next[target];
      next[target] = tmp;
      return next;
    });
  };
  const [modal, setModal] = useState<
      "create" | "edit" | "follow" | "assign" | null
    >(null),
    [current, setCurrent] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    wechat: "",
    source: "",
    intention_level: "1",
    remark: "",
    status: "NEW",
    matchmaker_id: "",
    organization_id: "",
    method: "PHONE",
    content: "",
    next_follow_at: "",
  });

  const filterByDate = useCallback(
    (items: Lead[]) => {
      if (!startDate && !endDate) return items;
      const fromTs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : -Infinity;
      const toTs = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Infinity;
      return items.filter((lead) => {
        const t = lead.created_at ? new Date(lead.created_at).getTime() : NaN;
        return Number.isFinite(t) && t >= fromTs && t <= toTs;
      });
    },
    [startDate, endDate],
  );
  const visibleLeads = useMemo(() => filterByDate(data.items), [filterByDate, data.items]);
  /* 弃海客源 Tab 复用专业视图列，数据源换成弃海线索。
     弃海接口（admin/customer-leads/abandoned）不接受 search/status/source 参数，
     筛选必须在前端做，否则筛选区点了没反应。 */
  const filteredAbandonLeads = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return filterByDate(abandonLeads).filter((lead) => {
      if (status && lead.status !== status) return false;
      if (source && lead.source !== source) return false;
      if (kw) {
        const haystack = [lead.name, lead.phone, lead.wechat, lead.remark, String(lead.id)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(kw)) return false;
      }
      return true;
    });
  }, [abandonLeads, keyword, status, source, filterByDate]);
  const tableLeads = leadTab === "abandon" ? filteredAbandonLeads : visibleLeads;
  const effectiveView = leadTab === "abandon" ? "professional" : viewMode;
  const load = useCallback(
    async (page = 1, size = 20) => {
      setLoading(true);
      try {
        const [pageData, stats, abandoned] = await Promise.all([
          adminEndpoints.customerLeads({
            page,
            page_size: size,
            search: keyword || undefined,
            status: status || undefined,
            source: source || undefined,
            // 「分派跟进」选中具体红娘时按 matchmaker_id 过滤（「待分派」后端暂无参数，不传）
            matchmaker_id: filterAssign && /^\d+$/.test(filterAssign) ? filterAssign : undefined,
            // 「更多选项」里已接线的 4 项：中文文案 → 接口枚举，未选则不传该参数
            wechat_added: moreFilters.wechat_added ? WECHAT_ADDED_VALUE[moreFilters.wechat_added] : undefined,
            xiangqin_status: moreFilters.xiangqin_status ? XIANGQIN_STATUS_VALUE[moreFilters.xiangqin_status] : undefined,
            bind_mode: moreFilters.bind_mode ? ACCOUNT_BIND_MODE_VALUE[moreFilters.bind_mode] : undefined,
            order: moreFilters.order ? RECORD_ORDER_VALUE[moreFilters.order] : undefined,
            promoter_id: promoterId ? Number(promoterId) : undefined,
          }),
          adminEndpoints.customerLeadStatistics(),
          adminEndpoints.abandonedCustomerLeads().catch(() => []),
        ]);
        setData(pageData as Page);
        setPageSize(size);
        setTotal((stats as { total: number }).total);
        setAbandonCount((abandoned as unknown[]).length);
        setMessage("");
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    },
    [keyword, status, source, moreFilters, filterAssign, promoterId],
  );
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    void adminEndpoints.customerLeadOptions().then(setLeadOptions).catch(() => setLeadOptions(null));
    // 录入管理员下拉 = 后台账号实际数据
    adminEndpoints
      .adminAccounts({ page: 1, page_size: 100 })
      .then((result) => setAdminNames((result.items ?? []).map((item) => item.display_name || item.username)))
      .catch(() => setAdminNames([]));
  }, []);
  /* 支持 /love-customer-abandon、/love-customer-abandon-log 重定向带来的 tab 参数 */
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab === "abandon" || tab === "log") setLeadTab(tab);
  }, []);
  /* 推广红娘列表的「明细」跳转带 ?promoter_id=，作为初始筛选 */
  useEffect(() => {
    const promoter = new URLSearchParams(window.location.search).get("promoter_id");
    if (promoter) setPromoterId(promoter);
  }, []);
  const loadAbandon = useCallback(async () => {
    setAbandonLoading(true);
    try {
      const rows = (await adminEndpoints.abandonedCustomerLeads()) as { id: number; lead_id: number }[];
      const details = await Promise.all(rows.map((r) => adminEndpoints.customerLead(r.lead_id).catch(() => null)));
      setAbandonLeads(details.filter(Boolean) as unknown as Lead[]);
    } finally {
      setAbandonLoading(false);
    }
  }, []);
  const loadLog = useCallback(async () => {
    setLogLoading(true);
    try {
      const rows = (await adminEndpoints.customerLeadAbandonments()) as AbandonLogRow[];
      const details = await Promise.all(rows.map((r) => adminEndpoints.customerLead(r.lead_id).catch(() => null)));
      const map: Record<number, string> = {};
      details.forEach((l) => { if (l) map[(l as unknown as Lead).id] = (l as unknown as Lead).name; });
      setLogRows(rows);
      setLogLeads(map);
    } finally {
      setLogLoading(false);
    }
  }, []);
  useEffect(() => {
    if (leadTab === "abandon") void loadAbandon();
    if (leadTab === "log") void loadLog();
  }, [leadTab, loadAbandon, loadLog]);
  useEffect(() => {
    const sourceItems = leadTab === "abandon" ? filteredAbandonLeads : visibleLeads;
    const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>(".customer-lead-page table tbody tr"));
    if (effectiveView === "simple") rows.forEach((row) => row.querySelector(".lead-selection-cell")?.remove());
    if (effectiveView === "professional") rows.forEach((row) => { const cell = row.cells[0]; if (cell && !cell.querySelector("input[type=checkbox]")) { const box = document.createElement("input"); box.type = "checkbox"; cell.prepend(box); } if (cell && cell.querySelector("input[type=checkbox]") && !row.querySelector(".lead-selection-cell")) { const box = cell.querySelector("input[type=checkbox]")!; const selectionCell = document.createElement("td"); selectionCell.className = "lead-selection-cell"; selectionCell.appendChild(box); row.insertBefore(selectionCell, cell); } });
    const boxes = Array.from(document.querySelectorAll<HTMLInputElement>(".customer-lead-page table tbody input[type=checkbox]"));
    boxes.forEach((box, index) => { const item = sourceItems[index]; if (item) box.checked = selectedLeadIds.includes(item.id); });
    const handlers = boxes.map((box, index) => { const handler = () => { const item = sourceItems[index]; if (!item) return; setSelectedLeadIds((current) => box.checked ? [...new Set([...current, item.id])] : current.filter((id) => id !== item.id)); }; box.addEventListener("change", handler); return [box, handler] as const; });
    return () => handlers.forEach(([box, handler]) => box.removeEventListener("change", handler));
  }, [selectedLeadIds, data.items, viewMode, leadTab, abandonLeads, effectiveView]);
  const open = (kind: NonNullable<typeof modal>, lead?: Lead) => {
    setCurrent(lead || null);
    setForm(
      lead
        ? {
            name: lead.name,
            phone: lead.phone || "",
            wechat: lead.wechat || "",
            source: lead.source,
            intention_level: String(lead.intention_level),
            remark: lead.remark || "",
            status: lead.status,
            matchmaker_id: lead.matchmaker_id ? String(lead.matchmaker_id) : "",
            organization_id: lead.organization_id
              ? String(lead.organization_id)
              : "",
            method: "PHONE",
            content: "",
            next_follow_at: lead.next_follow_at?.slice(0, 16) || "",
          }
        : {
            name: "",
            phone: "",
            wechat: "",
            source: "",
            intention_level: "1",
            remark: "",
            status: "NEW",
            matchmaker_id: "",
            organization_id: "",
            method: "PHONE",
            content: "",
            next_follow_at: "",
          },
    );
    setModal(kind);
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (modal === "create")
        await adminEndpoints.createCustomerLead({
          name: form.name,
          phone: form.phone || null,
          wechat: form.wechat || null,
          source: form.source,
          intention_level: +form.intention_level,
          remark: form.remark || null,
        });
      if (modal === "edit" && current)
        await adminEndpoints.updateCustomerLead(current.id, {
          name: form.name,
          phone: form.phone || null,
          wechat: form.wechat || null,
          intention_level: +form.intention_level,
          status: form.status,
          remark: form.remark || null,
          next_follow_at: form.next_follow_at || null,
        });
      if (modal === "assign" && current)
        await adminEndpoints.assignCustomerLead(current.id, {
          matchmaker_id: form.matchmaker_id ? +form.matchmaker_id : null,
          organization_id: form.organization_id ? +form.organization_id : null,
        });
      if (modal === "follow" && current)
        await adminEndpoints.createCustomerLeadFollowUp(current.id, {
          method: form.method,
          content: form.content,
          intention_level: +form.intention_level,
          next_follow_at: form.next_follow_at || null,
        });
      setModal(null);
      await load(data.page);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };
  const updateQuickRow = (index: number, patch: Partial<QuickRow>) =>
    setQuickRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const addQuickRow = () => setQuickRows((rows) => (rows.length >= 10 ? rows : [...rows, emptyQuickRow()]));
  const removeQuickRow = (index: number) =>
    setQuickRows((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : [emptyQuickRow()]));
  const submitQuick = async () => {
    if (saving) return;
    const valid = quickRows.filter((r) => r.name.trim() && (r.phone.trim() || r.wechat.trim()));
    if (valid.length === 0) {
      setMessage("每行至少填写称呼，且手机/微信至少填写1个");
      return;
    }
    setSaving(true);
    try {
      for (const row of valid) {
        await adminEndpoints.createCustomerLead({
          name: row.name.trim(),
          phone: row.phone.trim() || null,
          wechat: row.wechat.trim() || null,
          source: row.source || "抖音",
          intention_level: 1,
          remark: row.desc.trim() || null,
        });
      }
      setQuickOpen(false);
      setQuickRows([emptyQuickRow()]);
      setMessage(`成功录入 ${valid.length} 条客源线索`);
      await load(data.page);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };
  const convertLead = async (lead: Lead) => {
    if (!window.confirm(`确定将「${lead.name}」入库到会员CRM吗？`)) return;
    setSaving(true);
    try {
      const result = await adminEndpoints.convertCustomerLead(lead.id, { remark: lead.remark || undefined });
      setDetailMember({ id: result.user_id, nickname: lead.name, memberCode: String(result.user_id) });
      await load(data.page);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "入库失败");
    } finally {
      setSaving(false);
    }
  };
  const submitCreate = async () => {
    if (saving) return;
    const name = createNameRef.current?.value.trim() || "";
    if (!name) {
      setMessage("请填写昵称");
      return;
    }
    setSaving(true);
    try {
      await adminEndpoints.createCustomerLead({
        name,
        phone: createPhoneRef.current?.value.trim() || null,
        wechat: createWechatRef.current?.value.trim() || null,
        source: createSource,
        intention_level: 1,
        remark: createDescRef.current?.value.trim() || null,
      });
      setCreateOpen(false);
      if (createNameRef.current) createNameRef.current.value = "";
      if (createPhoneRef.current) createPhoneRef.current.value = "";
      if (createWechatRef.current) createWechatRef.current.value = "";
      if (createDescRef.current) createDescRef.current.value = "";
      setMessage("客源线索已添加");
      await load(data.page);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };
  const updateField = async (lead: Lead, patch: Record<string, unknown>) => {
    try {
      await adminEndpoints.updateCustomerLead(lead.id, patch);
      await load(data.page);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "更新失败");
    }
  };

  /** 行内「审核」下拉：有效 active / 待核 pending（后端 LeadAuditStatus 只有这两个值） */
  const setAuditStatus = async (lead: Lead, audit_status: string) => {
    if (audit_status === lead.audit_status) return;
    await updateField(lead, { audit_status });
  };

  /** 行内「分派跟进」下拉：选中红娘即调用分配接口（空值=未分派，不提交） */
  const setAssign = async (lead: Lead, value: string) => {
    if (value === (lead.matchmaker_id ? String(lead.matchmaker_id) : "")) return;
    if (!value) {
      setMessage("取消分派请在「分配客源线索」弹窗中操作");
      return;
    }
    try {
      await adminEndpoints.assignCustomerLead(lead.id, { matchmaker_id: Number(value) });
      await load(data.page);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "分派失败");
    }
  };

  /** 行内「分派跟进」单元格；字典为空时只显示当前值，仍可看出分派状态 */
  const assignCell = (x: Lead) => {
    const options = leadOptions?.matchmakers ?? [];
    const current = x.matchmaker_id ? String(x.matchmaker_id) : "";
    return (
      <select className="lead-cell-select" aria-label="分派跟进" value={current} onChange={(event) => void setAssign(x, event.target.value)}>
        <option value="">待分派</option>
        {options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        {current && !options.some((item) => item.value === current) && <option value={current}>红娘 #{current}</option>}
      </select>
    );
  };

  /** 行内「审核」单元格：有效 active / 待核 pending */
  const auditCell = (x: Lead) => (
    <select className="lead-cell-select valid" aria-label="审核状态" value={x.audit_status || "active"} onChange={(event) => void setAuditStatus(x, event.target.value)}>
      <option value="active">有效</option>
      <option value="pending">待核</option>
    </select>
  );

  const abandon = async (lead: Lead) => {
    if (!window.confirm(`确定将「${lead.name}」放入弃海吗？`)) return;
    try {
      await adminEndpoints.abandonCustomerLead(lead.id, "后台管理员放入弃海");
      await load(data.page);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "放入弃海失败");
    }
  };

  /**
   * 批量栏的统一执行器：串行处理选中线索，统计成败后一次性刷新列表。
   * 后端没有批量接口，逐条调用单条接口；单条失败不影响其余线索。
   */
  const runBulk = async (
    label: string,
    action: (lead: Lead) => Promise<unknown>,
    confirmText?: string,
  ) => {
    const targets = visibleLeads.filter((lead) => selectedLeadIds.includes(lead.id));
    if (targets.length === 0) {
      setMessage("请先选择要处理的线索");
      return;
    }
    if (confirmText && !window.confirm(confirmText.replace("{n}", String(targets.length)))) return;
    setSaving(true);
    setMessage("");
    let ok = 0;
    const failures: string[] = [];
    for (const lead of targets) {
      try {
        await action(lead);
        ok += 1;
      } catch (err) {
        failures.push(`${lead.name}：${err instanceof Error ? err.message : "失败"}`);
      }
    }
    setSaving(false);
    setSelectedLeadIds([]);
    await load(data.page);
    setMessage(
      failures.length === 0
        ? `已${label} ${ok} 条`
        : `${label}成功 ${ok} 条，失败 ${failures.length} 条（${failures.slice(0, 3).join("；")}）`,
    );
  };

  const bulkAssign = async (field: "replace_assign" | "replace_promoter", raw: string) => {
    if (!raw) return;
    const id = Number(raw);
    if (!Number.isFinite(id) || id <= 0) {
      setMessage("请选择有效的红娘");
      return;
    }
    await runBulk(field === "replace_assign" ? "更换分派" : "更换推广红娘", (lead) =>
      field === "replace_assign"
        ? adminEndpoints.assignCustomerLead(lead.id, { matchmaker_id: id })
        : adminEndpoints.updateCustomerLead(lead.id, { promoter_id: id }),
    );
  };

  /** 批量打标签：弹窗输入（逗号分隔），追加到选中线索，不清空原有标签。 */
  const bulkAssignTags = async () => {
    const raw = window.prompt("输入要追加的标签，多个用英文逗号分隔", "");
    if (raw === null) return;
    const tags = raw.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length === 0) {
      setMessage("请输入至少一个标签");
      return;
    }
    await runBulk("打标签", (lead) => adminEndpoints.updateCustomerLead(lead.id, { tags }));
  };

  const exportCsv = () => {
    /* 导出当前可见行：弃海 Tab 导出的是弃海线索（含已应用的筛选），而非线索管理列表 */
    const csv = [
      "客源ID,称呼,手机,微信,来源,意向,状态",
      ...tableLeads.map((x) =>
        [
          x.id,
          x.name,
          x.phone || "",
          x.wechat || "",
          x.source,
          intent(x.intention_level),
          statuses[x.status] || x.status,
        ]
          .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
          .join(","),
      ),
    ].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv" }),
    );
    link.download = "客源线索.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  /* 弃海记录：前端过滤（放弃红娘/日期/关键字/待捞取） */
  const filteredLogRows = useMemo(() => {
    const kw = logSearch.trim().toLowerCase();
    const fromTs = logFrom ? new Date(`${logFrom}T00:00:00`).getTime() : -Infinity;
    const toTs = logTo ? new Date(`${logTo}T23:59:59`).getTime() : Infinity;
    return logRows.filter((row) => {
      if (logWaitOnly && row.restored_at) return false;
      if (logBy && String(row.abandoned_by) !== logBy) return false;
      const ts = new Date(row.abandoned_at).getTime();
      if (ts < fromTs || ts > toTs) return false;
      if (kw && !(logLeads[row.lead_id] || "").toLowerCase().includes(kw)) return false;
      return true;
    });
  }, [logRows, logLeads, logSearch, logBy, logFrom, logTo, logWaitOnly]);
  const logWaitCount = useMemo(() => logRows.filter((row) => !row.restored_at).length, [logRows]);
  const pagedLogRows = useMemo(() => filteredLogRows.slice((logPage - 1) * logPageSize, logPage * logPageSize), [filteredLogRows, logPage, logPageSize]);
  return (
    <div className="customer-lead-page">
      <AdminBreadcrumb items={getBreadcrumb("客源线索", leadTab === "list" ? "线索管理" : leadTab === "abandon" ? "弃海客源" : "弃海记录")} />
      <section className="customer-notice mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]">
        <h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2>
        <span>
          客源线索（简称“线索库”）是指您广泛通过各种渠道获取到的单身潜在客户简单信息以快速便捷的形式收集汇总到“线索管理”中，分派给红娘进行销售跟进，并丰富完善更多信息。
        </span>
        <br />
        <span>
          根据业务进展情况可将客源线索一键入库转入到会员资料库（会员CRM）中，系统会自动生成账号；新账号通过手机号验证码登录。
        </span>
        <br />
        <span>
          已入库到“会员CRM”的客户线索在本页面中仅做记录查询，请在会员资料中管理，本页不再提供编辑和任何操作；删除客源记录不影响会员资料中的数据。
        </span>
      </section>
      <section className="bg-white px-5 pt-4">
        <div className="lead-tabs flex items-center justify-between border-b">
          <div>
            <button type="button" className={leadTab === "list" ? "active" : ""} onClick={() => setLeadTab("list")}>
              线索管理
            </button>
            <button type="button" className={leadTab === "abandon" ? "active" : ""} onClick={() => setLeadTab("abandon")}>
              弃海客源({abandonCount})
            </button>
            <button type="button" className={leadTab === "log" ? "active" : ""} onClick={() => setLeadTab("log")}>
              弃海记录
            </button>
          </div>
          <div className="flex gap-2 pb-3" style={leadTab === "log" ? { display: "none" } : undefined}>
            <div className="lead-add-wrap" onMouseEnter={() => setAddMenuOpen(true)} onMouseLeave={() => setAddMenuOpen(false)}>
              <button
                onClick={() => setModal("create")}
                className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white"
              >
                <Plus size={15} />
                添加客源
              </button>
              {addMenuOpen && (
                <div className="lead-add-menu">
                  <button type="button" className="lead-add-menu-item" onClick={() => { setCreateOpen(true); setAddMenuOpen(false); }}>单条录入</button>
                  <button type="button" className="lead-add-menu-item" onClick={() => { setQuickRows([emptyQuickRow()]); setQuickOpen(true); setAddMenuOpen(false); }}>10条快录</button>
                  <button type="button" className="lead-add-menu-item" onClick={() => { router.push("/love-customer-batch-import"); setAddMenuOpen(false); }}>批量导入</button>
                </div>
              )}
            </div>
            <button onClick={() => setModal("create")} className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white">▣ 智能录入</button>
            <button onClick={() => setStatsOpen(true)} className="flex items-center gap-1 whitespace-nowrap rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white"><BarChart3 size={15} />数据报表</button>
            <button onClick={exportCsv} className="flex items-center gap-1 rounded bg-[#3658f7] px-3 py-1.5 text-sm text-white"><FileDown size={15} />导出EXCEL</button>
          </div>
        </div>
        <div className="lead-filter-grid grid gap-2.5 pt-4 md:grid-cols-4" style={leadTab === "log" ? { display: "none" } : undefined}>
          <FilterSelect label="审核状态" options={[...LEAD_AUDIT_STATUS]} value={filterAudit} onChange={setFilterAudit} />
          <FilterSelect
            label="分派跟进"
            options={["待分派", ...(leadOptions?.matchmakers ?? []).map((item) => ({ value: item.value, label: item.label }))]}
            value={filterAssign}
            onChange={setFilterAssign}
          />
          <FilterSelect label="客源状态" options={Object.keys(LEAD_STATUS_BY_TEXT)} value={leadStatusText(status)} onChange={(text) => setStatus(LEAD_STATUS_BY_TEXT[text] ?? "")} />
          <FilterSelect
            label="录入红娘"
            options={(leadOptions?.matchmakers ?? []).map((item) => ({ value: item.value, label: item.label }))}
          />
          <FilterSelect
            label="推广红娘"
            options={(leadOptions?.promoters ?? []).map((item) => ({ value: item.value, label: item.label }))}
            value={filterPromoter}
            onChange={setFilterPromoter}
          />
          <FilterSelect label="录入管理员" options={adminNames} />
          <FilterSelect label="客户来源" options={[...LEAD_SOURCE]} value={source} onChange={setSource} />
          <FilterSelect label="客户意向" options={[...LEAD_INTENT_LEVEL]} value={filterIntent} onChange={setFilterIntent} />
          <button className="lead-more-filters" onClick={() => setShowMoreFilters((value) => !value)}>{showMoreFilters ? "收起选项" : "更多选项"}<span className="lead-chevron" /></button>
        </div>
        {showMoreFilters && leadTab !== "log" && <div className="lead-extra-filters">
          <FilterSelect label="客户性别" options={["男", "女"]} value={filterGender} onChange={setFilterGender} />
          <RangeSliderFilter label="年龄" min={18} max={80} unit="岁" value={filterAge} onChange={setFilterAge} />
          <RangeSliderFilter label="身高" min={140} max={220} unit="cm" value={filterHeight} onChange={setFilterHeight} />
          <FilterSelect label="职业" options={[...LEAD_OCCUPATION]} value={filterOccupation} onChange={setFilterOccupation} />
          <FilterSelect label="学历" options={[...LEAD_EDUCATION]} value={filterEducation} onChange={setFilterEducation} />
          <RegionCascaderFilter label="家乡" value={filterHometown} onChange={setFilterHometown} />
          <RegionCascaderFilter label="现居" value={filterResidence} onChange={setFilterResidence} />
          <FilterSelect label="婚况" options={[...LEAD_MARRIAGE]} value={filterMarriage} onChange={setFilterMarriage} />
          <FilterMultiSelect
            label="标签"
            options={[...LEAD_TAGS]}
            value={filterTags}
            onChange={setFilterTags}
            className="lead-span2"
          />
          <FilterSelect label="入库情况" options={["已入库", "未入库"]} value={filterStored} onChange={setFilterStored} />
          <FilterSelect
            label="加上了吗"
            options={["未添加", "已加上", "没加上"]}
            value={moreFilters.wechat_added ?? ""}
            onChange={(v) => setMoreFilters((current) => ({ ...current, wechat_added: v }))}
          />
          <FilterSelect
            label="相亲状态"
            options={[...XIANGQIN_STATUS_CLOSE]}
            value={moreFilters.xiangqin_status ?? ""}
            onChange={(v) => setMoreFilters((current) => ({ ...current, xiangqin_status: v }))}
          />
          <FilterSelect
            label="落户方式"
            options={[...ACCOUNT_BIND_MODE]}
            value={moreFilters.bind_mode ?? ""}
            onChange={(v) => setMoreFilters((current) => ({ ...current, bind_mode: v }))}
          />
          <FilterSelect
            label="记录排序"
            options={[...RECORD_ORDER]}
            value={moreFilters.order ?? ""}
            onChange={(v) => setMoreFilters((current) => ({ ...current, order: v }))}
          />
          <div className="lead-date-ranges">
            <DateRangePicker label="录" startValue={startDate} endValue={endDate} onStartChange={setStartDate} onEndChange={setEndDate} className="w-full" />
            <DateRangePicker label="派" startValue={assignStartDate} endValue={assignEndDate} onStartChange={setAssignStartDate} onEndChange={setAssignEndDate} className="w-full" />
          </div>
          <label><input type="checkbox" /> 隐藏今日已跟进</label><label><input type="checkbox" /> 隐藏今日已通话</label><label><input type="checkbox" /> 有电话</label><label><input type="checkbox" /> 有微信</label>
        </div>}
        <div className="lead-search-row flex flex-wrap items-end gap-3 py-4" style={leadTab === "log" ? { display: "none" } : undefined}>
          <div className="flex items-end">
            <select
              className="h-10 rounded border border-r-0 border-[#ddd] bg-white px-3 text-sm text-[#9aa1ad]"
              aria-label="搜索类型"
            >
              <option>智能搜索</option>
              <option>按昵称</option>
              <option>按手机</option>
              <option>按微信搜</option>
              <option>按编号搜</option>
            </select>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="请输入称呼/微信号/手机号/ID" className="h-10 w-[350px] rounded border border-[#ddd] px-3 text-sm placeholder:text-[#b4bac5]" />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => { if (leadTab === "abandon") void loadAbandon(); else void load(); }}
              className="flex h-10 items-center gap-1 rounded bg-[#3658f7] px-5 text-sm text-white"
            >
              <Search size={14} />
              搜索
            </button>
            <button
              onClick={() => {
                setKeyword("");
                setStatus("");
                setSource("");
                setPromoterId("");
              }}
              className="h-10 rounded border px-4 text-sm"
            >
              重置
            </button>
          </div>
          <select
            value={moreFilters.order ?? ""}
            onChange={(e) => setMoreFilters((current) => ({ ...current, order: e.target.value }))}
            className="h-10 rounded border border-[#ddd] bg-white px-3 text-sm text-[#9aa1ad]"
            aria-label="记录排序"
          >
            <option value="">排序：不限</option>
            <option value="最新记录显示在前面">排序：最新记录</option>
            <option value="最早记录显示在前面">排序：最早记录</option>
            <option value="智能匹配">排序：智能匹配</option>
          </select>
          <div className="lead-mode-switch">{viewMode === "simple" && <button className="lead-settings" aria-label="简洁模式设置" onClick={() => setSimpleSetOpen(true)}>⚙</button>}<button className={viewMode === "simple" ? "active" : ""} onClick={() => setViewMode("simple")}>简洁</button><button className={viewMode === "professional" ? "active" : ""} onClick={() => setViewMode("professional")}>专业</button></div>
        </div>
        <div className="lead-metrics-grid grid grid-cols-2 gap-3 md:grid-cols-6" style={leadTab === "list" ? undefined : { display: "none" }}>
          {[
            ["全部", visibleLeads.length],
            ["未分派", visibleLeads.filter((x) => !x.matchmaker_id).length],
            ["今日跟进", visibleLeads.filter((x) => x.next_follow_at && isToday(x.next_follow_at)).length],
            ["从未跟进", visibleLeads.filter((x) => !x.next_follow_at).length],
            ["超3天未跟进", visibleLeads.filter((x) => !x.next_follow_at && daysSince(x.created_at) > 3).length],
            ["今日需跟进", visibleLeads.filter((x) => x.next_follow_at && isToday(x.next_follow_at)).length],
          ].map(([n, c]) => (
            <div key={String(n)} className={`lead-metric-card ${n === "全部" ? "selected" : ""}`}>
              <div className="text-xs text-[#888]">{n}</div>
              <div className="mt-1 text-xl">{String(c)}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="overflow-x-auto bg-white" style={leadTab === "log" ? { display: "none" } : undefined}>
        <table className="w-full min-w-[1580px] text-sm">
          <thead className="bg-[#fafafa] text-[#666]">
            <tr>
              {(effectiveView === "simple" ? ["", "标记", "客源ID", "称呼", "姓名", "性别", "出生", "婚况", "学历", "身高", "职业", "来源", "录入", "跟进", "状态", "审核", "意向", "标签", "入库状态", "描述", "操作"] : ["", "客源ID", "资料", "客户意向", "来源", "审核", "录入人", "状态", "分派跟进", "跟进", "通话", "入库状态", "操作"]).map((x, index) => (
                <th
                  key={x}
                  className="border-b px-3 py-3 text-left font-normal"
                >
                  {index === 0 ? <input type="checkbox" aria-label="全选线索" checked={tableLeads.length > 0 && selectedLeadIds.length === tableLeads.length} onChange={(event) => setSelectedLeadIds(event.target.checked ? tableLeads.map((item) => item.id) : [])} /> : x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={effectiveView === "simple" ? "lead-simple-body" : "lead-professional-body"}>
            {(leadTab === "abandon" ? abandonLoading : loading) ? (
              <tr>
                <td colSpan={12} className="p-10 text-center text-[#999]">
                  加载中...
                </td>
              </tr>
            ) : tableLeads.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-10 text-center text-[#999]">
                  {leadTab === "abandon" ? <>暂无数据</> : <>暂无客源线索</>}
                </td>
              </tr>
            ) : (
              tableLeads.map((x) => (
                <tr
                  key={x.id}
                  className="border-b align-top hover:bg-[#fafcff]"
                >
                  {effectiveView === "simple" ? <><td className="px-3 py-3"><input type="checkbox" /></td><td className="px-3 py-3">-</td><td className="px-3 py-3 text-[#3658f7]">{x.id}</td><td className="px-3 py-3">{x.name || "-"}</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">-</td><td className="px-3 py-3">{x.source || "-"}</td><td className="px-3 py-3 text-xs">账号 #{x.created_by}<br />{new Date(x.created_at).toLocaleString("zh-CN")}</td><td className="px-3 py-3">{assignCell(x)}</td><td className="px-3 py-3"><select className="lead-cell-select" defaultValue={x.phone || x.wechat ? "已填写" : "未设置"}><option>未设置</option><option>已填写</option></select></td><td className="px-3 py-3">{auditCell(x)}</td><td className="px-3 py-3"><select className="lead-cell-select" value={String(x.intention_level)} onChange={(event) => void updateField(x, { intention_level: Number(event.target.value) })}><option value="1">低意向</option><option value="2">中意向</option><option value="3">高意向</option></select></td><td className="px-3 py-3"><span className="simple-tag">-</span></td><td className="px-3 py-3"><span className={x.converted_user_id ? "simple-converted" : "simple-not-converted"}>{x.converted_user_id ? "已入库" : "未入库"}</span>{x.converted_user_id && <small className="block">#{x.converted_user_id}</small>}</td><td className="px-3 py-3">{x.remark || "-"}</td><td className="px-3 py-3"><button onClick={() => open("edit", x)}>编辑</button><button onClick={() => open("edit", x)}>详情</button><button onClick={() => open("follow", x)}>跟进</button><button onClick={() => void abandon(x)}>放入弃海</button></td></> : <><td className="px-3 py-3 text-[#3658f7]">{x.id}</td>
                  <td className="px-3 py-3">
                    <div className="lead-profile"><div className="lead-avatar">#{x.id}</div><div><b>{x.name || "-"}</b>{x.phone && <span className="lead-tag">有电话</span>}{x.wechat && <span className="lead-tag">有微信</span>}</div></div>
                    <div className="lead-actions"><button onClick={() => open("edit", x)}>基本资料</button><button onClick={() => open("edit", x)}>择偶要求</button><button onClick={() => open("follow", x)}>跟进信息</button><button onClick={() => open("edit", x)} className="lead-more-button">更多</button></div>
                  </td>
                  <td className="px-3 py-3"><select className="lead-cell-select" value={String(x.intention_level)} onChange={(event) => void updateField(x, { intention_level: Number(event.target.value) })}><option value="1">低意向</option><option value="2">中意向</option><option value="3">高意向</option></select></td>
                  <td className="px-3 py-3">{x.source || "-"}</td>
                  <td className="px-3 py-3">{auditCell(x)}</td>
                  <td className="px-3 py-3 text-xs">
                    账号 #{x.created_by}
                    <br />
                    <span className="text-[#777]">#{x.created_by}</span>
                    <br />
                    <span className="text-[#999]">
                      {new Date(x.created_at).toLocaleString("zh-CN")}
                    </span>
                  </td>
                  <td className="px-3 py-3"><select className="lead-cell-select" value={x.status} onChange={(event) => void updateField(x, { status: event.target.value })}><option value="NEW">待联系</option><option value="CONTACTED">已联系</option><option value="INTENDED">有意向</option><option value="CONVERTED">已入库</option><option value="LOST">已弃海</option><option value="CLOSED">已关闭</option></select></td>
                  <td className="px-3 py-3">{assignCell(x)}</td>
                  <td className="px-3 py-3 text-xs text-[#777]">
                    <div>从未跟进</div>
                    <div className="text-[#ff7a21]">{daysSince(x.created_at)}天<span className="text-[#777]">未跟进</span></div>
                    <button onClick={() => void abandon(x)} className="mt-1 text-[#3658f7]">放入弃海</button>
                  </td>
                  <td className="px-3 py-3 text-[#999]">从未通话</td>
                  <td className="px-3 py-3">
                    {x.converted_user_id ? (
                      <span className="text-[#37a35b]">
                        已入库
                        <br />#{x.converted_user_id}
                      </span>
                    ) : (
                      <span>未入库</span>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-[#3658f7]"><button onClick={() => x.converted_user_id ? setDetailMember({ id: x.converted_user_id, nickname: x.name, memberCode: String(x.converted_user_id) }) : void convertLead(x)}>{x.converted_user_id ? "查看会员" : "一键入库"}</button></td></>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {leadTab === "list" && selectedLeadIds.length > 0 && (
        <div className="lead-bulk-toolbar">
          <span>已选择 <b>{selectedLeadIds.length}</b> 项</span>
          <select
            value=""
            disabled={saving}
            onChange={(e) => { const v = e.target.value; e.target.value = ""; void bulkAssign("replace_assign", v); }}
            aria-label="批量更换分派跟进"
          >
            <option value="">更换分派跟进</option>
            {leadOptions?.matchmakers.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <select
            value=""
            disabled={saving}
            onChange={(e) => { const v = e.target.value; e.target.value = ""; void bulkAssign("replace_promoter", v); }}
            aria-label="批量更换推广红娘"
          >
            <option value="">更换推广红娘</option>
            {leadOptions?.promoters.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <button type="button" disabled={saving} onClick={() => void runBulk("设为有效", (lead) => adminEndpoints.updateCustomerLead(lead.id, { audit_status: "active" }))}>有效</button>
          <button type="button" disabled={saving} onClick={() => void runBulk("设为待核", (lead) => adminEndpoints.updateCustomerLead(lead.id, { audit_status: "pending" }))}>待核</button>
          {/* 后端审核状态只有 active/pending；「无效」对应线索状态 CLOSED */}
          <button type="button" disabled={saving} onClick={() => void runBulk("设为无效", (lead) => adminEndpoints.updateCustomerLead(lead.id, { audit_status: "active", status: "CLOSED" }), "确定将选中的 {n} 条线索设为无效（关闭）吗？")}>无效</button>
          <button type="button" disabled={saving} onClick={() => void bulkAssignTags()}>打标签</button>
          <button type="button" disabled title="后端没有删除客源线索的接口，只能弃海">批量删除</button>
          <button type="button" disabled={saving} onClick={() => void runBulk("放入弃海", (lead) => adminEndpoints.abandonCustomerLead(lead.id, "后台批量放入弃海"), "确定将选中的 {n} 条线索放入弃海吗？")}>批量弃海</button>
          <button type="button" disabled={saving} onClick={() => void runBulk("入库", (lead) => adminEndpoints.convertCustomerLead(lead.id, { remark: lead.remark || undefined }), "确定将选中的 {n} 条线索入库到会员CRM吗？")}>批量入库</button>
          <button type="button" disabled={saving} onClick={() => setSelectedLeadIds([])}>取消选择</button>
        </div>
      )}
      {leadTab === "list" && message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      {leadTab === "list" && (
        <AdminPagination
          page={data.page}
          pageSize={data.page_size}
          total={data.total}
          onPageChange={(p) => void load(p, data.page_size)}
          onPageSizeChange={(size) => void load(1, size)}
        />
      )}

      {leadTab === "log" && (
        <section className="admin-card overflow-hidden pt-4">
          <div className="flex flex-wrap items-center gap-3 px-8 py-5">
            <select className="h-10 w-56 rounded border px-3 text-sm" value={logBy} onChange={(event) => { setLogBy(event.target.value); setLogPage(1); }}>
              <option value="">放弃红娘：不限</option>
              {Array.from(new Set(logRows.map((row) => row.abandoned_by))).map((id) => <option key={id} value={id}>账号 #{id}</option>)}
            </select>
            <DateRangePicker
              className="w-80"
              startValue={logFrom}
              endValue={logTo}
              onStartChange={(value) => { setLogFrom(value); setLogPage(1); }}
              onEndChange={(value) => { setLogTo(value); setLogPage(1); }}
            />
            <div className="flex h-10 min-w-[280px] flex-1">
              <input value={logKeyword} onChange={(event) => setLogKeyword(event.target.value)} placeholder="请输入会员昵称/手机/姓名/编号" className="min-w-0 flex-1 rounded-l border border-r-0 px-3 text-sm" />
              <button type="button" onClick={() => { setLogSearch(logKeyword); setLogPage(1); }} className="flex w-20 items-center justify-center gap-1 rounded-r bg-[#3658f7] text-sm text-white"><Search size={15} />搜索</button>
            </div>
            <label className="whitespace-nowrap text-sm"><input type="checkbox" checked={logWaitOnly} onChange={(event) => { setLogWaitOnly(event.target.checked); setLogPage(1); }} /> 待捞取/分派</label>
            <span className="ml-auto whitespace-nowrap text-sm">共有弃海记录：<b className="text-[#3658f7]">{filteredLogRows.length}条</b>　待捞取/分派：<b className="text-[#3658f7]">{logWaitCount}条</b></span>
          </div>
          <div className="overflow-x-auto px-8">
            <table className="w-full min-w-[1100px] table-fixed text-sm">
              <thead>
                <tr>
                  {["记录ID", "客源ID", "资料", "放弃人", "放弃类型", "放弃原因", "弃海时间", "分派状态（捞取人）", "捞取/分派时间"].map((x) => (
                    <th key={x} className="border-b bg-[#fafafa] px-3 py-3 text-left font-normal">{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logLoading ? (
                  <tr><td colSpan={9} className="h-52 text-center text-[#999]">加载中...</td></tr>
                ) : pagedLogRows.length === 0 ? (
                  <tr><td colSpan={9} className="h-52 text-center text-[#999]"><PackageOpen className="mx-auto mb-2" />暂无数据</td></tr>
                ) : pagedLogRows.map((x) => (
                  <tr key={x.id} className="border-b">
                    <td className="px-3 py-3">{x.id}</td>
                    <td className="px-3 py-3 text-[#3658f7]">{x.lead_id}</td>
                    <td className="px-3 py-3">{logLeads[x.lead_id] || "-"}</td>
                    <td className="px-3 py-3">服务红娘<br />账号 #{x.abandoned_by}</td>
                    <td className="px-3 py-3">主动放弃</td>
                    <td className="px-3 py-3">{x.reason || "-"}</td>
                    <td className="px-3 py-3">{logFmt(x.abandoned_at)}</td>
                    <td className="px-3 py-3">{x.restored_at ? <>已分派/被捞取<br /><span className="text-xs text-[#999]">账号 #{x.restored_by}</span></> : "未分派"}</td>
                    <td className="px-3 py-3">{logFmt(x.restored_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination page={logPage} pageSize={logPageSize} total={filteredLogRows.length} onPageChange={setLogPage} onPageSizeChange={(size) => { setLogPageSize(size); setLogPage(1); }} />
        </section>
      )}
      {simpleSetOpen && (
        <div className="lc-set-mask" onClick={() => setSimpleSetOpen(false)}>
          <div className="lc-set-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="lc-set-head">
              <div className="flex items-center gap-2"><span className="lc-create-head-x" onClick={() => setSimpleSetOpen(false)}>✕</span><h2>列表设置</h2></div>
              <div className="lc-set-head-actions">
                <button type="button" className="lc-set-cancel" onClick={() => setSimpleSetOpen(false)}>取消</button>
                <button type="button" className="lc-set-submit">确定提交</button>
              </div>
            </div>
            <div className="lc-set-body">
              <div className="lc-set-tip">
                <span>勾选要显示的列，并可以任意排序</span>
                <span className="lc-set-fix"><span className="lc-set-fix-label">固定前</span><select value={fixTop} onChange={(e) => setFixTop(Number(e.target.value))}>{Array.from({ length: 6 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select><span className="lc-set-fix-label">列</span></span>
                <span className="lc-set-fix"><span className="lc-set-fix-label">固定后</span><select value={fixBottom} onChange={(e) => setFixBottom(Number(e.target.value))}>{Array.from({ length: 6 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select><span className="lc-set-fix-label">列</span></span>
              </div>
              <table className="lc-set-table">
                <thead><tr><th className="check-cell">是否显示</th><th className="name-cell">字段名称</th><th className="sort-cell">排序</th></tr></thead>
                <tbody>
                  {simpleFields.map((f, idx) => (
                    <tr key={f.key}>
                      <td className="check-cell"><input type="checkbox" defaultChecked /></td>
                      <td className="name-cell">{f.name}</td>
                      <td className="sort-cell">
                        <button type="button" className="move" disabled={idx === 0} onClick={() => moveSimple(idx, -1)}>前移</button>
                        <button type="button" className="move" disabled={idx === simpleFields.length - 1} onClick={() => moveSimple(idx, 1)}>后移</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {quickOpen && (
        <div className="lc-quick-mask" onClick={() => setQuickOpen(false)}>
          <div className="lc-quick-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="lc-quick-head">
              <div className="flex items-center gap-2"><span className="lc-create-head-x" onClick={() => setQuickOpen(false)}>✕</span><h2>极速录入</h2></div>
              <div className="lc-quick-head-actions">
                <button type="button" className="lc-quick-cancel" onClick={() => setQuickOpen(false)}>取消</button>
                <button type="button" className="lc-quick-submit" disabled={saving} onClick={() => void submitQuick()}>{saving ? "提交中..." : "确定提交"}</button>
              </div>
            </div>
            <div className="lc-quick-body">
              <div className="lc-quick-notice"><div className="lc-quick-notice-title">💡 须知</div><div>可以一次性极速录入10条客源线索</div></div>
              {quickRows.map((row, index) => (
                <div className="lc-quick-row" key={index}>
                  <div className="lc-quick-cell"><input className="w-name" placeholder="请输入" value={row.name} onChange={(e) => updateQuickRow(index, { name: e.target.value })} /></div>
                  <div className="lc-quick-cell"><button type="button" className="lc-quick-auto" onClick={() => updateQuickRow(index, { name: genNickname() })}>自动生成</button></div>
                  <div className="lc-quick-cell lc-quick-gender"><label><input type="radio" name={`lc-q-g-${index}`} checked={row.gender === "男"} onChange={() => updateQuickRow(index, { gender: "男" })} />男</label><label><input type="radio" name={`lc-q-g-${index}`} checked={row.gender === "女"} onChange={() => updateQuickRow(index, { gender: "女" })} />女</label></div>
                  <div className="lc-quick-cell"><input className="w-mobile" placeholder="手机和微信至少填写1个" value={row.phone} onChange={(e) => updateQuickRow(index, { phone: e.target.value })} /></div>
                  <div className="lc-quick-cell"><input className="w-wechat" placeholder="手机和微信至少填写1个" value={row.wechat} onChange={(e) => updateQuickRow(index, { wechat: e.target.value })} /></div>
                  <div className="lc-quick-cell"><input className="w-desc" placeholder="请输入描述" value={row.desc} onChange={(e) => updateQuickRow(index, { desc: e.target.value })} /></div>
                  <div className="lc-quick-cell"><select className="w-source" value={row.source} onChange={(e) => updateQuickRow(index, { source: e.target.value })}><option value="" disabled>线索来源</option>{["抖音","微信群","本地群","朋友圈","落地页"].map((x) => <option key={x}>{x}</option>)}</select></div>
                  <div className="lc-quick-cell"><button type="button" className="lc-quick-del" onClick={() => removeQuickRow(index)}>删除</button></div>
                </div>
              ))}
              <button type="button" className="lc-quick-add" onClick={addQuickRow} disabled={quickRows.length >= 10}>+ 再加一条{quickRows.length >= 10 ? "（已达10条上限）" : ""}</button>
            </div>
          </div>
        </div>
      )}
      {createOpen && (
        <div className="lc-create-mask" onClick={() => setCreateOpen(false)}>
          <div className="lc-create-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="lc-create-head">
              <div className="flex items-center gap-2"><span className="lc-create-head-x" onClick={() => setCreateOpen(false)}>✕</span><h2>添加客源线索</h2></div>
            </div>
            <div className="lc-create-body">
              <div className="lc-create-form">
                <div className="lc-create-chips">
                  <span className="lc-create-field-label" style={{ minWidth: 40 }}>来源</span>
                  {["抖音","微信群","本地群","身边朋友","同行群","朋友圈","朋友介绍","QQ","其他渠道","落地页"].map((label) => (
                    <label key={label} className={"lc-create-chip" + (createSource === label ? " active" : "")}><input type="radio" name="lc-create-source" checked={createSource === label} onChange={() => setCreateSource(label)} />{label}</label>
                  ))}
                  <span className="lc-create-chip-mgr">管理来源</span>
                </div>
                <div className="lc-create-chips">
                  <span className="lc-create-field-label" style={{ minWidth: 40 }}>标签</span>
                  {["高颜值","高收入","985毕业","211毕业","事业单位","双一流","海归","身材好","博士","央企企","银行金融","公务员"].map((label) => (
                    <label key={label} className="lc-create-chip"><input type="checkbox" />{label}</label>
                  ))}
                  <span className="lc-create-chip-mgr">管理标签</span>
                </div>
                <div className="lc-create-row">
                  <div className="lc-create-field"><div className="lc-create-field-label">手机</div><input ref={createPhoneRef} placeholder="请输入手机号" /></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">微信</div><input ref={createWechatRef} placeholder="请输入微信号" /></div>
                  <div className="lc-create-field"><div className="lc-create-field-label"><span className="req">*</span>昵称</div><div className="lc-create-field-with-btn"><input ref={createNameRef} placeholder="请输入" /><button type="button" className="lc-create-auto-btn" onClick={() => { if (createNameRef.current) createNameRef.current.value = genNickname(); }}>自动生成</button></div></div>
                </div>
                <div className="lc-create-row">
                  <div className="lc-create-field"><div className="lc-create-field-label">性别</div><div className="lc-create-radio-inline"><label><input type="radio" name="lc-create-gender" defaultChecked />男</label><label><input type="radio" name="lc-create-gender" />女</label></div></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">姓名</div><input placeholder="请输入姓名" /></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">出生</div><input type="date" placeholder="请选择出生日期" defaultValue="1990-01-01" /></div>
                </div>
                <div className="lc-create-row">
                  <div className="lc-create-field"><div className="lc-create-field-label">婚况</div><select defaultValue=""><option value="" disabled>请选择婚况</option>{["未婚","离异","丧偶"].map((x) => <option key={x}>{x}</option>)}</select></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">职业</div><select defaultValue=""><option value="" disabled>请选择职业</option></select></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">收入</div><select defaultValue=""><option value="" disabled>请选择收入</option></select></div>
                </div>
                <div className="lc-create-row">
                  <div className="lc-create-field"><div className="lc-create-field-label">身高</div><div className="lc-create-input-with-unit"><input placeholder="请输入身高" /><span className="lc-create-input-unit">cm</span></div></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">体重</div><div className="lc-create-input-with-unit"><input placeholder="请输入体重" /><span className="lc-create-input-unit">kg</span></div></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">学历</div><select defaultValue=""><option value="" disabled>请选择学历</option>{["高中","大专","本科","硕士","博士"].map((x) => <option key={x}>{x}</option>)}</select></div>
                </div>
                <div className="lc-create-row">
                  <div className="lc-create-field"><div className="lc-create-field-label">家乡</div><select defaultValue="江苏省/南京市"><option>江苏省/南京市</option></select></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">现居</div><select defaultValue="江苏省/南京市"><option>江苏省/南京市</option></select></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">购房</div><select defaultValue=""><option value="" disabled>请选择购房</option></select></div>
                </div>
                <div className="lc-create-row">
                  <div className="lc-create-field"><div className="lc-create-field-label">购车</div><select defaultValue=""><option value="" disabled>请选择购车</option></select></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">吸烟</div><select defaultValue=""><option value="" disabled>请选择吸烟</option></select></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">喝酒</div><select defaultValue=""><option value="" disabled>请选择喝酒</option></select></div>
                </div>
                <div className="lc-create-row">
                  <div className="lc-create-field"><div className="lc-create-field-label">民族</div><select defaultValue=""><option value="" disabled>请选择民族</option></select></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">学校</div><div className="lc-create-field-with-btn"><input placeholder="填写毕业学校" /><span className="lc-create-input-unit" style={{ borderRadius: "6px", borderLeft: "1px solid #d9dde6", minWidth: 32 }}>⊕</span></div></div>
                  <div className="lc-create-field"><div className="lc-create-field-label">单位</div><div className="lc-create-field-with-btn"><input placeholder="填写工作单位" /><span className="lc-create-input-unit" style={{ borderRadius: "6px", borderLeft: "1px solid #d9dde6", minWidth: 32 }}>⊕</span></div></div>
                </div>
                <div className="lc-create-field"><div className="lc-create-field-label">描述</div><textarea ref={createDescRef} rows={3} placeholder="仅限500字，尽可能的将了解到的信息进行一段描述" /></div>
                <div className="lc-create-notice"><span className="lc-create-notice-dot">●</span>本内容仅红娘和后台可见，在入库到"会员CRM"后，显示在该客户的"会员资料-自我介绍"页中的"客源描述"中</div>
                <div className="lc-create-field"><div className="lc-create-field-label">照片</div><div className="lc-create-upload">＋ 上传图片</div></div>
                <div className="lc-create-assign"><span className="lc-create-field-label" style={{ minWidth: 40 }}>分派</span><label><input type="radio" name="lc-create-assign" defaultChecked />不分派</label><label><input type="radio" name="lc-create-assign" />智能分派</label></div>
                <div className="lc-create-submit-row"><button type="button" className="lc-create-submit" disabled={saving} onClick={() => void submitCreate()}>{saving ? "提交中..." : "确定提交"}</button></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {statsOpen && (
        <div className="stats-drawer-mask" onClick={() => setStatsOpen(false)}>
          <div className="stats-drawer-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="stats-drawer-head">
              <div className="flex items-center gap-2"><span className="stats-drawer-head-x" onClick={() => setStatsOpen(false)}>✕</span><h2>数据报表</h2></div>
              <button type="button" className="stats-drawer-close" onClick={() => setStatsOpen(false)}>关闭</button>
            </div>
            <div className="stats-drawer-body">
              <div className="stats-drawer-notice"><div className="stats-drawer-notice-title">💡 须知</div><div>为您统计了线索库中运营人员（推广红娘）的获客、销售红娘跟进、分派、客户意向等数据</div></div>
              <div className="stats-drawer-tabs">
                {([
                  ["follow","客户跟进统计"],
                  ["intent","客户意向统计"],
                  ["source","客户来源统计"],
                  ["status","客源状态统计"],
                  ["delta","客户增量统计"],
                  ["split","客源分流统计"],
                  ["promoter","推广红娘获客统计"],
                ] as const).map(([key, label]) => (
                  <div key={key} className={"stats-drawer-tab" + (statsTab === key ? " active" : "")} onClick={() => setStatsTab(key)}>{label}</div>
                ))}
              </div>
              {statsTab === "follow" && (
                <table className="stats-drawer-table">
                  <thead><tr><th>红娘</th><th className="center">名下客源</th><th className="center">从未跟进</th><th className="center">超3天未跟进</th><th className="center">超7天未跟进</th><th className="center">超15天未跟进</th><th className="center">超30天未跟进</th><th className="right">跟进总数</th><th className="right">本月跟进次数</th></tr></thead>
                  <tbody><tr><td>芸希老师</td><td className="center">1</td><td className="center">1</td><td className="center">0</td><td className="center">0</td><td className="center">0</td><td className="center">0</td><td className="right">0条</td><td className="right">0条</td></tr></tbody>
                </table>
              )}
              {statsTab !== "follow" && (
                <table className="stats-drawer-table">
                  <thead><tr><th>红娘</th><th className="center">数据</th></tr></thead>
                  <tbody><tr><td>芸希老师</td><td className="center">0</td></tr></tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
      {smartOpen && (
        <div className="smart-drawer-mask" onClick={() => setSmartOpen(false)}>
          <div className="smart-drawer-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="smart-drawer-head">
              <div className="flex items-center gap-2"><span className="smart-drawer-head-x" onClick={() => setSmartOpen(false)}>✕</span><h2>智能录入</h2></div>
              <div className="smart-drawer-head-actions">
                <button type="button" className="smart-drawer-cancel" onClick={() => setSmartOpen(false)}>取消</button>
                <button type="button" className="smart-drawer-submit">确定提交</button>
              </div>
            </div>
            <div className="smart-drawer-body">
              <div className="smart-drawer-notice"><div className="smart-drawer-notice-title">💡 须知</div><div>腾讯AI智能体+Deepseek大模型 实现信息识别，帮助婚介公司更加高效快捷的将客户信息录入到系统中</div></div>
              <div className="smart-drawer-radio-row">
                <label className="smart-drawer-radio"><input type="radio" name="smart-mode" defaultChecked />文字识别录入 <span className="smart-drawer-radio-link">参考模版</span></label>
                <label className="smart-drawer-radio"><input type="radio" name="smart-mode" />图片识别录入 <span className="smart-drawer-radio-link">参考模版</span></label>
              </div>
              <textarea className="smart-drawer-textarea" placeholder="复制粘贴到这里" defaultValue="" />
              <button type="button" className="smart-drawer-ai-btn">✦ 开始智能填写到下面信息中</button>
              <label className="smart-drawer-check-row"><input type="checkbox" defaultChecked />将本内容自动存储到「原始登记信息存储」字段中</label>

              <div className="smart-drawer-section-title">基本资料</div>
              <div className="smart-drawer-chips">
                {["高颜值","高收入","985毕业","211毕业","事业单位","双一流","海归","身材好","博士","央企企","银行金融","公务员"].map((label) => (
                  <label key={label} className="smart-drawer-chip"><input type="checkbox" />{label}</label>
                ))}
                <span className="smart-drawer-chip-mgr">标签管理</span>
              </div>
              <div className="smart-drawer-chips">
                {["抖音","微信群","本地群","身边朋友","同行群","朋友圈","朋友介绍","QQ","其他渠道","落地页"].map((label, idx) => (
                  <label key={label} className={"smart-drawer-chip" + (idx === 1 ? " active" : "")}><input type="radio" name="smart-source" defaultChecked={idx === 1} />{label}</label>
                ))}
                <span className="smart-drawer-chip-mgr">管理来源</span>
              </div>
              <div className="smart-drawer-grid">
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">手机</div><input placeholder="请输入手机号" /></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label"><span className="req">*</span>昵称</div><div className="smart-drawer-field-with-btn"><input placeholder="请输入" /><button type="button" className="smart-drawer-auto-btn">自动生成</button></div></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">姓名</div><input placeholder="请输入姓名" /></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">性别</div><div className="smart-drawer-radio-inline"><label><input type="radio" name="smart-gender" defaultChecked />男</label><label><input type="radio" name="smart-gender" />女</label></div></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">生日</div><input type="date" placeholder="请选择出生日期" /></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">属相</div><select defaultValue=""><option value="" disabled>请选择属相</option>{["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"].map((x) => <option key={x}>{x}</option>)}</select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">身高</div><div className="smart-drawer-input-with-unit"><input placeholder="请输入身高" /><span className="smart-drawer-input-unit">cm</span></div></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">体重</div><div className="smart-drawer-input-with-unit"><input placeholder="请输入体重" /><span className="smart-drawer-input-unit">kg</span></div></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">婚况</div><select defaultValue=""><option value="" disabled>请选择婚况</option>{["未婚","离异","丧偶"].map((x) => <option key={x}>{x}</option>)}</select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">家乡</div><select defaultValue=""><option value="" disabled>请选择家乡</option></select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">现居</div><select defaultValue=""><option value="" disabled>请选择现居</option></select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">学历</div><select defaultValue=""><option value="" disabled>请选择学历</option>{["高中","大专","本科","硕士","博士"].map((x) => <option key={x}>{x}</option>)}</select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">职业</div><select defaultValue=""><option value="" disabled>请选择职业</option></select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">收入</div><select defaultValue=""><option value="" disabled>请选择收入</option></select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">购房</div><select defaultValue=""><option value="" disabled>请选择购房</option></select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">购车</div><select defaultValue=""><option value="" disabled>请选择购车</option></select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">吸烟</div><select defaultValue=""><option value="" disabled>请选择吸烟</option></select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">喝酒</div><select defaultValue=""><option value="" disabled>请选择喝酒</option></select></div>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4">
          <form
            onSubmit={submit}
            className="w-full max-w-[520px] rounded bg-white p-5 shadow-xl"
          >
            <div className="mb-4 flex justify-between">
              <b>
                {modal === "create"
                  ? "添加客源"
                  : modal === "edit"
                    ? "编辑客源"
                    : modal === "assign"
                      ? "分派跟进"
                      : "新增跟进"}
              </b>
              <button type="button" onClick={() => setModal(null)}>
                关闭
              </button>
            </div>
            {modal === "assign" ? (
              <>
                <Field
                  label="服务红娘 ID"
                  value={form.matchmaker_id}
                  set={(v) => setForm({ ...form, matchmaker_id: v })}
                />
                <Field
                  label="门店 ID"
                  value={form.organization_id}
                  set={(v) => setForm({ ...form, organization_id: v })}
                />
              </>
            ) : modal === "follow" ? (
              <>
                <Select
                  label="跟进方式"
                  value={form.method}
                  set={(v) => setForm({ ...form, method: v })}
                  options={[
                    ["PHONE", "电话"],
                    ["WECHAT", "微信"],
                    ["VISIT", "到访"],
                    ["OTHER", "其他"],
                  ]}
                />
                <textarea
                  required
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  placeholder="跟进内容"
                  className="mt-3 h-24 w-full rounded border p-2 text-sm"
                />
              </>
            ) : (
              <>
                <Field
                  label="称呼"
                  value={form.name}
                  set={(v) => setForm({ ...form, name: v })}
                  required
                />
                <Field
                  label="手机"
                  value={form.phone}
                  set={(v) => setForm({ ...form, phone: v })}
                />
                <Field
                  label="微信"
                  value={form.wechat}
                  set={(v) => setForm({ ...form, wechat: v })}
                />
                {modal === "create" && (
                  <Field
                    label="客户来源"
                    value={form.source}
                    set={(v) => setForm({ ...form, source: v })}
                    required
                  />
                )}
                <Select
                  label="客户意向"
                  value={form.intention_level}
                  set={(v) => setForm({ ...form, intention_level: v })}
                  options={[
                    ["1", "低"],
                    ["2", "中"],
                    ["3", "高"],
                  ]}
                />
                {modal === "edit" && (
                  <Select
                    label="客源状态"
                    value={form.status}
                    set={(v) => setForm({ ...form, status: v })}
                    options={Object.entries(statuses)}
                  />
                )}
                <textarea
                  value={form.remark}
                  onChange={(e) => setForm({ ...form, remark: e.target.value })}
                  placeholder="备注"
                  className="mt-3 h-20 w-full rounded border p-2 text-sm"
                />
              </>
            )}
            <label className="mt-3 block text-sm">
              下次跟进{" "}
              <input
                type="datetime-local"
                value={form.next_follow_at}
                onChange={(e) =>
                  setForm({ ...form, next_follow_at: e.target.value })
                }
                className="rounded border p-1"
              />
            </label>
            <div className="mt-5 text-right">
              <button
                disabled={saving}
                className="rounded bg-[#3658f7] px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </form>
        </div>
      )}
      {detailMember && <MemberQuickProfileDrawer memberId={detailMember.id} nickname={detailMember.nickname} memberCode={detailMember.memberCode} onClose={() => setDetailMember(null)} />}
    </div>
  );
}
function Field({
  label,
  value,
  set,
  required,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="mt-3 block text-sm">
      {label}
      <input
        required={required}
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 block h-8 w-full rounded border px-2"
      />
    </label>
  );
}
function Select({
  label,
  value,
  set,
  options,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  options: string[][];
}) {
  return (
    <label className="block text-sm">
      {label}
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 block h-8 w-full rounded border bg-white px-2"
      >
        {options.map(([v, n]) => (
          <option value={v} key={v}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
