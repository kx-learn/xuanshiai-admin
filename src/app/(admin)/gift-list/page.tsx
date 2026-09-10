"use client";

import { useState } from "react";
import { X, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2, Image as ImageIcon, Smile, Quote, Code, Heading1, Heading2, RotateCcw, RotateCw, Trash2, Maximize2, Plus, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "积分商城", href: "/gift-list" },
  { label: "礼品管理" },
];

const columns = ["ID", "礼品标题", "性质", "所需积分", "库存数", "操作"];

export default function GiftListPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card gl-card">
        <div className="gl-filters">
          <div className="gl-searchbox">
            <input className="gl-search-input" placeholder="请输入礼品标题关键字" />
            <button className="finord-btn finord-btn-primary gl-search-btn">搜索</button>
          </div>
        </div>

        <div className="gl-head">
          <h2 className="gl-title">礼品管理</h2>
          <button type="button" className="finord-btn finord-btn-primary" onClick={() => setAddOpen(true)}>＋ 添加礼品</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table gl-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="gl-id">1</td>
                <td><a className="finord-link">指甲刀</a></td>
                <td className="gl-type">实物快递</td>
                <td className="gl-points">100</td>
                <td className="gl-stock">97</td>
                <td>
                  <div className="gl-ops">
                    <a className="finord-link gl-op">编辑</a>
                    <span className="gl-op-sep">|</span>
                    <a className="finord-link gl-op">删除</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="gl-pager">
          <span className="gl-pager-arrow">‹</span>
          <span className="gl-pager-cur">1</span>
          <span className="gl-pager-arrow">›</span>
        </div>
      </div>

      {addOpen && <AddGiftDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

const GL_TOOLBAR: { icon: React.ReactNode; title: string }[] = [
  { icon: <Heading1 size={14} />, title: "标题" },
  { icon: <Type size={14} />, title: "正文" },
  { icon: <Bold size={14} />, title: "加粗" },
  { icon: <Italic size={14} />, title: "斜体" },
  { icon: <Underline size={14} />, title: "下划线" },
  { icon: <Strikethrough size={14} />, title: "删除线" },
  { icon: <AlignLeft size={14} />, title: "左对齐" },
  { icon: <AlignCenter size={14} />, title: "居中" },
  { icon: <AlignRight size={14} />, title: "右对齐" },
  { icon: <List size={14} />, title: "无序列表" },
  { icon: <ListOrdered size={14} />, title: "有序列表" },
  { icon: <Quote size={14} />, title: "引用" },
  { icon: <Link2 size={14} />, title: "链接" },
  { icon: <ImageIcon size={14} />, title: "图片" },
  { icon: <Smile size={14} />, title: "表情" },
  { icon: <Code size={14} />, title: "代码" },
  { icon: <Plus size={14} />, title: "更多" },
  { icon: <RotateCcw size={14} />, title: "撤销" },
  { icon: <RotateCw size={14} />, title: "重做" },
  { icon: <Minus size={14} />, title: "分割线" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
  { icon: <Trash2 size={14} />, title: "清空" },
];

function GiftEditor({ placeholder, maxChars, errText }: { placeholder: string; maxChars: number; errText: string }) {
  return (
    <div className="gl-editor">
      <div className="gl-editor-toolbar">
        {GL_TOOLBAR.map((it, idx) => (
          <button key={idx} type="button" className="gl-editor-tool" title={it.title}>{it.icon}</button>
        ))}
      </div>
      <div className="gl-editor-body" contentEditable suppressContentEditableWarning>
        <p className="gl-editor-placeholder">{placeholder}</p>
      </div>
      <div className="gl-info">① 限制{maxChars}字</div>
      <div className="gl-err">{errText}</div>
    </div>
  );
}

function AddGiftDrawer({ onClose }: { onClose: () => void }) {
  const [nature, setNature] = useState("实物快递");
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel gl-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加礼品</span>
          </div>
          <div className="gl-head-actions">
            <button className="finord-btn gl-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 标题 */}
          <div className="gl-d-row">
            <span className="gl-d-label">＊标题</span>
            <input className="gl-d-input gl-d-input-wide" />
          </div>

          {/* 图片 */}
          <div className="gl-d-row gl-d-row-top">
            <span className="gl-d-label">＊图片</span>
            <div className="gl-d-content">
              <div className="gl-d-pick"><Plus size={18} /><span>上传图片</span></div>
              <div className="gl-d-info">① 最佳尺寸：750像素×750像素</div>
            </div>
          </div>

          {/* 性质 */}
          <div className="gl-d-row">
            <span className="gl-d-label">性质</span>
            <div className="gl-d-options">
              {["实物快递", "实物自取", "虚拟物品"].map((o) => (
                <label key={o} className={`gl-d-radio ${nature === o ? "active" : ""}`}>
                  <input type="radio" name="nature" value={o} checked={nature === o} onChange={() => setNature(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 积分 */}
          <div className="gl-d-row">
            <span className="gl-d-label">＊积分</span>
            <input className="gl-d-input gl-d-input-wide" defaultValue="100" />
          </div>

          {/* 库存 */}
          <div className="gl-d-row">
            <span className="gl-d-label">＊库存</span>
            <input className="gl-d-input gl-d-input-wide" defaultValue="99" />
          </div>

          {/* 须知 */}
          <div className="gl-d-row gl-d-row-top">
            <span className="gl-d-label">＊须知</span>
            <div className="gl-d-content">
              <GiftEditor placeholder="请输入兑换须知" maxChars={200} errText="请输入兑换须知" />
            </div>
          </div>

          {/* 介绍 */}
          <div className="gl-d-row gl-d-row-top">
            <span className="gl-d-label">＊介绍</span>
            <div className="gl-d-content">
              <GiftEditor placeholder="请输入正文" maxChars={500} errText="请输入礼品介绍" />
            </div>
          </div>

          <div className="gl-d-submit-row">
            <button className="finord-btn finord-btn-primary gl-d-submit">确定提交</button>
          </div>
        </div>
      </div>
    </>
  );
}