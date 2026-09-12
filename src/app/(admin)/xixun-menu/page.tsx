"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { pickAndUploadImage, showConfigToast, useConfigDomain } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "喜讯栏目");

type CategoryRow = {
  label: string;
  value: string;
  icon_url: string | null;
  can_down: boolean;
  sort_order: number;
};

type XixunMenuConfig = {
  title: string;
  description: string;
  share_cover_mode: "system" | "custom";
  share_cover_url: string | null;
  banner_url: string | null;
  view_url: string;
  categories: CategoryRow[];
  blessings: string[];
};

const FALLBACK_CATEGORIES: CategoryRow[] = [
  { label: "牵手成功", value: "牵手成功", icon_url: null, can_down: true, sort_order: 100 },
  { label: "恋爱生活", value: "恋爱生活", icon_url: null, can_down: true, sort_order: 90 },
  { label: "已见父母", value: "已见父母", icon_url: null, can_down: true, sort_order: 80 },
  { label: "已订婚", value: "已订婚", icon_url: null, can_down: true, sort_order: 70 },
  { label: "已领证", value: "已领证", icon_url: null, can_down: true, sort_order: 60 },
  { label: "已办婚礼", value: "已办婚礼", icon_url: null, can_down: true, sort_order: 50 },
  { label: "婚后生活", value: "婚后生活", icon_url: null, can_down: true, sort_order: 40 },
  { label: "锦旗飘飘", value: "锦旗飘飘", icon_url: null, can_down: false, sort_order: 30 },
];

const FALLBACK_BLESSINGS: string[] = [
  "恭喜这位孤寡青蛙成功上岸！从此下雨有人撑伞，吃火锅有人递纸。愿你们往后的日子，眼里有光，心里有爱，身边有彼此。",
  "终于有人把你这个人间宝藏捡回家啦！祝你们在平淡生活里，也能把日子过成糖。",
];

const DEFAULTS: XixunMenuConfig = {
  title: "脱单喜讯",
  description: "脱单喜讯",
  share_cover_mode: "custom",
  share_cover_url: null,
  banner_url: null,
  view_url: "https://www.xuanshiai.com/subpages/xixun/index",
  categories: FALLBACK_CATEGORIES,
  blessings: FALLBACK_BLESSINGS,
};

function normalizeCategories(raw: unknown): CategoryRow[] {
  if (!Array.isArray(raw) || raw.length === 0) return FALLBACK_CATEGORIES;
  return raw.map((item, i) => {
    if (typeof item === "string") {
      return {
        label: item,
        value: item,
        icon_url: null,
        can_down: i < 7,
        sort_order: 100 - i * 10,
      };
    }
    const obj = item as Partial<CategoryRow>;
    return {
      label: obj.label ?? String(obj.value ?? ""),
      value: obj.value ?? obj.label ?? "",
      icon_url: obj.icon_url ?? null,
      can_down: obj.can_down ?? true,
      sort_order: obj.sort_order ?? 0,
    };
  });
}

export default function XixunMenuPage() {
  const { snapshot, save } = useConfigDomain<XixunMenuConfig>("tools_good_news", DEFAULTS);
  const [cfg, setCfg] = useState<XixunMenuConfig>(DEFAULTS);

  useEffect(() => {
    if (!snapshot) return;
    const data = snapshot.config;
    setCfg({
      ...DEFAULTS,
      ...data,
      categories: normalizeCategories(data.categories),
      blessings: Array.isArray(data.blessings) ? data.blessings : FALLBACK_BLESSINGS,
    });
  }, [snapshot]);

  const set = <K extends keyof XixunMenuConfig>(key: K, value: XixunMenuConfig[K]) =>
    setCfg((cur) => ({ ...cur, [key]: value }));

  const setCategory = (i: number, patch: Partial<CategoryRow>) =>
    setCfg((cur) => ({
      ...cur,
      categories: cur.categories.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));

  const addBlessing = () =>
    setCfg((cur) => ({ ...cur, blessings: [...cur.blessings, ""] }));

  const updateBlessing = (i: number, text: string) =>
    setCfg((cur) => ({
      ...cur,
      blessings: cur.blessings.map((b, idx) => (idx === i ? text : b)),
    }));

  const removeBlessing = (i: number) =>
    setCfg((cur) => ({
      ...cur,
      blessings: cur.blessings.length > 1
        ? cur.blessings.filter((_, idx) => idx !== i)
        : cur.blessings,
    }));

  const moveCategory = (i: number, dir: -1 | 1) => {
    setCfg((cur) => {
      const next = [...cur.categories];
      const j = i + dir;
      if (j < 0 || j >= next.length) return cur;
      if (!next[j].can_down && dir === 1) return cur;
      [next[i], next[j]] = [next[j], next[i]];
      return { ...cur, categories: next };
    });
  };

  const submit = async () => {
    const payload = {
      ...cfg,
      blessings: cfg.blessings.filter((b) => b.trim()),
      categories: cfg.categories.filter((c) => c.label.trim() && c.value.trim()),
    };
    const ok = await save(payload, "红娘喜讯栏目配置更新");
    showConfigToast(ok ? "保存成功" : "内容无变化", ok ? "ok" : "error");
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>红娘喜讯栏目是给婚介机构搭建一个基于&ldquo;用户反馈&rdquo;的成功案例&ldquo;展示平台。致力于解决客户对&ldquo;婚介不信任&rdquo;的社会难题，帮助其提升信任度、口碑、品牌形象</p>
            <p>并创新性的设置了&ldquo;线上送锦旗&rdquo;功能。让客户能够快捷方便、不花1分钱就可以给婚介或红娘赠送锦旗，平台上设有专门的&ldquo;锦旗墙&rdquo;栏目来集中展示这些锦旗。同时也可以将这些锦旗自行制作为实物悬挂于门店中或任何行业。我们始终坚信：客户的认可才是最佳的销售利器</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="xm-title">栏目设置</div>

        <div className="xm-row">
          <span className="xm-label">栏目浏览</span>
          <div className="xm-content">
            <span className="xm-inline">网址路径:</span>
            <span className="xm-link">{cfg.view_url || "未配置"}</span>
            <span className="xm-inline">二维码:</span>
            <a className="xm-blue" href="#" onClick={(e) => e.preventDefault()}>查看</a>
            <span className="xm-inline">在线预览:</span>
            <a className="xm-blue" href={cfg.view_url || "#"} target="_blank" rel="noreferrer">点击这里</a>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">栏目标题</span>
          <input className="xm-input" value={cfg.title} onChange={(e) => set("title", e.target.value)} />
        </div>

        <div className="xm-row">
          <span className="xm-label">栏目描述</span>
          <input className="xm-input" value={cfg.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="xm-row">
          <span className="xm-label">分享封面</span>
          <div className="xm-content">
            <div className="xm-radios">
              {(["system", "custom"] as const).map((v) => (
                <label className="xm-radio" key={v}>
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
              <div className="xm-cover">
                <div className="xm-cover-img">
                  {cfg.share_cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cfg.share_cover_url} alt="封面" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span className="xm-cover-name">{cfg.title}</span>
                  )}
                  <label className="xm-cover-upload" style={{ cursor: "pointer" }}>
                    {cfg.share_cover_url ? "更换" : "上传图片"}
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
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">宣传头图</span>
          <div className="xm-content xm-upload-row">
            <label
              className="xm-upload-btn"
              style={{ cursor: "pointer" }}
            >
              上传
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
              <img src={cfg.banner_url} alt="宣传头图" style={{ maxHeight: 60, marginLeft: 8 }} />
            )}
            <span className="xm-muted">最佳尺寸: 698像素x240像素</span>
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">喜讯分类</span>
          <div className="xm-content xm-cats">
            {cfg.categories.map((c, i) => (
              <div className="xm-cat" key={`${c.label}-${i}`}>
                <span className="xm-cat-label">{c.label}:</span>
                <input
                  className="xm-cat-input"
                  value={c.value}
                  onChange={(e) => setCategory(i, { value: e.target.value })}
                />
                <label className="xm-cat-icon" style={{ cursor: "pointer" }}>
                  👤 更换图标
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) =>
                      pickAndUploadImage(
                        e.target.files?.[0],
                        (url) => setCategory(i, { icon_url: url }),
                        (m) => showConfigToast(m, "error"),
                      )
                    }
                  />
                </label>
                <span className="xm-cat-moves">
                  {i > 0 && (
                    <button type="button" className="xm-cat-move up" onClick={() => moveCategory(i, -1)}>↑ 上移</button>
                  )}
                  {i < cfg.categories.length - 1 && cfg.categories[i + 1].can_down && (
                    <button type="button" className="xm-cat-move down" onClick={() => moveCategory(i, 1)}>↓ 下移</button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="xm-row">
          <span className="xm-label">祝福语管理</span>
          <div className="xm-content xm-bless">
            <button type="button" className="xm-add-btn" onClick={addBlessing}>＋ 添加</button>
            {cfg.blessings.map((b, i) => (
              <div className="xm-bless-item" key={i}>
                <textarea
                  className="xm-bless-text"
                  rows={2}
                  value={b}
                  onChange={(e) => updateBlessing(i, e.target.value)}
                  style={{ width: "100%" }}
                />
                <button type="button" className="xm-bless-del" onClick={() => removeBlessing(i)}>🗑 删除</button>
              </div>
            ))}
          </div>
        </div>

        <div className="xm-actions">
          <button className="xm-submit" onClick={submit}>确定提交</button>
        </div>
      </div>
    </div>
  );
}
