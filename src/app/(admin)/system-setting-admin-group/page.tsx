"use client";
import { useCallback, useEffect, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Plus, X } from "lucide-react";
import { asObject, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

const GROUPS_DEFAULTS = { groups: [] as unknown[] } as const;

interface Group {
  id: number;
  name: string;
  users: string;
  permissions: string[];
}

export default function Page() {
  const domain = useConfigDomain<Dict>("admin_groups", GROUPS_DEFAULTS as Dict);
  const [groups, setGroups] = useState<Group[]>([]);
  const [editing, setEditing] = useState<Group | null>(null);
  const [permEditing, setPermEditing] = useState<Group | null>(null);

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.groups) ? config!.groups : [];
    setGroups(list.map((g, i) => {
      const o = asObject(g as Dict);
      return { id: Number(o.id ?? i + 1), name: String(o.name ?? ""), users: String(o.users ?? ""), permissions: Array.isArray(o.permissions) ? (o.permissions as unknown[]).map(String) : [] };
    }));
  }, []);

  useEffect(() => {
    domain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const persist = async (next: Group[]) => {
    setGroups(next);
    await domain.save({ groups: next.map((g) => ({ id: g.id, name: g.name, users: g.users, permissions: g.permissions })) } as Partial<Dict>, "权限分组更新");
  };

  const addGroup = async () => {
    const name = window.prompt("请输入用户组名称");
    if (!name || !name.trim()) return;
    await persist([...groups, { id: Date.now(), name: name.trim(), users: "", permissions: [] }]);
  };

  const renameGroup = async (g: Group) => {
    const name = window.prompt("修改用户组名称", g.name);
    if (!name || !name.trim()) return;
    await persist(groups.map((x) => (x.id === g.id ? { ...x, name: name.trim() } : x)));
  };

  const removeGroup = async (g: Group) => {
    if (!window.confirm(`确认删除用户组「${g.name}」？`)) return;
    await persist(groups.filter((x) => x.id !== g.id));
  };

  const savePerms = async (g: Group, perms: string[]) => {
    await persist(groups.map((x) => (x.id === g.id ? { ...x, permissions: perms } : x)));
    setPermEditing(null);
  };

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
                <th>用户组名</th>
                <th>当前用户</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>{domain.loading ? "加载中…" : "暂无数据"}</td></tr>
              ) : groups.map((r) => (
                <tr key={r.id}>
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

        <div className="au-pagination">
          <button className="au-page-btn">‹</button>
          <span className="au-page-num">1</span>
          <button className="au-page-btn">›</button>
        </div>
      </div>

      {permEditing && <PermModal group={permEditing} onClose={() => setPermEditing(null)} onSave={(perms) => savePerms(permEditing, perms)} />}
      {editing && null}
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
