"use client";

import { useState } from "react";
import { ArrowUp, ArrowDown, Trash2, ImagePlus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("商家联盟", "功能配置");

const BANNERS = [
  { id: 1, movable: "down" },
  { id: 2, movable: "both" },
  { id: 3, movable: "both" },
  { id: 4, movable: "both" },
  { id: 5, movable: "up" },
];

const CATEGORIES = [
  { id: 1, name: "推荐餐饮", movable: "down" },
  { id: 2, name: "新奇体验", movable: "both" },
  { id: 3, name: "休闲娱乐", movable: "both" },
  { id: 4, name: "生活服务", movable: "both" },
  { id: 5, name: "结婚", movable: "up" },
];

const DEFAULT_NOTICE = `成功购买后请凭消费券号至消费二维码前往商家消费
您的短信中将收到券号，可在"订单-中查看订单和二维码
消费过程中若遇到使用问题请及时联系我们介入沟通`;

export default function MerchantAllianceConfigPage() {
  const [shareCover, setShareCover] = useState("系统默认");
  const [banners, setBanners] = useState(BANNERS);
  const [categories, setCategories] = useState(CATEGORIES);

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

  const moveCategory = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= categories.length) return;
    setCategories((arr) => {
      const next = [...arr];
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };
  const removeCategory = (id: number) => setCategories((arr) => arr.filter((c) => c.id !== id));

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
            <span className="mac-url">https://www.xuanshi.com/subpages/hezuo/index</span>
            <span className="mac-text-muted" style={{ marginLeft: 24 }}>二维码：</span>
            <a className="finord-link">查看</a>
            <span className="mac-text-muted" style={{ marginLeft: 16 }}>在线预览：</span>
            <a className="finord-link">点击这里</a>
          </div>
        </div>

        {/* 栏目标题 */}
        <div className="mac-row">
          <span className="mac-label">栏目标题</span>
          <input className="mac-input mac-input-wide" defaultValue="优选合作商城" />
        </div>

        {/* 栏目描述 */}
        <div className="mac-row">
          <span className="mac-label">栏目描述</span>
          <input className="mac-input mac-input-wide" defaultValue="精选同城优质服务定制产品套餐，为您的约会提供愉快的消费" />
        </div>

        {/* 分享封面 */}
        <div className="mac-row">
          <span className="mac-label">分享封面</span>
          <div className="mac-options">
            {["系统默认", "自定义 (300*300)"].map((o) => (
              <label key={o} className={`mac-radio ${shareCover === o ? "active" : ""}`}>
                <input type="radio" name="shareCover" value={o} checked={shareCover === o} onChange={() => setShareCover(o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 宣传头图 */}
        <div className="mac-row">
          <span className="mac-label">宣传头图</span>
          <div className="mac-content">
            <div className="mac-banner-row">
              <button type="button" className="mac-upload-pill"><ImagePlus size={14} /> 上传</button>
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
                  <div className="mac-banner-frame" />
                  <div className="mac-banner-actions">
                    {idx > 0 && (
                      <button type="button" className="mac-banner-btn" onClick={() => moveBanner(idx, -1)}>
                        <ArrowUp size={12} /> 下移
                      </button>
                    )}
                    {idx === 0 && (
                      <button type="button" className="mac-banner-btn" onClick={() => moveBanner(idx, 1)}>
                        <ArrowDown size={12} /> 下移
                      </button>
                    )}
                    {idx === banners.length - 1 && idx > 0 && idx < banners.length - 1 ? null : null}
                    {idx > 0 && idx < banners.length - 1 && (
                      <button type="button" className="mac-banner-btn">
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
              <button type="button" className="mac-add-cat">＋ 增加分类</button>
            </div>
          </div>
        </div>

        {/* 购买须知 */}
        <div className="mac-row mac-row-top">
          <span className="mac-label">购买须知（默认）</span>
          <textarea className="mac-notice" defaultValue={DEFAULT_NOTICE} />
        </div>

        <div className="mac-submit-row">
          <button className="finord-btn finord-btn-primary mac-submit">确定提交</button>
        </div>
      </div>
    </div>
  );
}