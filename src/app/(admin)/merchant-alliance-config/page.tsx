"use client";

import { useEffect, useState } from "react";
import { ArrowUp, ArrowDown, Trash2, ImagePlus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type MerchantCategoryItem } from "@/lib/admin-endpoints";
import { pickAndUploadImage, showConfigToast, useConfigDomain } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("商家联盟", "功能配置");

const DEFAULT_NOTICE = `成功购买后请凭消费券号至消费二维码前往商家消费
您的短信中将收到券号，可在"订单-中查看订单和二维码
消费过程中若遇到使用问题请及时联系我们介入沟通`;

type BannerItem = { id: number; url: string };
type MerchantConfig = {
  title: string;
  description: string;
  share_cover_mode: string;
  share_cover_url: string | null;
  banner_url: string | null;
  banners: BannerItem[];
  notice: string;
  view_url: string;
};

const DEFAULTS: MerchantConfig = {
  title: "优选合作商城",
  description: "精选同城优质服务定制产品套餐，为您的约会提供愉快的消费",
  share_cover_mode: "default",
  share_cover_url: null,
  banner_url: null,
  banners: [],
  notice: DEFAULT_NOTICE,
  view_url: "https://www.xuanshi.com/subpages/hezuo/index",
};

export default function MerchantAllianceConfigPage() {
  const { snapshot, save } = useConfigDomain<MerchantConfig>("tools_merchant_alliance", DEFAULTS);
  const [shareCoverUrl, setShareCoverUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [title, setTitle] = useState(DEFAULTS.title);
  const [description, setDescription] = useState(DEFAULTS.description);
  const [notice, setNotice] = useState(DEFAULT_NOTICE);
  const [categories, setCategories] = useState<MerchantCategoryItem[]>([]);

  useEffect(() => {
    if (snapshot) {
      const cfg = snapshot.config;
      setTitle(cfg.title ?? DEFAULTS.title);
      setDescription(cfg.description ?? DEFAULTS.description);
      setNotice(cfg.notice ?? DEFAULT_NOTICE);
      setShareCoverUrl(cfg.share_cover_url ?? null);
      setBannerUrl(cfg.banner_url ?? null);
      setBanners(cfg.banners ?? []);
    }
  }, [snapshot]);

  const loadCategories = () => {
    adminEndpoints.merchantCategoryList().then(setCategories).catch(() => undefined);
  };
  useEffect(loadCategories, []);

  const shareCover = shareCoverUrl ? "自定义 (300*300)" : "系统默认";

  const moveBanner = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= banners.length) return;
    setBanners((arr) => {
      const next = [...arr];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };
  const removeBanner = (id: number) => setBanners((arr) => arr.filter((b) => b.id !== id));

  const moveCategory = async (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= categories.length) return;
    const next = [...categories];
    [next[idx], next[j]] = [next[j], next[idx]];
    setCategories(next);
    try {
      await adminEndpoints.reorderMerchantCategories(next.map((c) => c.id));
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "排序失败", "error");
    }
  };
  const removeCategory = async (id: number) => {
    try {
      await adminEndpoints.deleteMerchantCategory(id);
      setCategories((arr) => arr.filter((c) => c.id !== id));
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };
  const addCategory = async () => {
    const name = window.prompt("请输入商家分类名称");
    if (!name) return;
    try {
      await adminEndpoints.createMerchantCategory({ name, sort: categories.length + 1, status: 1 });
      loadCategories();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "新增失败", "error");
    }
  };

  const submit = async () => {
    const ok = await save(
      {
        title,
        description,
        notice,
        share_cover_mode: shareCoverUrl ? "custom" : "default",
        share_cover_url: shareCoverUrl,
        banner_url: bannerUrl,
        banners,
      },
      "商家联盟功能配置更新",
    );
    showConfigToast(ok ? "保存成功" : "内容无变化", ok ? "ok" : "error");
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card mac-card">
        <h2 className="mac-title">功能配置</h2>

        {/* 栏目浏览 */}
        <div className="mac-row">
          <span className="mac-label">栏目浏览</span>
          <div className="mac-content">
            <span className="mac-text-muted">网址路径：</span>
            <span className="mac-url">{snapshot?.config.view_url || DEFAULTS.view_url}</span>
            <span className="mac-text-muted" style={{ marginLeft: 24 }}>二维码：</span>
            <a className="finord-link">查看</a>
            <span className="mac-text-muted" style={{ marginLeft: 16 }}>在线预览：</span>
            <a className="finord-link" href={snapshot?.config.view_url || DEFAULTS.view_url} target="_blank" rel="noreferrer">点击这里</a>
          </div>
        </div>

        {/* 栏目标题 */}
        <div className="mac-row">
          <span className="mac-label">栏目标题</span>
          <input className="mac-input mac-input-wide" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        {/* 栏目描述 */}
        <div className="mac-row">
          <span className="mac-label">栏目描述</span>
          <input className="mac-input mac-input-wide" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        {/* 分享封面 */}
        <div className="mac-row">
          <span className="mac-label">分享封面</span>
          <div className="mac-options">
            {["系统默认", "自定义 (300*300)"].map((o) => (
              <label key={o} className={`mac-radio ${shareCover === o ? "active" : ""}`}>
                <input
                  type="radio"
                  name="shareCover"
                  value={o}
                  checked={shareCover === o}
                  onChange={() => setShareCoverUrl(o === "系统默认" ? null : shareCoverUrl || "")}
                />
                <span>{o}</span>
              </label>
            ))}
            {shareCover !== "系统默认" && (
              <label className="finord-link" style={{ cursor: "pointer", marginLeft: 12 }}>
                上传正方形封面
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => pickAndUploadImage(e.target.files?.[0], setShareCoverUrl, (m) => showConfigToast(m, "error"))}
                />
              </label>
            )}
          </div>
        </div>

        {/* 宣传头图 */}
        <div className="mac-row">
          <span className="mac-label">宣传头图</span>
          <div className="mac-content">
            <div className="mac-banner-row">
              <label className="mac-upload-pill">
                <ImagePlus size={14} /> 上传
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    pickAndUploadImage(
                      e.target.files?.[0],
                      (url) => setBanners((arr) => [...arr, { id: Date.now(), url }]),
                      (m) => showConfigToast(m, "error"),
                    )
                  }
                />
              </label>
              <span className="mac-info">最佳尺寸：700像素x240像素</span>
            </div>
          </div>
        </div>

        {/* 宣传图列表 */}
        <div className="mac-row mac-row-top">
          <span className="mac-label" />
          <div className="mac-content">
            <div className="mac-banners">
              {banners.map((b, idx) => (
                <div className="mac-banner-row mac-banner-row-list" key={b.id}>
                  <div className="mac-banner-frame">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={b.url} alt="宣传图" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                  </div>
                  <div className="mac-banner-actions">
                    {idx > 0 && (
                      <button type="button" className="mac-banner-btn" onClick={() => moveBanner(idx, -1)}>
                        <ArrowUp size={12} /> 上移
                      </button>
                    )}
                    {idx === 0 && (
                      <button type="button" className="mac-banner-btn" onClick={() => moveBanner(idx, 1)}>
                        <ArrowDown size={12} /> 下移
                      </button>
                    )}
                    {idx > 0 && (
                      <button type="button" className="mac-banner-btn" onClick={() => moveBanner(idx, 1)}>
                        <ArrowDown size={12} /> 下移
                      </button>
                    )}
                    {idx === 0 && (
                      <span className="mac-banner-btn-spacer" />
                    )}
                    <button type="button" className="mac-banner-btn" onClick={() => removeBanner(b.id)}>
                      <Trash2 size={12} /> 删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 商家分类 */}
        <div className="mac-row mac-row-top">
          <span className="mac-label">商家分类</span>
          <div className="mac-content">
            <div className="mac-cats">
              {categories.map((c, idx) => (
                <div className="mac-cat-row" key={c.id}>
                  <div className="mac-cat-input">{c.name}</div>
                  <div className="mac-cat-icons">
                    <button type="button" className="mac-icon-btn"><ImagePlus size={14} /> 上传图标</button>
                    <button
                      type="button"
                      className="mac-icon-btn"
                      disabled={idx === 0}
                      onClick={() => moveCategory(idx, -1)}
                    >
                      <ArrowUp size={12} /> 上移
                    </button>
                    <button
                      type="button"
                      className="mac-icon-btn"
                      disabled={idx === categories.length - 1}
                      onClick={() => moveCategory(idx, 1)}
                    >
                      <ArrowDown size={12} /> 下移
                    </button>
                    <button type="button" className="mac-icon-btn" onClick={() => removeCategory(c.id)}>
                      <Trash2 size={12} /> 删除
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" className="mac-add-cat" onClick={addCategory}>＋ 增加分类</button>
            </div>
          </div>
        </div>

        {/* 购买须知 */}
        <div className="mac-row mac-row-top">
          <span className="mac-label">购买须知（默认）</span>
          <textarea className="mac-notice" value={notice} onChange={(e) => setNotice(e.target.value)} />
        </div>

        <div className="mac-submit-row">
          <button className="finord-btn finord-btn-primary mac-submit" onClick={submit}>确定提交</button>
        </div>
      </div>
    </div>
  );
}
