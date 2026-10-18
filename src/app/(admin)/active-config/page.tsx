"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { pickAndUploadImage, showConfigToast, useConfigDomain } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("活动报名", "参数配置");

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

/** 页内轻量输入弹窗（替代 window.prompt） */
function NameDialog({
  title,
  placeholder,
  initial,
  confirmText = "确定",
  onCancel,
  onConfirm,
}: {
  title: string;
  placeholder: string;
  initial: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: (value: string) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <div className="tlc-mask" style={{ zIndex: 1300 }} onClick={onCancel} />
      <div
        role="dialog"
        aria-label={title}
        style={{
          position: "fixed",
          top: "28%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1301,
          width: 400,
          maxWidth: "92vw",
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 10px 34px rgba(0,0,0,.18)",
          padding: "20px 22px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: "#333" }}>{title}</span>
          <button type="button" className="tlc-x" onClick={onCancel} aria-label="关闭"><X size={16} /></button>
        </div>
        <input
          autoFocus
          className="ac-input ac-input-wide"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirm(value.trim());
            if (e.key === "Escape") onCancel();
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
          <button type="button" className="finord-btn finord-btn-outline" onClick={onCancel}>取消</button>
          <button type="button" className="finord-btn finord-btn-primary" onClick={() => onConfirm(value.trim())}>{confirmText}</button>
        </div>
      </div>
    </>
  );
}

/**
 * 协议编辑区：非受控，仅在外层重置键变化时用 dangerouslySetInnerHTML 重建，
 * 输入过程中 React 不会回写 innerHTML（否则每敲一个字光标就跳）。
 */
const AgreementEditor = memo(function AgreementEditor({
  html,
  onReady,
}: {
  html: string;
  onReady: (el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    onReady(ref.current);
  }, [onReady]);
  return (
    <div
      id="ac-agreement"
      ref={ref}
      className="ac-editor-body"
      contentEditable
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

export default function ActiveConfigPage() {
  const { snapshot, ready, saving, save } = useConfigDomain<ActivityConfig>("tools_active", DEFAULTS);
  const [categories, setCategories] = useState<string[]>(CATEGORIES);
  const [columnName, setColumnName] = useState("同城活动");
  const [imageWide, setImageWide] = useState<string | null>(null);
  const [imageSquare, setImageSquare] = useState<string | null>(null);
  const [renameIndex, setRenameIndex] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const agreementRef = useRef<HTMLDivElement | null>(null);
  const setAgreementRef = useCallback((el: HTMLDivElement | null) => {
    agreementRef.current = el;
  }, []);

  useEffect(() => {
    if (!snapshot) return;
    const cfg = snapshot.config;
    setCategories(cfg.categories?.length ? cfg.categories : CATEGORIES);
    setColumnName(cfg.column_name ?? "同城活动");
    setImageWide(cfg.default_image_wide ?? null);
    setImageSquare(cfg.default_image_square ?? null);
  }, [snapshot]);

  // 编辑器只在服务端快照变化时重置，避免受控 innerHTML 在输入时重置光标
  const initialAgreement = snapshot?.config.agreement_html || DEFAULTS.agreement_html;
  const editorKey = `agreement-${snapshot?.version ?? 0}`;

  const removeCategory = (name: string) => setCategories((arr) => arr.filter((c) => c !== name));

  const addCategory = (name: string) => {
    if (!name) return;
    if (categories.includes(name)) {
      showConfigToast("分类名称已存在", "error");
      return;
    }
    setCategories((arr) => [...arr, name]);
    setAddOpen(false);
  };

  const renameCategory = (name: string) => {
    if (renameIndex === null) return;
    if (!name) return;
    if (name !== categories[renameIndex] && categories.includes(name)) {
      showConfigToast("分类名称已存在", "error");
      return;
    }
    setCategories((arr) => arr.map((c, i) => (i === renameIndex ? name : c)));
    setRenameIndex(null);
  };

  const moveCategory = (from: number, to: number) => {
    setCategories((arr) => {
      if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
      const next = [...arr];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const submit = async () => {
    const el = agreementRef.current;
    const html = el ? el.innerHTML : initialAgreement;
    // 服务端存空串时页面展示的是默认文案；未编辑时按「未改动」提交，避免误判为有变化
    const storedAgreement = snapshot?.config.agreement_html ?? "";
    const agreementForSave = html === initialAgreement ? storedAgreement : html;
    const ok = await save(
      { categories, column_name: columnName, default_image_wide: imageWide, default_image_square: imageSquare, agreement_html: agreementForSave },
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
          {categories.map((c, index) => (
            <span
              className="ac-tag"
              key={`${c}-${index}`}
              draggable
              onDragStart={(e) => {
                dragIndexRef.current = index;
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(index));
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOver !== index) setDragOver(index);
              }}
              onDragLeave={() => setDragOver((cur) => (cur === index ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                const raw = dragIndexRef.current ?? Number(e.dataTransfer.getData("text/plain"));
                if (Number.isFinite(raw)) moveCategory(raw, index);
                dragIndexRef.current = null;
                setDragOver(null);
              }}
              onDragEnd={() => {
                dragIndexRef.current = null;
                setDragOver(null);
              }}
              style={dragOver === index ? { outline: "2px dashed #3658f7", outlineOffset: 2 } : undefined}
            >
              {c}
              <span className="ac-tag-icons">
                <button
                  type="button"
                  className="ac-tag-icon"
                  aria-label="编辑"
                  title="重命名分类"
                  style={{ border: "none", background: "none", padding: 0, lineHeight: 1 }}
                  onClick={() => setRenameIndex(index)}
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="ac-tag-icon"
                  aria-label="删除"
                  style={{ border: "none", background: "none", padding: 0, lineHeight: 1 }}
                  onClick={() => removeCategory(c)}
                >
                  ×
                </button>
                <span className="ac-tag-icon ac-tag-handle" aria-label="拖动排序" title="拖动排序">⋮⋮</span>
              </span>
            </span>
          ))}
          <button type="button" className="ac-add-tag" onClick={() => setAddOpen(true)}>＋ 添加分类</button>
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
              <div className="ac-editor-toolbar"><span className="ac-editor-tool-hint">支持纯文本编辑</span></div>
              <AgreementEditor key={editorKey} html={initialAgreement} onReady={setAgreementRef} />
            </div>
          </div>
        </div>

        <div className="ac-submit-row">
          <button className="finord-btn finord-btn-primary ac-submit" disabled={!ready || saving} onClick={submit}>
            {saving ? "保存中…" : "确定提交"}
          </button>
        </div>
      </div>

      {addOpen && (
        <NameDialog
          title="添加分类"
          placeholder="请输入活动分类名称"
          initial=""
          onCancel={() => setAddOpen(false)}
          onConfirm={addCategory}
        />
      )}

      {renameIndex !== null && (
        <NameDialog
          title="重命名分类"
          placeholder="请输入活动分类名称"
          initial={categories[renameIndex] ?? ""}
          onCancel={() => setRenameIndex(null)}
          onConfirm={renameCategory}
        />
      )}
    </div>
  );
}
