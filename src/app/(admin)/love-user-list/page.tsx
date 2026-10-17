"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Download,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminApi, resolveMediaUrl } from "@/lib/admin-api";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import DateRangePicker from "@/components/DateRangePicker";
import AdminPagination from "@/components/AdminPagination";
import { Button } from "@/components/ui/button";
import MemberDetailWorkspace from "@/components/MemberDetailWorkspace";
import Link from "next/link";
import { PackageOpen } from "lucide-react";

import {
  AGE_RANGE,
  AGE_RANGE_VALUE,
  BEHAVIOR_SORT,
  BEHAVIOR_TYPE,
  BEHAVIOR_TYPE_VALUE,
  BOOLEAN_FILTER_VALUE,
  CERT_STATUS,
  CERT_STATUS_VALUE,
  EDUCATION,
  HEIGHT_RANGE,
  HEIGHT_RANGE_VALUE,
  INCOME_RANGE,
  INCOME_RANGE_VALUE,
  INTENTION_LEVEL,
  INTENTION_LEVEL_VALUE,
  MARRIAGE_STATUS,
  MARRIAGE_STATUS_VALUE,
  MEMBER_SOURCE,
  REALNAME_STATUS,
  REALNAME_STATUS_VALUE,
  RECORD_ORDER_VALUE,
  REGION_TYPE,
  REGION_TYPE_VALUE,
  SEARCH_TYPE,
  SEARCH_TYPE_VALUE,
  WECHAT_ADDED_STATUS,
  WECHAT_ADDED_VALUE,
  XIANGQIN_STATUS_CLOSE,
  XIANGQIN_STATUS_VALUE,
  ZODIAC,
  CONSTELLATION,
} from "@/lib/filter-options";

type Member = {
  id: number;
  nickname?: string | null;
  real_name?: string | null;
  phone?: string | null;
  wechat?: string | null;
  gender?: number | null;
  status: number;
  is_vip: boolean;
  vip_end_at?: string | null;
  matchmaker_id?: number | null;
  created_at: string;
  avatar?: string | null;
  birthday?: string | null;
  is_married?: number | null;
  height?: number | null;
  weight?: number | null;
  income?: number | null;
  hometown?: string | null;
  residence?: string | null;
  education?: string | null;
  job?: string | null;
  tags?: string[] | null;
  ethnicity?: string | null;
  religion?: string | null;
  house_status?: string | null;
  auth_status?: number | null;
  intention_level?: number | null;
  last_follow_at?: string | null;
  next_follow_at?: string | null;
  last_login_at?: string | null;
};
type Page = {
  items: Member[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
};
type Matchmaker = { user_id: number; nickname?: string | null; is_available?: boolean };
type Statistics = {
  total: number;
  unassigned: number;
  never_followed: number;
  follow_due_today: number;
};
type Filters = {
  search: string;
  search_type: string;
  gender: string;
  status: string;
  vip: string;
  auth_status: string;
  assigned: string;
  follow_state: string;
  feedbackDay: string;
  whetherCurrentDayFollow: string;
  whetherCurrentDayCall: string;
  whetherHasBooking: string;
  bookingFollowDate: string;
  lastLoginDate: string;
  whetherAbandon: string;
  matchmakerId: string;
  /** 以下 6 项为后端补齐的新筛选：界面存中文文案，传参时按 filter-options 的映射表转成接口值 */
  region: string;
  cert_status: string;
  wechat_added: string;
  behavior_type: string;
  order: string;
  xiangqin_status: string;
  /** 2026-10-17：筛选区原本设值后不发参的控件，全部按接口参数接线 */
  source: string;
  organization_id: string;
  promoter_id: string;
  intention_level: string;
  realname: string;
  age_range: string;
  marriage: string;
  height_range: string;
  education: string;
  occupation: string;
  income_range: string;
  residence: string;
  hometown: string;
  hukou: string;
  offline_vip: string;
  promoted: string;
  newcomer: string;
  activity_signup: string;
  religion: string;
  car: string;
  level: string;
  tags: string;
  house: string;
  ethnicity: string;
  constellation: string;
  zodiac: string;
};
const initialFilters: Filters = {
  search: "",
  search_type: "智能搜索",
  gender: "",
  status: "",
  vip: "",
  auth_status: "",
  assigned: "",
  follow_state: "",
  region: "",
  cert_status: "",
  wechat_added: "",
  behavior_type: "",
  order: "",
  xiangqin_status: "",
  source: "",
  organization_id: "",
  promoter_id: "",
  intention_level: "",
  realname: "",
  age_range: "",
  marriage: "",
  height_range: "",
  education: "",
  occupation: "",
  income_range: "",
  residence: "",
  hometown: "",
  hukou: "",
  offline_vip: "",
  promoted: "",
  newcomer: "",
  activity_signup: "",
  religion: "",
  car: "",
  level: "",
  tags: "",
  house: "",
  ethnicity: "",
  constellation: "",
  zodiac: "",
  feedbackDay: "",
  whetherCurrentDayFollow: "",
  whetherCurrentDayCall: "",
  whetherHasBooking: "",
  bookingFollowDate: "",
  lastLoginDate: "",
  whetherAbandon: "false",
  matchmakerId: "",
};
const emptyStats: Statistics = {
  total: 0,
  unassigned: 0,
  never_followed: 0,
  follow_due_today: 0,
};
type FilterOption = { value: string; label: string };
/** GET /admin/matchmaker/members/options 的返回：门店按账号数据范围收口 */
type FilterOptions = { organizations: FilterOption[]; promoters: FilterOption[] };
/** 职业 / 房子 / 车子 / 民族 / 级别：取值列是自由文本，这里给常用选项，
 *  真正的可用值仍以库里已填写的为准（后端按原值精确匹配）。 */
const OCCUPATION_OPTIONS = [
  "企业职员", "个体经营", "教师", "公务员", "医生", "工程师", "金融从业", "自由职业", "学生", "其他",
];
const HOUSE_OPTIONS = ["有房", "有房有贷", "无房", "与父母同住"];
const CAR_OPTIONS = ["有车", "无车", "有车有贷"];
const ETHNICITY_OPTIONS = ["汉族", "回族", "满族", "壮族", "维吾尔族", "其他"];
const MEMBER_LEVEL_OPTIONS = ["普通会员", "VIP"];
/** 表头文案 → 后端 sort_by 白名单键；未列出的列不可排序。 */
const COLUMN_SORT_KEY: Record<string, string> = {
  ID: "id",
  跟进: "last_follow_at",
  "来源/注册/登录/分派时间": "created_at",
};
const selectClass =
  "h-8 min-w-[108px] border border-[#d9d9d9] bg-white px-2 text-xs text-[#555] outline-none focus:border-[#3658f7]";
const formatTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-";
const marital = (value?: number | null) =>
  ({ 1: "未婚", 2: "离异", 3: "丧偶" })[value ?? 0] ?? "-";
const authLabel = (value?: number | null) =>
  ({ 0: "未认证", 1: "审核中", 2: "已通过", 3: "未通过" })[value ?? 0] ??
  "未认证";

export default function LoveUserListPage() {
  const [rows, setRows] = useState<Member[]>([]);
  const [stats, setStats] = useState<Statistics>(emptyStats);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [view, setView] = useState<"professional" | "compact">("professional");
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [draft, setDraft] = useState<Filters>(initialFilters);
  const [sortBy, setSortBy] = useState("created_at");
  const [memberTab, setMemberTab] = useState<"profile" | "abandon" | "abandon-log">("profile");
  const [abandonCount, setAbandonCount] = useState(0);
  const [activeQuickFilter, setActiveQuickFilter] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ organizations: [], promoters: [] });
  const [followMember, setFollowMember] = useState<Member | null>(null);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [detailTab, setDetailTab] = useState("基本资料");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pageSize, setPageSize] = useState(20);
  const [followContent, setFollowContent] = useState("");
  const [nextFollowAt, setNextFollowAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [smartOpen, setSmartOpen] = useState(false);
  const [simpleSetOpen, setSimpleSetOpen] = useState(false);
  const [simpleFields] = useState([
    "标记","资料ID","编号","头像","昵称","姓名","性别","出生","婚况","学历","身高","职业","体重","购房","民族","现居","老家","收入","标签","宗教","推广人","跟进人","客户意向","跟进情况","审核","状态","来源","登记时间","最后登录","操作",
  ]);
  const [creating, setCreating] = useState(false);
  const [rowAuth, setRowAuth] = useState<Record<number, string>>({});
  const [rowIntentions, setRowIntentions] = useState<Record<number, string>>({});
  const [rowMatchmakers, setRowMatchmakers] = useState<Record<number, string>>({});
  const [matchmakers, setMatchmakers] = useState<Matchmaker[]>([]);
  const [importing, setImporting] = useState(false);
  const [memberForm, setMemberForm] = useState({
    nickname: "",
    real_name: "",
    code: "",
    phone: "",
    wechat: "",
    wechat_same: false,
    gender: "1",
    birthday: "",
    is_married: "",
    status: "1",
    source: "后台添加",
    account_mode: "auto",
    remark: "",
  });
  const importInput = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    setLoading(true);
    // filters 里存的是界面文案（「高意向」「26-35岁」），必须逐项翻译成接口值再发；
    // 早期直接展开 `...filters`，导致界面选中的中文原样作为参数发出，后端一律不认，
    // 表现就是「设了筛选点搜索，行数不变」。
    const query: Record<string, string | number | boolean | undefined> = {
      page,
      page_size: pageSize,
      sort_by: sortBy,
      search: filters.search,
      search_type: filters.search_type ? SEARCH_TYPE_VALUE[filters.search_type] : undefined,
      gender: filters.gender,
      status: filters.status,
      vip: filters.vip,
      auth_status: filters.auth_status,
      assigned: filters.assigned,
      follow_state: filters.follow_state,
      source: filters.source,
      organization_id: filters.organization_id,
      promoter_id: filters.promoter_id,
      matchmaker_id: filters.matchmakerId,
      residence: filters.residence,
      hometown: filters.hometown,
      hukou: filters.hukou,
      religion: filters.religion,
      occupation: filters.occupation,
      tags: filters.tags,
      ethnicity: filters.ethnicity,
      constellation: filters.constellation,
      zodiac: filters.zodiac,
      house: filters.house,
      car: filters.car,
      level: filters.level,
      education: filters.education,
      marriage: filters.marriage,
    };
    // 界面值是中文文案，这里按 filter-options 的映射表换成接口枚举值后再发请求。
    if (filters.region) query.region = REGION_TYPE_VALUE[filters.region];
    if (filters.cert_status) query.cert_status = CERT_STATUS_VALUE[filters.cert_status];
    if (filters.wechat_added) query.wechat_added = WECHAT_ADDED_VALUE[filters.wechat_added];
    if (filters.behavior_type) query.behavior_type = BEHAVIOR_TYPE_VALUE[filters.behavior_type];
    if (filters.order) {
      query.order = RECORD_ORDER_VALUE[filters.order];
      // 后端约定 order 与 sort_by 互斥且 order 优先，同时传会让排序档位失效；
      // 这里显式去掉 sort_by，避免两套排序控件互相覆盖却看不出是哪套生效。
      delete query.sort_by;
    }
    if (filters.xiangqin_status) query.xiangqin_status = XIANGQIN_STATUS_VALUE[filters.xiangqin_status];
    if (filters.intention_level) query.intention_level = INTENTION_LEVEL_VALUE[filters.intention_level];
    if (filters.realname) query.realname = REALNAME_STATUS_VALUE[filters.realname];
    // 四类「XX：不限」布尔筛选：文案「是/不是/已报名/未报名」映射回 Boolean。
    if (filters.offline_vip) query.offline_vip = BOOLEAN_FILTER_VALUE[filters.offline_vip];
    if (filters.promoted) query.promoted = BOOLEAN_FILTER_VALUE[filters.promoted];
    if (filters.newcomer) query.newcomer = BOOLEAN_FILTER_VALUE[filters.newcomer];
    if (filters.activity_signup) query.activity_signup = BOOLEAN_FILTER_VALUE[filters.activity_signup];
    // 三个区间筛选在界面上是单个下拉，接口侧却是上下限两个参数。
    const age = AGE_RANGE_VALUE[filters.age_range];
    if (age) {
      query.age_min = age[0];
      if (age[1] !== null) query.age_max = age[1];
    }
    const height = HEIGHT_RANGE_VALUE[filters.height_range];
    if (height) {
      query.height_min = height[0];
      if (height[1] !== null) query.height_max = height[1];
    }
    const income = INCOME_RANGE_VALUE[filters.income_range];
    if (income) {
      if (income[0] !== null) query.income_min = income[0];
      if (income[1] !== null) query.income_max = income[1];
    }
    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (value === "" || value === undefined || value === null) delete query[key];
    });
    try {
      const [result, summary] = await Promise.all([
        adminApi<Page>("admin/matchmaker/members", { query }),
        adminApi<Statistics>("admin/matchmaker/members/statistics"),
      ]);
      setRows(result.items);
      setTotal(result.total);
      setStats(summary);
      setLoadError("");
    } catch (error) {
      setRows([]);
      setTotal(0);
      setStats(emptyStats);
      setLoadError(error instanceof Error ? error.message : "会员接口请求失败，请检查登录状态和后端服务");
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, sortBy]);
  useEffect(() => {
    void load();
  }, [load]);
  // 门店 / 推广红娘的候选来自接口（门店还按账号数据范围收口），界面不再写死空下拉。
  useEffect(() => {
    void (async () => {
      try {
        const options = await adminApi<FilterOptions>("admin/matchmaker/members/options");
        setFilterOptions({
          organizations: Array.isArray(options?.organizations) ? options.organizations : [],
          promoters: Array.isArray(options?.promoters) ? options.promoters : [],
        });
      } catch {
        // 拿不到候选时保留空列表：下拉仍可点开，只是没有可选项，不影响其它筛选。
        setFilterOptions({ organizations: [], promoters: [] });
      }
    })();
  }, []);
  // 顶部「弃海会员」Tab 的计数：弃海数据在客源侧，后端只有 /admin/customer-leads/abandoned
  useEffect(() => {
    void (async () => {
      try {
        const rows = await adminApi<unknown[]>("admin/customer-leads/abandoned");
        setAbandonCount(Array.isArray(rows) ? rows.length : 0);
      } catch {
        setAbandonCount(0);
      }
    })();
  }, []);
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("keyword") ?? "";
    if (k) {
      const next = { ...initialFilters, search: k };
      setFilters(next);
      setDraft(next);
    }
  }, []);
  useEffect(() => {
    void (async () => {
      try {
        const first = await adminApi<{ items: Matchmaker[]; total: number; page_size: number }>("admin/matchmaker/matchmakers", {
          query: { page: 1, page_size: 100 },
        });
        const pages = Math.max(1, Math.ceil(first.total / first.page_size));
        const rest = await Promise.all(
          Array.from({ length: pages - 1 }, (_, index) =>
            adminApi<{ items: Matchmaker[] }>("admin/matchmaker/matchmakers", {
              query: { page: index + 2, page_size: first.page_size },
            }),
          ),
        );
        setMatchmakers([
          ...first.items,
          ...rest.flatMap((result) => result.items),
        ]);
      } catch {
        setMatchmakers([]);
      }
    })();
  }, []);
  useEffect(() => {
    setSelectedIds([]);
  }, [page, pageSize, filters]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const allSelected =
    rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));
  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : rows.map((row) => row.id));
  const toggleRow = (id: number) =>
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const applyFilters = () => {
    setPage(1);
    setActiveQuickFilter("");
    setFilters(draft);
  };
  const quickFilter = (key: string, follow_state = "", assigned = "") => {
    setPage(1);
    setActiveQuickFilter(key);
    const next = { ...initialFilters, follow_state, assigned };
    if (key === "unassigned") next.matchmakerId = "0";
    if (key === "today_follow") next.whetherCurrentDayFollow = "true";
    if (key === "never_follow") next.feedbackDay = "8";
    if (key === "overdue") next.feedbackDay = "8";
    if (key === "due_today")
      next.bookingFollowDate = new Date().toISOString().slice(0, 10);
    if (key === "today_login")
      next.lastLoginDate = new Date().toISOString().slice(0, 10);
    setFilters(next);
    setDraft(next);
  };
  const openWorkspace = (member: Member, tab = "基本资料") => {
    const tabKey: Record<string, string> = {
      基本资料: "basic",
      服务跟进: "follow",
      牵线记录: "line",
      超级管理: "super",
    };
    setDetailTab(tabKey[tab] ?? tab);
    setDetailMember(member);
  };
  async function saveFollowUp() {
    if (!followMember || !followContent.trim()) return;
    setSaving(true);
    try {
      await adminApi(`admin/members/${followMember.id}/follow-ups`, {
        method: "POST",
        body: {
          method: "PHONE",
          content: followContent.trim(),
          next_follow_at: nextFollowAt
            ? new Date(nextFollowAt).toISOString()
            : null,
        },
      });
      setFollowMember(null);
      setFollowContent("");
      setNextFollowAt("");
      await load();
    } finally {
      setSaving(false);
    }
  }
  async function createMember() {
    if (!memberForm.nickname || !memberForm.phone) return;
    setCreating(true);
    try {
      // 后端 MatchmakerMemberCreate 只接受 phone/nickname/gender/birthday/is_married/avatar/source/remark；
      // 早期这里还多发 real_name / wechat / status 且 source 传数字，都会被 schema 忽略或校验失败。
      await adminApi("admin/matchmaker/members", {
        method: "POST",
        body: {
          nickname: memberForm.nickname,
          phone: memberForm.phone,
          gender: Number(memberForm.gender),
          birthday: memberForm.birthday || null,
          is_married: memberForm.is_married
            ? Number(memberForm.is_married)
            : null,
          source: memberForm.source || "后台添加",
          remark: memberForm.remark || null,
        },
      });
      setCreateOpen(false);
      setMemberForm({
        nickname: "",
        real_name: "",
        code: "",
        phone: "",
        wechat: "",
        wechat_same: false,
        gender: "1",
        birthday: "",
        is_married: "",
        status: "1",
        source: "后台添加",
        account_mode: "auto",
        remark: "",
      });
      await load();
    } finally {
      setCreating(false);
    }
  }
  async function batchStatus(status: number) {
    if (!selectedIds.length) return;
    setSaving(true);
    try {
      await adminApi("admin/matchmaker/members/batch-status", { method: "POST", body: { member_ids: selectedIds, status, reason: "会员列表批量修改" } });
      setSelectedIds([]);
      await load();
    } finally {
      setSaving(false);
    }
  }
  async function updateMemberField(memberId: number, body: Record<string, number | null>) {
    try {
      await adminApi(`admin/matchmaker/members/${memberId}`, { method: "PATCH", body });
      await load();
    } catch (error) {
      alert(error instanceof Error ? `修改失败：${error.message}` : "修改失败");
      await load();
    }
  }
  async function updateAssignment(memberId: number, value: string) {
    const matchmakerId = value ? Number(value) : null;
    if (value && !Number.isInteger(matchmakerId)) return;
    try {
      await adminApi(`admin/matchmaker/members/${memberId}/assignment`, {
        method: "PATCH",
        body: { matchmaker_id: matchmakerId },
      });
      await load();
    } catch (error) {
      alert(error instanceof Error ? `分派失败：${error.message}` : "分派失败");
      await load();
    }
  }
  async function importMembers(file?: File) {
    if (!file) return;
    setImporting(true);
    try {
      const rows = (await file.text())
        .replace(/^\uFEFF/, "")
        .split(/\r?\n/)
        .filter(Boolean);
      const headers =
        rows
          .shift()
          ?.split(",")
          .map((v) => v.trim()) ?? [];
      const idx = (name: string) => headers.indexOf(name);
      let imported = 0;
      for (const row of rows) {
        const values = row.split(",").map((v) => v.trim());
        const phone = values[idx("手机号")] || values[idx("phone")];
        const nickname = values[idx("昵称")] || values[idx("nickname")];
        const gender =
          values[idx("性别")] === "女" || values[idx("gender")] === "2" ? 2 : 1;
        if (phone && nickname) {
          await adminApi("admin/matchmaker/members", {
            method: "POST",
            body: { phone, nickname, gender },
          });
          imported += 1;
        }
      }
      alert(`已导入 ${imported} 位会员`);
      await load();
    } catch (error) {
      alert(error instanceof Error ? `导入失败：${error.message}` : "导入失败");
    } finally {
      setImporting(false);
      if (importInput.current) importInput.current.value = "";
    }
  }
  function exportMembers() {
    const columns = [
      "ID",
      "昵称",
      "手机号",
      "性别",
      "认证",
      "会员级别",
      "服务红娘",
      "注册时间",
    ];
    const lines = rows.map((m) =>
      [
        m.id,
        m.nickname || "",
        m.phone || "",
        m.gender === 2 ? "女" : "男",
        authLabel(m.auth_status),
        m.is_vip ? "VIP" : "普通会员",
        m.matchmaker_id ? `红娘#${m.matchmaker_id}` : "未分派",
        formatTime(m.created_at),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const url = URL.createObjectURL(
      new Blob([`\uFEFF${columns.join(",")}\n${lines.join("\n")}`], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `会员资料-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={getBreadcrumb("会员CRM", memberTab === "abandon-log" ? "弃海记录" : "资料管理")} />
      <section className="bg-white px-6 pb-4 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] pb-3">
          <div className="flex h-9 items-start gap-7 text-sm">
            <button
              type="button"
              onClick={() => setMemberTab("profile")}
              className={`h-9 border-b-2 px-0 ${memberTab === "profile" ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#333]"}`}
            >
              会员资料
            </button>
            <button
              type="button"
              onClick={() => setMemberTab("abandon")}
              className={`h-9 border-b-2 px-0 ${memberTab === "abandon" ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#333]"}`}
            >
              弃海会员({abandonCount})
            </button>
            <button
              type="button"
              onClick={() => setMemberTab("abandon-log")}
              className={`h-9 border-b-2 px-0 ${memberTab === "abandon-log" ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#333]"}`}
            >
              弃海记录
            </button>
          </div>
          <div className="flex gap-2" style={memberTab === "abandon-log" ? { display: "none" } : undefined}>
            <ToolButton
              icon={<Plus />}
              label="添加资料"
              primary
              onClick={() => setCreateOpen(true)}
            />
            <ToolButton
              icon={<FileText />}
              label="智能录入"
              primary
              onClick={() => setSmartOpen(true)}
            />
            <ToolButton
              icon={<Download />}
              label={importing ? "导入中" : "批量导入资料"}
              primary
              onClick={() => importInput.current?.click()}
            />
            <ToolButton
              icon={<FileText />}
              label="导出EXCEL"
              primary
              onClick={exportMembers}
            />
            <input
              ref={importInput}
              className="hidden"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => void importMembers(e.target.files?.[0])}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2 xl:grid-cols-7" style={memberTab === "abandon-log" ? { display: "none" } : undefined}>
          <StaticSelect
            label="地区：不限"
            options={[...REGION_TYPE]}
            value={draft.region}
            onChange={(region) => setDraft({ ...draft, region })}
          />
          <StaticSelect
            label="认证：不限"
            options={[...CERT_STATUS]}
            value={draft.cert_status}
            onChange={(cert_status) => setDraft({ ...draft, cert_status })}
          />
          <StaticSelect
            label="加上了吗?"
            options={[...WECHAT_ADDED_STATUS]}
            value={draft.wechat_added}
            onChange={(wechat_added) => setDraft({ ...draft, wechat_added })}
          />
          <StaticSelect
            label="线上行为：不限"
            options={[...BEHAVIOR_TYPE]}
            value={draft.behavior_type}
            onChange={(behavior_type) => setDraft({ ...draft, behavior_type })}
          />
          <StaticSelect
            label="记录排序"
            options={[...BEHAVIOR_SORT]}
            value={draft.order}
            onChange={(order) => setDraft({ ...draft, order })}
          />
          <StaticSelect
            label="相亲状态：不限"
            options={[...XIANGQIN_STATUS_CLOSE]}
            value={draft.xiangqin_status}
            onChange={(xiangqin_status) => setDraft({ ...draft, xiangqin_status })}
          />
          <StaticSelect
            label="门店：不限"
            options={filterOptions.organizations.map((option) => option.label)}
            value={filterOptions.organizations.find((option) => option.value === draft.organization_id)?.label ?? ""}
            onChange={(label) =>
              setDraft({
                ...draft,
                organization_id: filterOptions.organizations.find((option) => option.label === label)?.value ?? "",
              })
            }
          />
          <Select
            value={draft.assigned}
            onChange={(assigned) => setDraft({ ...draft, assigned })}
            label="服务红娘：不限"
            options={[
              ["true", "已分派"],
              ["false", "未分派"],
            ]}
          />
          <Select
            value={draft.auth_status}
            onChange={(auth_status) => setDraft({ ...draft, auth_status })}
            label="审核：不限"
            options={[
              ["0", "待审核"],
              ["1", "未通过"],
              ["2", "已通过"],
              ["3", "已到店核验"],
            ]}
          />
          <Select
            value={draft.status}
            onChange={(status) => setDraft({ ...draft, status })}
            label="状态：不限"
            options={[
              ["1", "正常"],
              ["2", "冻结"],
              ["3", "注销"],
            ]}
          />
          <StaticSelect
            label="客户意向：不限"
            options={[...INTENTION_LEVEL]}
            value={draft.intention_level}
            onChange={(intention_level) => setDraft({ ...draft, intention_level })}
          />
          <StaticSelect
            label="登记：不限"
            options={[...MEMBER_SOURCE]}
            value={draft.source}
            onChange={(source) => setDraft({ ...draft, source })}
          />
          <StaticSelect
            label="推广红娘"
            options={filterOptions.promoters.map((option) => option.label)}
            value={filterOptions.promoters.find((option) => option.value === draft.promoter_id)?.label ?? ""}
            onChange={(label) =>
              setDraft({
                ...draft,
                promoter_id: filterOptions.promoters.find((option) => option.label === label)?.value ?? "",
              })
            }
          />
          <Select
            value={draft.gender}
            onChange={(gender) => setDraft({ ...draft, gender })}
            label="性别：不限"
            options={[
              ["1", "男"],
              ["2", "女"],
            ]}
          />
          {showMoreFilters && (
            <>
              <StaticSelect
                label="年龄：不限"
                options={[...AGE_RANGE]}
                value={draft.age_range}
                onChange={(age_range) => setDraft({ ...draft, age_range })}
              />
              <MultiSelect
                label="婚况：不限（多选）"
                options={[...MARRIAGE_STATUS]}
                value={draft.marriage}
                onChange={(marriage) => setDraft({ ...draft, marriage })}
                toParam={(picked) => picked.map((item) => MARRIAGE_STATUS_VALUE[item]).join(",")}
              />
              <StaticSelect
                label="身高：不限"
                options={[...HEIGHT_RANGE]}
                value={draft.height_range}
                onChange={(height_range) => setDraft({ ...draft, height_range })}
              />
              <MultiSelect
                label="学历：不限（多选）"
                options={[...EDUCATION]}
                value={draft.education}
                onChange={(education) => setDraft({ ...draft, education })}
              />
              <MultiSelect
                label="职业：不限（多选）"
                options={OCCUPATION_OPTIONS}
                value={draft.occupation}
                onChange={(occupation) => setDraft({ ...draft, occupation })}
              />
              <StaticSelect
                label="收入：不限"
                options={[...INCOME_RANGE]}
                value={draft.income_range}
                onChange={(income_range) => setDraft({ ...draft, income_range })}
              />
              <TextFilter
                label="现居：不限"
                value={draft.residence}
                onChange={(residence) => setDraft({ ...draft, residence })}
              />
              <Select
                value={draft.vip}
                onChange={(vip) => setDraft({ ...draft, vip })}
                label="会员级别：不限"
                options={[["true", "VIP"], ["false", "普通会员"]]}
              />
              <Select
                value={draft.realname}
                onChange={(realname) => setDraft({ ...draft, realname })}
                label="实名：不限"
                options={[...REALNAME_STATUS].map((item) => [item, item])}
              />
              <Select
                value={draft.offline_vip}
                onChange={(offline_vip) => setDraft({ ...draft, offline_vip })}
                label="线下VIP：不限"
                options={[["是", "线下VIP：是"], ["不是", "线下VIP：不是"]]}
              />
              <Select
                value={draft.promoted}
                onChange={(promoted) => setDraft({ ...draft, promoted })}
                label="置顶推广：不限"
                options={[["置顶中", "置顶中"], ["未置顶", "未置顶"]]}
              />
              <Select
                value={draft.newcomer}
                onChange={(newcomer) => setDraft({ ...draft, newcomer })}
                label="新人推荐：不限"
                options={[["推荐中", "推荐中"]]}
              />
              <Select
                value={draft.activity_signup}
                onChange={(activity_signup) => setDraft({ ...draft, activity_signup })}
                label="活动报名：不限"
                options={[["已报名", "已报名"], ["未报名", "未报名"]]}
              />
              <TextFilter
                label="宗教：不限"
                value={draft.religion}
                onChange={(religion) => setDraft({ ...draft, religion })}
              />
              <MultiSelect
                label="车子：不限（多选）"
                options={CAR_OPTIONS}
                value={draft.car}
                onChange={(car) => setDraft({ ...draft, car })}
              />
              <MultiSelect
                label="级别：不限（多选）"
                options={MEMBER_LEVEL_OPTIONS}
                value={draft.level}
                onChange={(level) => setDraft({ ...draft, level })}
              />
              <TextFilter
                label="标签：不限（多选）"
                value={draft.tags}
                onChange={(tags) => setDraft({ ...draft, tags })}
                placeholder="多个标签用英文逗号分隔"
              />
              <TextFilter
                label="户口：不限"
                value={draft.hukou}
                onChange={(hukou) => setDraft({ ...draft, hukou })}
              />
              <TextFilter
                label="家乡：不限"
                value={draft.hometown}
                onChange={(hometown) => setDraft({ ...draft, hometown })}
              />
              <MultiSelect
                label="房子：不限（多选）"
                options={HOUSE_OPTIONS}
                value={draft.house}
                onChange={(house) => setDraft({ ...draft, house })}
              />
              <MultiSelect
                label="民族：不限（多选）"
                options={ETHNICITY_OPTIONS}
                value={draft.ethnicity}
                onChange={(ethnicity) => setDraft({ ...draft, ethnicity })}
              />
              <StaticSelect
                label="星座：不限"
                options={[...CONSTELLATION]}
                value={draft.constellation}
                onChange={(constellation) => setDraft({ ...draft, constellation })}
              />
              <StaticSelect
                label="属相：不限"
                options={[...ZODIAC]}
                value={draft.zodiac}
                onChange={(zodiac) => setDraft({ ...draft, zodiac })}
              />
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowMoreFilters((current) => !current)}
          aria-expanded={showMoreFilters}
          style={memberTab === "abandon-log" ? { display: "none" } : undefined}
          className="mb-4 inline-flex items-center text-xs text-[#3658f7]"
        >
          {showMoreFilters ? "收起选项" : "更多选项"}
          <span className={`ml-2 size-1.5 border-b border-r border-current ${showMoreFilters ? "-translate-y-px rotate-[225deg]" : "-translate-y-0.5 rotate-45"}`} />
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3" style={memberTab === "abandon-log" ? { display: "none" } : undefined}>
          <div className="flex h-8">
            <label className="relative flex h-8 items-center border border-r-0 border-[#d9d9d9] bg-white text-xs text-[#595959]">
              <select
                value={draft.search_type}
                onChange={(e) => setDraft({ ...draft, search_type: e.target.value })}
                className="h-full appearance-none bg-transparent py-0 pl-3 pr-7 outline-none"
                aria-label="搜索方式"
              >
                {SEARCH_TYPE.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-3 size-1.5 rotate-45 border-b border-r border-[#8c8c8c]" />
            </label>
            <input
              value={draft.search}
              onChange={(e) => setDraft({ ...draft, search: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="w-[215px] border border-[#d9d9d9] px-3 text-xs outline-none focus:border-[#3658f7]"
              placeholder="请输入"
            />
            <button
              onClick={applyFilters}
              className="flex w-16 items-center justify-center bg-[#3658f7] text-xs text-white"
            >
              <Search className="mr-1 size-3" />
              搜索
            </button>
            <button
              onClick={() => {
                setDraft(initialFilters);
                setFilters(initialFilters);
                setActiveQuickFilter("all");
                setPage(1);
              }}
              className="ml-2 flex w-16 items-center justify-center border border-[#d9d9d9] text-xs text-[#595959]"
            >
              <RefreshCw className="mr-1 size-3" />
              重置
            </button>
            <label className="ml-6 flex items-center gap-1 text-xs text-[#595959]">
              排序
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="h-8 border border-[#d9d9d9] bg-white px-2 text-xs"
              >
                <option value="created_at">排序：注册时间</option>
                <option value="entered_at">排序：录入时间</option>
                <option value="last_login_at">排序：登录时间</option>
                <option value="last_follow_at">排序：跟进时间</option>
                <option value="assigned_at">排序：分派时间</option>
                <option value="fetched_at">排序：捞取时间</option>
              </select>
            </label>
          </div>
          <div className="flex overflow-hidden border border-[#d9d9d9] text-xs">
            {view === "compact" && (
              <button
                onClick={() => setSimpleSetOpen(true)}
                aria-label="简洁模式设置"
                className="grid h-8 w-9 place-items-center border-r border-[#d9d9d9] text-[#595959] hover:text-[#3658f7]"
              >
                ⚙
              </button>
            )}
            <button
              onClick={() => setView("compact")}
              className={`h-8 px-3 ${view === "compact" ? "bg-[#f5f7ff] text-[#3658f7]" : "text-[#595959]"}`}
            >
              简洁
            </button>
            <button
              onClick={() => setView("professional")}
              className={`h-8 border-l border-[#d9d9d9] px-3 ${view === "professional" ? "bg-[#f5f7ff] text-[#3658f7]" : "text-[#595959]"}`}
            >
              专业
            </button>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-8" style={memberTab === "abandon-log" ? { display: "none" } : undefined}>
          {[
            ["all", "全部", stats.total, () => quickFilter("all")],
            [
              "unassigned",
              "未分派",
              stats.unassigned ?? 0,
              () => quickFilter("unassigned", "", "false"),
            ],
            [
              "today_follow",
              "今日跟进",
              0,
              () => quickFilter("today_follow", "due_today"),
            ],
            [
              "never_follow",
              "从未跟进",
              stats.never_followed ?? 0,
              () => quickFilter("never_follow", "never"),
            ],
            [
              "overdue",
              "超3天未跟进",
              0,
              () => quickFilter("overdue", "overdue"),
            ],
            [
              "due_today",
              "今日需跟进",
              stats.follow_due_today ?? 0,
              () => quickFilter("due_today", "due_today"),
            ],
            [
              "today_login",
              "今日登录",
              0,
              () => quickFilter("today_login", "today_login"),
            ],
            ["calendar", "预约跟进日历", "", null],
          ].map(([key, label, amount, handler]) => {
            const selected = activeQuickFilter === key;
            if (key === "calendar") {
              return (
                <Link
                  key={String(key)}
                  href="/love-appointment"
                  className="flex h-14 items-center justify-center gap-2 bg-[#fafafa] text-xs text-[#595959] hover:bg-[#f3f6ff]"
                >
                  <CalendarDays className="size-4 text-[#3658f7]" />
                  {String(label)}
                </Link>
              );
            }
            return (
              <button
                key={String(key)}
                onClick={handler as () => void}
                aria-pressed={selected}
                className={`flex h-14 flex-col justify-center px-3 text-left transition-colors ${selected ? "bg-[#eef2ff] text-[#3658f7]" : "bg-[#fafafa] text-[#595959] hover:bg-[#f3f6ff]"}`}
              >
                <span className="text-xs">{String(label)}</span>
                <b className="mt-1 text-base font-medium">{String(amount)}</b>
              </button>
            );
          })}
        </div>
        <div className="mt-4 overflow-x-auto" style={memberTab === "abandon-log" ? { display: "none" } : undefined}>
          <table className={view === "compact" ? "min-w-[2400px] w-full text-xs" : "min-w-[1250px] w-full text-xs"}>
            <thead className="bg-[#fafafa] text-[#333]">
              <tr>
                {(view === "compact" ? ["", ...simpleFields] : [
                  "",
                  "ID",
                  "头像",
                  "资料",
                  "审核",
                  "状态/级别",
                  "红娘",
                  "跟进",
                  "客户意向",
                  "来源/注册/登录/分派时间",
                ]).map((name) => {
                  // 表头排序只对后端 SORT_SQL 白名单里真实存在的列开放；
                  // 其余列保持纯文案，避免点出一片没有实际效果的箭头。
                  const sortKey = COLUMN_SORT_KEY[name as string];
                  if (!sortKey) {
                    return (
                      <th key={name as string} className="whitespace-nowrap p-3 text-left font-medium">
                        {name === "" ? <input type="checkbox" aria-label="全选会员" checked={allSelected} onChange={toggleAll} /> : name}
                      </th>
                    );
                  }
                  const active = sortBy === sortKey;
                  return (
                    <th key={name as string} className="whitespace-nowrap p-0 text-left font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          setSortBy(sortKey);
                          setPage(1);
                        }}
                        className={`flex w-full items-center gap-1 p-3 text-left hover:text-[#3658f7] ${active ? "text-[#3658f7]" : ""}`}
                        title={`按${name}排序`}
                      >
                        {name}
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
                  <td colSpan={view === "compact" ? 31 : 10} className="p-12 text-center text-[#8c8c8c]">
                    加载中...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={view === "compact" ? 31 : 10} className="p-12 text-center text-[#d4380d]">
                    {loadError}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={view === "compact" ? 31 : 10} className="p-12 text-center text-[#8c8c8c]">
                    暂无数据
                  </td>
                </tr>
              ) : (
                rows.map((m) => (
                  <tr
                    key={m.id}
                    className={`align-top border-t border-[#f0f0f0] hover:bg-[#fcfcff] ${selectedIds.includes(m.id) ? "bg-[#f5f7ff]" : ""}`}
                  >
                    {view === "compact" ? (
                      <>
                        <td className="p-3">
                          <input type="checkbox" aria-label={`选择会员 ${m.id}`} checked={selectedIds.includes(m.id)} onChange={() => toggleRow(m.id)} />
                        </td>
                        <td className="p-3 text-[#595959]">{m.id}</td>
                        <td className="p-3 text-[#595959]">G{String(m.id).padStart(6, "0")}</td>
                        <td className="p-3">
                          <div className="h-[36px] w-[36px] overflow-hidden rounded-[3px] border border-[#f0f0f0] bg-[#f5f5f5]">
                            {m.avatar ? <img src={resolveMediaUrl(m.avatar)} alt="" className="h-full w-full object-cover" /> : <UserRound className={`m-[9px] size-[18px] ${m.gender === 1 ? "text-[#5b8ff9]" : "text-[#f08bb4]"}`} />}
                          </div>
                        </td>
                        <td className="p-3 text-sm font-semibold text-[#262626] whitespace-nowrap">{m.nickname || "未命名"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.real_name || "—"}</td>
                        <td className="p-3 whitespace-nowrap"><span className={m.gender === 2 ? "rounded px-2 text-[#eb2f96] bg-[#fff0f6]" : "rounded px-2 text-[#1677ff] bg-[#e6f4ff]"}>{m.gender === 2 ? "女" : "男"}</span></td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.birthday ? `${new Date(m.birthday).getFullYear()}年(${new Date().getFullYear() - new Date(m.birthday).getFullYear()}岁)` : "—"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{marital(m.is_married)}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.education || "—"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.height ? `${m.height}CM` : "—"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.job || "—"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.weight ? `${m.weight}KG` : "—"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.house_status || "—"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.ethnicity || "汉族"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.residence || "—"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.hometown || "—"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.income || "—"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.tags || "—"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">{m.religion || "无宗教信仰"}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">-</td>
                        <td className="p-3 whitespace-nowrap">
                          <select className="h-7 w-[88px] border border-[#d9d9d9] bg-white px-1 text-xs text-[#595959] outline-none focus:border-[#3658f7]" defaultValue={m.matchmaker_id ? String(m.matchmaker_id) : ""}>
                            <option value="">未分派</option>
                            {matchmakers.map((matchmaker) => <option key={matchmaker.user_id} value={matchmaker.user_id}>{matchmaker.nickname || `红娘 #${matchmaker.user_id}`}</option>)}
                          </select>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <select className="h-7 w-[80px] border border-[#d9d9d9] bg-white px-1 text-xs text-[#8c8c8c] outline-none focus:border-[#3658f7]" defaultValue={String(m.intention_level ?? "")}>
                            <option value="">请选择</option>
                            <option value="3">高意向</option>
                            <option value="2">中意向</option>
                            <option value="1">低意向</option>
                          </select>
                        </td>
                        <td className="p-3 text-[11px] text-[#595959] whitespace-nowrap">
                          {m.last_follow_at && <div>上次跟进:<br/>{formatTime(m.last_follow_at)}</div>}
                          {m.next_follow_at && <div className={Number(m.next_follow_at.slice(0,10).replace(/-/g,"")) - Number(new Date().toISOString().slice(0,10).replace(/-/g,"")) < 0 ? "text-[#ff4d4f]" : "text-[#fa8c16]"}>{Number(m.next_follow_at.slice(0,10).replace(/-/g,"")) - Number(new Date().toISOString().slice(0,10).replace(/-/g,""))}天{m.next_follow_at.slice(5,7)}未跟进</div>}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <select value={rowAuth[m.id] ?? String(m.auth_status ?? 0)} onChange={(e) => { setRowAuth({ ...rowAuth, [m.id]: e.target.value }); void updateMemberField(m.id, { auth_status: Number(e.target.value) }); }} className="h-7 w-[72px] border border-[#d9d9d9] bg-white px-1 text-xs text-[#595959] outline-none focus:border-[#3658f7]">
                            <option value="0">待审</option>
                            <option value="1">审核中</option>
                            <option value="2">通过</option>
                            <option value="3">未通过</option>
                          </select>
                          <div className="mt-1 flex items-center gap-1 whitespace-nowrap text-[11px] text-[#3658f7]">
                            <button type="button" onClick={() => { setRowAuth({ ...rowAuth, [m.id]: "2" }); void updateMemberField(m.id, { auth_status: 2 }); }}>免审核资质</button>
                            <button type="button" title="编辑" onClick={() => { setRowAuth({ ...rowAuth, [m.id]: "1" }); void updateMemberField(m.id, { auth_status: 1 }); }}><Pencil className="size-3" /></button>
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">{m.status === 1 ? <span className="text-[#fa8c16]">公开相亲</span> : <span className="text-[#ff4d4f]">{m.status === 2 ? "已冻结" : "已注销"}</span>}</td>
                        <td className="p-3 text-[#595959] whitespace-nowrap">自己注册</td>
                        <td className="p-3 text-[11px] text-[#8c8c8c] whitespace-nowrap">{formatTime(m.created_at)}</td>
                        <td className="p-3 text-[11px] text-[#8c8c8c] whitespace-nowrap">{m.last_login_at ? formatTime(m.last_login_at) : "—"}</td>
                        <td className="p-3 whitespace-nowrap text-[#3658f7]">
                          <button type="button" onClick={() => openWorkspace(m)}>详细</button>
                          <button type="button" onClick={() => setFollowMember(m)}>跟进</button>
                          <button type="button" onClick={() => openWorkspace(m, "超级管理")}>超管</button>
                        </td>
                      </>
                    ) : (
                    <>
                    <td className="p-3">
                      <input
                        type="checkbox"
                        aria-label={`选择会员 ${m.id}`}
                        checked={selectedIds.includes(m.id)}
                        onChange={() => toggleRow(m.id)}
                      />
                    </td>
                    <td className="p-3 text-[#595959]">{m.id}</td>
                    <td className="p-3">
                      <div className="w-[54px]">
                        <div className="h-[54px] w-[54px] overflow-hidden rounded-[3px] border border-[#f0f0f0] bg-[#f5f5f5]">
                          {m.avatar ? (
                            <img
                              src={resolveMediaUrl(m.avatar)}
                              alt={`${m.nickname || "会员"}头像`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound
                              className={`m-[15px] size-6 ${m.gender === 1 ? "text-[#5b8ff9]" : "text-[#f08bb4]"}`}
                            />
                          )}
                        </div>
                        <span
                          className={`mt-1 block whitespace-nowrap rounded px-1 text-center text-[11px] ${m.gender === 1 ? "bg-[#e6f4ff] text-[#1677ff]" : "bg-[#fff0f6] text-[#eb2f96]"}`}
                        >
                          {m.gender === 2 ? "女" : "男"}
                          {m.birthday
                            ? ` ${new Date().getFullYear() - new Date(m.birthday).getFullYear()}岁`
                            : ""}
                        </span>
                      </div>
                    </td>
                    <td className="min-w-[360px] p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#262626]">
                          {m.nickname || "未命名会员"}
                        </span>
                        <span className="rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[#8c8c8c]">
                          {authLabel(m.auth_status)}
                        </span>
                        <span className="rounded bg-[#f5f5f5] px-1.5 py-0.5 text-[#8c8c8c]">
                          G{String(m.id).padStart(6, "0")}
                        </span>
                      </div>
                      {view === "professional" && (
                        <>
                          <div className="mt-1 text-[#595959]">
                            {m.birthday
                              ? `${new Date(m.birthday).getFullYear()}年 / ${m.height ? `${m.height}cm` : "身高未填"} / ${m.education || "学历未填"} / ${m.job || "职业未填"} / ${marital(m.is_married)}`
                              : "资料待完善"}
                          </div>
                          <div className="mt-1 text-[#8c8c8c]">
                            籍贯 {m.hometown || "未填"} / 现居{" "}
                            {m.residence || "未填"}
                          </div>
                        </>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <RowAction onClick={() => openWorkspace(m)}>
                          详细资料
                        </RowAction>
                        <RowAction onClick={() => openWorkspace(m, "服务跟进")}>
                          服务跟进
                        </RowAction>
                        <RowAction onClick={() => openWorkspace(m, "牵线记录")}>
                          牵线记录
                        </RowAction>
                        <RowAction onClick={() => openWorkspace(m, "超级管理")}>
                          更多
                          <ChevronDown className="size-3" />
                        </RowAction>
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        value={rowAuth[m.id] ?? String(m.auth_status ?? 0)}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRowAuth({ ...rowAuth, [m.id]: value });
                          void updateMemberField(m.id, { auth_status: Number(value) });
                        }}
                        className="h-7 w-[72px] border border-[#d9d9d9] bg-white px-1 text-xs text-[#595959] outline-none focus:border-[#3658f7]"
                      >
                        <option value="0">待审</option>
                        <option value="1">审核中</option>
                        <option value="2">通过</option>
                        <option value="3">未通过</option>
                      </select>
                      <div className="mt-1 flex items-center gap-2 whitespace-nowrap text-[11px] text-[#3658f7]">
                        <button type="button" onClick={() => { setRowAuth({ ...rowAuth, [m.id]: "2" }); void updateMemberField(m.id, { auth_status: 2 }); }}>免审核</button>
                        <button type="button" title="编辑审核状态" aria-label="编辑审核状态" onClick={() => { setRowAuth({ ...rowAuth, [m.id]: "1" }); void updateMemberField(m.id, { auth_status: 1 }); }}>
                          <Pencil className="size-3" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3">
                      <div
                        className={
                          m.status === 1
                            ? "rounded-full bg-[#fff1e8] px-2 py-1 text-[#fa8c16]"
                            : "text-[#ff4d4f]"
                        }
                      >
                        {m.status === 1
                          ? "公开相亲"
                          : m.status === 2
                            ? "已冻结"
                            : "已注销"}
                      </div>
                      <div className="mt-2 text-[#595959]">
                        {m.is_vip ? "VIP会员" : "普通会员"}
                      </div>
                    </td>
                    <td className="p-3 text-[#262626]">
                      <select
                        value={rowMatchmakers[m.id] ?? (m.matchmaker_id ? String(m.matchmaker_id) : "")}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRowMatchmakers({ ...rowMatchmakers, [m.id]: value });
                          void updateAssignment(m.id, value);
                        }}
                        className="h-7 w-[120px] border border-[#d9d9d9] bg-white px-1 text-xs text-[#595959] outline-none focus:border-[#3658f7]"
                      >
                        <option value="">未分派</option>
                        {matchmakers.map((matchmaker) => (
                          <option key={matchmaker.user_id} value={matchmaker.user_id}>
                            {matchmaker.nickname || `红娘 #${matchmaker.user_id}`}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1 text-[11px] text-[#8c8c8c]">推广：-</div>
                    </td>
                    <td className="p-3">
                      <div
                        className={m.last_follow_at ? "text-[#3658f7]" : "text-[#3658f7]"}
                      >
                        {m.last_follow_at
                          ? `最后：${formatTime(m.last_follow_at)}`
                          : "从未跟进"}
                      </div>
                      <div className="mt-1 text-[#8c8c8c]">
                        {m.next_follow_at
                          ? `下次：${formatTime(m.next_follow_at)}`
                          : "暂未预约"}
                      </div>
                    </td>
                    <td className="p-3">
                      <select
                        value={rowIntentions[m.id] ?? String(m.intention_level ?? "")}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRowIntentions({ ...rowIntentions, [m.id]: value });
                          void updateMemberField(m.id, { intention_level: value ? Number(value) : null });
                        }}
                        className="h-7 w-[92px] border border-[#d9d9d9] bg-white px-1 text-xs text-[#8c8c8c] outline-none focus:border-[#3658f7]"
                      >
                        <option value="">请选择</option>
                        <option value="3">高意向</option>
                        <option value="2">中意向</option>
                        <option value="1">低意向</option>
                      </select>
                    </td>
                    <td className="p-3 text-[#595959]">
                      <div>自己注册</div>
                      <div className="mt-1 text-[#8c8c8c]">
                        注册：{formatTime(m.created_at)}
                      </div>
                    </td>
                    </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {selectedIds.length > 0 && memberTab !== "abandon-log" && (
          <div className="sticky bottom-0 z-10 flex h-12 items-center gap-3 border border-[#d9d9d9] bg-white px-4 text-xs shadow-sm">
            <span className="text-[#595959]">已选 {selectedIds.length} 条</span>
            <button type="button" disabled={saving} onClick={() => void batchStatus(1)} className="border border-[#d9d9d9] px-3 py-1.5 text-[#595959] disabled:opacity-50">批量设为公开</button>
            <button type="button" disabled={saving} onClick={() => void batchStatus(2)} className="border border-[#d9d9d9] px-3 py-1.5 text-[#595959] disabled:opacity-50">批量冻结</button>
            <button type="button" disabled title="后端尚未提供弃海数据接口" className="cursor-not-allowed border border-[#d9d9d9] px-3 py-1.5 text-[#bfbfbf]">加入弃海</button>
            <button type="button" onClick={() => setSelectedIds([])} className="ml-auto text-[#3658f7]">取消选择</button>
          </div>
        )}
        {memberTab !== "abandon-log" && <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />}
      </section>

      {memberTab === "abandon-log" && (
        <section className="admin-card mt-4 overflow-hidden pt-4">
          <div className="mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b] mx-5">
            <h2 className="mb-1 font-semibold text-[#26324a]">💡 知情</h2>
            <p>红娘可以将自己名下的“会员资料”进行放入弃海，资料一旦进入到弃海，则其“分派跟进”状态自动变更为“待分派”。</p>
            <p>所有红娘均可见弃海中的“未被捞取”的资料信息，可进行捞取操作，捞取成功后自动分派到自己名下进行跟进。</p>
            <p>红娘在将弃海中的资料捞取到自己名下之前，不可见资料中的客户联系方式。</p>
            <p>红娘超过约定的时长未对会员进行跟进操作，将被系统自动放入弃海；红娘可设置自动弃海的资料数上限。</p>
            <p>同一资料可多次放入弃海，每次放入弃海均生成一次记录，历史可查。</p>
            <p>管理员、超级红娘可以直接将弃海会员重新分派给红娘，也可以将任意资料直接放入到弃海。</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 px-8 py-5">
            <select className="h-10 w-56 rounded border px-3 text-sm" defaultValue="">
              <option value="">放弃红娘：不限</option>
            </select>
            <DateRangePicker startValue="" endValue="" onStartChange={() => {}} onEndChange={() => {}} className="w-[260px]" />
            <div className="flex h-10 min-w-[280px] flex-1">
              <input placeholder="请输入会员昵称/手机/姓名/编号" className="min-w-0 flex-1 rounded-l border border-r-0 px-3 text-sm" />
              <button type="button" className="flex w-20 items-center justify-center gap-1 rounded-r bg-[#3658f7] text-sm text-white"><Search size={15} />搜索</button>
            </div>
            <label className="whitespace-nowrap text-sm"><input type="checkbox" /> 待捞取/分派</label>
            <span className="ml-auto whitespace-nowrap text-sm">共有弃海记录：<b className="text-[#3658f7]">0条</b>　待捞取/分派：<b className="text-[#3658f7]">0条</b></span>
          </div>
          <div className="overflow-x-auto px-8">
            <table className="w-full min-w-[1100px] table-fixed text-sm">
              <thead>
                <tr>
                  {["ID", "头像", "资料", "放弃人", "放弃类型", "放弃原因", "弃海时间", "分派状态（捞取人）", "捞取/分派时间"].map((x) => (
                    <th key={x} className="border-b bg-[#fafafa] px-3 py-3 text-left font-normal">{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={9} className="h-52 text-center text-[#8c8c8c]">
                    <PackageOpen className="mx-auto mb-2" />
                    暂无数据
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {detailMember && (
        <MemberDetailWorkspace
          member={detailMember}
          initialTab={detailTab}
          onClose={() => setDetailMember(null)}
        />
      )}
      {followMember && (
        <Modal
          title={`服务跟进 · ${followMember.nickname || `会员 #${followMember.id}`}`}
          onClose={() => setFollowMember(null)}
        >
          <div className="space-y-4">
            <textarea
              value={followContent}
              onChange={(e) => setFollowContent(e.target.value)}
              className="h-28 w-full resize-none border border-[#d9d9d9] p-3 text-sm outline-none focus:border-[#3658f7]"
              placeholder="填写本次沟通内容、会员需求和服务进展"
            />
            <label className="block text-sm text-[#595959]">
              下次跟进时间
              <input
                value={nextFollowAt}
                onChange={(e) => setNextFollowAt(e.target.value)}
                type="datetime-local"
                className="ml-3 h-8 border border-[#d9d9d9] px-2 text-xs"
              />
            </label>
            <div className="flex justify-end gap-2">
              <Button onClick={() => setFollowMember(null)}>取消</Button>
              <Button
                variant="primary"
                loading={saving}
                disabled={!followContent.trim()}
                onClick={() => void saveFollowUp()}
              >
                保存跟进
              </Button>
            </div>
          </div>
        </Modal>
      )}
      {createOpen && (
        <div className="member-add-mask" onClick={() => setCreateOpen(false)}>
          <div className="member-add-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="member-add-head">
              <div className="flex items-center gap-2"><span className="member-add-head-x" onClick={() => setCreateOpen(false)}>✕</span><h2>添加资料</h2></div>
              <div className="member-add-head-actions">
                <button type="button" className="member-add-cancel" onClick={() => setCreateOpen(false)}>取消</button>
                <button type="button" className="member-add-submit" disabled={!memberForm.nickname || !memberForm.phone || creating} onClick={() => void createMember()}>{creating ? "提交中…" : "确定提交"}</button>
              </div>
            </div>
            <div className="member-add-body">
              <div className="member-add-row">
                <div className="member-add-label">账号</div>
                <div className="member-add-field-wrap">
                  {([["auto","自动生成账号"],["bind","绑定已有账号"],["custom","自定义创建"]] as const).map(([key, label]) => (
                    <label key={key} className={"member-add-radio" + (memberForm.account_mode === key ? " active" : "")}><input type="radio" name="member-add-account" checked={memberForm.account_mode === key} onChange={() => setMemberForm({ ...memberForm, account_mode: key })} />{label}</label>
                  ))}
                </div>
              </div>
              <div className="member-add-notice">
                <span className="member-add-notice-dot">●</span>系统将以下发资料库中的手机号作为注册手机，将昵称作为客户登录账号（如：爱笑小天使），默认密码 abc123
              </div>
              <div className="member-add-row">
                <div className="member-add-field-wrap">
                  <div className="member-add-field"><div className="member-add-field-label"><span className="req">*</span>昵称</div><div className="member-add-field-with-side"><input maxLength={28} value={memberForm.nickname} onChange={(e) => setMemberForm({ ...memberForm, nickname: e.target.value })} placeholder="3-28字符，最多14个汉字" className="form-input" /><span className="member-add-side">作为登录账号</span></div></div>
                </div>
              </div>
              <div className="member-add-row">
                <div className="member-add-field-wrap">
                  <div className="member-add-field"><div className="member-add-field-label">编号</div><div className="member-add-field-with-side"><input value={memberForm.code} onChange={(e) => setMemberForm({ ...memberForm, code: e.target.value })} placeholder="留空表示系统自动生成" className="form-input" /><span className="member-add-side">建议留空自动生成</span></div></div>
                </div>
              </div>
              <div className="member-add-row">
                <div className="member-add-field-wrap">
                  <div className="member-add-field"><div className="member-add-field-label">姓名</div><input maxLength={30} value={memberForm.real_name} onChange={(e) => setMemberForm({ ...memberForm, real_name: e.target.value })} placeholder="3-30字符，最多15个汉字" className="form-input" /></div>
                </div>
              </div>
              <div className="member-add-row">
                <div className="member-add-label">性别</div>
                <div className="member-add-field-wrap">
                  <div className="member-add-radio-group">
                    <label className="member-add-radio"><input type="radio" name="member-add-gender" checked={memberForm.gender === "1"} onChange={() => setMemberForm({ ...memberForm, gender: "1" })} />男</label>
                    <label className="member-add-radio"><input type="radio" name="member-add-gender" checked={memberForm.gender === "2"} onChange={() => setMemberForm({ ...memberForm, gender: "2" })} />女</label>
                  </div>
                </div>
              </div>
              <div className="member-add-row">
                <div className="member-add-field-wrap member-add-row-2">
                  <div className="member-add-field"><div className="member-add-field-label">手机</div><div className="member-add-field-with-side"><input value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} placeholder="" className="form-input" /><span className="member-add-side">微信和手机至少填写一项</span></div></div>
                  <div className="member-add-field"><div className="member-add-field-label">微信</div><div className="member-add-field-with-side"><input value={memberForm.wechat} onChange={(e) => setMemberForm({ ...memberForm, wechat: e.target.value })} placeholder="" className="form-input" /><label className="member-add-check"><input type="checkbox" checked={memberForm.wechat_same} onChange={(e) => setMemberForm({ ...memberForm, wechat_same: e.target.checked })} />微信同号</label></div></div>
                </div>
              </div>
              <div className="member-add-row">
                <div className="member-add-label">状态</div>
                <div className="member-add-field-wrap">
                  <div className="member-add-radio-group">
                    {([["1","公开相亲"],["2","委托红娘"],["3","完全私密"],["4","停止相亲"],["5","已经脱单"]] as const).map(([key, label]) => (
                      <label key={key} className="member-add-radio"><input type="radio" name="member-add-status" checked={memberForm.status === key} onChange={() => setMemberForm({ ...memberForm, status: key })} />{label}</label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="member-add-notice">
                <span className="member-add-notice-dot">●</span>在平台中向所有人公开显示基本信息，相亲会员可进入主页查看详细资料（不含联系方式）
              </div>
              <div className="member-add-row">
                <div className="member-add-label">来源</div>
                <div className="member-add-field-wrap">
                  <div className="member-add-radio-group">
                    <label className="member-add-radio"><input type="radio" name="member-add-source" checked={memberForm.source === "后台添加"} onChange={() => setMemberForm({ ...memberForm, source: "后台添加" })} />后台添加</label>
                    <label className="member-add-radio"><input type="radio" name="member-add-source" checked={memberForm.source === "父母登记"} onChange={() => setMemberForm({ ...memberForm, source: "父母登记" })} />父母登记</label>
                  </div>
                </div>
              </div>
              <div className="member-add-notice">
                <span className="member-add-notice-dot">●</span>请谨慎选择，一经提交，无法修改
              </div>
            </div>
          </div>
        </div>
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
                <span className="lc-set-fix"><span className="lc-set-fix-label">固定前</span><select defaultValue={0}>{Array.from({ length: 6 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select><span className="lc-set-fix-label">列</span></span>
                <span className="lc-set-fix"><span className="lc-set-fix-label">固定后</span><select defaultValue={0}>{Array.from({ length: 6 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select><span className="lc-set-fix-label">列</span></span>
              </div>
              <table className="lc-set-table">
                <thead><tr><th className="check-cell">是否显示</th><th className="name-cell">字段名称</th><th className="sort-cell">排序</th></tr></thead>
                <tbody>
                  {simpleFields.map((name, idx) => (
                    <tr key={name}>
                      <td className="check-cell"><input type="checkbox" defaultChecked /></td>
                      <td className="name-cell">{name}</td>
                      <td className="sort-cell">
                        <button type="button" className="move" disabled={idx === 0}>前移</button>
                        <button type="button" className="move" disabled={idx === simpleFields.length - 1}>后移</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
                <span className="lc-set-fix"><span className="lc-set-fix-label">固定前</span><select defaultValue={0}>{Array.from({ length: 6 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select><span className="lc-set-fix-label">列</span></span>
                <span className="lc-set-fix"><span className="lc-set-fix-label">固定后</span><select defaultValue={0}>{Array.from({ length: 6 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select><span className="lc-set-fix-label">列</span></span>
              </div>
              <table className="lc-set-table">
                <thead><tr><th className="check-cell">是否显示</th><th className="name-cell">字段名称</th><th className="sort-cell">排序</th></tr></thead>
                <tbody>
                  {simpleFields.map((name, idx) => (
                    <tr key={name}>
                      <td className="check-cell"><input type="checkbox" defaultChecked /></td>
                      <td className="name-cell">{name}</td>
                      <td className="sort-cell">
                        <button type="button" className="move" disabled={idx === 0}>前移</button>
                        <button type="button" className="move" disabled={idx === simpleFields.length - 1}>后移</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {smartOpen && (
        <div className="smart-drawer-mask" onClick={() => setSmartOpen(false)}>
          <div className="smart-drawer-panel" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="smart-drawer-head">
              <div className="flex items-center gap-2"><span className="smart-drawer-head-x">✕</span><h2>智能录入</h2></div>
              <div className="smart-drawer-head-actions">
                <button type="button" className="smart-drawer-cancel" onClick={() => setSmartOpen(false)}>取消</button>
                <button type="button" className="smart-drawer-submit">确定提交</button>
              </div>
            </div>
            <div className="smart-drawer-body">
              <div className="smart-drawer-notice"><div className="smart-drawer-notice-title">💡 须知</div><div>腾讯AI智能体+Deepseek大模型 实现信息识别，帮助婚介公司更加高效快捷的将客户信息录入到系统中</div></div>
              <div className="smart-drawer-radio-row">
                <label className="smart-drawer-radio"><input type="radio" name="ul-smart-mode" defaultChecked />文字识别录入 <span className="smart-drawer-radio-link">参考模版</span></label>
                <label className="smart-drawer-radio"><input type="radio" name="ul-smart-mode" />图片识别录入 <span className="smart-drawer-radio-link">参考模版</span></label>
              </div>
              <textarea className="smart-drawer-textarea" placeholder="复制粘贴到这里" defaultValue="" />
              <button type="button" className="smart-drawer-ai-btn">✦ 开始智能填写到下面信息中</button>
              <label className="smart-drawer-check-row"><input type="checkbox" defaultChecked />将本内容自动存储到「原始登记信息存储」字段中</label>
              <div className="smart-drawer-notice" style={{ marginTop: 10 }}><span style={{ color: "#3658f7", marginRight: 4 }}>📍</span>系统将以下发资料库中的手机号作为注册手机，将昵称作为客户登录账号（如：爱笑小天使），默认密码abc123</div>

              <div className="smart-drawer-section-title">基本资料</div>
              <div className="smart-drawer-section-title">择偶要求</div>
              <div className="smart-drawer-grid">
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">手机</div><input placeholder="请输入手机号" /></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label"><span className="req">*</span>昵称</div><div className="smart-drawer-field-with-btn"><input placeholder="请输入" /><button type="button" className="smart-drawer-auto-btn">自动生成</button></div></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">姓名</div><input placeholder="请输入姓名" /></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">性别</div><div className="smart-drawer-radio-inline"><label><input type="radio" name="ul-smart-gender" defaultChecked />男</label><label><input type="radio" name="ul-smart-gender" />女</label></div></div>
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
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">星座</div><select defaultValue=""><option value="" disabled>请选择星座</option>{["未知","魔羯座","水瓶座","双鱼座","白羊座","金牛座","双子座","巨蟹座","狮子座","处女座","天秤座","天蝎座","射手座"].map((x) => <option key={x}>{x}</option>)}</select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">民族</div><select defaultValue=""><option value="" disabled>请选择民族</option></select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">宗教</div><select defaultValue=""><option value="" disabled>请选择宗教</option></select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">结婚意向</div><select defaultValue=""><option value="" disabled>请选择结婚意向</option></select></div>
                <div className="smart-drawer-field"><div className="smart-drawer-field-label">来源</div><select defaultValue=""><option value="" disabled>请选择来源</option>{["后台添加","红娘录入","批量导入","自己注册","落地页","父母登记","线索入库","活动入库","找搭子"].map((x) => <option key={x}>{x}</option>)}</select></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function Select({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: string[][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={selectClass}
    >
      <option value="">{label}</option>
      {options.map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
function StaticSelect({
  label,
  options: customOptions,
  value,
  onChange,
}: {
  label: string;
  options?: string[];
  /** 传了 onChange 就是受控筛选（会真的参与查询）；不传则保持纯展示 */
  value?: string;
  onChange?: (value: string) => void;
}) {
  const options = customOptions ?? (label.includes("婚况")
    ? ["未婚", "离异", "丧偶"]
    : label.includes("学历")
      ? ["高中", "大专", "本科", "硕士"]
      : label.includes("职业")
        ? ["企业职员", "个体经营", "教师", "公务员"]
        : label.includes("收入")
          ? ["3000以下", "3000-8000", "8000以上"]
          : label.includes("年龄")
            ? ["18-25岁", "26-35岁", "36-45岁"]
            : ["不限", "已选择"]);
  return (
    <label className="relative block min-w-[108px]">
      <select
        {...(onChange ? { value: value ?? "", onChange: (e) => onChange(e.target.value) } : { defaultValue: "" })}
        className={`${selectClass} w-full appearance-none pr-7 text-[#8c8c8c]`}
        aria-label={label}
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 top-3 size-1.5 rotate-45 border-b border-r border-[#bfbfbf]" />
    </label>
  );
}
/**
 * 真正的多选下拉。
 *
 * 原先标着「（多选）」的控件其实是单个 <select>，选第二个值时前一个就被挤掉了。
 * 这里用原生 multiple 列表框承载多值：按住 Ctrl/⌘ 多选，选中项以英文逗号拼成
 * 一个参数传给后端（服务端按逗号拆分，见 member_crm_filter.split_values）。
 */
function MultiSelect({
  label,
  options,
  value,
  onChange,
  toParam,
}: {
  label: string;
  options: string[];
  /** 英文逗号拼接的已选文案；空串表示不限 */
  value: string;
  onChange: (value: string) => void;
  /** 文案 → 接口值；不传则原样使用文案本身 */
  toParam?: (picked: string[]) => string;
}) {
  const picked = value ? value.split(",").filter(Boolean) : [];
  return (
    <label className="relative block min-w-[108px]">
      <select
        multiple
        value={picked}
        onChange={(e) => {
          const next = Array.from(e.target.selectedOptions).map((option) => option.value);
          onChange(toParam ? toParam(next) : next.join(","));
        }}
        className="h-[42px] w-full border border-[#d9d9d9] bg-white px-2 py-1 text-xs text-[#555] outline-none focus:border-[#3658f7]"
        aria-label={label}
        title={picked.length ? picked.join("、") : label}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute -top-4 left-0 text-[10px] text-[#bfbfbf]">
        {picked.length ? `已选 ${picked.length} 项` : label}
      </span>
    </label>
  );
}
/** 文本类筛选（现居 / 家乡 / 户口 / 宗教 / 标签）：后端按 LIKE 或原值匹配。 */
function TextFilter({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? label}
      className="h-8 min-w-[108px] border border-[#d9d9d9] bg-white px-2 text-xs text-[#555] outline-none focus:border-[#3658f7]"
      aria-label={label}
    />
  );
}
function ToolButton({
  icon,
  label,
  primary,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1.5 px-3 text-xs ${primary ? "bg-[#3658f7] text-white hover:bg-[#2f4ddb]" : "border border-[#d9d9d9] text-[#595959]"}`}
    >
      {icon}
      {label}
    </button>
  );
}
function RowAction({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-6 items-center gap-0.5 border border-[#9bb6ff] bg-white px-1.5 text-[11px] text-[#3658f7] hover:border-[#3658f7] hover:bg-[#f5f7ff]"
    >
      {children}
    </button>
  );
}
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-[#595959]">
      <span>
        {label}
        {required ? <b className="ml-0.5 text-[#ff4d4f]">*</b> : null}
      </span>
      <div className="mt-1 [&_input]:h-8 [&_input]:w-full [&_input]:border [&_input]:border-[#d9d9d9] [&_input]:px-2 [&_input]:outline-none [&_input]:focus:border-[#3658f7] [&_select]:h-8 [&_select]:w-full [&_select]:border [&_select]:border-[#d9d9d9] [&_select]:bg-white [&_select]:px-2">
        {children}
      </div>
    </label>
  );
}
function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-[#8c8c8c]">{label}</div>
      <div className="mt-1 text-[#262626]">{value}</div>
    </div>
  );
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[620px] bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-4">
          <h2 className="text-base font-medium text-[#262626]">{title}</h2>
          <button
            title="关闭"
            onClick={onClose}
            className="text-[#8c8c8c] hover:text-[#262626]"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function MemberWorkspace({
  member,
  initialTab = "基本资料",
  onClose,
  onFollow,
}: {
  member: Member;
  initialTab?: string;
  onClose: () => void;
  onFollow: () => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const tabs = [
    "基本资料",
    "认证信息",
    "照片视频",
    "自我介绍",
    "择偶要求",
    "服务跟进",
    "私密信息",
    "推荐匹配",
    "通话记录",
    "牵线记录",
    "约会记录",
    "活动报名",
    "线上行为",
    "超级管理",
    "信息溯源",
  ];
  return (
    <div className="fixed inset-0 z-50 bg-black/45">
      <div className="ml-[18%] flex h-full min-w-[760px] max-w-none flex-col bg-white shadow-2xl">
        <div className="flex h-24 items-center justify-between border-b border-[#f0f0f0] px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 overflow-hidden rounded-lg bg-[#f5f5f5]">
              {member.avatar ? (
                <img
                src={resolveMediaUrl(member.avatar)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="m-4 size-6 text-[#8c8c8c]" />
              )}
            </div>
            <div>
              <div className="text-lg font-medium text-[#262626]">
                {member.nickname || "未命名会员"}
              </div>
              <div className="mt-1 text-xs text-[#8c8c8c]">
                ID：{member.id}　加入：{formatTime(member.created_at)}　跟进：
                {member.matchmaker_id ? `红娘 #${member.matchmaker_id}` : "-"}
              </div>
            </div>
          </div>
          <button
            title="关闭会员管理"
            onClick={onClose}
            className="p-1 text-[#8c8c8c] hover:text-[#262626]"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto border-b border-[#f0f0f0] px-6 pt-2">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`h-9 shrink-0 border-b-2 px-1 text-sm ${tab === item ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#595959]"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {tab === "基本资料" ? (
            <div className="grid max-w-[850px] grid-cols-3 gap-x-8 gap-y-6">
              <Info label="编号" value={String(member.id)} />
              <Info label="姓名" value={member.nickname || "未填写"} />
              <Info label="性别" value={member.gender === 2 ? "女" : "男"} />
              <Info label="生日" value={member.birthday || "未填写"} />
              <Info
                label="身高"
                value={member.height ? `${member.height} cm` : "未填写"}
              />
              <Info label="婚况" value={marital(member.is_married)} />
              <Info label="家乡" value={member.hometown || "未填写"} />
              <Info label="现居" value={member.residence || "未填写"} />
              <Info label="学历" value={member.education || "未填写"} />
              <Info label="职业" value={member.job || "未填写"} />
              <Info
                label="收入"
                value={member.income ? `${member.income} 元` : "未填写"}
              />
              <Info
                label="会员级别"
                value={member.is_vip ? "VIP会员" : "普通会员"}
              />
            </div>
          ) : tab === "服务跟进" ? (
            <div>
              <Button variant="primary" onClick={onFollow}>
                <Plus />
                添加跟进
              </Button>
              <p className="mt-5 text-sm text-[#8c8c8c]">
                服务跟进记录会在此显示。
              </p>
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-[#8c8c8c]">
              {tab} 暂无数据
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
