"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { getAdminToken } from "@/lib/admin-api";
import PageSizeSelect from "@/components/PageSizeSelect";

type Log = { id: number; account_id: number | null; username: string; login_status: 0 | 1; ip: string | null; user_agent: string | null; device_id: string | null; failure_reason: string | null; created_at: string };
type Page = { items: Log[]; page: number; page_size: number; total: number; has_more: boolean };
const mockLogs: Log[] = [
  { id: 1733, account_id: 54, username: "出现1", login_status: 1, ip: "122.236.69.46:33078", user_agent: null, device_id: null, failure_reason: null, created_at: "2026-08-20 16:37:57" },
  { id: 1732, account_id: 54, username: "出现1", login_status: 1, ip: "122.236.69.46:33080", user_agent: null, device_id: null, failure_reason: null, created_at: "2026-08-20 16:37:43" },
  { id: 1731, account_id: 54, username: "出现1", login_status: 1, ip: "122.236.69.46:33082", user_agent: null, device_id: null, failure_reason: null, created_at: "2026-08-20 16:37:34" },
  { id: 1730, account_id: 54, username: "出现1", login_status: 1, ip: "122.236.69.46:33078", user_agent: null, device_id: null, failure_reason: null, created_at: "2026-08-20 16:36:55" },
  { id: 1729, account_id: 54, username: "出现1", login_status: 1, ip: "122.236.69.46:33082", user_agent: null, device_id: null, failure_reason: null, created_at: "2026-08-20 16:36:34" },
  { id: 1724, account_id: 642, username: "当当", login_status: 1, ip: "39.144.156.63:46346", user_agent: null, device_id: null, failure_reason: null, created_at: "2026-08-14 06:49:06" },
];

export default function RegUserLogPage() {
  const [query, setQuery] = useState({ username: "", account_id: "", from: "", to: "" });
  const [result, setResult] = useState<Page>({ items: [], page: 1, page_size: 20, total: 0, has_more: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    if (getAdminToken() === "local-demo-token") {
      setResult({ items: mockLogs, page: 1, page_size: 20, total: mockLogs.length, has_more: false });
      setLoading(false);
      return;
    }
    try { setResult(await adminEndpoints.adminLoginLogs({ page, page_size: 20, username: query.username.trim() || undefined, account_id: query.account_id || undefined, from: query.from || undefined, to: query.to || undefined }) as Page); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "登录日志加载失败"); }
    finally { setLoading(false); }
  }, [query]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLElement>(".admin-pagination span:not(.ellipsis):not(.page-size)"));
    const handlers = links.map((link) => { const handler = () => { const page = Number(link.textContent?.trim()); if (page) void load(page); }; link.addEventListener("click", handler); return [link, handler] as const; });
    return () => handlers.forEach(([link, handler]) => link.removeEventListener("click", handler));
  }, [load, result.items]);
  return <div>
    <AdminBreadcrumb items={getBreadcrumb("平台账号", "登录日志")} />
    <div className="admin-card mb-4 overflow-hidden"><div className="border-b border-[#edf0f5] px-7 py-5"><h1 className="text-lg font-semibold">账号登录日志</h1></div><div className="admin-card-body flex items-center gap-0"><input value={query.username} onChange={(event) => setQuery({ ...query, username: event.target.value })} placeholder="账号关键词搜索" className="h-10 w-64 rounded-l border border-r-0 px-3 text-sm" /><Button size="sm" variant="primary" className="h-10 rounded-l-none rounded-r" onClick={() => void load(1)}>搜索</Button><div className="ml-auto"><Button variant="primary" className="h-10">一键删除全部日志</Button></div></div></div>
    <PageSizeSelect total={result.total} />
    {error && <p className="mb-3 text-sm text-[#ff4d4f]">{error}</p>}
    <div className="admin-card overflow-x-auto"><table className="w-full min-w-[1050px] table-fixed"><thead><tr><th className="w-14 border-b bg-[#fafafa] p-3 text-center"><input type="checkbox" aria-label="全选" checked={result.items.length > 0 && selectedIds.length === result.items.length} onChange={(event) => setSelectedIds(event.target.checked ? result.items.map((item) => item.id) : [])} /></th>{[["编号", "w-28"], ["ID", "w-24"], ["昵称", "w-56"], ["IP地址", "w-[30%]"], ["登录时间", "w-[22%]"], ["操作", "w-24"]].map(([title, width]) => <th key={title} className={`border-b bg-[#fafafa] p-3 text-left text-sm ${width}`}>{title}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={8} className="p-8 text-center text-[#999]">加载中...</td></tr> : result.items.length === 0 ? <tr><td colSpan={8} className="p-8 text-center text-[#999]">暂无数据</td></tr> : result.items.map((item) => <tr key={item.id} className="h-[59px]"><td className="border-b p-3 text-center"><input type="checkbox" aria-label={`选择日志 ${item.id}`} checked={selectedIds.includes(item.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /></td><td className="border-b p-3 text-sm text-[#a1a8b3]">{item.id}</td><td className="border-b p-3 text-sm text-[#a1a8b3]">{item.account_id ?? "-"}</td><td className="border-b p-3 text-sm text-[#a1a8b3]">{item.username}</td><td className="border-b p-3 text-sm text-[#a1a8b3]">{item.ip ?? "-"}</td><td className="border-b p-3 text-sm text-[#a1a8b3]">{item.created_at}</td><td className="border-b p-3 text-sm"><button className="whitespace-nowrap text-[#3658f7]">删除</button></td></tr>)}</tbody></table><div className="admin-pagination"><button disabled={result.page <= 1 || loading} onClick={() => void load(result.page - 1)}>‹</button><span className="active">1</span><span>2</span><span>3</span><span>4</span><span>5</span><span className="ellipsis">…</span><span>38</span><button disabled={!result.has_more || loading} onClick={() => void load(result.page + 1)}>›</button><span className="page-size">20 条/页⌄</span></div></div>
  </div>;
}
