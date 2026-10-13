"use client";
import { useCallback, useEffect, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Info, Inbox, Search, Calendar, ChevronDown } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";
import AdminPagination from "@/components/AdminPagination";

type Row = Record<string, string>;

interface ColumnDef {
  title: string;
  key: string;
  width?: number;
}

interface TabDef {
  key: string;
  label: string;
  notice?: string;
  filter: "input" | "range" | "rangeInput";
  columns: ColumnDef[];
  /** 数据来源：login = 后台登录日志接口；audit = 通用审计日志（按 action 前缀） */
  source: { kind: "login" } | { kind: "audit"; prefix: string };
}

const TABS: TabDef[] = [
  {
    key: "login",
    label: "后台登录日志",
    notice: "系统后台的每次登录都会生成日志记录",
    filter: "input",
    columns: [
      { title: "ID", key: "id", width: 110 },
      { title: "账号", key: "account" },
      { title: "时间", key: "time" },
      { title: "IP地址", key: "ip" },
    ],
    source: { kind: "login" },
  },
  {
    key: "password",
    label: "后台密码修改日志",
    filter: "range",
    columns: [
      { title: "ID", key: "id", width: 110 },
      { title: "账号", key: "account" },
      { title: "时间", key: "time" },
      { title: "IP地址", key: "ip" },
    ],
    source: { kind: "audit", prefix: "admin_account.password" },
  },
  {
    key: "memberDel",
    label: "会员删除日志",
    notice: "管理员删除会员的时候系统会记录下操作日志，方便平台管理者对于每个被删除的会员都可以有据可查",
    filter: "rangeInput",
    columns: [
      { title: "ID", key: "id", width: 90 },
      { title: "操作人", key: "operator", width: 120 },
      { title: "账号/会员/客源", key: "target" },
      { title: "操作时间", key: "time" },
      { title: "IP地址", key: "ip" },
    ],
    source: { kind: "audit", prefix: "member.delete" },
  },
  {
    key: "leadDel",
    label: "客源线索删除日志",
    notice: "管理员删除客源线索的时候系统会记录下操作日志，方便平台管理者对于每个被删除的客源都可以有据可查",
    filter: "rangeInput",
    columns: [
      { title: "ID", key: "id", width: 90 },
      { title: "操作人", key: "operator", width: 120 },
      { title: "账号/会员/客源", key: "target" },
      { title: "操作时间", key: "time" },
      { title: "IP地址", key: "ip" },
    ],
    source: { kind: "audit", prefix: "lead.delete" },
  },
  {
    key: "accountDel",
    label: "账号删除日志",
    notice: "账号被删除的时候会被记录下操作时间、操作账号、IP地址。方便平台管理者对于每个被删除的账号都可以有据可查",
    filter: "rangeInput",
    columns: [
      { title: "ID", key: "id", width: 90 },
      { title: "操作人", key: "operator", width: 120 },
      { title: "账号/会员/客源", key: "target" },
      { title: "操作时间", key: "time" },
      { title: "IP地址", key: "ip" },
    ],
    source: { kind: "audit", prefix: "admin_account.status" },
  },
  {
    key: "memberMobile",
    label: "会员CRM手机号修改日志",
    notice: "会员CRM手机号被修改的时候会被记录下操作时间、操作账号、IP地址。方便平台管理者对于每次修改都可以有据可查",
    filter: "rangeInput",
    columns: [
      { title: "ID", key: "id", width: 90 },
      { title: "操作人", key: "operator", width: 120 },
      { title: "账号/会员/客源", key: "target" },
      { title: "操作时间", key: "time" },
      { title: "IP地址", key: "ip" },
    ],
    source: { kind: "audit", prefix: "member.mobile" },
  },
  {
    key: "leadMobile",
    label: "客源线索手机号修改日志",
    notice: "客源线索手机号被修改的时候会被记录下操作时间、操作账号、IP地址。方便平台管理者对于每次修改都可以有据可查",
    filter: "rangeInput",
    columns: [
      { title: "ID", key: "id", width: 90 },
      { title: "操作人", key: "operator", width: 120 },
      { title: "账号/会员/客源", key: "target" },
      { title: "操作时间", key: "time" },
      { title: "IP地址", key: "ip" },
    ],
    source: { kind: "audit", prefix: "lead.mobile" },
  },
];

function Notice({ text }: { text: string }) {
  return (
    <div className="obc-notice syslog-notice">
      <span className="obc-notice-i">
        <Info className="w-2.5 h-2.5" />
      </span>
      <div className="obc-notice-body">
        <p className="obc-notice-t">须知</p>
        <p className="obc-notice-desc">{text}</p>
      </div>
    </div>
  );
}

function AdminSelect({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="syslog-select-wrap">
      {label && <span className="syslog-select-label">{label}</span>}
      <span className="syslog-select-holder">
        <select className="syslog-select" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="all">不限</option>
          <option value="current">当前管理员</option>
        </select>
        <ChevronDown className="syslog-select-chevron" />
      </span>
    </label>
  );
}

function DateRange({ from, to, setFrom, setTo }: { from: string; to: string; setFrom: (value: string) => void; setTo: (value: string) => void }) {
  return (
    <div className="syslog-daterange">
      <label className="syslog-date">
        <Calendar className="syslog-date-ico" />
        <input aria-label="开始日期" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
      </label>
      <span className="syslog-date-arrow">→</span>
      <label className="syslog-date">
        <Calendar className="syslog-date-ico" />
        <input aria-label="结束日期" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
      </label>
    </div>
  );
}

function FilterBar({ tab, admin, setAdmin, keyword, setKeyword, from, to, setFrom, setTo, onSearch }: { tab: TabDef; admin: string; setAdmin: (v: string) => void; keyword: string; setKeyword: (v: string) => void; from: string; to: string; setFrom: (v: string) => void; setTo: (v: string) => void; onSearch: () => void }) {
  if (tab.filter === "input") {
    return (
      <div className="syslog-filter">
        <input className="syslog-input syslog-input-w" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="账号关键词搜索" onKeyDown={(e) => e.key === "Enter" && onSearch()} />
        <button className="syslog-search-btn" onClick={onSearch}>
          <Search className="syslog-search-ico" />
          搜索
        </button>
      </div>
    );
  }
  return (
    <div className="syslog-filter">
      <AdminSelect label="管理员：" value={admin} onChange={setAdmin} />
      <DateRange from={from} to={to} setFrom={setFrom} setTo={setTo} />
      {tab.filter === "rangeInput" && (
        <>
          <input className="syslog-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="被删除的账号/手机" onKeyDown={(e) => e.key === "Enter" && onSearch()} />
          <button className="syslog-search-btn" onClick={onSearch}>
            <Search className="syslog-search-ico" />
            搜索
          </button>
        </>
      )}
    </div>
  );
}

function Table({ tab, rows, loading, selectedIds, onToggleAll, onToggle }: { tab: TabDef; rows: Row[]; loading: boolean; selectedIds: string[]; onToggleAll: (checked: boolean) => void; onToggle: (id: string, checked: boolean) => void }) {
  if (rows.length === 0) {
    return (
      <div className="syslog-empty">
        <Inbox className="syslog-empty-icon" />
        <span className="syslog-empty-text">{loading ? "加载中…" : "暂无数据"}</span>
      </div>
    );
  }
  return (
    <div className="syslog-table-wrap">
      <table className="syslog-table">
        <thead>
          <tr>
            <th><input type="checkbox" aria-label="全选日志" checked={rows.length > 0 && rows.every((row) => selectedIds.includes(row.id))} onChange={(event) => onToggleAll(event.target.checked)} /></th>
            {tab.columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id || idx}>
              <td><input type="checkbox" aria-label={`选择日志 ${row.id}`} checked={selectedIds.includes(row.id)} onChange={(event) => onToggle(row.id, event.target.checked)} /></td>
              {tab.columns.map((col) => (
                <td key={col.key} className={col.key === "target" ? "syslog-td-target" : ""}>{row[col.key] ?? ""}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const fmt = (v: unknown) => String(v ?? "").replace("T", " ").slice(0, 19);

export default function Page() {
  const breadcrumb = getBreadcrumb("系统管理", "系统日志");
  const [active, setActive] = useState("login");
  const [admin, setAdmin] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const tab = TABS.find((t) => t.key === active) ?? TABS[0];

  useEffect(() => {
    void adminApi<{ account: { id: number } }>("/admin/matchmaker/auth/me")
      .then((data) => setCurrentAdminId(data.account?.id ?? null))
      .catch(() => setCurrentAdminId(null));
  }, []);

  const load = useCallback(async (kw: string, nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    setSelectedIds([]);
    try {
      if (tab.source.kind === "login") {
        const qs = new URLSearchParams({ page: String(nextPage), page_size: String(nextPageSize) });
        if (kw) qs.set("username", kw);
        const data = await adminApi<{ items: Record<string, unknown>[]; total: number }>(`/admin/matchmaker/accounts/login-logs?${qs.toString()}`);
        setRows((data.items ?? []).map((it) => ({
          id: String(it.id ?? ""),
          account: String(it.username ?? ""),
          time: fmt(it.created_at),
          ip: String(it.ip ?? "-"),
        })));
        setTotal(data.total ?? 0);
      } else {
        const qs = new URLSearchParams({ page: String(nextPage), page_size: String(nextPageSize), action_prefix: tab.source.kind === "audit" ? tab.source.prefix : "" });
        if (kw) qs.set("keyword", kw);
        if (from) qs.set("from", `${from}T00:00:00`);
        if (admin === "current" && currentAdminId) qs.set("actor_account_id", String(currentAdminId));
        if (to) qs.set("to", `${to}T23:59:59`);
        const data = await adminApi<{ items: Record<string, unknown>[]; total: number }>(`/admin/matchmaker/audit-logs?${qs.toString()}`);
        setRows((data.items ?? []).map((it) => ({
          id: String(it.id ?? ""),
          operator: String(it.actor_name ?? it.actor_account_id ?? "-"),
          account: String(it.actor_name ?? it.actor_account_id ?? "-"),
          target: `${it.action ?? ""}${it.resource_type ? ` (${it.resource_type}${it.resource_id ? `:${it.resource_id}` : ""})` : ""}${it.reason ? `\n${it.reason}` : ""}`,
          time: fmt(it.created_at),
          ip: "-",
        })));
        setTotal(data.total ?? 0);
      }
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "日志加载失败", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [admin, currentAdminId, from, page, pageSize, tab, to]);

  useEffect(() => { void load(keyword, page, pageSize); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [active, page, pageSize, load]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="admin-card syslog-card">
        <div className="syslog-tabs">
          {TABS.map((t) => (
            <button key={t.key} className={`syslog-tab ${active === t.key ? "active" : ""}`} onClick={() => { setActive(t.key); setKeyword(""); setPage(1); }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab.notice && <Notice text={tab.notice} />}

        <FilterBar tab={tab} admin={admin} setAdmin={(value) => { setAdmin(value); setPage(1); }} keyword={keyword} setKeyword={setKeyword} from={from} to={to} setFrom={(value) => { setFrom(value); setPage(1); }} setTo={(value) => { setTo(value); setPage(1); }} onSearch={() => { setPage(1); void load(keyword, 1, pageSize); }} />

        <Table tab={tab} rows={rows} loading={loading} selectedIds={selectedIds} onToggleAll={(checked) => setSelectedIds(checked ? rows.map((row) => row.id) : [])} onToggle={(id, checked) => setSelectedIds((current) => checked ? [...current, id] : current.filter((value) => value !== id))} />
        {selectedIds.length > 0 && <div className="lead-bulk-toolbar"><span>已选择 <b>{selectedIds.length}</b> 项</span><button type="button" onClick={() => setSelectedIds([])}>取消选择</button></div>}
        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      </div>
    </div>
  );
}
