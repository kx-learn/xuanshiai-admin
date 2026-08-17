"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

type Log = { id: number; account_id: number | null; username: string; login_status: 0 | 1; ip: string | null; user_agent: string | null; device_id: string | null; failure_reason: string | null; created_at: string };
type Page = { items: Log[]; page: number; page_size: number; total: number; has_more: boolean };

export default function RegUserLogPage() {
  const [query, setQuery] = useState({ username: "", account_id: "", from: "", to: "" });
  const [result, setResult] = useState<Page>({ items: [], page: 1, page_size: 20, total: 0, has_more: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try { setResult(await adminEndpoints.adminLoginLogs({ page, page_size: 20, username: query.username.trim() || undefined, account_id: query.account_id || undefined, from: query.from || undefined, to: query.to || undefined }) as Page); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "登录日志加载失败"); }
    finally { setLoading(false); }
  }, [query]);
  useEffect(() => { void load(); }, [load]);
  return <div>
    <AdminBreadcrumb items={getBreadcrumb("平台账号", "登录日志")} />
    <h1 className="mb-4 text-xl font-medium">登录日志</h1>
    <div className="admin-card mb-4"><div className="admin-card-body flex flex-wrap items-end gap-3"><label className="text-sm">用户名<input value={query.username} onChange={(event) => setQuery({ ...query, username: event.target.value })} className="ml-2 h-8 w-40 rounded border px-2" /></label><label className="text-sm">账号 ID<input type="number" min="1" value={query.account_id} onChange={(event) => setQuery({ ...query, account_id: event.target.value })} className="ml-2 h-8 w-28 rounded border px-2" /></label><label className="text-sm">开始时间<input type="datetime-local" value={query.from} onChange={(event) => setQuery({ ...query, from: event.target.value })} className="ml-2 h-8 rounded border px-2" /></label><label className="text-sm">结束时间<input type="datetime-local" value={query.to} onChange={(event) => setQuery({ ...query, to: event.target.value })} className="ml-2 h-8 rounded border px-2" /></label><Button size="sm" variant="primary" onClick={() => void load(1)}>查询</Button><Button size="sm" onClick={() => setQuery({ username: "", account_id: "", from: "", to: "" })}>重置</Button></div></div>
    {error && <p className="mb-3 text-sm text-[#ff4d4f]">{error}</p>}
    <div className="admin-card overflow-x-auto"><table className="w-full min-w-[1050px]"><thead><tr>{["编号", "账号 ID", "用户名", "结果", "IP 地址", "设备", "User-Agent", "失败原因", "登录时间"].map((title) => <th key={title} className="border-b bg-[#fafafa] p-3 text-left text-sm">{title}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={9} className="p-8 text-center text-[#999]">加载中...</td></tr> : result.items.length === 0 ? <tr><td colSpan={9} className="p-8 text-center text-[#999]">暂无数据</td></tr> : result.items.map((item) => <tr key={item.id}><td className="border-b p-3 text-sm">{item.id}</td><td className="border-b p-3 text-sm">{item.account_id ?? "-"}</td><td className="border-b p-3 text-sm">{item.username}</td><td className={`border-b p-3 text-sm ${item.login_status === 1 ? "text-[#52c41a]" : "text-[#ff4d4f]"}`}>{item.login_status === 1 ? "成功" : "失败"}</td><td className="border-b p-3 text-sm">{item.ip ?? "-"}</td><td className="border-b p-3 text-sm">{item.device_id ?? "-"}</td><td className="max-w-64 truncate border-b p-3 text-sm" title={item.user_agent ?? ""}>{item.user_agent ?? "-"}</td><td className="border-b p-3 text-sm">{item.failure_reason ?? "-"}</td><td className="border-b p-3 text-sm">{item.created_at}</td></tr>)}</tbody></table><div className="flex justify-between px-4 py-4 text-sm"><span>共 {result.total} 条</span><div className="flex gap-2"><Button size="sm" disabled={result.page <= 1 || loading} onClick={() => void load(result.page - 1)}>上一页</Button><span className="py-1">第 {result.page} 页</span><Button size="sm" disabled={!result.has_more || loading} onClick={() => void load(result.page + 1)}>下一页</Button></div></div></div>
  </div>;
}
