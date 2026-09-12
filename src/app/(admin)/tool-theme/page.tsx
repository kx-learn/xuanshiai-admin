"use client";

import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { pickAndUploadImage, showConfigToast, useConfigDomain } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "会员分区");

type Zone = {
  id: number;
  name: string;
  slogan: string;
  popup_enabled: boolean;
  data_mode: "auto" | "manual";
  cover_url: string | null;
  template_index: number;
  share_title: string;
  share_summary: string;
  share_cover_url: string | null;
  online: boolean;
  status: boolean;
  sort_order: number;
};

type ZoneConfig = {
  zones: Zone[];
};

const TZ_TPL_COLORS = [
  ["#f6d8e2", "#e8b6c6"],
  ["#dfe6fb", "#c1d0f2"],
  ["#e4f0e3", "#c6e0c4"],
  ["#fde9d9", "#f8d4b8"],
  ["#e6dcf5", "#cfbce8"],
];

function emptyZone(sort: number): Zone {
  return {
    id: Date.now() + sort,
    name: "",
    slogan: "",
    popup_enabled: false,
    data_mode: "auto",
    cover_url: null,
    template_index: 0,
    share_title: "",
    share_summary: "",
    share_cover_url: null,
    online: true,
    status: true,
    sort_order: sort,
  };
}

export default function ToolThemePage() {
  const { snapshot, save } = useConfigDomain<ZoneConfig>("tools_member_zone", { zones: [] });
  const [zones, setZones] = useState<Zone[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<Zone | null>(null);

  useEffect(() => {
    if (!snapshot) return;
    const data = snapshot.config;
    const list = Array.isArray(data.zones) ? data.zones : [];
    setZones(
      list.map((z, i) => ({
        id: typeof z.id === "number" ? (z.id as number) : Date.now() + i,
        name: typeof z.name === "string" ? (z.name as string) : "",
        slogan: typeof z.slogan === "string" ? (z.slogan as string) : "",
        popup_enabled: Boolean(z.popup_enabled),
        data_mode: z.data_mode === "manual" ? "manual" : "auto",
        cover_url: typeof z.cover_url === "string" ? (z.cover_url as string) : null,
        template_index: typeof z.template_index === "number" ? (z.template_index as number) : 0,
        share_title: typeof z.share_title === "string" ? (z.share_title as string) : "",
        share_summary: typeof z.share_summary === "string" ? (z.share_summary as string) : "",
        share_cover_url: typeof z.share_cover_url === "string" ? (z.share_cover_url as string) : null,
        online: z.online !== false,
        status: z.status !== false,
        sort_order: typeof z.sort_order === "number" ? (z.sort_order as number) : i * 10,
      })),
    );
  }, [snapshot]);

  const move = (idx: number, dir: -1 | 1) =>
    setZones((arr) => {
      const next = [...arr];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return arr;
      [next[idx], next[j]] = [next[j], next[idx]];
      next.forEach((z, i) => { z.sort_order = i * 10; });
      return next;
    });

  const toggleStatus = (idx: number) =>
    setZones((arr) => arr.map((z, i) => (i === idx ? { ...z, status: !z.status } : z)));

  const remove = (idx: number) => {
    if (!window.confirm("确定删除该分区？")) return;
    setZones((arr) => arr.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    const ok = await save({ zones }, "会员分区更新");
    showConfigToast(ok ? "保存成功" : "内容无变化", ok ? "ok" : "error");
  };

  const openCreate = () => {
    setDraft(emptyZone(zones.length * 10));
    setDrawerOpen(true);
  };

  const openEdit = (zone: Zone) => {
    setDraft({ ...zone });
    setDrawerOpen(true);
  };

  const confirmDrawer = () => {
    if (!draft) return;
    if (!draft.name.trim()) {
      showConfigToast("请输入分区名称", "error");
      return;
    }
    setZones((arr) => {
      const idx = arr.findIndex((z) => z.id === draft.id);
      if (idx >= 0) {
        const next = [...arr];
        next[idx] = draft;
        return next;
      }
      return [...arr, draft];
    });
    setDrawerOpen(false);
    setDraft(null);
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>会员分区功能可帮助您的企业快速建立各种主题的会员聚合页面，将会员按照性格特征进行分类集中展示，能够给会员快速的引导入口，增强关注度和流量导入。还可以通过专区功能轻松创建互动活动</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="tm-head">
          <div className="tm-title">会员分区</div>
          <button type="button" className="finord-btn finord-btn-primary" onClick={openCreate}>＋ 添加分区</button>
        </div>

        <div className="tm-table-wrap">
          <table className="tm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>分区名称</th>
                <th>状态</th>
                <th>排序</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {zones.map((row, index) => (
                <tr key={row.id}>
                  <td className="tm-cell-id">{index + 1}</td>
                  <td>
                    <div className="tm-name-row">
                      <span>{row.name}</span>
                      {row.status ? null : <span style={{ marginLeft: 8, color: "#999", fontSize: 12 }}>（已下架）</span>}
                    </div>
                  </td>
                  <td>
                    <span className="tm-status-wrap">
                      <span className={`tm-badge ${row.status ? "on" : "off"}`}>{row.status ? "上架" : "下架"}</span>
                      <button
                        type="button"
                        className={`mp-switch ${row.status ? "on" : ""} tm-switch-sm`}
                        onClick={() => toggleStatus(index)}
                        aria-label="切换状态"
                      >
                        <span className="mp-switch-knob" />
                      </button>
                    </span>
                  </td>
                  <td>
                    <span className="tm-moves">
                      {index > 0 && (
                        <button type="button" className="tm-move" onClick={() => move(index, -1)}>↑ 上移</button>
                      )}
                      {index < zones.length - 1 && (
                        <button type="button" className="tm-move" onClick={() => move(index, 1)}>↓ 下移</button>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className="tm-ops">
                      <span className="finord-link" onClick={() => openEdit(row)} style={{ cursor: "pointer" }}>编辑</span>
                      <span className="tm-op-sep">|</span>
                      <span className="finord-link tm-op-del" onClick={() => remove(index)} style={{ cursor: "pointer" }}>删除</span>
                    </span>
                  </td>
                </tr>
              ))}
              {zones.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂无分区，点击「添加分区」开始创建
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="xm-actions" style={{ marginTop: 16 }}>
          <button type="button" className="xm-submit" onClick={submit}>确定提交</button>
        </div>
      </div>

      {drawerOpen && draft && (
        <>
          <div className="tlc-mask" onClick={() => { setDrawerOpen(false); setDraft(null); }} />
          <div className="tlc-panel tz-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button type="button" className="tlc-x" onClick={() => { setDrawerOpen(false); setDraft(null); }} aria-label="关闭"><X size={18} /></button>
                <span className="tlc-panel-title">{zones.find((z) => z.id === draft.id) ? "编辑分区" : "添加分区"}</span>
              </div>
              <div className="tz-head-actions">
                <button type="button" className="finord-btn tz-cancel" onClick={() => { setDrawerOpen(false); setDraft(null); }}>取消</button>
                <button type="button" className="finord-btn finord-btn-primary" onClick={confirmDrawer}>确定</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              <div className="tz-row">
                <span className="tz-label">＊分区名称</span>
                <div className="tz-content">
                  <input
                    className="tz-input tz-input-wide"
                    value={draft.name}
                    onChange={(e) => setDraft((cur) => cur ? { ...cur, name: e.target.value } : cur)}
                  />
                  <div className="tz-info">① 建议不要超过6个汉字，如：高颜值专区</div>
                </div>
              </div>

              <div className="tz-row">
                <span className="tz-label">＊宣传标语</span>
                <div className="tz-content">
                  <input
                    className="tz-input tz-input-wide"
                    value={draft.slogan}
                    onChange={(e) => setDraft((cur) => cur ? { ...cur, slogan: e.target.value } : cur)}
                  />
                  <div className="tz-info">① 建议不要超过20个汉字</div>
                </div>
              </div>

              <div className="tz-row">
                <span className="tz-label">进入页面弹窗</span>
                <div className="tz-options">
                  {(["关闭", "启用"] as const).map((o) => (
                    <label key={o} className={`tz-radio ${(draft.popup_enabled ? "启用" : "关闭") === o ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="popup"
                        checked={(draft.popup_enabled ? "启用" : "关闭") === o}
                        onChange={() => setDraft((cur) => cur ? { ...cur, popup_enabled: o === "启用" } : cur)}
                      />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="tz-row tz-row-top">
                <span className="tz-label">会员数据</span>
                <div className="tz-content">
                  <div className="tz-options">
                    <label className={`tz-radio ${draft.data_mode === "auto" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="dataMode"
                        checked={draft.data_mode === "auto"}
                        onChange={() => setDraft((cur) => cur ? { ...cur, data_mode: "auto" } : cur)}
                      />
                      <span>自动条件筛选</span>
                    </label>
                    <label className={`tz-radio ${draft.data_mode === "manual" ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="dataMode"
                        checked={draft.data_mode === "manual"}
                        onChange={() => setDraft((cur) => cur ? { ...cur, data_mode: "manual" } : cur)}
                      />
                      <span>指定会员（可支持会员自助申请加入）</span>
                    </label>
                  </div>
                  <div className="tz-info">① 根据您设置的条件实时自动筛选出数据并显示在该分区中</div>
                </div>
              </div>

              <div className="tz-row tz-row-top">
                <span className="tz-label">头部背景</span>
                <div className="tz-content">
                  <div className="tz-bg-row">
                    <div className="tz-pick" style={{ cursor: "pointer" }}>
                      {draft.cover_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={draft.cover_url} alt="头部背景" style={{ width: 120, height: 60, objectFit: "cover" }} />
                      ) : (
                        <>
                          <Plus size={18} />
                          <span>上传图片</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) =>
                          pickAndUploadImage(
                            e.target.files?.[0],
                            (url) => setDraft((cur) => cur ? { ...cur, cover_url: url } : cur),
                            (m) => showConfigToast(m, "error"),
                          )
                        }
                      />
                    </div>
                    {draft.cover_url && (
                      <button
                        type="button"
                        className="tz-cancel-bg"
                        onClick={() => setDraft((cur) => cur ? { ...cur, cover_url: null } : cur)}
                      >取消背景</button>
                    )}
                  </div>
                  <div className="tz-info">① 最佳尺寸：750像素×345像素，点击可重新上传</div>
                </div>
              </div>

              <div className="tz-row tz-row-top">
                <span className="tz-label">分区页模板</span>
                <div className="tz-tpl-row">
                  {TZ_TPL_COLORS.map(([c1, c2], i) => (
                    <label key={i} className={`tz-tpl ${draft.template_index === i ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="tpl"
                        checked={draft.template_index === i}
                        onChange={() => setDraft((cur) => cur ? { ...cur, template_index: i } : cur)}
                      />
                      <div className="tz-tpl-frame" style={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                        <div className="tz-tpl-rows"><span /><span /><span /></div>
                        <div className="tz-tpl-avatar" />
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="tz-row">
                <span className="tz-label">分享标题</span>
                <input
                  className="tz-input tz-input-wide"
                  value={draft.share_title}
                  onChange={(e) => setDraft((cur) => cur ? { ...cur, share_title: e.target.value } : cur)}
                />
              </div>

              <div className="tz-row">
                <span className="tz-label">分享摘要</span>
                <input
                  className="tz-input tz-input-wide"
                  value={draft.share_summary}
                  onChange={(e) => setDraft((cur) => cur ? { ...cur, share_summary: e.target.value } : cur)}
                />
              </div>

              <div className="tz-row tz-row-top">
                <span className="tz-label">＊分享封面</span>
                <div className="tz-content">
                  <div className="tz-pick" style={{ cursor: "pointer" }}>
                    {draft.share_cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={draft.share_cover_url} alt="分享封面" style={{ width: 60, height: 60, objectFit: "cover" }} />
                    ) : (
                      <>
                        <Plus size={18} />
                        <span>上传图片</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) =>
                        pickAndUploadImage(
                          e.target.files?.[0],
                          (url) => setDraft((cur) => cur ? { ...cur, share_cover_url: url } : cur),
                          (m) => showConfigToast(m, "error"),
                        )
                      }
                    />
                  </div>
                  <div className="tz-info">① 最佳尺寸：300像素×300像素</div>
                </div>
              </div>

              <div className="tz-row">
                <span className="tz-label">是否上线</span>
                <div className="tz-options">
                  {(["暂不上线", "上线"] as const).map((o) => (
                    <label key={o} className={`tz-radio ${(draft.online ? "上线" : "暂不上线") === o ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="online"
                        checked={(draft.online ? "上线" : "暂不上线") === o}
                        onChange={() => setDraft((cur) => cur ? { ...cur, online: o === "上线" } : cur)}
                      />
                      <span>{o}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
