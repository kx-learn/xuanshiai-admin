"use client";

import { useState } from "react";
import { X, Plus, Image as ImageIcon, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Quote, List, ListOrdered, Link2, Smile, Code, Heading1, Heading2, RotateCcw, RotateCw, Maximize2, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("商家联盟", "商家管理");

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

const columns = ["ID", "商家名称", "分类", "管理账号", "创建时间", "商品统计", "销售额统计", "核销员工", "展示", "链接/二维码", "操作"];

export default function MerchantManagementPage() {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>您在这里可以添加、管理全部的合作商家，掌握商品、订单、销售数据情况</p>
          </div>
        </div>
      </div>

      <div className="finord-card mm-card">
        <div className="mm-head">
          <h2 className="mm-title">商家管理</h2>
          <button className="finord-btn finord-btn-primary" onClick={() => setAddOpen(true)}>＋ 添加商家</button>
        </div>

        <div className="mm-filters">
          <select className="mm-select"><option>按商家分类</option></select>
          <input className="mm-input" placeholder="按商家名称" />
          <button className="finord-btn finord-btn-primary mm-search-btn">搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table mm-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="mm-empty">
                  <div className="mm-empty-inner">
                    <div className="mm-empty-icon">📦</div>
                    <div className="mm-empty-text">暂无数据</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && <AddMerchantDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddMerchantDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel mm-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加/编辑商家</span>
          </div>
          <div className="mm-head-actions">
            <button className="finord-btn mm-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 商家名称 */}
          <div className="mm-row">
            <span className="mm-label">＊商家名称</span>
            <input className="mm-input-wide" placeholder="请输入商家名称" />
          </div>

          {/* 商家封面 */}
          <div className="mm-row">
            <span className="mm-label">＊商家封面</span>
            <div className="mm-pick"><Plus size={18} /><span>+300*300</span></div>
          </div>

          {/* 商家相册 */}
          <div className="mm-row">
            <span className="mm-label">商家相册</span>
            <button className="mm-pick-btn"><ImageIcon size={14} /> 图片上传/管理（支持移动排序、删除）</button>
          </div>

          {/* 管理账号 */}
          <div className="mm-row">
            <span className="mm-label">＊管理账号</span>
            <div className="mm-content">
              <input className="mm-input-wide" placeholder="输入昵称关键词" />
              <div className="mm-info">① 必须拥有推广红娘身份，一个推广红娘只能绑定一个商家管理账号</div>
            </div>
          </div>

          {/* 商家分类 */}
          <div className="mm-row">
            <span className="mm-label">＊商家分类</span>
            <select className="mm-select-wide"><option>请选择商家分类</option></select>
          </div>

          {/* 特色标签 */}
          <div className="mm-row">
            <span className="mm-label">特色标签</span>
            <button className="mm-add-tag"><Plus size={12} /> 添加标签</button>
          </div>

          {/* 商家地址 */}
          <div className="mm-row">
            <span className="mm-label">＊商家地址</span>
            <div className="mm-content">
              <div className="mm-addr-row">
                <select className="mm-select mm-select-addr"><option>请选择</option></select>
                <input className="mm-input-wide" placeholder="请输入详细地址" />
              </div>
            </div>
          </div>

          {/* 联系电话 */}
          <div className="mm-row">
            <span className="mm-label">＊联系电话</span>
            <input className="mm-input-wide" placeholder="请输入联系电话" />
          </div>

          {/* 营业时间 */}
          <div className="mm-row">
            <span className="mm-label">＊营业时间</span>
            <input className="mm-input-wide" placeholder="请输入营业时间" />
          </div>

          {/* 商家介绍 */}
          <div className="mm-row mm-row-top">
            <span className="mm-label">商家介绍</span>
            <div className="mm-content">
              <div className="mm-editor">
                <div className="mm-editor-toolbar">
                  {TOOLBAR.map((it, idx) => (
                    <button key={idx} type="button" className="mm-editor-tool" title={it.title}>{it.icon}</button>
                  ))}
                </div>
                <div className="mm-editor-body" contentEditable suppressContentEditableWarning>
                  <p className="mm-editor-placeholder">请输入正文</p>
                </div>
              </div>
              <div className="mm-info">本内容显示在支付完成入群费后弹出的页面</div>
            </div>
          </div>

          {/* 显示排序 */}
          <div className="mm-row mm-row-top">
            <span className="mm-label">显示排序</span>
            <div className="mm-content">
              <input className="mm-input-num" />
              <div className="mm-info">数字越大显示越靠前</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}