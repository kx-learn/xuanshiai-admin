"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { StoreAdminItem } from "@/lib/admin-endpoints";
import { asStr, pickAndUploadImage, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";
import { resolveMediaUrl } from "@/lib/admin-api";

const breadcrumb = getBreadcrumb("分店管理", "分站配置");

const columns = ["分站地区", "显示名称", "链接", "显示排序", "链接/二维码", "自动跳转", "操作"];

const CONFIG_DEFAULTS: Dict = { mode: "all", current_site: "", sites: [] };
const MODE_OPTIONS = ["全国模式", "指定地区"] as const;
const LABEL_TO_MODE: Record<string, string> = { 全国模式: "all", 指定地区: "region" };

const STATUS_LABEL: Record<number, string> = { 1: "正常", 2: "已关闭", 3: "已停用" };

export default function BranchConfigPage() {
  const domain = useConfigDomain<Dict>("tools_branch", CONFIG_DEFAULTS);

  const [mode, setMode] = useState<string>("全国模式");
  const [rows, setRows] = useState<StoreAdminItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editor, setEditor] = useState<{ open: boolean; row: StoreAdminItem | null }>({ open: false, row: null });

  // 配置域回填分站模式（不改动 DOM 结构，仅同步受控值）
  useEffect(() => {
    const stored = asStr(domain.snapshot?.config?.mode, "all");
    setMode(stored === "region" ? "指定地区" : "全国模式");
  }, [domain.snapshot]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.storeList({ page, page_size: pageSize });
      setRows(result.items);
      setTotal(result.total);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    void load();
  }, [load]);

  const confirmMode = async () => {
    const ok = await domain.save({ mode: LABEL_TO_MODE[mode] ?? "all" }, "分站模式切换");
    showConfigToast(ok ? "分站模式已更新" : "分站模式未发生变化");
  };

  const removeRow = async (row: StoreAdminItem) => {
    if (typeof window !== "undefined" && !window.confirm(`确认删除分站「${row.display_name || row.name}」？`)) return;
    try {
      await adminEndpoints.deleteStore(row.id);
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
            <p>分站是按照会员的"现居地"为依据进行划分，当访客进入到对应"地区"的分站，则平台首页中只显示出"现居地"为该地区的会员</p>
            <p>默认情况下进入分站显示所有地区的会员，访客可以手动通过点击右上角的区域自行切换到指定区域，切换后只显示出"现居地"为该地区的会员</p>
            <p>分站可以开启"自动跳转"来实现自动切换到指定区域，当系统识别出访客的IP归属地与分站为同一地区的时候将进入平台首页的时候会自动跳转到该地区分站</p>
            <p>分站模式支持全部模式、指定区域两种模式，可以在两种模式之间自由切换；全国模式不支持自动跳转和自定义分站名称文字</p>
          </div>
        </div>
      </div>

      {/* 分站模式 */}
      <div className="finord-card bc-card">
        <div className="bc-mode">
          <span className="bc-mode-label">分站模式</span>
          <div className="bc-mode-options">
            {MODE_OPTIONS.map((o) => (
              <label key={o} className={`bc-radio ${mode === o ? "active" : ""}`}>
                <input type="radio" name="mode" value={o} checked={mode === o} onChange={() => setMode(o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
          <button
            className="finord-btn finord-btn-primary bc-confirm-btn"
            disabled={!domain.ready || domain.loading || domain.saving}
            onClick={() => void confirmMode()}
          >
            {domain.saving ? "提交中…" : "确定切换"}
          </button>
        </div>
      </div>

      {/* 分站列表 */}
      <div className="finord-card bc-card">
        <div className="bc-list-head">
          <button
            className="finord-btn bc-add-btn"
            style={{ background: "#3658f7", borderColor: "#3658f7", color: "#fff", cursor: "pointer" }}
            onClick={() => setEditor({ open: true, row: null })}
          >
            + 添加分站
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table bc-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.region_code || "-"}</td>
                  <td>{row.display_name || row.name}</td>
                  <td>{row.link_url || "-"}</td>
                  <td>{row.sort_order}</td>
                  <td>
                    {row.qr_code ? (
                      <a className="finord-link" href={resolveMediaUrl(row.qr_code) ?? row.qr_code} target="_blank" rel="noreferrer">查看二维码</a>
                    ) : "-"}
                  </td>
                  <td>{row.auto_redirect ? "开启" : "关闭"}</td>
                  <td>
                    <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => setEditor({ open: true, row })}>编辑</button>
                    <span style={{ margin: "0 8px", color: "#dfe3ea" }}>|</span>
                    <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => void removeRow(row)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && (
            <div className="bc-empty" style={{ display: "block" }}>
              <div className="bc-empty-inner">
                <div className="bc-empty-icon">📦</div>
                <div className="bc-empty-text">{loading ? "加载中…" : "暂无数据"}</div>
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

      {editor.open && (
        <StoreEditorDrawer
          row={editor.row}
          onClose={() => setEditor({ open: false, row: null })}
          onSaved={() => { setEditor({ open: false, row: null }); void load(); }}
        />
      )}
    </div>
  );
}

/* ── 添加 / 编辑分站抽屉 ───────────────────────────────────── */

function StoreEditorDrawer({ row, onClose, onSaved }: { row: StoreAdminItem | null; onClose: () => void; onSaved: () => void }) {
  const editing = row !== null;
  const [code, setCode] = useState(row?.code ?? "");
  const [name, setName] = useState(row?.name ?? "");
  const [displayName, setDisplayName] = useState(row?.display_name ?? "");
  const [regionCode, setRegionCode] = useState(row?.region_code ?? "");
  const [linkUrl, setLinkUrl] = useState(row?.link_url ?? "");
  const [sortOrder, setSortOrder] = useState(String(row?.sort_order ?? 0));
  const [qrCode, setQrCode] = useState<string | null>(row?.qr_code ?? null);
  const [autoRedirect, setAutoRedirect] = useState(row?.auto_redirect ?? false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const submit = async () => {
    if (!editing && !/^[A-Za-z0-9_-]{2,64}$/.test(code.trim())) {
      setError("分站编码仅支持 2-64 位字母、数字、下划线或短横线");
      return;
    }
    if (!name.trim()) {
      setError("请填写分站名称");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        display_name: displayName.trim() || null,
        region_code: regionCode.trim() || null,
        link_url: linkUrl.trim() || null,
        sort_order: Number(sortOrder) || 0,
        qr_code: qrCode,
        auto_redirect: autoRedirect,
      };
      if (editing && row) {
        await adminEndpoints.updateStoreAdmin(row.id, payload);
      } else {
        await adminEndpoints.createStore({ code: code.trim(), ...payload });
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
      <div className="tlc-panel" style={{ width: 520 }}>
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">{editing ? "编辑分站" : "添加分站"}</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary" disabled={saving} onClick={() => void submit()}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="bd-form">
            {!editing && (
              <div className="bd-form-row">
                <span className="bd-form-label"><span className="bd-req">*</span>分站编码</span>
                <input className="bd-input" value={code} placeholder="如 nanjing-01（创建后不可修改）" onChange={(e) => setCode(e.target.value)} />
              </div>
            )}
            <div className="bd-form-row">
              <span className="bd-form-label"><span className="bd-req">*</span>分站名称</span>
              <input className="bd-input" value={name} placeholder="请输入分站名称" onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="bd-form-row">
              <span className="bd-form-label">显示名称</span>
              <input className="bd-input" value={displayName} placeholder="全国模式下不展示自定义名称" onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="bd-form-row">
              <span className="bd-form-label">分站地区</span>
              <input className="bd-input" value={regionCode} placeholder="行政区划码，如 320100" onChange={(e) => setRegionCode(e.target.value)} />
            </div>
            <div className="bd-form-row">
              <span className="bd-form-label">链接</span>
              <input className="bd-input" value={linkUrl} placeholder="分站访问链接（选填）" onChange={(e) => setLinkUrl(e.target.value)} />
            </div>
            <div className="bd-form-row">
              <span className="bd-form-label">显示排序</span>
              <input className="bd-input" value={sortOrder} inputMode="numeric" onChange={(e) => setSortOrder(e.target.value.replace(/[^\d]/g, ""))} />
            </div>
            <div className="bd-form-row bd-form-icon-row">
              <span className="bd-form-label">链接/二维码</span>
              <div className="bd-icon-group">
                <button type="button" className="bd-icon-upload" onClick={() => fileRef.current?.click()}>上传图片</button>
                {qrCode && (
                  <>
                    <img src={resolveMediaUrl(qrCode) ?? qrCode} alt="二维码" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }} />
                    <button type="button" className="finord-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => setQrCode(null)}>移除</button>
                  </>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  pickAndUploadImage(e.target.files?.[0], (url) => setQrCode(url), (msg) => setError(msg));
                  e.target.value = "";
                }}
              />
            </div>
            <div className="bd-form-row bd-form-icon-row">
              <span className="bd-form-label">自动跳转</span>
              <div className="bm-radio-row">
                {[{ label: "开启", value: true }, { label: "关闭", value: false }].map((o) => (
                  <label key={o.label} className={`bm-radio ${autoRedirect === o.value ? "active" : ""}`}>
                    <input type="radio" name="autoRedirect" checked={autoRedirect === o.value} onChange={() => setAutoRedirect(o.value)} />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {error && <p style={{ color: "#ff4d4f", fontSize: 13, marginTop: 12 }}>{error}</p>}
          {editing && row && (
            <p style={{ color: "#9aa3b2", fontSize: 12, marginTop: 12 }}>
              当前状态：{STATUS_LABEL[row.status] ?? row.status}　成员 {row.member_count} 人　分店红娘 {row.matchmaker_count} 人
            </p>
          )}
        </div>
      </div>
    </>
  );
}
