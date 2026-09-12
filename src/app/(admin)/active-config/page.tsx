"use client";

import { useEffect, useState } from "react";
import { Plus, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Quote, List, ListOrdered, Link2, Image as ImageIcon, Smile, Code, Heading1, Heading2, RotateCcw, RotateCw, Maximize2, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { pickAndUploadImage, showConfigToast, useConfigDomain } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("活动报名", "参数配置");

const TOOLBAR: { icon: React.ReactNode; title: string }[] = [
  { icon: <Heading1 size={14} />, title: "标题" },
  { icon: <Type size={14} />, title: "正文" },
  { icon: <Bold size={14} />, title: "加粗" },
  { icon: <Italic size={14} />, title: "斜体" },
  { icon: <Underline size={14} />, title: "下划线" },
  { icon: <Strikethrough size={14} />, title: "删除线" },
  { icon: <AlignLeft size={14} />, title: "左对齐" },
  { icon: <AlignCenter size={14} />, title: "居中" },
  { icon: <AlignRight size={14} />, title: "右对齐" },
  { icon: <Quote size={14} />, title: "引用" },
  { icon: <Link2 size={14} />, title: "链接" },
  { icon: <ImageIcon size={14} />, title: "图片" },
  { icon: <Smile size={14} />, title: "表情" },
  { icon: <Code size={14} />, title: "代码" },
  { icon: <List size={14} />, title: "无序列表" },
  { icon: <ListOrdered size={14} />, title: "有序列表" },
  { icon: <Minus size={14} />, title: "分割线" },
  { icon: <RotateCcw size={14} />, title: "撤销" },
  { icon: <RotateCw size={14} />, title: "重做" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
];

const CATEGORIES = [
  "专场活动",
  "会面小聚",
  "相亲大会",
  "政企联谊",
  "免费活动",
];

type ActivityConfig = {
  categories: string[];
  column_name: string;
  default_image_wide: string | null;
  default_image_square: string | null;
  agreement_html: string;
};

const DEFAULTS: ActivityConfig = {
  categories: CATEGORIES,
  column_name: "同城活动",
  default_image_wide: null,
  default_image_square: null,
  agreement_html: "<p>线下活动规则</p>",
};

export default function ActiveConfigPage() {
  const { snapshot, ready, saving, save } = useConfigDomain<ActivityConfig>("tools_active", DEFAULTS);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [columnName, setColumnName] = useState("同城活动");
  const [imageWide, setImageWide] = useState<string | null>(null);
  const [imageSquare, setImageSquare] = useState<string | null>(null);

  useEffect(() => {
    if (!snapshot) return;
    const cfg = snapshot.config;
    setCategories(cfg.categories?.length ? cfg.categories : CATEGORIES);
    setColumnName(cfg.column_name ?? "同城活动");
    setImageWide(cfg.default_image_wide ?? null);
    setImageSquare(cfg.default_image_square ?? null);
  }, [snapshot]);

  const removeCategory = (name: string) => setCategories((arr) => arr.filter((c) => c !== name));
  const addCategory = () => {
    const name = window.prompt("请输入活动分类名称");
    if (name && !categories.includes(name)) setCategories((arr) => [...arr, name]);
  };

  const submit = async () => {
    const el = document.getElementById("ac-agreement");
    const html = el ? el.innerHTML : DEFAULTS.agreement_html;
    const ok = await save(
      { categories, column_name: columnName, default_image_wide: imageWide, default_image_square: imageSquare, agreement_html: html },
      "活动参数配置更新",
    );
    showConfigToast(ok ? "保存成功" : "内容无变化", ok ? "ok" : "error");
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 卡片 1：活动分类 */}
      <div className="finord-card ac-card">
        <h2 className="ac-title">活动分类</h2>
        <div className="ac-tags-row">
          {categories.map((c) => (
            <span className="ac-tag" key={c}>
              {c}
              <span className="ac-tag-icons">
                <span className="ac-tag-icon" aria-label="编辑">✎</span>
                <span className="ac-tag-icon" aria-label="删除" onClick={() => removeCategory(c)}>×</span>
                <span className="ac-tag-icon" aria-label="拖动">⋮⋮</span>
              </span>
            </span>
          ))}
          <button type="button" className="ac-add-tag" onClick={addCategory}>＋ 添加分类</button>
        </div>
      </div>

      {/* 卡片 2：参数配置 */}
      <div className="finord-card ac-card">
        <h2 className="ac-title">参数配置</h2>

        {/* 自定义栏目名称 */}
        <div className="ac-row">
          <span className="ac-label">自定义栏目名称</span>
          <input className="ac-input ac-input-wide" value={columnName} onChange={(e) => setColumnName(e.target.value)} />
        </div>

        {/* 自定义默认图一 */}
        <div className="ac-row ac-row-top">
          <span className="ac-label">自定义默认图一</span>
          <div className="ac-content">
            <label className="ac-pick ac-pick-wide">
              {imageWide ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageWide} alt="默认图一" style={{ maxWidth: "100%", maxHeight: "100%" }} />
              ) : (
                <><Plus size={18} /><span>上传图片</span></>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => pickAndUploadImage(e.target.files?.[0], setImageWide, (m) => showConfigToast(m, "error"))}
              />
            </label>
            <div className="ac-info">① 最佳尺寸：900×383（与公众号首图一致）</div>
          </div>
        </div>

        {/* 自定义默认图二 */}
        <div className="ac-row ac-row-top">
          <span className="ac-label">自定义默认图二</span>
          <div className="ac-content">
            <label className="ac-pick ac-pick-square">
              {imageSquare ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageSquare} alt="默认图二" style={{ maxWidth: "100%", maxHeight: "100%" }} />
              ) : (
                <><Plus size={18} /><span>上传图片</span></>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => pickAndUploadImage(e.target.files?.[0], setImageSquare, (m) => showConfigToast(m, "error"))}
              />
            </label>
            <div className="ac-info">① 最佳尺寸：300像素x300像素</div>
          </div>
        </div>

        {/* 用户协议须知 */}
        <div className="ac-row ac-row-top">
          <span className="ac-label">＊用户协议须知</span>
          <div className="ac-content">
            <div className="ac-editor">
              <div className="ac-editor-toolbar">
                {TOOLBAR.map((it, idx) => (
                  <button key={idx} type="button" className="ac-editor-tool" title={it.title}>{it.icon}</button>
                ))}
              </div>
              <div
                id="ac-agreement"
                className="ac-editor-body"
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: snapshot?.config.agreement_html || DEFAULTS.agreement_html }}
              />
            </div>
          </div>
        </div>

        <div className="ac-submit-row">
          <button className="finord-btn finord-btn-primary ac-submit" disabled={!ready || saving} onClick={submit}>
            {saving ? "保存中…" : "确定提交"}
          </button>
        </div>
      </div>
    </div>
  );
}
