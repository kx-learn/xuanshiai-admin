"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { pickAndUploadImage, showConfigToast, useConfigDomain } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "搭子栏目");

const TOOLBAR: ({ t: string; title: string } | null)[] = [
  { t: "H", title: "标题" },
  { t: "B", title: "加粗" },
  { t: "T", title: "正文" },
  null,
  { t: "I", title: "斜体" },
  { t: "U", title: "下划线" },
  { t: "S", title: "删除线" },
  null,
  { t: "≡", title: "左对齐" },
  { t: "☰", title: "居中" },
  { t: "≡", title: "右对齐" },
  null,
  { t: "••", title: "无序列表" },
  { t: "1.", title: "有序列表" },
  null,
  { t: "❝", title: "引用" },
  { t: "🔗", title: "链接" },
  { t: "🖼", title: "图片" },
  { t: "⋯", title: "更多" },
  null,
  { t: "↶", title: "撤销" },
  { t: "↷", title: "重做" },
  null,
  { t: "🗑", title: "清空" },
];

type HotRegion = { region: string; sort: number };

type GroupMenuConfig = {
  title: string;
  description: string;
  share_cover_mode: "system" | "custom";
  share_cover_url: string | null;
  banner_mode: "system" | "custom";
  banner_url: string | null;
  promotion_intro_html: string;
  notice_html: string;
  agreement_html: string;
  hot_regions: HotRegion[];
};

const DEFAULTS: GroupMenuConfig = {
  title: "找搭子",
  description: "年轻人的潮流新社交。放下手机，遇见真实的Ta",
  share_cover_mode: "system",
  share_cover_url: null,
  banner_mode: "system",
  banner_url: null,
  promotion_intro_html: "",
  notice_html: "",
  agreement_html: "",
  hot_regions: [],
};

const REGION_OPTIONS = ["北京", "上海", "广州", "深圳", "杭州", "南京", "成都", "武汉"];

export default function GroupMenuPage() {
  const { snapshot, save } = useConfigDomain<GroupMenuConfig>("tools_column_config", DEFAULTS);
  const [cfg, setCfg] = useState<GroupMenuConfig>(DEFAULTS);
  const [hotOpen, setHotOpen] = useState(false);
  const [draftRegion, setDraftRegion] = useState("");
  const [draftKeyword, setDraftKeyword] = useState("");

  useEffect(() => {
    if (!snapshot) return;
    const data = snapshot.config;
    setCfg({
      ...DEFAULTS,
      ...data,
      hot_regions: Array.isArray(data.hot_regions) ? data.hot_regions : [],
    });
  }, [snapshot]);

  const set = <K extends keyof GroupMenuConfig>(key: K, value: GroupMenuConfig[K]) =>
    setCfg((cur) => ({ ...cur, [key]: value }));

  const submit = async () => {
    const ok = await save(cfg, "搭子社群栏目配置更新");
    showConfigToast(ok ? "保存成功" : "内容无变化", ok ? "ok" : "error");
  };

  const addHot = () => {
    if (!draftRegion) {
      showConfigToast("请选择热门区域", "error");
      return;
    }
    setCfg((cur) => ({
      ...cur,
      hot_regions: [
        ...cur.hot_regions.filter((r) => r.region !== draftRegion),
        { region: draftRegion, sort: cur.hot_regions.length + 1 },
      ],
    }));
    setHotOpen(false);
    setDraftKeyword("");
    setDraftRegion("");
  };

  const removeHot = (region: string) =>
    setCfg((cur) => ({
      ...cur,
      hot_regions: cur.hot_regions.filter((r) => r.region !== region),
    }));

  const renderToolbar = (target: keyof GroupMenuConfig) => (
    <div className="gm-toolbar">
      {TOOLBAR.map((tool, i) =>
        tool === null ? (
          <span className="gm-tool-sep" key={`sep-${target}-${i}`} />
        ) : (
          <button
            className="gm-tool"
            type="button"
            key={`${target}-${tool.title}-${i}`}
            title={tool.title}
            onClick={(e) => e.preventDefault()}
          >
            {tool.t}
          </button>
        ),
      )}
    </div>
  );

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card">
        <div className="xm-title">栏目设置</div>

        <div className="xm-row">
          <span className="xm-label">栏目名称</span>
          <div className="xm-content">
            <input
              className="xm-input"
              style={{ width: 360 }}
              value={cfg.title}
              onChange={(e) => set("title", e.target.value)}
            />
            <div className="gm-info">● 作为首页和分享标题。</div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">栏目描述</span>
          <div className="xm-content">
            <textarea
              className="gm-textarea"
              rows={3}
              value={cfg.description}
              onChange={(e) => set("description", e.target.value)}
            />
            <div className="gm-info">● 作为分享描述</div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">分享封面</span>
          <div className="xm-content">
            <div className="xm-radios">
              {(["system", "custom"] as const).map((v) => (
                <label className="xm-radio" key={`share-${v}`}>
                  <input
                    type="radio"
                    checked={cfg.share_cover_mode === v}
                    onChange={() => set("share_cover_mode", v)}
                  />
                  {v === "system" ? "系统默认" : "自定义 (300*300)"}
                </label>
              ))}
            </div>
            {cfg.share_cover_mode === "custom" && (
              <div className="xm-upload-row" style={{ marginTop: 8 }}>
                <label className="xm-upload-btn" style={{ cursor: "pointer" }}>
                  {cfg.share_cover_url ? "更换图片" : "上传图片 (300*300)"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      pickAndUploadImage(
                        e.target.files?.[0],
                        (url) => set("share_cover_url", url),
                        (m) => showConfigToast(m, "error"),
                      )
                    }
                  />
                </label>
                {cfg.share_cover_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cfg.share_cover_url} alt="封面" style={{ maxHeight: 60, marginLeft: 8 }} />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">首页头图</span>
          <div className="xm-content">
            <div className="xm-radios">
              {(["system", "custom"] as const).map((v) => (
                <label className="xm-radio" key={`banner-${v}`}>
                  <input
                    type="radio"
                    checked={cfg.banner_mode === v}
                    onChange={() => set("banner_mode", v)}
                  />
                  {v === "system" ? "系统默认" : "自定义 (778*417)"}
                </label>
              ))}
            </div>
            {cfg.banner_mode === "custom" && (
              <div className="xm-upload-row" style={{ marginTop: 8 }}>
                <label className="xm-upload-btn" style={{ cursor: "pointer" }}>
                  {cfg.banner_url ? "更换图片" : "上传图片 (778*417)"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      pickAndUploadImage(
                        e.target.files?.[0],
                        (url) => set("banner_url", url),
                        (m) => showConfigToast(m, "error"),
                      )
                    }
                  />
                </label>
                {cfg.banner_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cfg.banner_url} alt="头图" style={{ maxHeight: 60, marginLeft: 8 }} />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">社群分类</span>
          <div className="xm-content">
            <div className="gm-catbar">
              <span className="gm-catbar-dot">●</span>
              请在&ldquo;平台配置-基础数据-社群分类&rdquo;中添加和管理
              <a className="gm-catbar-go" href="/platform-base">转入</a>
            </div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">热门区域</span>
          <div className="xm-content">
            {cfg.hot_regions.length === 0 ? (
              <span className="gm-info">（暂无）</span>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {cfg.hot_regions.map((r) => (
                  <span key={r.region} className="gm-tag" style={{ background: "#f0f2f5", padding: "4px 8px", borderRadius: 4 }}>
                    {r.region}
                    <button
                      type="button"
                      onClick={() => removeHot(r.region)}
                      style={{ marginLeft: 6, color: "#999", cursor: "pointer" }}
                      aria-label="删除"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <button type="button" className="gm-add-hot" style={{ marginTop: 8 }} onClick={() => setHotOpen(true)}>＋ 添加热门区域</button>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">推广介绍</span>
          <div className="xm-content">
            <div className="gm-editor">
              {renderToolbar("promotion_intro_html")}
              <div
                className="gm-body"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => set("promotion_intro_html", (e.target as HTMLDivElement).innerHTML)}
                dangerouslySetInnerHTML={{ __html: cfg.promotion_intro_html || "（请在此输入推广介绍）" }}
              />
            </div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">入群须知</span>
          <div className="xm-content">
            <div className="gm-editor">
              {renderToolbar("notice_html")}
              <div
                className="gm-body gm-body-text"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => set("notice_html", (e.target as HTMLDivElement).innerHTML)}
                dangerouslySetInnerHTML={{ __html: cfg.notice_html || "（请在此输入入群须知）" }}
              />
            </div>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">入群协议</span>
          <div className="xm-content">
            <div className="gm-editor">
              {renderToolbar("agreement_html")}
              <div
                className="gm-body gm-body-text"
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => set("agreement_html", (e.target as HTMLDivElement).innerHTML)}
                dangerouslySetInnerHTML={{ __html: cfg.agreement_html || "（请在此输入入群协议）" }}
              />
            </div>
          </div>
        </div>

        <div className="xm-actions">
          <button className="xm-submit" onClick={submit}>确定提交</button>
        </div>
      </div>

      {hotOpen && (
        <>
          <div className="tlc-mask" onClick={() => setHotOpen(false)} />
          <div className="tlc-panel gp-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button className="tlc-x" type="button" onClick={() => setHotOpen(false)} aria-label="关闭"><X size={18} /></button>
                <span className="tlc-panel-title">添加热门区域</span>
              </div>
              <div className="gp-head-actions">
                <button type="button" className="finord-btn gp-cancel" onClick={() => setHotOpen(false)}>取消</button>
                <button type="button" className="finord-btn finord-btn-primary" onClick={addHot}>确定提交</button>
              </div>
            </div>
            <div className="tlc-panel-body">
              <div className="gp-row">
                <div className="gp-row-top">
                  <span className="gp-label">＊可选择任意省级或以下区域</span>
                  <span className="gp-info-inline">请输入关键词筛选或从下方列表选择</span>
                </div>
                <div className="gp-content">
                  <input
                    className="gp-input"
                    value={draftKeyword}
                    onChange={(e) => setDraftKeyword(e.target.value)}
                    placeholder="输入区域关键字"
                  />
                </div>
              </div>
              <div className="gp-row">
                <div className="gp-row-top">
                  <span className="gp-label">＊热门区域</span>
                </div>
                <div className="gp-content">
                  <select
                    className="gp-select gp-select-wide"
                    value={draftRegion}
                    onChange={(e) => setDraftRegion(e.target.value)}
                  >
                    <option value="">请选择</option>
                    {REGION_OPTIONS
                      .filter((r) => (draftKeyword ? r.includes(draftKeyword) : true))
                      .map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
