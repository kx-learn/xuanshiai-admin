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
import { Button } from "@/components/ui/button";
import MemberDetailWorkspace from "@/components/MemberDetailWorkspace";
import Link from "next/link";

type Member = {
  id: number;
  nickname?: string | null;
  phone?: string | null;
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
  income?: number | null;
  hometown?: string | null;
  residence?: string | null;
  education?: string | null;
  job?: string | null;
  auth_status?: number | null;
  intention_level?: number | null;
  last_follow_at?: string | null;
  next_follow_at?: string | null;
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
};
const initialFilters: Filters = {
  search: "",
  gender: "",
  status: "",
  vip: "",
  auth_status: "",
  assigned: "",
  follow_state: "",
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
  const [activeQuickFilter, setActiveQuickFilter] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [followMember, setFollowMember] = useState<Member | null>(null);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [detailTab, setDetailTab] = useState("基本资料");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [pageSize, setPageSize] = useState(20);
  const [followContent, setFollowContent] = useState("");
  const [nextFollowAt, setNextFollowAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [rowAuth, setRowAuth] = useState<Record<number, string>>({});
  const [rowIntentions, setRowIntentions] = useState<Record<number, string>>({});
  const [rowMatchmakers, setRowMatchmakers] = useState<Record<number, string>>({});
  const [matchmakers, setMatchmakers] = useState<Matchmaker[]>([]);
  const [importing, setImporting] = useState(false);
  const [memberForm, setMemberForm] = useState({
    nickname: "",
    phone: "",
    gender: "1",
    birthday: "",
    is_married: "",
    remark: "",
  });
  const importInput = useRef<HTMLInputElement>(null);
  const load = useCallback(async () => {
    setLoading(true);
    const query: Record<string, string | number | undefined> = {
      page,
      page_size: pageSize,
      sort_by: sortBy,
      ...filters,
    };
    Object.keys(query).forEach((key) => {
      if (query[key] === "") delete query[key];
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
  useEffect(() => {
    void adminApi<{ items: Matchmaker[] }>("admin/matchmaker/matchmakers", {
      query: { page: 1, page_size: 50 },
    }).then((result) => setMatchmakers(result.items)).catch(() => setMatchmakers([]));
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
          remark: memberForm.remark || null,
        },
      });
      setCreateOpen(false);
      setMemberForm({
        nickname: "",
        phone: "",
        gender: "1",
        birthday: "",
        is_married: "",
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
      <AdminBreadcrumb items={getBreadcrumb("会员CRM", "资料管理")} />
      <section className="bg-white px-6 pb-4 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0f0f0] pb-3">
          <div className="flex h-9 items-start gap-7 text-sm">
            <button className="h-9 border-b-2 border-[#3658f7] px-0 text-[#3658f7]">
              会员资料
            </button>
            <button className="text-[#333]">弃海会员(0)</button>
            <button className="text-[#333]">弃海记录</button>
          </div>
          <div className="flex gap-2">
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
              onClick={() => setCreateOpen(true)}
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
        <div className="grid grid-cols-1 gap-3 py-4 sm:grid-cols-2 xl:grid-cols-7">
          <StaticSelect label="门店：不限" />
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
              ["0", "未认证"],
              ["1", "审核中"],
              ["2", "已通过"],
              ["3", "未通过"],
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
            options={["高意向", "中意向", "低意向"]}
          />
          <StaticSelect label="登记：不限" />
          <StaticSelect label="推广红娘" />
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
              <StaticSelect label="年龄：不限" />
              <StaticSelect label="婚况：不限（多选）" />
              <StaticSelect label="身高：不限" />
              <StaticSelect label="学历：不限（多选）" />
              <StaticSelect label="职业：不限（多选）" />
              <StaticSelect label="收入：不限（多选）" />
              <StaticSelect label="现居：不限" />
              <Select
                value={draft.vip}
                onChange={(vip) => setDraft({ ...draft, vip })}
                label="会员级别：不限"
                options={[["true", "VIP"], ["false", "普通会员"]]}
              />
              <StaticSelect label="实名：不限" />
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowMoreFilters((current) => !current)}
          aria-expanded={showMoreFilters}
          className="mb-4 inline-flex items-center text-xs text-[#3658f7]"
        >
          {showMoreFilters ? "收起选项" : "更多选项"}
          <span className={`ml-2 size-1.5 border-b border-r border-current ${showMoreFilters ? "-translate-y-px rotate-[225deg]" : "-translate-y-0.5 rotate-45"}`} />
        </button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex h-8">
            <label className="relative flex h-8 items-center border border-r-0 border-[#d9d9d9] bg-white text-xs text-[#595959]">
              <select className="h-full appearance-none bg-transparent py-0 pl-3 pr-7 outline-none">
                <option>智能搜索</option>
                <option>昵称</option>
                <option>手机号</option>
                <option>会员编号</option>
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
                <option value="created_at">注册时间</option>
                <option value="last_login_at">最后登录</option>
                <option value="last_follow_at">最后跟进</option>
                <option value="next_follow_at">下次跟进</option>
              </select>
            </label>
          </div>
          <div className="flex overflow-hidden border border-[#d9d9d9] text-xs">
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
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-8">
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
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[1250px] w-full text-xs">
            <thead className="bg-[#fafafa] text-[#333]">
              <tr>
                {[
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
                ].map((name) => (
                  <th key={name} className="p-3 text-left font-medium">
                    {name || <input type="checkbox" aria-label="全选会员" checked={allSelected} onChange={toggleAll} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-[#8c8c8c]">
                    加载中...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-[#d4380d]">
                    {loadError}
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-[#8c8c8c]">
                    暂无数据
                  </td>
                </tr>
              ) : (
                rows.map((m) => (
                  <tr
                    key={m.id}
                    className={`align-top border-t border-[#f0f0f0] hover:bg-[#fcfcff] ${selectedIds.includes(m.id) ? "bg-[#f5f7ff]" : ""}`}
                  >
                    <td className="p-3">
                      <input type="checkbox" aria-label={`选择会员 ${m.id}`} checked={selectedIds.includes(m.id)} onChange={() => toggleRow(m.id)} />
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
                      <button
                        onClick={() => setFollowMember(m)}
                        className="mt-2 text-[#3658f7]"
                      >
                        放入弃海
                      </button>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {selectedIds.length > 0 && (
          <div className="sticky bottom-0 z-10 flex h-12 items-center gap-3 border border-[#d9d9d9] bg-white px-4 text-xs shadow-sm">
            <span className="text-[#595959]">已选 {selectedIds.length} 条</span>
            <button type="button" disabled={saving} onClick={() => void batchStatus(1)} className="border border-[#d9d9d9] px-3 py-1.5 text-[#595959] disabled:opacity-50">批量设为公开</button>
            <button type="button" disabled={saving} onClick={() => void batchStatus(2)} className="border border-[#d9d9d9] px-3 py-1.5 text-[#595959] disabled:opacity-50">批量冻结</button>
            <button type="button" disabled title="后端尚未提供弃海数据接口" className="cursor-not-allowed border border-[#d9d9d9] px-3 py-1.5 text-[#bfbfbf]">加入弃海</button>
            <button type="button" onClick={() => setSelectedIds([])} className="ml-auto text-[#3658f7]">取消选择</button>
          </div>
        )}
        <div className="flex items-center justify-between py-3 text-xs text-[#8c8c8c]">
          <span>共 {total} 条，每页 {pageSize} 条</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              aria-label="上一页"
              className="grid size-7 place-items-center border border-[#d9d9d9] text-[#595959] disabled:text-[#d9d9d9]"
            ><span className="size-1.5 rotate-45 border-b border-l border-current" /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map((item) => <button key={item} type="button" onClick={() => setPage(item)} className={`grid size-7 place-items-center border ${page === item ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#595959]"}`}>{item}</button>)}
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              aria-label="下一页"
              className="grid size-7 place-items-center border border-[#d9d9d9] text-[#595959] disabled:text-[#d9d9d9]"
            ><span className="size-1.5 -rotate-45 border-r border-t border-current" /></button>
            <label className="relative ml-2"><select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-7 appearance-none border border-[#d9d9d9] bg-white py-0 pl-2 pr-7 text-xs text-[#595959]"><option value={20}>20 条/页</option><option value={50}>50 条/页</option><option value={100}>100 条/页</option></select><span className="pointer-events-none absolute right-2 top-2 size-1.5 rotate-45 border-b border-r border-[#8c8c8c]" /></label>
          </div>
        </div>
      </section>
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
        <Modal title="添加会员资料" onClose={() => setCreateOpen(false)}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="昵称" required>
              <input
                value={memberForm.nickname}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, nickname: e.target.value })
                }
                className="form-input"
              />
            </Field>
            <Field label="手机号" required>
              <input
                value={memberForm.phone}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, phone: e.target.value })
                }
                className="form-input"
              />
            </Field>
            <Field label="性别" required>
              <select
                value={memberForm.gender}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, gender: e.target.value })
                }
                className="form-input"
              >
                <option value="1">男</option>
                <option value="2">女</option>
              </select>
            </Field>
            <Field label="出生日期">
              <input
                type="date"
                value={memberForm.birthday}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, birthday: e.target.value })
                }
                className="form-input"
              />
            </Field>
            <Field label="婚况">
              <select
                value={memberForm.is_married}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, is_married: e.target.value })
                }
                className="form-input"
              >
                <option value="">未填写</option>
                <option value="1">未婚</option>
                <option value="2">离异</option>
                <option value="3">丧偶</option>
              </select>
            </Field>
            <Field label="备注">
              <input
                value={memberForm.remark}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, remark: e.target.value })
                }
                className="form-input"
              />
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={() => setCreateOpen(false)}>取消</Button>
            <Button
              variant="primary"
              loading={creating}
              disabled={!memberForm.nickname || !memberForm.phone}
              onClick={() => void createMember()}
            >
              保存
            </Button>
          </div>
        </Modal>
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
function StaticSelect({ label, options: customOptions }: { label: string; options?: string[] }) {
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
        defaultValue=""
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
