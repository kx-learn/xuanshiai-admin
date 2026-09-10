"use client";

import { useState } from "react";
import { X, Plus, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Quote, List, ListOrdered, Link2, Image as ImageIcon, Smile, Code, Heading1, Heading2, RotateCcw, RotateCw, Maximize2, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

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

export default function ActiveConfigPage() {
  const [categories, setCategories] = useState(CATEGORIES);
  const removeCategory = (name: string) => setCategories((arr) => arr.filter((c) => c !== name));

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
          <button type="button" className="ac-add-tag">＋ 添加分类</button>
        </div>
      </div>

      {/* 卡片 2：参数配置 */}
      <div className="finord-card ac-card">
        <h2 className="ac-title">参数配置</h2>

        {/* 自定义栏目名称 */}
        <div className="ac-row">
          <span className="ac-label">自定义栏目名称</span>
          <input className="ac-input ac-input-wide" defaultValue="同城活动" />
        </div>

        {/* 自定义默认图一 */}
        <div className="ac-row ac-row-top">
          <span className="ac-label">自定义默认图一</span>
          <div className="ac-content">
            <div className="ac-pick ac-pick-wide">
              <Plus size={18} /><span>上传图片</span>
            </div>
            <div className="ac-info">① 最佳尺寸：900×383（与公众号首图一致）</div>
          </div>
        </div>

        {/* 自定义默认图二 */}
        <div className="ac-row ac-row-top">
          <span className="ac-label">自定义默认图二</span>
          <div className="ac-content">
            <div className="ac-pick ac-pick-square">
              <Plus size={18} /><span>上传图片</span>
            </div>
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
              <div className="ac-editor-body" contentEditable suppressContentEditableWarning>
                <p className="ac-editor-content">线下活动规则</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ac-submit-row">
          <button className="finord-btn finord-btn-primary ac-submit">确定提交</button>
        </div>
      </div>
    </div>
  );
}