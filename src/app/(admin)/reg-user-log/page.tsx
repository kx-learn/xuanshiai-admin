"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminPagination from "@/components/AdminPagination";

type Log = { id: number; account_id: number | null; username: string; login_status: 0 | 1; ip: string | null; user_agent: string | null; device_id: string | null; failure_reason: string | null; created_at: string };
type Page = { items: Log[]; page: number; page_size: number; total: number; has_more: boolean };

export default function RegUserLogPage() {
  const [query, setQuery] = useState({ username: "", account_id: "", from: "", to: "" });
  const [result, setResult] = useState<Page>({ items: [], page: 1, page_size: 20, total: 0, has_more: false });
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try { setResult(await adminEndpoints.adminLoginLogs({ page, page_size: pageSize, username: query.username.trim() || undefined, account_id: query.account_id || undefined, from: query.from || undefined, to: query.to || undefined }) as Page); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "登录日志加载失败"); }
    finally { setLoading(false); }
  }, [query, pageSize]);
  useEffect(() => { void load(); }, [load]);
  return <div>
    <AdminBreadcrumb items={getBreadcrumb("平台账号", "登录日志")} />
    <div className="admin-card mb-4 overflow-hidden"><div className="border-b border-[#edf0f5] px-7 py-5"><h1 className="text-lg font-semibold">账号登录日志</h1></div><div className="admin-card-body flex items-center gap-0"><input value={query.username} onChange={(event) => setQuery({ ...query, username: event.target.value })} placeholder="账号关键词搜索" className="h-10 w-64 rounded-l border border-r-0 px-3 text-sm" /><Button size="sm" variant="primary" className="h-10 rounded-l-none rounded-r" onClick={() => void load(1)}>搜索</Button><div className="ml-auto"><Button variant="primary" className="h-10">一键删除全部日志</Button></div></div></div>
    {error && <p className="mb-3 text-sm text-[#ff4d4f]">{error}</p>}
    <div className="admin-card overflow-x-auto"><table className="w-full min-w-[1050px] table-fixed"><thead><tr><th className="w-14 border-b bg-[#fafafa] p-3 text-center"><input type="checkbox" aria-label="全选" checked={result.items.length > 0 && selectedIds.length === result.items.length} onChange={(event) => setSelectedIds(event.target.checked ? result.items.map((item) => item.id) : [])} /></th>{[["编号", "w-28"], ["ID", "w-24"], ["昵称", "w-56"], ["IP地址", "w-[30%]"], ["登录时间", "w-[22%]"], ["操作", "w-24"]].map(([title, width]) => <th key={title} className={`border-b bg-[#fafafa] p-3 text-left text-sm ${width}`}>{title}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={8} className="p-8 text-center text-[#999]">加载中...</td></tr> : result.items.length === 0 ? <tr><td colSpan={8} className="p-8 text-center text-[#999]">暂无数据</td></tr> : result.items.map((item) => <tr key={item.id} className="h-[59px]"><td className="border-b p-3 text-center"><input type="checkbox" aria-label={`选择日志 ${item.id}`} checked={selectedIds.includes(item.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} /></td><td className="border-b p-3 text-sm text-[#a1a8b3]">{item.id}</td><td className="border-b p-3 text-sm text-[#a1a8b3]">{item.account_id ?? "-"}</td><td className="border-b p-3 text-sm text-[#a1a8b3]">{item.username}</td><td className="border-b p-3 text-sm text-[#a1a8b3]">{item.ip ?? "-"}</td><td className="border-b p-3 text-sm text-[#a1a8b3]">{item.created_at}</td><td className="border-b p-3 text-sm"><button className="whitespace-nowrap text-[#3658f7]">删除</button></td></tr>)}</tbody></table><AdminPagination page={result.page} pageSize={result.page_size} total={result.total} onPageChange={(p) => void load(p)} onPageSizeChange={(s) => setPageSize(s)} /></div>
  </div>;
}
