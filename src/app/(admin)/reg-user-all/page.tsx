"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { adminEndpoints, type AdminAccountItem } from "@/lib/admin-endpoints";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

type Page = { items: AdminAccountItem[]; page: number; page_size: number; total: number; has_more: boolean };
type Dialog = "create" | "edit" | "status" | "password" | null;
type Form = { username: string; password: string; display_name: string; matchmaker_user_id: string; data_scope: string; organization_id: string; permissions: string };
type Session = { id: number; ip: string | null; user_agent: string | null; last_used_at: string; status: number; revoked_at: string | null };
const initialForm: Form = { username: "", password: "", display_name: "", matchmaker_user_id: "", data_scope: "SELF", organization_id: "", permissions: "" };

const statusName = (status: number) => status === 1 ? "启用" : status === 2 ? "停用" : "锁定";
const optionalId = (value: string) => value.trim() ? Number(value) : null;

export default function RegUserAllPage() {
  const [query, setQuery] = useState({ username: "", display_name: "", status: "" });
  const [result, setResult] = useState<Page>({ items: [], page: 1, page_size: 20, total: 0, has_more: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [selected, setSelected] = useState<AdminAccountItem | null>(null);
  const [form, setForm] = useState<Form>(initialForm);
  const [reason, setReason] = useState("");
  const [nextStatus, setNextStatus] = useState("2");
  const [saving, setSaving] = useState(false);
  const [sessionAccount, setSessionAccount] = useState<AdminAccountItem | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    try {
      setResult(await adminEndpoints.adminAccounts({ page, page_size: 20, username: query.username.trim() || undefined, display_name: query.display_name.trim() || undefined, status: query.status || undefined }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "账号列表加载失败"); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { void load(); }, [load]);
  const update = (key: keyof Form, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const close = () => { setDialog(null); setSelected(null); setForm(initialForm); setReason(""); };
  const permissions = () => form.permissions.split(",").map((item) => item.trim()).filter(Boolean);
  const openEdit = (account: AdminAccountItem) => {
    setSelected(account);
    setForm({ username: account.username, password: "", display_name: account.display_name, matchmaker_user_id: account.matchmaker_user_id?.toString() ?? "", data_scope: account.data_scope, organization_id: account.organization_id?.toString() ?? "", permissions: account.permissions.join(", ") });
    setDialog("edit");
  };
  const submit = async () => {
    setSaving(true); setError("");
    try {
      if (dialog === "create") await adminEndpoints.createAdminAccount({ username: form.username.trim(), password: form.password, display_name: form.display_name.trim(), matchmaker_user_id: optionalId(form.matchmaker_user_id), data_scope: form.data_scope, organization_id: optionalId(form.organization_id), permissions: permissions() });
      if (dialog === "edit" && selected) await adminEndpoints.updateAdminAccount(selected.id, { display_name: form.display_name.trim(), matchmaker_user_id: optionalId(form.matchmaker_user_id), data_scope: form.data_scope, organization_id: optionalId(form.organization_id), permissions: permissions() });
      if (dialog === "status" && selected) await adminEndpoints.updateAdminAccountStatus(selected.id, { status: Number(nextStatus), reason: reason.trim() });
      if (dialog === "password" && selected) await adminEndpoints.resetAdminAccountPassword(selected.id, { new_password: form.password, reason: reason.trim() });
      close(); await load(result.page);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "操作失败"); }
    finally { setSaving(false); }
  };
  const revoke = async (account: AdminAccountItem) => {
    if (!window.confirm(`确认强制下线账号“${account.username}”的全部会话？`)) return;
    try { await adminEndpoints.revokeAdminAccountSessions(account.id); await load(result.page); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "强制下线失败"); }
  };
  const viewSessions = async (account: AdminAccountItem) => {
    setSessionAccount(account); setSessions([]); setError("");
    try {
      const response = await adminEndpoints.adminAccountSessions(account.id, { page: 1, page_size: 50 }) as { items: Session[] };
      setSessions(response.items);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "会话列表加载失败"); }
  };
  const valid = dialog === "create" ? Boolean(form.username.trim() && form.display_name.trim() && form.password.length >= 8) : dialog === "edit" ? Boolean(form.display_name.trim()) : dialog === "status" ? Boolean(reason.trim()) : dialog === "password" ? Boolean(reason.trim() && form.password.length >= 8) : false;

  return <div>
    <AdminBreadcrumb items={getBreadcrumb("平台账号", "账号管理")} />
    <div className="mb-4 flex items-center justify-between"><h1 className="text-xl font-medium">账号管理</h1><Button variant="primary" onClick={() => { setForm(initialForm); setDialog("create"); }}>新增账号</Button></div>
    <div className="admin-card mb-4"><div className="admin-card-body flex flex-wrap items-end gap-3"><label className="text-sm">用户名<input value={query.username} onChange={(event) => setQuery({ ...query, username: event.target.value })} className="ml-2 h-8 w-40 rounded border px-2" /></label><label className="text-sm">显示名称<input value={query.display_name} onChange={(event) => setQuery({ ...query, display_name: event.target.value })} className="ml-2 h-8 w-40 rounded border px-2" /></label><label className="text-sm">状态<select value={query.status} onChange={(event) => setQuery({ ...query, status: event.target.value })} className="ml-2 h-8 rounded border bg-white px-2"><option value="">全部</option><option value="1">启用</option><option value="2">停用</option><option value="3">锁定</option></select></label><Button size="sm" variant="primary" onClick={() => void load(1)}>查询</Button><Button size="sm" onClick={() => setQuery({ username: "", display_name: "", status: "" })}>重置</Button></div></div>
    {error && <p className="mb-3 text-sm text-[#ff4d4f]">{error}</p>}
    <div className="admin-card overflow-x-auto"><table className="w-full min-w-[1050px]"><thead><tr>{["ID", "账号", "显示名称", "关联红娘", "范围", "状态", "失败次数", "最后登录", "权限", "操作"].map((title) => <th key={title} className="border-b bg-[#fafafa] p-3 text-left text-sm">{title}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={10} className="p-8 text-center text-[#999]">加载中...</td></tr> : result.items.length === 0 ? <tr><td colSpan={10} className="p-8 text-center text-[#999]">暂无数据</td></tr> : result.items.map((account) => <tr key={account.id}><td className="border-b p-3 text-sm">{account.id}</td><td className="border-b p-3 text-sm">{account.username}</td><td className="border-b p-3 text-sm">{account.display_name}</td><td className="border-b p-3 text-sm">{account.matchmaker_user_id ?? "-"}</td><td className="border-b p-3 text-sm">{account.data_scope}</td><td className="border-b p-3 text-sm">{statusName(account.status)}</td><td className="border-b p-3 text-sm">{account.failed_count}</td><td className="border-b p-3 text-sm">{account.last_login_at ?? "-"}</td><td className="border-b p-3 text-sm">{account.permissions.length}</td><td className="border-b p-3 text-sm"><div className="flex gap-2"><button className="text-[#3658f7]" onClick={() => openEdit(account)}>编辑</button><button className="text-[#3658f7]" onClick={() => { setSelected(account); setNextStatus(account.status === 1 ? "2" : "1"); setDialog("status"); }}>{account.status === 1 ? "停用" : "启用"}</button><button className="text-[#3658f7]" onClick={() => { setSelected(account); setForm({ ...initialForm, username: account.username }); setDialog("password"); }}>重置密码</button><button className="text-[#3658f7]" onClick={() => void viewSessions(account)}>会话</button><button className="text-[#3658f7]" onClick={() => void revoke(account)}>强制下线</button></div></td></tr>)}</tbody></table><div className="flex justify-between px-4 py-4 text-sm"><span>共 {result.total} 条</span><div className="flex gap-2"><Button size="sm" disabled={result.page <= 1 || loading} onClick={() => void load(result.page - 1)}>上一页</Button><span className="py-1">第 {result.page} 页</span><Button size="sm" disabled={!result.has_more || loading} onClick={() => void load(result.page + 1)}>下一页</Button></div></div></div>
    {dialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-md bg-white p-5 shadow-xl"><div className="mb-4 flex justify-between"><h2 className="text-lg font-medium">{dialog === "create" ? "新增账号" : dialog === "edit" ? "编辑账号" : dialog === "status" ? "调整账号状态" : "重置密码"}</h2><button onClick={close}>关闭</button></div>{(dialog === "create" || dialog === "edit") && <div className="space-y-3"><label className="block text-sm">账号<input disabled={dialog === "edit"} value={form.username} onChange={(event) => update("username", event.target.value)} className="mt-1 h-9 w-full rounded border px-2 disabled:bg-[#f5f5f5]" /></label><label className="block text-sm">显示名称<input value={form.display_name} onChange={(event) => update("display_name", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" /></label><label className="block text-sm">关联红娘用户 ID<input type="number" min="1" value={form.matchmaker_user_id} onChange={(event) => update("matchmaker_user_id", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" /></label><label className="block text-sm">数据范围<select value={form.data_scope} onChange={(event) => update("data_scope", event.target.value)} className="mt-1 h-9 w-full rounded border bg-white px-2"><option value="SELF">SELF</option><option value="STORE">STORE</option><option value="ORGANIZATION">ORGANIZATION</option><option value="ALL">ALL</option></select></label><label className="block text-sm">组织 ID<input type="number" min="1" value={form.organization_id} onChange={(event) => update("organization_id", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" /></label><label className="block text-sm">权限（逗号分隔）<input value={form.permissions} onChange={(event) => update("permissions", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" placeholder="dashboard.read, finance.read" /></label>{dialog === "create" && <label className="block text-sm">初始密码<input type="password" minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" /></label>}</div>}{dialog === "status" && <div className="space-y-3"><label className="block text-sm">新状态<select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="mt-1 h-9 w-full rounded border bg-white px-2"><option value="1">启用</option><option value="2">停用</option><option value="3">锁定</option></select></label><label className="block text-sm">操作原因<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} className="mt-1 w-full rounded border p-2" /></label></div>}{dialog === "password" && <div className="space-y-3"><label className="block text-sm">新密码<input type="password" minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" /></label><label className="block text-sm">重置原因<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} className="mt-1 w-full rounded border p-2" /></label></div>}<div className="mt-5 flex justify-end gap-2"><Button onClick={close}>取消</Button><Button variant="primary" loading={saving} disabled={!valid} onClick={() => void submit()}>确认</Button></div></section></div>}
    {sessionAccount && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-md bg-white p-5 shadow-xl"><div className="mb-4 flex justify-between"><h2 className="text-lg font-medium">{sessionAccount.username} 的会话</h2><button onClick={() => setSessionAccount(null)}>关闭</button></div><div className="max-h-80 overflow-auto"><table className="w-full text-sm"><thead><tr><th className="border-b p-2 text-left">IP</th><th className="border-b p-2 text-left">最后使用</th><th className="border-b p-2 text-left">状态</th><th className="border-b p-2 text-left">客户端</th></tr></thead><tbody>{sessions.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-[#999]">暂无会话</td></tr> : sessions.map((session) => <tr key={session.id}><td className="border-b p-2">{session.ip ?? "-"}</td><td className="border-b p-2">{session.last_used_at}</td><td className="border-b p-2">{session.status === 1 ? "有效" : "已失效"}</td><td className="max-w-80 truncate border-b p-2" title={session.user_agent ?? ""}>{session.user_agent ?? "-"}</td></tr>)}</tbody></table></div></section></div>}
  </div>;
}
