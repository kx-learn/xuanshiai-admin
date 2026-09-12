"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { AdminMenuNode, MatchmakerStaffItem, StoreDictItem } from "@/lib/admin-endpoints";
import { pickAndUploadImage } from "@/lib/platform-config";
import { resolveMediaUrl } from "@/lib/admin-api";

const breadcrumb = getBreadcrumb("分店管理", "分店红娘");

const columns = ["红娘", "手机/微信", "隶属门店", "锁定", "前台展示", "菜单权限", "操作"];

export default function BranchMatchmakerListPage() {
  const [rows, setRows] = useState<MatchmakerStaffItem[]>([]);
  const [stores, setStores] = useState<StoreDictItem[]>([]);
  const [storeId, setStoreId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [applied, setApplied] = useState({ storeId: "", keyword: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<MatchmakerStaffItem | null>(null);
  const [permTarget, setPermTarget] = useState<MatchmakerStaffItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.matchmakerStaffList({
        page,
        page_size: pageSize,
        in_store: true,
        store_id: applied.storeId ? Number(applied.storeId) : undefined,
        keyword: applied.keyword || undefined,
      });
      setRows(result.items);
      setTotal(result.total);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, applied]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    adminEndpoints.dictStores()
      .then(setStores)
      .catch(() => setStores([]));
  }, []);

  const search = () => {
    setPage(1);
    setApplied({ storeId, keyword: keyword.trim() });
  };

  const toggleLock = async (row: MatchmakerStaffItem) => {
    try {
      await adminEndpoints.updateMatchmakerLock(row.id, { locked: !row.locked });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  };

  const toggleVisible = async (row: MatchmakerStaffItem) => {
    try {
      await adminEndpoints.updateMatchmakerVisibility(row.id, { visible: !row.visible });
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "操作失败");
    }
  };

  const removeRow = async (row: MatchmakerStaffItem) => {
    if (typeof window !== "undefined" && !window.confirm(`确认删除红娘「${row.display_name}」？`)) return;
    try {
      await adminEndpoints.deleteMatchmakerStaff(row.id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p><b>分店 店长红娘：</b>在门店管理平台中可以查看、操作、编辑在本集隶属门店下的全部客源信息、会员资料、联系方式、牵线记录、跟进档案等，并可以自行添加、管理分店下的红娘、分派资源、查看门店各种数据报表</p>
            <p><b>分店 普通红娘：</b>在红娘平台中可以查看、操作、编辑在分店中隶属自己名下的全部客源信息、会员资料、联系方式、牵线记录等</p>
            <p>「门店状态为"关闭"时，门店管理系统将被禁止登录，其名下红娘（含店长）登录管理平台时也会提示"门店关闭中，无法登录"</p>
            <p><b>注意：</b>分店的"客源线索"中不会显示总店和其门店的"待分客源"；再海客源中也不会显示总店和其他门店的"待海客源"</p>
          </div>
        </div>
      </div>

      <div className="finord-card bm-card">
        <div className="bm-head">
          <h2 className="bm-title">红娘管理</h2>
          <button
            className="finord-btn finord-btn-primary bm-add-btn"
            onClick={() => { setEditing(null); setAddOpen(true); }}
          >
            ＋ 添加红娘
          </button>
        </div>

        <div className="bm-filters">
          <select className="bm-select" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
            <option value="">全部门店</option>
            {stores.map((s) => (
              <option key={s.id} value={String(s.id)}>{s.display_name || s.name}</option>
            ))}
          </select>
          <input
            className="bm-input"
            placeholder="请输入红娘称呼/手机"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") search(); }}
          />
          <button className="finord-btn finord-btn-primary bm-search-btn" onClick={search}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table bm-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.display_name}</td>
                  <td>{row.phone || "-"}{row.wechat ? ` / ${row.wechat}` : ""}</td>
                  <td>{row.store_name || "-"}</td>
                  <td>
                    <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => void toggleLock(row)}>
                      {row.locked ? "已锁定" : "未锁定"}
                    </button>
                  </td>
                  <td>
                    <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => void toggleVisible(row)}>
                      {row.visible ? "展示" : "隐藏"}
                    </button>
                  </td>
                  <td>
                    <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => setPermTarget(row)}>
                      {row.menu_permission_count ? `已配置 ${row.menu_permission_count} 项` : "全部菜单"}
                    </button>
                  </td>
                  <td>
                    <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => { setEditing(row); setAddOpen(true); }}>编辑</button>
                    <span style={{ margin: "0 8px", color: "#dfe3ea" }}>|</span>
                    <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => void removeRow(row)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="bm-empty" style={{ display: "block" }}>
              <div className="bm-empty-inner">
                <div className="bm-empty-icon">📦</div>
                <div className="bm-empty-text">{loading ? "加载中…" : "暂无数据"}</div>
              </div>
            </div>
          )}
        </div>
        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
        />
        {message && <p style={{ color: "#ff4d4f", fontSize: 13, marginTop: 8 }}>{message}</p>}
      </div>

      {addOpen && (
        <AddMatchmakerDrawer
          row={editing}
          stores={stores}
          defaultStoreId={applied.storeId || storeId}
          onClose={() => { setAddOpen(false); setEditing(null); }}
          onSaved={() => { setAddOpen(false); setEditing(null); void load(); }}
        />
      )}

      {permTarget && (
        <PermissionDrawer
          row={permTarget}
          onClose={() => setPermTarget(null)}
          onSaved={() => { setPermTarget(null); void load(); }}
        />
      )}
    </div>
  );
}

/* ── 添加 / 编辑分店红娘 ─────────────────────────────────── */

function AddMatchmakerDrawer({
  row, stores, defaultStoreId, onClose, onSaved,
}: {
  row: MatchmakerStaffItem | null;
  stores: StoreDictItem[];
  defaultStoreId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = row !== null;
  const [accountMode, setAccountMode] = useState<"按昵称" | "按手机">("按昵称");
  const [lookup, setLookup] = useState("");
  const [commission, setCommission] = useState("不参与");
  const [editContact, setEditContact] = useState("不允许");
  const [timedLock, setTimedLock] = useState(false);

  const [avatar, setAvatar] = useState<string | null>(row?.avatar ?? null);
  const [wechatQr, setWechatQr] = useState<string | null>(row?.wechat_qr ?? null);
  const [displayName, setDisplayName] = useState(row?.display_name ?? "");
  const [description, setDescription] = useState(row?.description ?? "");
  const [slogan, setSlogan] = useState(row?.slogan ?? "");
  const [wechat, setWechat] = useState(row?.wechat ?? "");
  const [phone, setPhone] = useState(row?.phone ?? "");
  const [roleTag, setRoleTag] = useState<"super" | "normal">(row?.role_tag ?? "normal");
  const [storeSel, setStoreSel] = useState(row?.store_id ? String(row.store_id) : defaultStoreId);
  const [sort, setSort] = useState(String(row?.sort ?? 0));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const avatarRef = useRef<HTMLInputElement | null>(null);
  const qrRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (row) {
      setEditContact(row.contact_editable === false ? "不允许" : "允许");
      setTimedLock(!!row.lock_at);
    }
  }, [row]);

  const submit = async () => {
    if (!displayName.trim()) { setError("请填写红娘称呼"); return; }
    if (!phone.trim() || !/^\d{11,20}$/.test(phone.trim())) { setError("请填写正确的手机号"); return; }
    if (!editing && !lookup.trim()) { setError("请填写要绑定的用户昵称或手机号"); return; }
    if (!storeSel) { setError("请先选择隶属门店（可在上方筛选区选择后再添加）"); return; }
    setError("");
    setSaving(true);
    try {
      if (editing && row) {
        await adminEndpoints.updateMatchmakerStaff(row.id, {
          display_name: displayName.trim(),
          phone: phone.trim(),
          wechat: wechat.trim() || null,
          wechat_qr: wechatQr,
          avatar,
          store_id: Number(storeSel),
          role_tag: roleTag,
          description: description.trim() || null,
          slogan: slogan.trim() || null,
          sort: Number(sort) || 0,
          contact_editable: editContact === "允许",
        });
      } else {
        await adminEndpoints.createMatchmakerStaff({
          lookup: lookup.trim(),
          lookup_by: accountMode === "按手机" ? "phone" : "nickname",
          display_name: displayName.trim(),
          phone: phone.trim(),
          wechat: wechat.trim() || null,
          wechat_qr: wechatQr,
          avatar,
          store_id: Number(storeSel),
          role_tag: roleTag,
          description: description.trim() || null,
          slogan: slogan.trim() || null,
          sort: Number(sort) || 0,
          contact_editable: editContact === "允许",
          visible: true,
        });
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel bm-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">{editing ? "编辑服务红娘" : "添加服务红娘"}</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary" disabled={saving} onClick={() => void submit()}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 账号绑定 */}
          {!editing && (
            <div className="bm-row">
              <span className="bm-label">＊账号绑定</span>
              <div className="bm-content">
                <div className="bm-acct-row">
                  <input
                    className="bm-input-wide"
                    placeholder={accountMode === "按手机" ? "请输入已注册用户的手机号" : "请输入已注册用户的昵称"}
                    value={lookup}
                    onChange={(e) => setLookup(e.target.value)}
                  />
                  {(["按昵称", "按手机"] as const).map((o) => (
                    <label key={o} className={`bm-radio ${accountMode === o ? "active" : ""}`}>
                      <input type="radio" name="accountMode" value={o} checked={accountMode === o} onChange={() => setAccountMode(o)} />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
                <div className="bm-info">① 如果查询不到账号，请先让红娘使用微信在平台上登录注册；一个账号只能绑定一个红娘。</div>
              </div>
            </div>
          )}

          {/* 红娘头像 + 微信二维码 */}
          <div className="bm-row bm-row-top">
            <span className="bm-label">红娘头像</span>
            <div className="bm-content">
              <div className="bm-pick-row">
                <div className="bm-pick">
                  <span>红娘头像</span>
                  {avatar && <img src={resolveMediaUrl(avatar) ?? avatar} alt="头像" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} />}
                  <button type="button" className="bm-pick-btn" onClick={() => avatarRef.current?.click()}><Plus size={14} /> 上传图片</button>
                </div>
                <div className="bm-pick">
                  <span>微信二维码</span>
                  {wechatQr && <img src={resolveMediaUrl(wechatQr) ?? wechatQr} alt="二维码" style={{ width: 40, height: 40, objectFit: "cover" }} />}
                  <button type="button" className="bm-pick-btn" onClick={() => qrRef.current?.click()}><Plus size={14} /> 上传图片</button>
                </div>
              </div>
            </div>
          </div>
          <input ref={avatarRef} type="file" accept="image/*" hidden onChange={(e) => { pickAndUploadImage(e.target.files?.[0], setAvatar, setError); e.target.value = ""; }} />
          <input ref={qrRef} type="file" accept="image/*" hidden onChange={(e) => { pickAndUploadImage(e.target.files?.[0], setWechatQr, setError); e.target.value = ""; }} />

          {/* 红娘称呼 + 岗位描述 */}
          <div className="bm-row">
            <span className="bm-label">＊红娘称呼</span>
            <div className="bm-content">
              <div className="bm-two-col">
                <input className="bm-input-wide" placeholder="请输入红娘称呼" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                <input className="bm-input-wide" placeholder="如：电话邀约、匹配牵线" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 红娘口号 */}
          <div className="bm-row">
            <span className="bm-label">＊红娘口号</span>
            <div className="bm-content">
              <div className="bm-two-col">
                <select className="bm-select bm-select-wide" value={slogan} onChange={(e) => setSlogan(e.target.value)}>
                  <option value="">请选择</option>
                  {["缘分天注定", "帮你找到对的人", "认真对待每一次牵线"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <input className="bm-input-wide" placeholder="或自定义输入口号" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 微信号 + 手机号 */}
          <div className="bm-row">
            <span className="bm-label">＊微信号</span>
            <div className="bm-content">
              <div className="bm-two-col">
                <input className="bm-input-wide" placeholder="请输入微信号" value={wechat} onChange={(e) => setWechat(e.target.value)} />
                <input className="bm-input-wide" placeholder="请输入手机号" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </div>

          {/* 红娘角色 */}
          <div className="bm-row">
            <span className="bm-label">＊红娘角色</span>
            <select className="bm-select bm-select-wide" value={roleTag} onChange={(e) => setRoleTag(e.target.value as "super" | "normal")}>
              <option value="normal">普通红娘</option>
              <option value="super">超级红娘</option>
            </select>
          </div>

          {/* 隶属门店 */}
          <div className="bm-row">
            <span className="bm-label">＊隶属门店</span>
            <select className="bm-select bm-select-wide" value={storeSel} onChange={(e) => setStoreSel(e.target.value)}>
              <option value="">请选择隶属门店</option>
              {stores.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.display_name || s.name}</option>
              ))}
            </select>
          </div>

          {/* 分成级别 */}
          <div className="bm-row">
            <span className="bm-label">分成级别</span>
            <div className="bm-content">
              <div className="bm-radio-row">
                {["不参与", "允许"].map((o) => (
                  <label key={o} className={`bm-radio ${commission === o ? "active" : ""}`}>
                    <input type="radio" name="commission" value={o} checked={commission === o} onChange={() => setCommission(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="bm-info">① 分店的红娘分成将由分店自行在分店平台中设置与结算</div>
            </div>
          </div>

          {/* 修改联系方式 */}
          <div className="bm-row">
            <span className="bm-label">修改联系方式</span>
            <div className="bm-content">
              <div className="bm-radio-row">
                {["不允许", "允许"].map((o) => (
                  <label key={o} className={`bm-radio ${editContact === o ? "active" : ""}`}>
                    <input type="radio" name="editContact" value={o} checked={editContact === o} onChange={() => setEditContact(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="bm-info">① 若设置为"不允许"则红娘在其红娘平台中无法修改客户的手机号码和微信（包括客源线索、会员CRM）</div>
            </div>
          </div>

          {/* 定时锁定 */}
          <div className="bm-row">
            <span className="bm-label">定时锁定</span>
            <div className="bm-content">
              <div className="bm-switch-row">
                <span>{timedLock ? "开启" : "关闭"}</span>
                <button type="button" className={`mp-switch ${timedLock ? "on" : ""}`} onClick={() => setTimedLock(!timedLock)}>
                  <span className="mp-switch-knob"></span>
                </button>
              </div>
              <div className="bm-info">① 开启定时锁定后，到了时间后该账号自动锁定</div>
            </div>
          </div>

          {/* 排序值 */}
          <div className="bm-row">
            <span className="bm-label">排序值</span>
            <div className="bm-content">
              <input className="bm-input-num" value={sort} inputMode="numeric" onChange={(e) => setSort(e.target.value.replace(/[^\d]/g, ""))} />
              <div className="bm-info">数字越大显示越靠前</div>
            </div>
          </div>

          {error && <p style={{ color: "#ff4d4f", fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    </>
  );
}

/* ── 菜单权限配置 ────────────────────────────────────────── */

function saveFlat(nodes: AdminMenuNode[], bucket: number[] = []): number[] {
  for (const node of nodes) {
    bucket.push(node.id);
    if (node.children?.length) saveFlat(node.children, bucket);
  }
  return bucket;
}

function PermissionDrawer({ row, onClose, onSaved }: { row: MatchmakerStaffItem; onClose: () => void; onSaved: () => void }) {
  const [tree, setTree] = useState<AdminMenuNode[]>([]);
  const [checked, setChecked] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [menuTree, perms] = await Promise.all([
          adminEndpoints.adminMenuTree(),
          adminEndpoints.matchmakerPermissions(row.id),
        ]);
        setTree(menuTree);
        setChecked(perms.menuIds);
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    })();
  }, [row.id]);

  const toggle = (id: number) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const submit = async () => {
    setSaving(true);
    try {
      await adminEndpoints.updateMatchmakerPermissions(row.id, { menuIds: checked });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const renderNode = (node: AdminMenuNode) => (
    <label key={node.id} style={{ display: "block", marginLeft: node.parent_id ? 18 : 0, fontSize: 13, color: "#333", lineHeight: "28px" }}>
      <input type="checkbox" checked={checked.includes(node.id)} onChange={() => toggle(node.id)} style={{ accentColor: "#3658f7", marginRight: 6 }} />
      {node.name}
      {(node.children ?? []).map(renderNode)}
    </label>
  );

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel bm-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">菜单权限 · {row.display_name}</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={() => setChecked([])}>清空</button>
            <button className="finord-btn bm-cancel" onClick={() => setChecked(saveFlat(tree))}>全选</button>
            <button className="finord-btn finord-btn-primary" disabled={saving} onClick={() => void submit()}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {loading ? <p style={{ color: "#9aa3b2", fontSize: 13 }}>加载中…</p> : tree.length === 0 ? <p style={{ color: "#9aa3b2", fontSize: 13 }}>暂无可配置菜单</p> : tree.map(renderNode)}
          {error && <p style={{ color: "#ff4d4f", fontSize: 13, marginTop: 12 }}>{error}</p>}
        </div>
      </div>
    </>
  );
}
