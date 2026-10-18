"use client";
import { useEffect, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Plus, X } from "lucide-react";
import { asObject, readPlatformConfig, savePlatformConfig, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";
import AdminPagination from "@/components/AdminPagination";

const GROUPS_DEFAULTS = { groups: [] as unknown[] } as const;
const PAGE_SIZE = 20;

interface Group {
  id: number;
  name: string;
  users: string;
  permissions: string[];
}

function toGroups(config: Dict | null | undefined): Group[] {
  const list = Array.isArray(config?.groups) ? config!.groups : [];
  return list.map((g, i) => {
    const o = asObject(g as Dict);
    return { id: Number(o.id ?? i + 1), name: String(o.name ?? ""), users: String(o.users ?? ""), permissions: Array.isArray(o.permissions) ? (o.permissions as unknown[]).map(String) : [] };
  });
}

export default function Page() {
  const domain = useConfigDomain<Dict>("admin_groups", GROUPS_DEFAULTS as Dict);
  const [groups, setGroups] = useState<Group[]>([]);
  const [permEditing, setPermEditing] = useState<Group | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    domain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { setGroups(toGroups(domain.snapshot?.config)); }, [domain.snapshot]);

  // 每次写入前重新读取最新版本再提交（避免用过期 version 提交而 409），
  // 冲突时基于最新数据重放一次修改；失败则给出真实错误提示，本地数据保持不变。
  const persist = async (mutate: (list: Group[]) => Group[], summary: string, successMessage = "已保存"): Promise<boolean> => {
    let lastError = "保存失败，未修改本地数据";
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const fresh = await readPlatformConfig<Dict>("admin_groups");
        const next = mutate(toGroups(fresh.config));
        const data = await savePlatformConfig<Dict>("admin_groups", fresh.version, {
          ...fresh.config,
          groups: next.map((g) => ({ id: g.id, name: g.name, users: g.users, permissions: g.permissions })),
        }, summary);
        setGroups(toGroups(data.config));
        showConfigToast(successMessage);
        return true;
      } catch (e) {
        lastError = e instanceof Error ? e.message : lastError;
      }
    }
    showConfigToast(lastError, "error");
    return false;
  };

  const addGroup = async () => {
    const name = window.prompt("请输入用户组名称");
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    await persist((list) => [...list, { id: Date.now(), name: trimmed, users: "", permissions: [] }], "权限分组新增", "用户组已添加");
  };

  const renameGroup = async (g: Group) => {
    const name = window.prompt("修改用户组名称", g.name);
    if (!name || !name.trim()) return;
    const trimmed = name.trim();
    await persist((list) => list.map((x) => (x.id === g.id ? { ...x, name: trimmed } : x)), "权限分组重命名", "用户组已重命名");
  };

  const removeGroup = async (g: Group) => {
    if (!window.confirm(`确认删除用户组「${g.name}」？`)) return;
    const ok = await persist((list) => list.filter((x) => x.id !== g.id), "权限分组删除", "用户组已删除");
    if (ok) setSelectedIds((current) => current.filter((id) => id !== g.id));
  };

  const savePerms = async (g: Group, perms: string[]) => {
    const ok = await persist((list) => list.map((x) => (x.id === g.id ? { ...x, permissions: perms } : x)), "权限分组权限更新", "权限已保存");
    if (ok) setPermEditing(null);
  };

  const pageCount = Math.max(1, Math.ceil(groups.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = groups.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageAllSelected = pageRows.length > 0 && pageRows.every((g) => selectedIds.includes(g.id));

  const base = getBreadcrumb("系统管理", "权限分组");
  const breadcrumb = [
    base[0],
    base[1],
    { label: "后台账号" },
    base[2],
  ];

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="admin-card au-card">
        <div className="au-head au-head-between">
          <h2 className="au-title">权限分组</h2>
          <button className="au-add" onClick={addGroup}>
            <Plus className="au-add-plus" />
            添加用户组
          </button>
        </div>

        <div className="au-table-wrap">
          <table className="au-table au-group-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="全选用户组" checked={pageAllSelected} onChange={(event) => setSelectedIds(event.target.checked ? [...new Set([...selectedIds, ...pageRows.map((group) => group.id)])] : selectedIds.filter((id) => !pageRows.some((group) => group.id === id)))} /></th>
                <th>用户组名</th>
                <th>当前用户</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>{domain.loading ? "加载中…" : "暂无数据"}</td></tr>
              ) : pageRows.map((r) => (
                <tr key={r.id}>
                  <td><input type="checkbox" aria-label={`选择用户组 ${r.name}`} checked={selectedIds.includes(r.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, r.id] : current.filter((id) => id !== r.id))} /></td>
                  <td className="au-group-name">{r.name}</td>
                  <td className="au-group-users">{r.users ? r.users : <span className="au-wechat-none">无当前用户</span>}</td>
                  <td>
                    <span className="au-actions">
                      <button className="au-edit" onClick={() => renameGroup(r)}>编辑</button>
                      <button className="au-edit" onClick={() => setPermEditing(r)}>权限管理</button>
                      <button className="au-del" onClick={() => removeGroup(r)}>删除</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedIds.length > 0 && <div className="lead-bulk-toolbar"><span>已选择 <b>{selectedIds.length}</b> 项</span><button type="button" onClick={() => setSelectedIds([])}>取消选择</button></div>}
        <AdminPagination page={safePage} pageSize={PAGE_SIZE} total={groups.length} onPageChange={(next) => { setPage(next); setSelectedIds([]); }} />
      </div>

      {permEditing && <PermModal group={permEditing} onClose={() => setPermEditing(null)} onSave={(perms) => savePerms(permEditing, perms)} />}
    </div>
  );
}

function PermModal({ group, onClose, onSave }: { group: Group; onClose: () => void; onSave: (perms: string[]) => void }) {
  const [text, setText] = useState(group.permissions.join("\n"));
  return (
    <div className="ec-modal-mask" onClick={onClose}>
      <div className="ec-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal-header">
          <span className="ec-modal-title">权限管理：{group.name}</span>
          <button type="button" className="ec-modal-close" aria-label="关闭" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ec-modal-body">
          <div className="ec-row">
            <span className="ec-key">权限码</span>
            <textarea
              className="ec-input"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="每行一个权限码，如 matchmaker.account.manage；加入本组的账号创建时将默认带上这些权限"
              style={{ fontFamily: "monospace" }}
            />
          </div>
        </div>
        <div className="ec-modal-footer">
          <button type="button" className="ec-cancel" onClick={onClose}>取消</button>
          <button type="button" className="ec-ok" onClick={() => onSave(text.split(/[\n,，]/).map((s) => s.trim()).filter(Boolean))}>确定</button>
        </div>
      </div>
    </div>
  );
}
