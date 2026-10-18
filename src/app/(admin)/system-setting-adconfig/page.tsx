"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { X, Upload } from "lucide-react";
import { adminEndpoints, type AdminListQuery } from "@/lib/admin-endpoints";
import { pickAndUploadImage, showConfigToast } from "@/lib/platform-config";
import { resolveMediaUrl as resolveMedia } from "@/lib/admin-api";

/** 广告位内容项（admin/content/ad_slot），业务字段存放在 extra */
type AdItem = {
  id: number;
  title: string;
  image_url: string | null;
  status: number;
  sort: number;
  extra: Record<string, unknown>;
};

type AdRow = {
  id: number;
  code: string;
  title: string;
  type: string;
  platform: string;
  image: string;
  on: boolean;
  sort: number;
};

type AdForm = {
  code: string;
  title: string;
  type: string;
  platform: string;
  image: string;
  on: boolean;
  sort: number;
};

const DEFAULT_SLOTS: Omit<AdRow, "id">[] = [
  { code: "h5_index", title: "h5端首页轮播图", type: "轮播图", platform: "H5端", image: "", on: true, sort: 100 },
  { code: "active_h5_index", title: "h5端活动页首页轮播图", type: "轮播图", platform: "H5端", image: "", on: true, sort: 99 },
  { code: "active_mp_index", title: "小程序端活动页首页轮播图", type: "轮播图", platform: "小程序端", image: "", on: true, sort: 98 },
  { code: "h5_index_nosingle", title: "h5端首页宣传广告图", type: "图片", platform: "H5端", image: "", on: true, sort: 97 },
  { code: "h5_theme_banner", title: "h5端会员专区广告图", type: "图片", platform: "H5端", image: "", on: true, sort: 96 },
  { code: "member_h5_integrity", title: "会员端诚信认证banner广告", type: "图片", platform: "H5端", image: "", on: true, sort: 95 },
  { code: "member_mp_integrity", title: "小程序端会员诚信认证banner广告", type: "图片", platform: "小程序端", image: "", on: true, sort: 94 },
  { code: "mp_index", title: "小程序端首页轮播图", type: "轮播图", platform: "小程序端", image: "", on: true, sort: 93 },
  { code: "mp_index_nosingle", title: "小程序端首页宣传广告图", type: "图片", platform: "小程序端", image: "", on: true, sort: 92 },
  { code: "mp_index_open", title: "小程序起开屏广告", type: "图片", platform: "小程序端", image: "", on: false, sort: 91 },
  { code: "mp_theme_banner", title: "小程序端会员专区广告图", type: "图片", platform: "小程序端", image: "", on: true, sort: 90 },
  { code: "video_h5_index", title: "h5端短视频首页轮播图", type: "轮播图", platform: "H5端", image: "", on: false, sort: 89 },
  { code: "video_mp_index", title: "小程序端短视频首页轮播图", type: "轮播图", platform: "小程序端", image: "", on: false, sort: 88 },
];

const SEED_FLAG = "adcfg_default_slots_seeded";
// 模块级守卫：开发模式 React Strict Mode 会重复执行挂载 effect，避免默认广告位被重复创建
let seedPromise: Promise<void> | null = null;

function Switch({ on }: { on: boolean }) {
  return (
    <span className={"mp-switch" + (on ? " on" : "")}>
      {on && <span className="mp-switch-label">开</span>}
      <span className="mp-switch-knob"></span>
    </span>
  );
}

function toRow(item: AdItem): AdRow {
  const extra = (item.extra ?? {}) as Record<string, unknown>;
  const code = typeof extra.code === "string" && extra.code ? extra.code : `ad_${item.id}`;
  return {
    id: item.id,
    code,
    title: item.title || "",
    type: typeof extra.ad_type === "string" ? extra.ad_type : "图片",
    platform: typeof extra.platform === "string" ? extra.platform : "H5端",
    image: item.image_url || (typeof extra.image_url === "string" ? extra.image_url : ""),
    on: item.status === 1,
    sort: item.sort,
  };
}

function AdDrawer({
  mode,
  initial,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  initial: AdRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<AdForm>({
    code: initial?.code ?? "",
    title: initial?.title ?? "",
    type: initial?.type ?? "轮播图",
    platform: initial?.platform ?? "H5端",
    image: initial?.image ?? "",
    on: initial?.on ?? true,
    sort: initial?.sort ?? 0,
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const save = async () => {
    if (!form.code.trim()) return showConfigToast("请填写广告编号", "error");
    if (!form.title.trim()) return showConfigToast("请填写广告标题", "error");
    setBusy(true);
    try {
      const body = {
        title: form.title.trim(),
        // 后端 update 对 image_url=null 视为“未提交”，清除图片必须提交空串
        image_url: form.image || (mode === "edit" ? "" : null),
        status: form.on ? 1 : 2,
        sort: Number(form.sort) || 0,
        extra: {
          code: form.code.trim(),
          ad_type: form.type,
          platform: form.platform,
          image_url: form.image || "",
        },
      };
      if (mode === "create") await adminEndpoints.createContent("ad_slot", body);
      else if (initial) await adminEndpoints.updateContent("ad_slot", initial.id, body);
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
      <div className="ec-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal-header">
          <span className="ec-modal-title">{mode === "create" ? "添加广告" : `编辑广告：${initial?.code ?? ""}`}</span>
          <button type="button" className="ec-modal-close" aria-label="关闭" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ec-modal-body">
          <div className="ec-row">
            <span className="ec-key">广告编号</span>
            <input className="ec-input" value={form.code} disabled={mode === "edit"} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="如 h5_index" />
          </div>
          <div className="ec-row">
            <span className="ec-key">广告标题</span>
            <input className="ec-input" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="ec-row">
            <span className="ec-key">广告类型</span>
            <select className="ec-input" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
              <option value="轮播图">轮播图</option>
              <option value="图片">图片</option>
            </select>
          </div>
          <div className="ec-row">
            <span className="ec-key">平台</span>
            <select className="ec-input" value={form.platform} onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}>
              <option value="H5端">H5端</option>
              <option value="小程序端">小程序端</option>
            </select>
          </div>
          <div className="ec-row">
            <span className="ec-key">广告图片</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {form.image ? <img src={resolveMedia(form.image) ?? form.image} alt="" style={{ width: 88, height: 48, objectFit: "cover", border: "1px solid #e5e8f0", borderRadius: 4 }} /> : <div style={{ width: 88, height: 48, background: "#f2f4f8", borderRadius: 4 }} />}
              <button type="button" className="sy-upload-sm sy-upload-file" disabled={uploading} onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4" /><span>{uploading ? "上传中…" : form.image ? "重新上传" : "上传图片"}</span>
              </button>
              {form.image && <button type="button" className="ec-cancel" onClick={() => setForm((f) => ({ ...f, image: "" }))}>清除</button>}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                setUploading(true);
                pickAndUploadImage(file, (url) => { setForm((f) => ({ ...f, image: url })); setUploading(false); }, (message) => { showConfigToast(message, "error"); setUploading(false); });
              }}
            />
          </div>
          <div className="ec-row">
            <span className="ec-key">显示状态</span>
            <label className="mp-switch" style={{ cursor: "pointer" }}>
              <input type="checkbox" checked={form.on} onChange={(e) => setForm((f) => ({ ...f, on: e.target.checked }))} style={{ display: "none" }} />
              <Switch on={form.on} />
            </label>
          </div>
          <div className="ec-row">
            <span className="ec-key">排序</span>
            <input className="ec-input" type="number" value={form.sort} onChange={(e) => setForm((f) => ({ ...f, sort: Number(e.target.value) }))} />
          </div>
        </div>
        <div className="ec-modal-footer">
          <button type="button" className="ec-cancel" onClick={onClose}>取消</button>
          <button type="button" className="ec-ok" disabled={busy || uploading} onClick={save}>确定</button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [rows, setRows] = useState<AdRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [seeding] = useState(false);
  const [editing, setEditing] = useState<AdRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async (nextPage = page, nextPageSize = pageSize) => {
    setLoading(true);
    try {
      const query: AdminListQuery = { page: nextPage, page_size: nextPageSize };
      const data = await adminEndpoints.listContent<AdItem>("ad_slot", query);
      const items = (data.items ?? []).map(toRow);
      setRows(items);
      setTotal(data.total ?? items.length);
      setSelectedIds([]);
      return items;
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "广告列表加载失败", "error");
      return [];
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  // 首次进入且后端尚无广告位时，把默认广告位写入 ad_slot，使参考表中的 13 个广告位可直接配置
  useEffect(() => {
    void (async () => {
      const items = await load(1, pageSize);
      const seeded = typeof window !== "undefined" && window.localStorage.getItem(SEED_FLAG) === "1";
      if (items.length === 0 && !seeded && !seedPromise) {
        seedPromise = (async () => {
          for (const slot of DEFAULT_SLOTS) {
            await adminEndpoints.createContent("ad_slot", {
              title: slot.title,
              subtitle: null,
              image_url: null,
              status: slot.on ? 1 : 2,
              sort: slot.sort,
              extra: { code: slot.code, ad_type: slot.type, platform: slot.platform, image_url: null },
            });
          }
          window.localStorage.setItem(SEED_FLAG, "1");
        })();
        try {
          await seedPromise;
          showConfigToast("已创建默认广告位，可直接配置图片与状态");
          await load(1, pageSize);
        } catch (e) {
          seedPromise = null;
          showConfigToast(e instanceof Error ? e.message : "默认广告位创建失败", "error");
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStatus = async (row: AdRow, on: boolean) => {
    try {
      await adminEndpoints.updateContent("ad_slot", row.id, { status: on ? 1 : 2 });
      setRows((current) => current.map((r) => (r.id === row.id ? { ...r, on } : r)));
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "状态保存失败", "error");
    }
  };

  const removeRows = async (ids: number[]) => {
    if (ids.length === 0) return;
    if (!window.confirm(`确认删除选中的 ${ids.length} 个广告位？`)) return;
    setBusy(true);
    try {
      for (const id of ids) await adminEndpoints.deleteContent("ad_slot", id);
      showConfigToast("已删除");
      await load(page, pageSize);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    } finally {
      setBusy(false);
    }
  };

  const bulkStatus = async (ids: number[], on: boolean) => {
    if (ids.length === 0) return;
    setBusy(true);
    try {
      for (const id of ids) await adminEndpoints.updateContent("ad_slot", id, { status: on ? 1 : 2 });
      showConfigToast(on ? "已启用" : "已停用");
      await load(page, pageSize);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "批量操作失败", "error");
    } finally {
      setBusy(false);
    }
  };

  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row.id));

  return (
    <div className="adcfg-page">
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          {
            label: "系统管理",
            href: "/system-setting-basic",
            children: [
              { label: "系统配置", href: "/system-setting-basic" },
              { label: "广告管理", href: "/system-setting-adconfig" },
              { label: "外呼平台", href: "/outbound-call-platform" },
              { label: "外呼状态", href: "/out-call-list" },
              { label: "呼叫记录", href: "/out-call-record" },
              { label: "签名配置", href: "/sms-signature" },
              { label: "通知配置", href: "/sms-notices" },
              { label: "短信群发", href: "/sms-group" },
              { label: "发送记录", href: "/sms-record" },
              { label: "添加账号", href: "/system-setting-admin-user-add" },
              { label: "账号管理", href: "/system-setting-admin-user" },
              { label: "权限分组", href: "/system-setting-admin-group" },
              { label: "系统日志", href: "/system-setting-admin-log" },
            ],
          },
          { label: "广告管理", href: "/system-setting-adconfig" },
          { label: "全部广告" },
        ]}
      />

      <div className="admin-card mt-3">
        <div className="adcfg-head">
          <h2 className="adcfg-title">广告管理</h2>
          <button className="adcfg-add" onClick={() => setCreating(true)}>
            <span className="adcfg-add-plus">+</span> 添加广告
          </button>
        </div>

        <div className="adcfg-body">
          <table className="adcfg-table">
            <thead>
              <tr>
                <th className="adcfg-col-check"><input type="checkbox" aria-label="全选广告位" checked={allSelected} onChange={(event) => setSelectedIds(event.target.checked ? rows.map((row) => row.id) : [])} /></th>
                <th className="adcfg-col-code">广告编号</th>
                <th className="adcfg-col-title">广告标题</th>
                <th className="adcfg-col-type">广告类型</th>
                <th className="adcfg-col-platform">平台</th>
                <th className="adcfg-col-status">状态</th>
                <th className="adcfg-col-op">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "32px 0", color: "#999" }}>{loading || seeding ? "加载中…" : "暂无广告位"}</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id}>
                  <td className="adcfg-td-check"><input type="checkbox" aria-label={`选择广告位 ${row.code}`} checked={selectedIds.includes(row.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} /></td>
                  <td className="adcfg-td-code">{row.code}</td>
                  <td className="adcfg-td-title">{row.title}</td>
                  <td className="adcfg-td-type">{row.type}</td>
                  <td className="adcfg-td-platform">{row.platform}</td>
                  <td className="adcfg-td-status">
                    <button type="button" className="adcfg-switch" onClick={() => void setStatus(row, !row.on)}>
                      <Switch on={row.on} />
                    </button>
                  </td>
                  <td className="adcfg-td-op">
                    <span className="au-actions">
                      <button type="button" className="au-edit" onClick={() => setEditing(row)}>编辑</button>
                      <button type="button" className="au-del" disabled={busy} onClick={() => void removeRows([row.id])}>删除</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedIds.length > 0 && (
          <div className="lead-bulk-toolbar">
            <span>已选择 <b>{selectedIds.length}</b> 项</span>
            <button type="button" disabled={busy} onClick={() => void bulkStatus(selectedIds, true)}>启用</button>
            <button type="button" disabled={busy} onClick={() => void bulkStatus(selectedIds, false)}>停用</button>
            <button type="button" disabled={busy} onClick={() => void removeRows(selectedIds)}>删除</button>
            <button type="button" onClick={() => setSelectedIds([])}>取消选择</button>
          </div>
        )}

        <AdminPagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={(next) => { setPage(next); void load(next, pageSize); }}
          onPageSizeChange={(next) => { setPageSize(next); setPage(1); void load(1, next); }}
        />
      </div>

      {creating && <AdDrawer mode="create" initial={null} onClose={() => setCreating(false)} onSaved={() => void load(page, pageSize)} />}
      {editing && <AdDrawer mode="edit" initial={editing} onClose={() => setEditing(null)} onSaved={() => void load(page, pageSize)} />}
    </div>
  );
}
