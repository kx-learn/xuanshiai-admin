"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type ShortVideoItem, type VideoCategoryItem } from "@/lib/admin-endpoints";
import { pickAndUploadImage, showConfigToast, uploadAdminImage } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("短视频", "视频管理");

const STATUS_TABS: { label: string; value: string | undefined }[] = [
  { label: "全部", value: undefined },
  { label: "通过", value: "approved" },
  { label: "待审", value: "pending" },
  { label: "未通过", value: "rejected" },
];
const FLAG_TABS: { label: string; value: "top" | "recommend" | "hot" }[] = [
  { label: "置顶", value: "top" },
  { label: "推荐", value: "recommend" },
  { label: "热门", value: "hot" },
];
const AUDIT_OPTIONS = [
  { label: "通过", value: "approved" },
  { label: "待审", value: "pending" },
  { label: "未通过", value: "rejected" },
];
const PERM_OPTIONS = [
  { label: "不限", value: "all" },
  { label: "必须先登录", value: "login" },
  { label: "仅相亲会员", value: "member" },
];
const LINK_OPTIONS = [
  { label: "不关联", value: "none" },
  { label: "自定义", value: "custom" },
  { label: "关联相亲资料", value: "member" },
  { label: "关联平台活动", value: "activity" },
  { label: "关联平台首页", value: "home" },
];

const fmt = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 19) : "-");

export default function ShortVideoListPage() {
  const [rows, setRows] = useState<ShortVideoItem[]>([]);
  const [categories, setCategories] = useState<VideoCategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusTab, setStatusTab] = useState<string | undefined>(undefined);
  const [flag, setFlag] = useState<"top" | "recommend" | "hot" | undefined>(undefined);
  const [categoryId, setCategoryId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    adminEndpoints.videoCategoryList().then(setCategories).catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminEndpoints.shortVideoList({
        page: 1, page_size: 50,
        audit_status: statusTab,
        flag,
        category_id: categoryId ? Number(categoryId) : undefined,
        keyword: keyword || undefined,
        order_by: orderBy || undefined,
      });
      setRows(res.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [statusTab, flag, categoryId, keyword, orderBy]);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const patch = async (id: number, body: Record<string, unknown>) => {
    try {
      const updated = await adminEndpoints.updateShortVideo(id, body);
      setRows((l) => l.map((x) => (x.id === id ? updated : x)));
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "操作失败", "error");
      load();
    }
  };

  const deleteRow = async (r: ShortVideoItem) => {
    if (!window.confirm(`确定删除视频 ${r.id}？`)) return;
    try {
      await adminEndpoints.deleteShortVideo(r.id);
      showConfigToast("删除成功", "ok");
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const refreshPublishTime = async () => {
    try {
      const res = await adminEndpoints.brushVideos("publish_time", 1, 100000);
      showConfigToast(`已刷新 ${res.affected} 条发布时间`, "ok");
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card svl-card">
        {/* 标题行 */}
        <div className="svl-head">
          <h2 className="svl-title">视频管理</h2>
          <div className="svl-head-actions">
            <button className="finord-btn finord-btn-primary svl-add-btn" onClick={() => setAddOpen(true)}>＋ 添加视频</button>
            <button className="finord-btn finord-btn-primary svl-refresh-btn" onClick={refreshPublishTime}>⟳ 一键刷新发布时间</button>
          </div>
        </div>

        {/* 筛选条 */}
        <div className="svl-filters">
          <div className="svl-tabs">
            {STATUS_TABS.map((t) => (
              <button key={t.label} className={`svl-tab ${statusTab === t.value ? "active" : ""}`} onClick={() => setStatusTab(t.value)}>{t.label}</button>
            ))}
            <span className="svl-tab-sep" />
            {FLAG_TABS.map((t) => (
              <button key={t.value} className={`svl-tab ${flag === t.value ? "active" : ""}`} onClick={() => setFlag(flag === t.value ? undefined : t.value)}>{t.label}</button>
            ))}
          </div>
          <select className="svl-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">全部分类</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="svl-radio">
            <input type="radio" name="searchMode" defaultChecked />
            <span>按标题搜</span>
          </label>
          <input className="svl-input" placeholder="请输入" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <button className="finord-btn finord-btn-primary svl-search-btn" onClick={() => load()}>搜索</button>
          <select className="svl-select svl-time-select" value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
            <option value="">按发布时间</option>
            <option value="views">按播放数</option>
            <option value="likes">按点赞数</option>
          </select>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table svl-table">
            <thead>
              <tr>
                <th className="svl-col-check"><input type="checkbox" className="svl-check" /></th>
                <th>ID</th>
                <th>封面</th>
                <th>描述</th>
                <th>浏览权限</th>
                <th>关联内容</th>
                <th>统计数据</th>
                <th>打赏收入</th>
                <th>红包</th>
                <th>显示</th>
                <th>审核</th>
                <th>属性</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td className="svl-col-check"><input type="checkbox" className="svl-check" /></td>
                  <td className="svl-id">{v.id}</td>
                  <td>
                    <div className="svl-cover">{v.cover || v.category_name || v.description?.slice(0, 6) || "-"}</div>
                  </td>
                  <td className="svl-desc">
                    <div className="svl-desc-text">{v.description || "-"}</div>
                    <div className="svl-desc-meta">
                      <span>分类：<span className="svl-meta-blue">{v.category_name || "-"}</span></span>
                      <span>时长：{v.duration_label}</span>
                      <span>发布：{v.publisher_nickname || v.publisher_user_id}</span>
                      <span>时间：{fmt(v.published_at || v.created_at)}</span>
                    </div>
                  </td>
                  <td>
                    <select className="svl-perm-select" value={v.view_permission} onChange={(e) => patch(v.id, { view_permission: e.target.value })}>
                      {PERM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td>{v.link_label}</td>
                  <td className="svl-stats">
                    <div>播放数：{v.view_count}</div>
                    <div>评论数：{v.comment_count}</div>
                    <div>点赞数：{v.like_count}</div>
                  </td>
                  <td><span className="svl-tip">{v.tip_amount}元</span></td>
                  <td>
                    <div className="svl-redpacket">
                      <span className="svl-redpacket-text">有红包</span>
                      <button type="button" className={`mp-switch ${v.has_red_packet ? "on" : ""}`} onClick={() => patch(v.id, { has_red_packet: !v.has_red_packet })}>
                        <span className="mp-switch-knob"></span>
                      </button>
                    </div>
                  </td>
                  <td>
                    <button type="button" className={`mp-switch ${v.visible ? "on" : ""}`} onClick={() => patch(v.id, { visible: !v.visible })}>
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                  <td>
                    <select className="svl-audit-select" value={v.audit_status} onChange={(e) => patch(v.id, { audit_status: e.target.value })}>
                      {AUDIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td className="svl-flags">
                    <div className="svl-flag-row">置顶：
                      <button type="button" className={`mp-switch ${v.is_top ? "on" : ""}`} onClick={() => patch(v.id, { is_top: !v.is_top })}>
                        <span className="mp-switch-knob"></span>
                      </button>
                    </div>
                    <div className="svl-flag-row">推荐：
                      <button type="button" className={`mp-switch ${v.is_recommend ? "on" : ""}`} onClick={() => patch(v.id, { is_recommend: !v.is_recommend })}>
                        <span className="mp-switch-knob"></span>
                      </button>
                    </div>
                    <div className="svl-flag-row">热门：
                      <button type="button" className={`mp-switch ${v.is_hot ? "on" : ""}`} onClick={() => patch(v.id, { is_hot: !v.is_hot })}>
                        <span className="mp-switch-knob"></span>
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="svl-ops">
                      <a className="finord-link" onClick={() => setAddOpen(true)}>编辑</a>
                      <a className="finord-link" onClick={() => v.video_url && window.open(v.video_url, "_blank")}>预览视频</a>
                      <a className="finord-link svl-op-del" onClick={() => deleteRow(v)}>删除</a>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={13} style={{ textAlign: "center", padding: "32px 0", color: "#98a2b3" }}>暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && <AddVideoDrawer categories={categories} onClose={() => setAddOpen(false)} onSaved={load} />}
    </div>
  );
}

function AddVideoDrawer({ categories, onClose, onSaved }: { categories: VideoCategoryItem[]; onClose: () => void; onSaved: () => void }) {
  const [coverMode, setCoverMode] = useState<"auto" | "custom">("auto");
  const [linkType, setLinkType] = useState("none");
  const [publisher, setPublisher] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [cover, setCover] = useState<string | null>(null);
  const [sort, setSort] = useState(0);
  const [virtualViews, setVirtualViews] = useState(0);
  const [commentEnabled, setCommentEnabled] = useState(true);
  const [tipEnabled, setTipEnabled] = useState(true);
  const [permission, setPermission] = useState("login");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!publisher.trim()) { showConfigToast("请填写发布账号（会员ID）", "error"); return; }
    if (!description.trim()) { showConfigToast("请填写视频描述", "error"); return; }
    setSaving(true);
    try {
      await adminEndpoints.createShortVideo({
        publisher_user_id: Number(publisher),
        cover,
        cover_mode: coverMode,
        description,
        category_id: categoryId ? Number(categoryId) : null,
        video_url: videoUrl,
        link_type: linkType,
        view_permission: permission,
        sort,
        virtual_views: virtualViews,
        comment_enabled: commentEnabled,
        tip_enabled: tipEnabled,
      });
      showConfigToast("提交成功", "ok");
      onSaved();
      onClose();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "提交失败", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel svl-add-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加视频</span>
          </div>
          <div className="svl-add-actions">
            <button className="finord-btn svl-add-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary" onClick={submit} disabled={saving}>{saving ? "提交中…" : "确定提交"}</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 发布账号 */}
          <div className="svl-add-row">
            <span className="svl-add-label">＊发布账号</span>
            <input className="svl-add-input svl-add-input-wide" placeholder="请输入账号昵称 / 会员ID" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
          </div>

          {/* 上传视频 */}
          <div className="svl-add-row">
            <span className="svl-add-label">＊上传视频</span>
            <label className="svl-add-pick">
              {videoUrl ? <span>已上传</span> : <><Plus size={18} /><span>上传视频</span></>}
              <input type="file" accept="video/*" hidden onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const url = await uploadAdminImage(f);
                  setVideoUrl(url);
                } catch (err) {
                  showConfigToast(err instanceof Error ? err.message : "上传失败", "error");
                }
              }} />
            </label>
          </div>

          {/* 视频封面 */}
          <div className="svl-add-row">
            <span className="svl-add-label">视频封面</span>
            <div className="svl-add-options svl-add-options-row">
              {([["auto", "系统自动截图"], ["custom", "自定义上传"]] as const).map(([v, label]) => (
                <label key={v} className={`svl-add-radio ${coverMode === v ? "active" : ""}`}>
                  <input type="radio" name="cover" value={v} checked={coverMode === v} onChange={() => setCoverMode(v)} />
                  <span>{label}</span>
                </label>
              ))}
              {coverMode === "custom" && (
                <label className="finord-link" style={{ cursor: "pointer", marginLeft: 12 }}>
                  {cover ? "已上传封面" : "上传封面"}
                  <input type="file" accept="image/*" hidden onChange={(e) => pickAndUploadImage(e.target.files?.[0], setCover, (m) => showConfigToast(m, "error"))} />
                </label>
              )}
            </div>
          </div>

          {/* 视频分类 */}
          <div className="svl-add-row">
            <span className="svl-add-label">＊视频分类</span>
            <select className="svl-add-select svl-add-select-wide" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">选择视频分类</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* 视频描述 */}
          <div className="svl-add-row">
            <span className="svl-add-label">＊视频描述</span>
            <textarea className="svl-add-textarea" placeholder="不要超出50汉字" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {/* 关联链接 */}
          <div className="svl-add-row">
            <span className="svl-add-label">关联链接</span>
            <div className="svl-add-options svl-add-options-row">
              {LINK_OPTIONS.map((o) => (
                <label key={o.value} className={`svl-add-radio ${linkType === o.value ? "active" : ""}`}>
                  <input type="radio" name="link" value={o.value} checked={linkType === o.value} onChange={() => setLinkType(o.value)} />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 显示排序 */}
          <div className="svl-add-row">
            <span className="svl-add-label">显示排序</span>
            <div className="svl-add-content">
              <input className="svl-add-input" style={{ width: 220 }} type="number" value={sort} onChange={(e) => setSort(Number(e.target.value))} />
              <div className="svl-add-info">① 数字越大显示越靠前</div>
            </div>
          </div>

          {/* 虚拟播放数 */}
          <div className="svl-add-row">
            <span className="svl-add-label">虚拟播放数</span>
            <div className="svl-add-content">
              <input className="svl-add-input" style={{ width: 220 }} type="number" value={virtualViews} onChange={(e) => setVirtualViews(Number(e.target.value))} />
              <div className="svl-add-info">① 修改后将在此基数上累计计算</div>
            </div>
          </div>

          {/* 功能设置 */}
          <div className="svl-add-row">
            <span className="svl-add-label">功能设置</span>
            <div className="svl-add-func">
              <span className="svl-add-func-item">评论</span>
              <button type="button" className={`mp-switch ${commentEnabled ? "on" : ""}`} onClick={() => setCommentEnabled(!commentEnabled)}>
                <span className="mp-switch-knob"></span>
              </button>
              <span className="svl-add-func-item">打赏</span>
              <button type="button" className={`mp-switch ${tipEnabled ? "on" : ""}`} onClick={() => setTipEnabled(!tipEnabled)}>
                <span className="mp-switch-knob"></span>
              </button>
              <span className="svl-add-func-item">发布时间</span>
              <span className="svl-add-func-dots">...</span>
            </div>
          </div>

          {/* 浏览权限 */}
          <div className="svl-add-row">
            <span className="svl-add-label">浏览权限</span>
            <select className="svl-add-select" value={permission} onChange={(e) => setPermission(e.target.value)}>
              {PERM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
