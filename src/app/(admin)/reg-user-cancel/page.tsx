"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { Button } from "@/components/ui/button";
import { adminEndpoints, type AccountCancellationItem, type AccountCancellationPage } from "@/lib/admin-endpoints";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const emptyPage: AccountCancellationPage = { items: [], page: 1, page_size: 20, total: 0, has_more: false };

const statusBadge: Record<AccountCancellationItem["status"], { label: string; className: string }> = {
  pending: { label: "待处理", className: "border-[#91d5ff] bg-[#e6f7ff] text-[#1890ff]" },
  approved: { label: "已注销", className: "border-[#b7eb8f] bg-[#f6ffed] text-[#52c41a]" },
  cancelled: { label: "已取消", className: "border-[#d9d9d9] bg-[#fafafa] text-[#8c96a8]" },
};

const formatTime = (value: string | null) => (value ? value.replace("T", " ").slice(0, 19) : "-");

export default function RegUserCancelPage() {
  const [status, setStatus] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [pageSize, setPageSize] = useState(20);
  const [result, setResult] = useState<AccountCancellationPage>(emptyPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try {
      setResult(await adminEndpoints.accountCancellations({ page, page_size: pageSize, status: status || "all", keyword: keyword.trim() || undefined }));
      setSelectedIds([]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "注销申请列表加载失败"); }
    finally { setLoading(false); }
  }, [status, keyword, pageSize]);

  useEffect(() => { void load(); }, [load]);

  const review = async (row: AccountCancellationItem, approve: boolean) => {
    if (!approve && !window.confirm(`确认取消账号“${row.display_name}”的注销申请？取消后账号恢复正常使用。`)) return;
    if (approve && !window.confirm(`确定注销账号“${row.display_name}”（${row.username}）？注销后该账号将无法登录平台，关联的绑定关系与权限一并清除，操作不可恢复。`)) return;
    setActingId(row.id); setError("");
    try {
      await adminEndpoints.reviewAccountCancellation(row.id, { approve });
      await load(result.page);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "操作失败"); }
    finally { setActingId(null); }
  };

  const flagCell = (value: boolean) => <td className="border-b p-3 text-center text-lg">{value ? "✓" : "×"}</td>;

  return <div className="reg-user-cancel-page">
    <AdminBreadcrumb items={getBreadcrumb("平台账号", "注销申请")} />
    <section className="mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]"><h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2><p>确定注销后，等同于删除账号，并且在系统中所有的账号关联将自动清空、解除绑定关系，会员资料自动变为“停止相亲”；待处理中的账号将被暂停登录；取消注销后账号恢复正常使用　<button type="button" className="text-[#3658f7]" onClick={() => setGuideOpen(true)}>账号注销流程图示</button></p></section>
    <div className="admin-card overflow-hidden"><div className="flex items-center gap-8 border-b border-[#edf0f5] px-8"><Link href="/reg-user-all" className="py-5 text-[#333]">账号管理</Link><Link href="/reg-user-cancel" className="border-b-2 border-[#3658f7] py-5 font-medium text-[#3658f7]">注销申请</Link></div><div className="flex flex-wrap items-center gap-3 px-8 py-5"><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded border px-3 text-sm"><option value="all">全部账号</option><option value="pending">待处理</option><option value="approved">已注销</option><option value="cancelled">已取消</option></select><input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="h-10 w-96 rounded border px-3" placeholder="请输入账号/昵称" /><Button variant="primary" onClick={() => void load(1)}>搜索</Button></div>
    {error && <p className="px-8 pb-3 text-sm text-[#ff4d4f]">{error}</p>}
    <div className="overflow-x-auto px-8"><table className="w-full min-w-[1200px] table-fixed"><thead><tr><th className="border-b bg-[#fafafa] p-3 text-left text-sm"><input type="checkbox" aria-label="全选" checked={result.items.length > 0 && selectedIds.length === result.items.length} onChange={() => setSelectedIds(selectedIds.length === result.items.length ? [] : result.items.map((row) => row.id))} /></th>{["ID", "账号", "申请注销时间", "IP地址", "会员资料关联", "推广红娘关联", "合伙红娘关联", "服务红娘关联", "状态", "操作"].map((title) => <th key={title} className="border-b bg-[#fafafa] p-3 text-left text-sm">{title}</th>)}</tr></thead><tbody>{loading ? <tr className="h-20"><td colSpan={11} className="border-b p-3 text-center text-sm text-[#999]">加载中...</td></tr> : result.items.length === 0 ? <tr className="h-20"><td colSpan={11} className="border-b p-3 text-center text-sm text-[#999]">暂无数据</td></tr> : result.items.map((row) => { const badge = statusBadge[row.status]; return <tr key={row.id} className="h-20"><td className="border-b p-3 text-sm"><input type="checkbox" aria-label={`选择注销申请 ${row.id}`} checked={selectedIds.includes(row.id)} onChange={() => setSelectedIds((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])} /></td><td className="border-b p-3 text-sm text-[#8c96a8]">{row.id}</td><td className="border-b p-3 text-sm"><strong className="block">{row.display_name}</strong><span className="text-[#8c96a8]">账号ID：{row.account_id}</span><span className="block text-[#8c96a8]">{row.username}</span></td><td className="border-b p-3 text-sm">{formatTime(row.created_at)}</td><td className="border-b p-3 text-sm">{row.requested_ip ?? "-"}</td>{flagCell(row.has_member_profile)}{flagCell(row.has_promoter_link)}{flagCell(row.has_partner_link)}{flagCell(row.has_matchmaker_link)}<td className="border-b p-3"><span className={`rounded border px-2 py-1 text-xs ${badge.className}`}>{badge.label}</span></td><td className="border-b p-3 text-sm">{row.status === "pending" ? <><button className="mr-3 text-[#3658f7] disabled:opacity-50" disabled={actingId !== null} onClick={() => void review(row, false)}>取消注销</button><button className="text-[#3658f7] disabled:opacity-50" disabled={actingId !== null} onClick={() => void review(row, true)}>确定注销</button></> : <span className="text-[#8c96a8]">{row.reviewed_at ? `处理于 ${formatTime(row.reviewed_at)}` : "-"}</span>}</td></tr>; })}</tbody></table></div>
    <div className="px-8 py-5"><AdminPagination page={result.page} pageSize={pageSize} total={result.total} onPageChange={(next) => void load(next)} onPageSizeChange={(size) => { setPageSize(size); }} /></div>{selectedIds.length > 0 && <div className="fixed bottom-0 left-[224px] right-0 z-50 flex min-h-[54px] items-center gap-2.5 border-t border-[#e3e7ef] bg-white px-[18px] py-2 text-[13px] text-[#46516b] shadow-[0_-2px_10px_rgba(24,40,80,.12)]"><span>已选择 <b>{selectedIds.length}</b> 项</span><button type="button" className="h-9 whitespace-nowrap rounded border border-[#3658f7] bg-[#3658f7] px-4 text-[13px] text-white" onClick={() => setSelectedIds([])}>取消选择</button></div>}</div>
    {guideOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded bg-white p-6 shadow-xl"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">账号注销流程</h2><button type="button" onClick={() => setGuideOpen(false)} aria-label="关闭">✕</button></div><ol className="list-decimal space-y-2 pl-5 text-sm text-[#46516b]"><li>提交注销申请后，账号进入待处理状态并暂停登录。</li><li>管理员确认注销后，关联会员、红娘和权限关系会被清理。</li><li>取消注销申请后，账号恢复正常使用。</li></ol></div></div>}
  </div>;
}
