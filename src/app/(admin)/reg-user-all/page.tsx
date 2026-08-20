"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AccountStatusToggle from "@/components/AccountStatusToggle";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { adminEndpoints, type AdminAccountItem } from "@/lib/admin-endpoints";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { getAdminToken } from "@/lib/admin-api";

type Page = { items: AdminAccountItem[]; page: number; page_size: number; total: number; has_more: boolean };
type Dialog = "create" | "edit" | "status" | "password" | null;
type Form = { username: string; password: string; display_name: string; matchmaker_user_id: string; data_scope: string; organization_id: string; permissions: string };
type Session = { id: number; ip: string | null; user_agent: string | null; last_used_at: string; status: number; revoked_at: string | null };
const initialForm: Form = { username: "", password: "", display_name: "", matchmaker_user_id: "", data_scope: "SELF", organization_id: "", permissions: "" };
const mockAccounts: AdminAccountItem[] = [
  { id: 787, username: "135****9114", display_name: "~", matchmaker_user_id: null, data_scope: "SELF", organization_id: null, status: 1, failed_count: 0, locked_until: null, last_login_at: "2026-07-23 16:18:51", last_login_ip: "163.125.222.166", permissions: [], created_at: "2026-07-23 16:18:37", updated_at: "2026-07-23 16:18:37" },
  { id: 786, username: "152****9218", display_name: "闪电", matchmaker_user_id: null, data_scope: "SELF", organization_id: null, status: 1, failed_count: 0, locked_until: null, last_login_at: "2026-07-22 21:32:05", last_login_ip: "112.2.87.113", permissions: [], created_at: "2026-07-22 21:32:05", updated_at: "2026-07-22 21:32:05" },
  { id: 785, username: "191****2290", display_name: "太洋", matchmaker_user_id: null, data_scope: "SELF", organization_id: null, status: 1, failed_count: 0, locked_until: null, last_login_at: "2026-07-31 16:21:30", last_login_ip: "117.170.54.14", permissions: [], created_at: "2026-07-22 12:58:34", updated_at: "2026-07-22 12:58:34" },
  { id: 784, username: "198****3073", display_name: "Garfield", matchmaker_user_id: null, data_scope: "SELF", organization_id: null, status: 1, failed_count: 0, locked_until: null, last_login_at: "2026-07-21 01:30:12", last_login_ip: "121.237.160.141", permissions: [], created_at: "2026-07-21 01:30:12", updated_at: "2026-07-21 01:30:12" },
  { id: 783, username: "197****3654", display_name: "小可爱", matchmaker_user_id: null, data_scope: "SELF", organization_id: null, status: 1, failed_count: 0, locked_until: null, last_login_at: "2026-07-20 14:33:45", last_login_ip: "117.147.79.112", permissions: [], created_at: "2026-07-20 14:33:45", updated_at: "2026-07-20 14:33:45" },
];

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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [accountStatuses, setAccountStatuses] = useState<Record<number, number>>({});

  const load = useCallback(async (page = 1) => {
    setLoading(true); setError("");
    if (getAdminToken() === "local-demo-token") {
      setResult({ items: mockAccounts, page, page_size: 20, total: 38, has_more: page < 38 });
      setLoading(false);
      return;
    }
    try {
      setResult(await adminEndpoints.adminAccounts({ page, page_size: 20, username: query.username.trim() || undefined, display_name: query.display_name.trim() || undefined, status: query.status || undefined }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "账号列表加载失败"); }
    finally { setLoading(false); }
  }, [query]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    const links = Array.from(document.querySelectorAll<HTMLElement>(".admin-pagination span:not(.ellipsis):not(.page-size)"));
    const handlers = links.map((link) => { const handler = () => { const page = Number(link.textContent?.trim()); if (page) void load(page); }; link.addEventListener("click", handler); return [link, handler] as const; });
    return () => handlers.forEach(([link, handler]) => link.removeEventListener("click", handler));
  }, [load, result.items]);
  const toggleAccountStatus = (account: AdminAccountItem) => {
    const currentStatus = accountStatuses[account.id] ?? account.status;
    setAccountStatuses((current) => ({ ...current, [account.id]: currentStatus === 1 ? 3 : 1 }));
  };
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
    <section className="mb-5 rounded border border-[#cdd8ff] bg-[#f4f6ff] px-5 py-4 text-sm leading-6 text-[#46516b]"><h2 className="mb-1 font-semibold text-[#26324a]">💡 须知</h2><p>账号是指您的客户、红娘在您的平台（包括手机网页、小程序、红娘工作台）上的唯一身份；</p><p>若账号未绑定微信，在“编辑”中点击绑定微信，将二维码发给客户，让客户用微信扫码即可将该当前账号与其微信绑定，日后其使用微信即可一键登录；</p><p>账号在锁定状态下账号被禁用，无法登录您的平台；</p><p>您可以对在平台注册了账号，但未提交会员资料的客户进行操作，点击“入库线索”，其手机号和昵称将作为基础资料信息自动录入到“客源线索”中，然后分派红娘进行销售服务跟进，完善资料；</p><p>客源线索入库后，客户依然可以自行在平台上自主完善提交资料进入到“会员CRM”，若您在客户未自主完善资料之前将“客源线索”一键入库到“会员CRM”则其资料自动绑定到该账号名下，客户在平台中可自行维护，无需在登记注册。实现了“注册账号--客源线索--会员CRM”的完美流转</p></section>
    <div className="admin-card mb-4 overflow-hidden"><div className="flex items-center gap-8 border-b border-[#edf0f5] px-6"><Link href="/reg-user-all" className="border-b-2 border-[#3658f7] py-4 font-medium text-[#3658f7]">账号管理</Link><Link href="/reg-user-cancel" className="py-4 text-[#333]">注销申请</Link></div><div className="admin-card-body flex flex-wrap items-end gap-3">
      <label className="text-sm">账号类型<select value={query.status} onChange={(event) => setQuery({ ...query, status: event.target.value })} className="ml-2 h-9 w-32 rounded border bg-white px-2"><option value="">全部账号</option><option value="1">启用</option><option value="2">停用</option></select></label>
      <label className="text-sm">按昵称搜<input value={query.display_name} onChange={(event) => setQuery({ ...query, display_name: event.target.value })} placeholder="请输入" className="ml-2 h-9 w-48 rounded border px-3" /></label><Button size="sm" variant="primary" onClick={() => void load(1)}>搜索</Button><label className="text-sm">注册时间<select className="ml-2 h-9 w-36 rounded border bg-white px-2"><option>注册时间(默认)</option></select></label><label className="text-sm">是否相亲会员<select className="ml-2 h-9 w-36 rounded border bg-white px-2"><option>全部</option></select></label><div className="ml-auto flex flex-wrap gap-2"><Button variant="primary" onClick={() => { setForm(initialForm); setDialog("create"); }}>添加账号</Button><Button variant="primary">导出账号资料</Button><Button variant="primary">一键更新全部账号IP属地</Button><Button variant="primary">一键更新全部账号手机属地</Button></div></div></div>
    {error && <p className="mb-3 text-sm text-[#ff4d4f]">{error}</p>}
    <div className="admin-card overflow-x-auto"><table className="account-table w-full min-w-[1450px]"><thead><tr>{["", "ID", "头像", "账号", "推广人", "相亲会员", "积分", "余额", "注册IP", "时间", "线索入库", "操作"].map((title, index) => <th key={`${title}-${index}`} className="border-b bg-[#fafafa] p-3 text-left text-sm">{index === 0 ? <input type="checkbox" aria-label="全选" checked={result.items.length > 0 && selectedIds.length === result.items.length} onChange={(event) => setSelectedIds(event.target.checked ? result.items.map((item) => item.id) : [])} /> : title}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={12} className="p-8 text-center text-[#999]">加载中...</td></tr> : result.items.length === 0 ? <tr><td colSpan={12} className="p-8 text-center text-[#999]">暂无数据</td></tr> : result.items.map((account) => { const currentStatus = accountStatuses[account.id] ?? account.status; const locked = currentStatus !== 1; return <tr key={account.id}><td className="border-b p-3"><input type="checkbox" aria-label={`选择账号 ${account.id}`} checked={selectedIds.includes(account.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, account.id] : current.filter((id) => id !== account.id))} /></td><td className="border-b p-3 text-sm text-[#8c96a8]">{account.id}</td><td className="border-b p-3"><div className="h-10 w-10 rounded-full bg-[#e5ebff]" /></td><td className="border-b p-3 text-sm"><strong className="block text-[#333]">{account.display_name}</strong><span className="text-[#8c96a8]">{account.username}</span><small className="block text-[#8c96a8]">手机属地：未知未知</small></td><td className="border-b p-3 text-sm">-</td><td className="border-b p-3 text-sm"><span className="rounded border px-2 py-1">否</span></td><td className="border-b p-3 text-sm text-[#8d69e8]">0</td><td className="border-b p-3 text-sm"><span className="text-[#ff4d4f]">0元</span><button className="ml-2 text-[#3658f7]" onClick={() => openEdit(account)}>✎ 修改</button></td><td className="border-b p-3 text-sm text-[#8c96a8]">{account.last_login_ip}<small className="block">IP属地：未知</small></td><td className="border-b p-3 text-sm text-[#8c96a8]">登录次数：{account.failed_count + 1}<small className="block">注册时间：{account.created_at}</small><small className="block">最后登录：{account.last_login_at}</small></td><td className="border-b p-3 text-sm text-[#3658f7]">入库线索</td><td className="border-b p-3 text-sm"><AccountStatusToggle locked={locked} onToggle={() => toggleAccountStatus(account)} /><div className="mt-2 flex gap-3 text-[#3658f7]"><button onClick={() => openEdit(account)}>编辑</button><button>登录</button><button>删除</button></div></td></tr>})}</tbody></table><div className="admin-pagination"><button disabled={result.page <= 1 || loading} onClick={() => void load(result.page - 1)}>‹</button><span className="active">1</span><span>2</span><span>3</span><span>4</span><span>5</span><span className="ellipsis">…</span><span>38</span><button disabled={!result.has_more || loading} onClick={() => void load(result.page + 1)}>›</button><span className="page-size">20 条/页⌄</span></div></div>
    {dialog && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-md bg-white p-5 shadow-xl"><div className="mb-4 flex justify-between"><h2 className="text-lg font-medium">{dialog === "create" ? "新增账号" : dialog === "edit" ? "编辑账号" : dialog === "status" ? "调整账号状态" : "重置密码"}</h2><button onClick={close}>关闭</button></div>{(dialog === "create" || dialog === "edit") && <div className="space-y-3"><label className="block text-sm">账号<input disabled={dialog === "edit"} value={form.username} onChange={(event) => update("username", event.target.value)} className="mt-1 h-9 w-full rounded border px-2 disabled:bg-[#f5f5f5]" /></label><label className="block text-sm">显示名称<input value={form.display_name} onChange={(event) => update("display_name", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" /></label><label className="block text-sm">关联红娘用户 ID<input type="number" min="1" value={form.matchmaker_user_id} onChange={(event) => update("matchmaker_user_id", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" /></label><label className="block text-sm">数据范围<select value={form.data_scope} onChange={(event) => update("data_scope", event.target.value)} className="mt-1 h-9 w-full rounded border bg-white px-2"><option value="SELF">SELF</option><option value="STORE">STORE</option><option value="ORGANIZATION">ORGANIZATION</option><option value="ALL">ALL</option></select></label><label className="block text-sm">组织 ID<input type="number" min="1" value={form.organization_id} onChange={(event) => update("organization_id", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" /></label><label className="block text-sm">权限（逗号分隔）<input value={form.permissions} onChange={(event) => update("permissions", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" placeholder="dashboard.read, finance.read" /></label>{dialog === "create" && <label className="block text-sm">初始密码<input type="password" minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" /></label>}</div>}{dialog === "status" && <div className="space-y-3"><label className="block text-sm">新状态<select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="mt-1 h-9 w-full rounded border bg-white px-2"><option value="1">启用</option><option value="2">停用</option><option value="3">锁定</option></select></label><label className="block text-sm">操作原因<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} className="mt-1 w-full rounded border p-2" /></label></div>}{dialog === "password" && <div className="space-y-3"><label className="block text-sm">新密码<input type="password" minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} className="mt-1 h-9 w-full rounded border px-2" /></label><label className="block text-sm">重置原因<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} className="mt-1 w-full rounded border p-2" /></label></div>}<div className="mt-5 flex justify-end gap-2"><Button onClick={close}>取消</Button><Button variant="primary" loading={saving} disabled={!valid} onClick={() => void submit()}>确认</Button></div></section></div>}
    {sessionAccount && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-2xl rounded-md bg-white p-5 shadow-xl"><div className="mb-4 flex justify-between"><h2 className="text-lg font-medium">{sessionAccount.username} 的会话</h2><button onClick={() => setSessionAccount(null)}>关闭</button></div><div className="max-h-80 overflow-auto"><table className="w-full text-sm"><thead><tr><th className="border-b p-2 text-left">IP</th><th className="border-b p-2 text-left">最后使用</th><th className="border-b p-2 text-left">状态</th><th className="border-b p-2 text-left">客户端</th></tr></thead><tbody>{sessions.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-[#999]">暂无会话</td></tr> : sessions.map((session) => <tr key={session.id}><td className="border-b p-2">{session.ip ?? "-"}</td><td className="border-b p-2">{session.last_used_at}</td><td className="border-b p-2">{session.status === 1 ? "有效" : "已失效"}</td><td className="max-w-80 truncate border-b p-2" title={session.user_agent ?? ""}>{session.user_agent ?? "-"}</td></tr>)}</tbody></table></div></section></div>}
  </div>;
}
