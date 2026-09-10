"use client";

import { useState } from "react";
import { X, Plus, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Quote, List, ListOrdered, Link2, Image as ImageIcon, Smile, Code, Heading1, Heading2, RotateCcw, RotateCw, Maximize2, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("商家联盟", "商品管理");

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

const columns = ["ID", "商品名称", "商家名称", "销售价格", "添加时间", "销量统计", "上架", "链接/二维码", "操作"];

export default function MerchantProductPage() {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>您可以在这里添加、管理所有的合作销售的商品或服务</p>
          </div>
        </div>
      </div>

      <div className="finord-card mp-card">
        <div className="mp-head">
          <h2 className="mp-title">商品管理</h2>
          <button className="finord-btn finord-btn-primary" onClick={() => setAddOpen(true)}>＋ 添加商品</button>
        </div>

        <div className="mp-filters">
          <select className="mp-select"><option>所有商家</option></select>
          <input className="mp-input" placeholder="按商品名称" />
          <button className="finord-btn finord-btn-primary mp-search-btn">搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table mp-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="mp-empty">
                  <div className="mp-empty-inner">
                    <div className="mp-empty-icon">📦</div>
                    <div className="mp-empty-text">暂无数据</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && <AddProductDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddProductDrawer({ onClose }: { onClose: () => void }) {
  const [promoteMode, setPromoteMode] = useState("统一设置");
  const [partnerMode, setPartnerMode] = useState("统一设置");
  const [limitMode, setLimitMode] = useState("account");
  const [noticeMode, setNoticeMode] = useState("使用默认");

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel mp-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加/编辑商品</span>
          </div>
          <div className="mp-head-actions">
            <button className="finord-btn mp-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 合作商家 */}
          <div className="mp-row">
            <span className="mp-label">＊合作商家</span>
            <input className="mp-input-wide" placeholder="输入关键词选择" />
          </div>

          {/* 商品名称 */}
          <div className="mp-row">
            <span className="mp-label">＊商品名称</span>
            <input className="mp-input-wide" placeholder="不要超过30汉字" />
          </div>

          {/* 商品封面 */}
          <div className="mp-row">
            <span className="mp-label">＊商品封面</span>
            <div className="mp-pick"><Plus size={18} /><span>+800*800</span></div>
          </div>

          {/* 商品价格 */}
          <div className="mp-row">
            <span className="mp-label">＊商品价格</span>
            <div className="mp-price-row">
              <span className="mp-price-label">原价值</span>
              <input className="mp-input-num" />
              <span className="mp-unit">元</span>
              <span className="mp-price-label">合作优惠价</span>
              <input className="mp-input-num" />
              <span className="mp-unit">元</span>
            </div>
            <div className="mp-info">① 合作优惠价为客户下单实际支付所得价格</div>
          </div>

          {/* 商家结算 */}
          <div className="mp-row">
            <span className="mp-label">商家结算</span>
            <div className="mp-content">
              <div className="mp-range">
                <input className="mp-input-num" defaultValue="0" />
                <span className="mp-unit">元/份</span>
              </div>
              <div className="mp-info">① 订单核销成功后，平台给予商家结算的结算金额，本金额会自动计入到商家账号的"余额"中，且均有明细账务。0元表示不分成</div>
            </div>
          </div>

          {/* 推广红娘分成 */}
          <div className="mp-row">
            <span className="mp-label">推广红娘分成</span>
            <div className="mp-content">
              <div className="mp-split-row">
                {["统一设置", "按级别设置分成"].map((o) => (
                  <label key={o} className={`mp-radio ${promoteMode === o ? "active" : ""}`}>
                    <input type="radio" name="promote" value={o} checked={promoteMode === o} onChange={() => setPromoteMode(o)} />
                    <span>{o}</span>
                  </label>
                ))}
                <select className="mp-select mp-select-sm"><option>固定金额</option></select>
                <input className="mp-input-num" defaultValue="0" />
                <span className="mp-unit">元/份</span>
              </div>
              <div className="mp-info">① 订单核销成功后，平台可设置给予下单人所属于的推广红娘分成（以订单创建时归属关系为准），本金额会自动计入到红娘账号的"余额"中，且均有明细账务。0元表示不分成。特别提醒：客户仅需在平台一链接即可绑定归属关系，给予推广人订单分成，无需完善相亲会员资料</div>
            </div>
          </div>

          {/* 合伙红娘分成 */}
          <div className="mp-row">
            <span className="mp-label">合伙红娘分成</span>
            <div className="mp-content">
              <div className="mp-split-row">
                {["统一设置", "按级别设置分成"].map((o) => (
                  <label key={o} className={`mp-radio ${partnerMode === o ? "active" : ""}`}>
                    <input type="radio" name="partner" value={o} checked={partnerMode === o} onChange={() => setPartnerMode(o)} />
                    <span>{o}</span>
                  </label>
                ))}
                <select className="mp-select mp-select-sm"><option>固定金额</option></select>
                <input className="mp-input-num" defaultValue="0" />
                <span className="mp-unit">元/份</span>
              </div>
              <div className="mp-info">① 如果该付款客户有归属合伙红娘，将获得对应的金额分成，本金额会自动计入到合伙红娘账号的"余额"中</div>
            </div>
          </div>

          {/* 服务红娘分成 */}
          <div className="mp-row">
            <span className="mp-label">服务红娘分成</span>
            <div className="mp-content">
              <div className="mp-split-row">
                <select className="mp-select mp-select-sm"><option>固定金额</option></select>
                <input className="mp-input-num" defaultValue="0" />
                <span className="mp-unit">元/份</span>
              </div>
              <div className="mp-info">① 订单核销成功后，平台可设置给予下单人所属于的服务红娘分成，本金额会自动计入到红娘账号的"余额"中。0元表示不分成</div>
            </div>
          </div>

          {/* 购买限制 */}
          <div className="mp-row">
            <span className="mp-label">购买限制</span>
            <div className="mp-limit-row">
              <label className="mp-radio">
                <input type="radio" name="limit" value="account" checked={limitMode === "account"} onChange={() => setLimitMode("account")} />
                <span>每个账号只能购买</span>
              </label>
              <input className="mp-input-num" defaultValue="0" />
              <span className="mp-unit">份</span>
              <label className="mp-radio">
                <input type="radio" name="limit" value="order" checked={limitMode === "order"} onChange={() => setLimitMode("order")} />
                <span>每个订单只能购买</span>
              </label>
              <input className="mp-input-num" defaultValue="0" />
              <span className="mp-unit">份</span>
            </div>
            <div className="mp-info">① 若一个订单购买多份，只能一次性核销，无法分次核销</div>
          </div>

          {/* 购买须知 */}
          <div className="mp-row">
            <span className="mp-label">购买须知</span>
            <div className="mp-options">
              {["使用默认", "自定义"].map((o) => (
                <label key={o} className={`mp-radio ${noticeMode === o ? "active" : ""}`}>
                  <input type="radio" name="notice" value={o} checked={noticeMode === o} onChange={() => setNoticeMode(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 商品介绍 */}
          <div className="mp-row mp-row-top">
            <span className="mp-label">商品介绍</span>
            <div className="mp-editor">
              <div className="mp-editor-toolbar">
                {TOOLBAR.map((it, idx) => (
                  <button key={idx} type="button" className="mp-editor-tool" title={it.title}>{it.icon}</button>
                ))}
              </div>
              <div className="mp-editor-body" contentEditable suppressContentEditableWarning>
                <p className="mp-editor-placeholder">请输入正文</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}