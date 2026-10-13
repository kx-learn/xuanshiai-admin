"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { ChevronDown, X } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";
import AdminPagination from "@/components/AdminPagination";

interface AccountRow {
  id: number;
  username: string;
  display_name: string;
  status: number;
  last_login_at: string | null;
  last_login_ip: string | null;
  locked_until: string | null;
  permissions: string[];
  created_at: string;
  matchmaker_user_id?: number | null;
}

interface AccountPage {
  items: AccountRow[];
  total: number;
  has_more: boolean;
  page: number;
  page_size: number;
}

const statusTabs = ["全部", "正常", "已锁定", "已停用"];

const breadcrumb = [
  getBreadcrumb("系统管理", "账号管理")[0],
  getBreadcrumb("系统管理", "账号管理")[1],
  {
    label: "后台账号",
    children: [
      { label: "添加账号", href: "/system-setting-admin-user-add" },
      { label: "账号管理", href: "/system-setting-admin-user" },
      { label: "权限分组", href: "/system-setting-admin-group" },
    ],
  },
  getBreadcrumb("系统管理", "账号管理")[2],
];

function EditModal({ row, onClose, onSaved }: { row: AccountRow; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(row.display_name);
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      await adminApi(`/admin/matchmaker/accounts/${row.id}`, { method: "PATCH", body: { display_name: name } });
      if (pwd.length >= 8) {
        await adminApi(`/admin/matchmaker/accounts/${row.id}/reset-password`, {
          method: "POST",
          body: { new_password: pwd, reason: "账号管理页重置密码" },
        });
      }
      showConfigToast("保存成功");
      onSaved();
      onClose();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="ec-modal-mask" onClick={onClose}>
      <div className="ec-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal-header">
          <span className="ec-modal-title">编辑账号：{row.username}</span>
          <button type="button" className="ec-modal-close" aria-label="关闭" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ec-modal-body">
          <div className="ec-row">
            <span className="ec-key">姓名</span>
            <input className="ec-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="ec-row">
            <span className="ec-key">新密码</span>
            <input className="ec-input" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="留空则不修改（至少8位）" />
          </div>
        </div>
        <div className="ec-modal-footer">
          <button type="button" className="ec-cancel" onClick={onClose}>取消</button>
          <button type="button" className="ec-ok" disabled={busy} onClick={save}>确定</button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [status, setStatus] = useState("全部");
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AccountRow | null>(null);

  const load = useCallback(async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const statusMap: Record<string, number | undefined> = { "正常": 1, "已锁定": 3, "已停用": 2 };
      const s = statusMap[status];
      const qs = new URLSearchParams({ page: String(nextPage), page_size: String(nextPageSize) });
      if (s !== undefined) qs.set("status", String(s));
      if (keyword.trim()) qs.set("keyword", keyword.trim());
      const data = await adminApi<AccountPage>(`/admin/matchmaker/accounts?${qs.toString()}`);
      setRows(data.items ?? []);
      setTotal(data.total ?? 0);
      setSelectedIds([]);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "账号列表加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, keyword, status]);

  useEffect(() => { void load(page, pageSize); }, [load, page, pageSize]);

  const disable = async (row: AccountRow) => {
    if (!window.confirm(`确认停用账号「${row.username}」？（后台账号不支持物理删除，将以停用代替）`)) return;
    try {
      await adminApi(`/admin/matchmaker/accounts/${row.id}/status`, {
        method: "PATCH",
        body: { status: 2, reason: "账号管理页停用" },
      });
      showConfigToast("已停用");
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const shown = useMemo(() => rows, [rows]);
  const allSelected = shown.length > 0 && shown.every((row) => selectedIds.includes(row.id));

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="admin-card au-card">
        <div className="au-head">
          <h2 className="au-title">账号管理</h2>
        </div>

        {/* 筛选栏 */}
        <div className="au-filter">
          <div className="au-tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setStatus(tab); setPage(1); }}
                className={`au-tab ${status === tab ? "au-tab-active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="au-fd"><span className="au-fd-label">全部</span><ChevronDown className="au-fd-chevron" /></div>

          <div className="au-group">
            <span className="au-group-label">分组：</span>
            <div className="au-fd">
              <span className="au-fd-label">不分</span>
              <ChevronDown className="au-fd-chevron" />
            </div>
          </div>

          <input className="au-phone" placeholder="账号/姓名关键词" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { setPage(1); void load(1, pageSize); } }} />

          <button className="au-search" onClick={() => { setPage(1); void load(1, pageSize); }}>搜索</button>
        </div>

        {/* 表格 */}
        <div className="au-table-wrap">
          <table className="au-table">
            <thead>
              <tr>
                <th className="au-th-check"><input type="checkbox" checked={allSelected} onChange={(event) => setSelectedIds(event.target.checked ? shown.map((row) => row.id) : [])} /></th>
                <th>用户名</th>
                <th>姓名</th>
                <th>用户组</th>
                <th>手机号</th>
                <th>绑定微信</th>
                <th>添加时间</th>
                <th>一般锁定</th>
                <th>定时锁定</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>{loading ? "加载中…" : "暂无数据"}</td></tr>
              ) : shown.map((r) => (
                <tr key={r.id}>
                  <td className="au-td-check"><input type="checkbox" checked={selectedIds.includes(r.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, r.id] : current.filter((id) => id !== r.id))} /></td>
                  <td>{r.username}</td>
                  <td>{r.display_name}</td>
                  <td>{r.permissions.length > 0 ? `${r.permissions.length} 项权限` : "-"}</td>
                  <td>-</td>
                  <td>
                    <span className="au-wechat-none">未绑定</span>
                  </td>
                  <td>{(r.created_at ?? "").replace("T", " ").slice(0, 19)}</td>
                  <td>
                    <span className="au-lock">
                      {r.status === 1 ? "正常" : r.status === 3 ? "已锁定" : "已停用"}
                      <ChevronDown className="au-lock-chevron" />
                    </span>
                  </td>
                  <td><span className="au-timed">{r.locked_until ? "已设置" : "未开启"}</span></td>
                  <td>
                    <span className="au-actions">
                      <button className="au-edit" onClick={() => setEditing(r)}>编辑</button>
                      {r.status !== 2 && <button className="au-del" onClick={() => disable(r)}>删除</button>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedIds.length > 0 && <div className="lead-bulk-toolbar"><span>已选择 <b>{selectedIds.length}</b> 项</span><button type="button" onClick={() => setSelectedIds([])}>取消选择</button></div>}
        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={(next) => { setPage(next); void load(next, pageSize); }} onPageSizeChange={(next) => { setPageSize(next); setPage(1); void load(1, next); }} />
      </div>

      {editing && <EditModal row={editing} onClose={() => setEditing(null)} onSaved={load} />}
    </div>
  );
}
