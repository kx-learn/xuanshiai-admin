"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Inbox } from "lucide-react";
import { asObject, asStr, useConfigDomain, type Dict } from "@/lib/platform-config";

const DEFAULTS = { items: [] as unknown[] } as const;

interface CallRow {
  id: number;
  status: string;
  callee: string;
  callee_name: string;
  agent: string;
  started_at: string | null;
  ended_at: string | null;
  seconds: number;
  record_url: string | null;
  note: string;
  record_type: string;
}

const columns = [
  "状态",
  "呼出信息",
  "通话次数",
  "呼出坐席",
  "呼出开始时间",
  "挂机时间",
  "通话时长",
  "录音回放",
  "本次通话小记(同步到服务跟进)",
];

const scopes = ["所有坐席"];
const filterBehaviors = ["按昵称搜", "按号码搜"];

export default function Page() {
  const domain = useConfigDomain<Dict>("outbound_call_records", DEFAULTS as Dict);
  const [rows, setRows] = useState<CallRow[]>([]);
  const [scope, setScope] = useState(scopes[0]);
  const [behavior, setBehavior] = useState(filterBehaviors[0]);
  const [keyword, setKeyword] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [recordType, setRecordType] = useState("member");

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    setRows(list.map((r, i) => {
      const o = asObject(r as Dict);
      return {
        id: Number(o.id ?? i + 1),
        status: asStr(o.status, "已接通"),
        callee: asStr(o.callee, ""),
        callee_name: asStr(o.callee_name, ""),
        agent: asStr(o.agent, ""),
        started_at: asStr(o.started_at, "") || null,
        ended_at: asStr(o.ended_at, "") || null,
        seconds: Number(o.seconds ?? 0),
        record_url: asStr(o.record_url, "") || null,
        note: asStr(o.note, ""),
        record_type: asStr(o.record_type, "member"),
      };
    }));
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const shown = useMemo(() => rows.filter((r) => {
    if (recordType === "member" && r.record_type !== "member") return false;
    if (recordType === "lead" && r.record_type !== "lead") return false;
    if (behavior === "按昵称搜" && keyword && !r.callee_name.includes(keyword)) return false;
    if (behavior === "按号码搜" && keyword && !r.callee.includes(keyword)) return false;
    const day = (r.started_at ?? "").slice(0, 10);
    if (fromDate && day && day < fromDate) return false;
    if (toDate && day && day > toDate) return false;
    return true;
  }), [rows, keyword, behavior, fromDate, toDate, recordType]);

  return (
    <div className="rec-page">
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          {
            label: "系统管理",
            href: "/system-setting-basic",
            children: [
              { label: "系统配置", href: "/system-setting-basic" },
              { label: "广告管理", href: "/system-setting-adconfig" },
              { label: "外呼平台", href: "/outbound-call-platform" },
              { label: "外呼状态", href: "/out-call-list" },
              { label: "呼叫记录", href: "/out-call-record" },
              { label: "签名配置", href: "/sms-signature" },
              { label: "通知配置", href: "/sms-notices" },
              { label: "短信群发", href: "/sms-group" },
              { label: "发送记录", href: "/sms-record" },
              { label: "添加账号", href: "/system-setting-admin-user-add" },
              { label: "账号管理", href: "/system-setting-admin-user" },
              { label: "权限分组", href: "/system-setting-admin-group" },
              { label: "系统日志", href: "/system-setting-admin-log" },
            ],
          },
          { label: "电话外呼" },
          { label: "呼叫记录" },
        ]}
      />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">须知</p>
          <p className="obc-notice-desc">在这里您可以快速便捷浏览、回听外呼系统所有坐席的呼出记录、通话录音和通话小记。</p>
        </div>
      </div>

      <div className="admin-card rec-card">
        <div className="rec-head">
          <h2 className="rec-title">呼叫记录</h2>
        </div>

        <div className="rec-bar">
          <div className="rec-bar-left">
            <label className="pcfg-radio">
              <input type="radio" name="recType" checked={recordType === "member"} onChange={() => setRecordType("member")} />
              <span className="pcfg-radio-dot"></span>
              <span className="pcfg-radio-label">相亲会员</span>
            </label>
            <label className="pcfg-radio">
              <input type="radio" name="recType" checked={recordType === "lead"} onChange={() => setRecordType("lead")} />
              <span className="pcfg-radio-dot"></span>
              <span className="pcfg-radio-label">客源线索</span>
            </label>
          </div>

          <div className="rec-toolbar">
            <div className="rec-select-wrap">
              <select className="rec-select" value={scope} onChange={(e) => setScope(e.target.value)}>
                {scopes.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="rec-search-group">
              <div className="rec-select-wrap rec-behavior">
                <select className="rec-select" value={behavior} onChange={(e) => setBehavior(e.target.value)}>
                  {filterBehaviors.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <input className="rec-input" placeholder="请输入" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
            </div>

            <button type="button" className="rec-search-btn">搜索</button>

            <div className="rec-range">
              <input type="date" className="rec-input rec-date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} placeholder="开始日期" />
              <span className="rec-range-arrow">→</span>
              <input type="date" className="rec-input rec-date" value={toDate} onChange={(e) => setToDate(e.target.value)} placeholder="结束日期" />
            </div>
          </div>
        </div>

        <div className="rec-body">
          <table className="rec-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="rec-empty">
                    <Inbox className="rec-empty-icon" />
                    <span>{domain.loading ? "加载中…" : "暂无数据"}</span>
                  </td>
                </tr>
              ) : shown.map((r) => (
                <tr key={r.id}>
                  <td>{r.status}</td>
                  <td>{r.callee_name ? `${r.callee_name}（${r.callee}）` : r.callee}</td>
                  <td>1</td>
                  <td>{r.agent || "-"}</td>
                  <td>{r.started_at ? r.started_at.replace("T", " ").slice(0, 19) : "-"}</td>
                  <td>{r.ended_at ? r.ended_at.replace("T", " ").slice(0, 19) : "-"}</td>
                  <td>{r.seconds > 0 ? `${r.seconds}秒` : "0秒"}</td>
                  <td>
                    {r.record_url ? (
                      <a className="text-[#3658f7] text-sm" href={r.record_url} target="_blank" rel="noreferrer">回放</a>
                    ) : "-"}
                  </td>
                  <td>{r.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
