"use client";
import { useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Info, Inbox, Search, Calendar, ChevronDown } from "lucide-react";

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
  rows: Row[];
  showPagination?: boolean;
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
    rows: [
      { id: "1907", account: "shushu", time: "2026-09-08 16:01:32", ip: "117.147.79.141" },
      { id: "1905", account: "shushu", time: "2026-09-08 14:20:33", ip: "117.147.79.141" },
      { id: "1903", account: "shushu", time: "2026-09-08 14:08:30", ip: "117.147.79.141" },
      { id: "1895", account: "shushu", time: "2026-07-07 15:32:35", ip: "117.147.79.141" },
      { id: "1893", account: "shushu", time: "2026-07-07 15:28:46", ip: "45.67.201.104" },
      { id: "1892", account: "shushu", time: "2026-07-07 15:28:36", ip: "45.67.201.104" },
      { id: "1891", account: "shushu", time: "2026-07-07 15:28:36", ip: "45.67.201.104" },
      { id: "1888", account: "shushu", time: "2026-09-06 17:26:39", ip: "117.147.79.141" },
      { id: "1887", account: "shushu", time: "2026-09-06 17:25:59", ip: "117.147.79.141" },
      { id: "1886", account: "shushu", time: "2026-09-06 17:25:55", ip: "117.147.79.141" },
      { id: "1885", account: "shushu", time: "2026-09-06 17:25:50", ip: "117.147.79.141" },
      { id: "1879", account: "shushu", time: "2026-09-06 16:28:49", ip: "45.67.201.104" },
      { id: "1876", account: "shushu", time: "2026-09-06 16:13:40", ip: "117.147.79.141" },
      { id: "1873", account: "shushu", time: "2026-09-04 19:25:18", ip: "117.147.79.61" },
    ],
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
    rows: [
      { id: "643", account: "三土", time: "2026-06-12 10:16:18", ip: "180.111.215.178" },
      { id: "640", account: "三土", time: "2026-06-11 22:04:29", ip: "122.192.14.204" },
      { id: "273", account: "刘佳", time: "2026-06-04 11:38:45", ip: "180.111.214.207" },
      { id: "246", account: "admin", time: "2026-06-03 14:06:11", ip: "180.111.214.207" },
    ],
    showPagination: true,
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
    rows: [
      { id: "467", operator: "三土", target: "越可名", time: "2026-07-22 10:59:54", ip: "121.225.22.223" },
      { id: "465", operator: "三土", target: "乌龙茶607i", time: "2026-07-22 10:59:44", ip: "121.225.22.223" },
      { id: "463", operator: "三土", target: "别借我橘子", time: "2026-07-22 10:58:26", ip: "121.225.22.223" },
      { id: "461", operator: "三土", target: "优米", time: "2026-07-22 10:57:19", ip: "121.225.22.223" },
      { id: "459", operator: "三土", target: "小喵", time: "2026-07-22 10:56:39", ip: "121.225.22.223" },
      { id: "457", operator: "三土", target: "Karo", time: "2026-07-22 10:56:01", ip: "121.225.22.223" },
      { id: "455", operator: "三土", target: "Natash", time: "2026-07-22 10:55:53", ip: "121.225.22.223" },
      { id: "453", operator: "三土", target: "暖风拂过", time: "2026-07-22 10:55:45", ip: "121.225.22.223" },
      { id: "451", operator: "三土", target: "毛毛Oyg2", time: "2026-07-22 10:55:38", ip: "121.225.22.223" },
      { id: "449", operator: "三土", target: "eRolia", time: "2026-07-22 10:55:14", ip: "121.225.22.223" },
      { id: "447", operator: "三土", target: "muf", time: "2026-07-22 10:55:04", ip: "121.225.22.223" },
      { id: "445", operator: "三土", target: "小猪", time: "2026-07-22 10:54:59", ip: "121.225.22.223" },
      { id: "443", operator: "三土", target: "石头", time: "2026-07-22 10:54:52", ip: "121.225.22.223" },
      { id: "441", operator: "李会强", target: "秋刀鱼", time: "2026-07-19 14:11:12", ip: "121.225.22.223" },
    ],
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
    rows: [],
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
    rows: [
      { id: "469", operator: "shushu", target: "O。o彡\n(ID: 760)", time: "2026-08-20 22:22:20", ip: "121.225.22.223" },
      { id: "468", operator: "三土", target: "越可名\n(ID: 707)", time: "2026-07-22 10:59:55", ip: "121.225.22.223" },
      { id: "466", operator: "三土", target: "乌龙茶607i\n(ID: 709)", time: "2026-07-22 10:59:45", ip: "121.225.22.223" },
      { id: "464", operator: "三土", target: "别借我橘子\n(ID: 26)", time: "2026-07-22 10:58:26", ip: "121.225.22.223" },
      { id: "462", operator: "三土", target: "优米\n(ID: 745)", time: "2026-07-22 10:57:20", ip: "121.225.22.223" },
      { id: "460", operator: "三土", target: "小喵\n(ID: 744)", time: "2026-07-22 10:56:41", ip: "121.225.22.223" },
      { id: "458", operator: "三土", target: "Karo\n(ID: 682)", time: "2026-07-22 10:56:02", ip: "121.225.22.223" },
      { id: "456", operator: "三土", target: "Natash\n(ID: 692)", time: "2026-07-22 10:55:55", ip: "121.225.22.223" },
      { id: "454", operator: "三土", target: "暖风拂过\n(ID: 673)", time: "2026-07-22 10:55:46", ip: "121.225.22.223" },
      { id: "452", operator: "三土", target: "毛毛Oyg2\n(ID: 675)", time: "2026-07-22 10:55:39", ip: "121.225.22.223" },
      { id: "450", operator: "三土", target: "eRolia\n(ID: 657)", time: "2026-07-22 10:55:15", ip: "121.225.22.223" },
      { id: "448", operator: "三土", target: "muf\n(ID: 667)", time: "2026-07-22 10:55:05", ip: "121.225.22.223" },
      { id: "446", operator: "三土", target: "小猪\n(ID: 668)", time: "2026-07-22 10:55:00", ip: "121.225.22.223" },
      { id: "444", operator: "三土", target: "石头\n(ID: 670)", time: "2026-07-22 10:54:54", ip: "121.225.22.223" },
    ],
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
    rows: [
      { id: "415", operator: "admin", target: "O。o彡\n将手机号：18856767690 修改为：18956767690", time: "2026-06-28 16:46:38", ip: "49.77.196.32" },
      { id: "414", operator: "admin", target: "O。o彡\n将手机号：18856767690 修改为：19856767690", time: "2026-06-28 16:36:53", ip: "49.77.196.32" },
      { id: "413", operator: "admin", target: "出现1\n将手机号：13285268800 修改为：13285288888", time: "2026-06-28 16:27:56", ip: "49.77.196.32" },
      { id: "412", operator: "admin", target: "出现1\n将手机号：13285268888 修改为：13285288800", time: "2026-06-28 16:16:36", ip: "49.77.196.32" },
      { id: "409", operator: "芸希老师", target: "不吃猪肉\n将手机号：17551158019 修改为：17551157098", time: "2026-06-27 16:39:21", ip: "114.222.57.246" },
      { id: "408", operator: "芸希老师", target: "MMARLO\n将手机号：17756898209 修改为：17756897650", time: "2026-06-27 16:39:10", ip: "114.222.57.246" },
      { id: "407", operator: "芸希老师", target: "Z\n将手机号：13951913934 修改为：13951917850", time: "2026-06-27 16:39:00", ip: "114.222.57.246" },
      { id: "406", operator: "芸希老师", target: "杭月\n将手机号：15236510661 修改为：15236515539", time: "2026-06-27 16:38:51", ip: "114.222.57.246" },
      { id: "405", operator: "芸希老师", target: "虫雨虫虫\n将手机号：17860889761 修改为：17860889970", time: "2026-06-27 16:38:31", ip: "114.222.57.246" },
      { id: "404", operator: "芸希老师", target: "在郑州\n将手机号：15706036991 修改为：15706033999", time: "2026-06-27 16:38:24", ip: "114.222.57.246" },
    ],
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
    rows: [],
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
          <option value="santu">三土</option>
          <option value="shushu">shushu</option>
          <option value="admin">admin</option>
        </select>
        <ChevronDown className="syslog-select-chevron" />
      </span>
    </label>
  );
}

function DateRange() {
  return (
    <div className="syslog-daterange">
      <span className="syslog-date">
        <Calendar className="syslog-date-ico" />
        <span className="syslog-date-text">开始日期</span>
      </span>
      <span className="syslog-date-arrow">→</span>
      <span className="syslog-date">
        <Calendar className="syslog-date-ico" />
        <span className="syslog-date-text">结束日期</span>
      </span>
    </div>
  );
}

function FilterBar({ tab, admin, setAdmin, keyword, setKeyword }: { tab: TabDef; admin: string; setAdmin: (v: string) => void; keyword: string; setKeyword: (v: string) => void }) {
  if (tab.filter === "input") {
    return (
      <div className="syslog-filter">
        <input className="syslog-input syslog-input-w" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="账号关键词搜索" />
        <button className="syslog-search-btn">
          <Search className="syslog-search-ico" />
          搜索
        </button>
      </div>
    );
  }
  return (
    <div className="syslog-filter">
      <AdminSelect label="管理员：" value={admin} onChange={setAdmin} />
      <DateRange />
      {tab.filter === "rangeInput" && (
        <>
          <input className="syslog-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="被删除的账号/手机" />
          <button className="syslog-search-btn">
            <Search className="syslog-search-ico" />
            搜索
          </button>
        </>
      )}
    </div>
  );
}

function Table({ tab }: { tab: TabDef }) {
  if (tab.rows.length === 0) {
    return (
      <div className="syslog-empty">
        <Inbox className="syslog-empty-icon" />
        <span className="syslog-empty-text">暂无数据</span>
      </div>
    );
  }
  return (
    <div className="syslog-table-wrap">
      <table className="syslog-table">
        <thead>
          <tr>
            {tab.columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tab.rows.map((row, idx) => (
            <tr key={row.id || idx}>
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

export default function Page() {
  const breadcrumb = getBreadcrumb("系统管理", "系统日志");
  const [active, setActive] = useState("login");
  const [admin, setAdmin] = useState("all");
  const [keyword, setKeyword] = useState("");
  const tab = TABS.find((t) => t.key === active) ?? TABS[0];

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="admin-card syslog-card">
        <div className="syslog-tabs">
          {TABS.map((t) => (
            <button key={t.key} className={`syslog-tab ${active === t.key ? "active" : ""}`} onClick={() => setActive(t.key)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab.notice && <Notice text={tab.notice} />}

        <FilterBar tab={tab} admin={admin} setAdmin={setAdmin} keyword={keyword} setKeyword={setKeyword} />

        <Table tab={tab} />

        {tab.showPagination && (
          <div className="syslog-pagination">
            <button className="syslog-page-btn">‹</button>
            <span className="syslog-page-num">1</span>
            <button className="syslog-page-btn">›</button>
          </div>
        )}
      </div>
    </div>
  );
}
