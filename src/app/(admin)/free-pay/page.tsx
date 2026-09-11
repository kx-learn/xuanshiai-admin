"use client";
import { useState } from "react";
import { X, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link2, Image as ImageIcon, Smile, Video, FileText, RotateCcw, RotateCw, Minus, Quote, Code, Heading1, Heading2, Heading3, Maximize2 } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const TABS = ["自由收款", "收款订单"];

export default function FreePayPage() {
  const [tab, setTab] = useState("自由收款");
  const [catOpen, setCatOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const breadcrumb = getBreadcrumb("运营工具", "自由收款");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card">
        <div className="fp-tab-bar">
          {TABS.map((t) => (
            <button key={t} className={`fp-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        {tab === "自由收款" ? (
          <>
            <div className="ecl-notice">
              <div className="ecl-notice-body">
                <span className="ecl-notice-ic">◇</span>
                <div className="ecl-notice-text">
                  <div className="ecl-notice-title">须知</div>
                  <p>这是一款<em>自由在线收款解决方案</em>，帮助您在平台上快速完成服务或商品介绍、在线收款、财务数据统计。</p>
                  <p>您可以在这里创建任意在线支付项目，发送到微信或微信群给客户即可完成在线收款，款项直接进入到您的微信账户中。</p>
                  <p>每个收款项目都拥有一个独立的聚合页面(效果预览)，同时每个收款项目都拥有独立的展示页面(效果预览)，供您在实际运营中根据需求灵活运用。</p>
                  <p>注意：所有的自由收款在本系统的财务的支付事项中将称为"线上收款"。</p>
                </div>
              </div>
            </div>

            <div className="finord-section-title fp-title">您已经创建的项目:</div>

            <div className="finord-filters fp-filters">
              <div className="finord-searchbox">
                <span className="finord-search-label">收款类目:</span>
                <select className="finord-select"><option>不限</option></select>
              </div>
              <div className="fp-spacer" />
              <button className="finord-btn finord-btn-primary" onClick={() => setCatOpen(true)}>＋ 添加收款类目</button>
              <button className="finord-btn finord-btn-primary" onClick={() => setItemOpen(true)}>＋ 添加收款项目</button>
            </div>

            <div className="finord-table-wrap">
              <table className="finord-table">
                <thead>
                  <tr>
                    <th>ID</th><th>收款项目名称</th><th>收款类目</th><th>收款金额</th>
                    <th>推广红娘奖励</th><th>服务红娘奖励</th><th>合伙红娘奖励</th>
                    <th>在聚合页面</th><th>收款订单</th><th>查看</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={11} className="ecl-empty">
                      <div className="ecl-empty-inner">
                        <div className="ecl-empty-icon">▤</div>
                        <div className="ecl-empty-text">暂无数据</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="ecl-notice">
              <div className="ecl-notice-body">
                <span className="ecl-notice-ic">◇</span>
                <div className="ecl-notice-text">
                  <p>客户在平台点击"立即支付"系统就会创建一个订单，您在这里可以查询到您的全部订单信息，您可以在"财务管理-收入明细"中进行更多操作。</p>
                </div>
              </div>
            </div>

            <div className="finord-filters fp-filters">
              <div className="finord-searchbox">
                <span className="finord-search-label">收款类目:</span>
                <select className="finord-select"><option>不限</option></select>
              </div>
              <div className="finord-daterange">
                <input className="finord-date" type="date" />
                <span className="finord-date-sep">→</span>
                <input className="finord-date" type="date" />
              </div>
              <div className="finord-searchbox">
                <span className="finord-search-label">按会员昵称</span>
                <input className="finord-search-input" placeholder="请输入" />
              </div>
              <button className="finord-btn finord-btn-primary">搜索</button>
            </div>

            <div className="finord-table-wrap">
              <table className="finord-table">
                <thead>
                  <tr>
                    <th>ID</th><th>下单时间</th><th>付款人</th><th>关联红娘</th>
                    <th>收款内容</th><th>金额</th><th>支付状态</th><th>支付时间</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={9} className="ecl-empty">
                      <div className="ecl-empty-inner">
                        <div className="ecl-empty-icon">▤</div>
                        <div className="ecl-empty-text">暂无数据</div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {catOpen && <AddCategoryDrawer onClose={() => setCatOpen(false)} />}
      {itemOpen && <AddItemDrawer onClose={() => setItemOpen(false)} />}
    </div>
  );
}

function DrawerHead({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="tlc-panel-head">
      <div className="tlc-panel-head-left">
        <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
        <span className="tlc-panel-title">{title}</span>
      </div>
      <div className="fp-head-actions">
        <button className="finord-btn fp-cancel" onClick={onClose}>取消</button>
        <button className="finord-btn finord-btn-primary">确定提交</button>
      </div>
    </div>
  );
}

const TOOLBAR_ICONS: { icon: React.ReactNode; title: string }[] = [
  { icon: <Heading1 size={14} />, title: "标题1" },
  { icon: <Heading2 size={14} />, title: "标题2" },
  { icon: <Heading3 size={14} />, title: "标题3" },
  { icon: <Type size={14} />, title: "字体" },
  { icon: <Bold size={14} />, title: "加粗" },
  { icon: <Italic size={14} />, title: "斜体" },
  { icon: <Underline size={14} />, title: "下划线" },
  { icon: <Strikethrough size={14} />, title: "删除线" },
  { icon: <AlignLeft size={14} />, title: "左对齐" },
  { icon: <AlignCenter size={14} />, title: "居中" },
  { icon: <AlignRight size={14} />, title: "右对齐" },
  { icon: <AlignJustify size={14} />, title: "两端对齐" },
  { icon: <List size={14} />, title: "无序列表" },
  { icon: <ListOrdered size={14} />, title: "有序列表" },
  { icon: <Link2 size={14} />, title: "链接" },
  { icon: <ImageIcon size={14} />, title: "图片" },
  { icon: <Smile size={14} />, title: "表情" },
  { icon: <Video size={14} />, title: "视频" },
  { icon: <FileText size={14} />, title: "表单" },
  { icon: <Minus size={14} />, title: "分割线" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
  { icon: <RotateCcw size={14} />, title: "撤销" },
  { icon: <RotateCw size={14} />, title: "重做" },
  { icon: <Code size={14} />, title: "源码" },
  { icon: <Quote size={14} />, title: "引用" },
];

function RichEditor({ placeholder }: { placeholder: string }) {
  return (
    <div className="fp-editor">
      <div className="fp-editor-toolbar">
        {TOOLBAR_ICONS.map((it, idx) => (
          <button key={idx} type="button" className="fp-editor-tool" title={it.title}>{it.icon}</button>
        ))}
      </div>
      <div className="fp-editor-body" contentEditable suppressContentEditableWarning>
        <p className="fp-editor-placeholder">{placeholder}</p>
      </div>
    </div>
  );
}

function AddCategoryDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel fp-panel">
        <DrawerHead title="添加收款类目" onClose={onClose} />
        <div className="tlc-panel-body">
          {/* 类目名称 */}
          <div className="fp-row">
            <span className="fp-label">＊类目名称</span>
            <input className="fp-input fp-input-wide" placeholder="不要超过10汉字" />
          </div>

          {/* 页面头图 */}
          <div className="fp-row">
            <span className="fp-label">页面头图</span>
            <div className="fp-content">
              <div className="fp-cover"><span>+750*350</span></div>
              <div className="fp-info">① 留空则不显示，多图轮换显示，最佳尺寸750*350，用于显示在聚合页面的头部</div>
            </div>
          </div>

          {/* 服务介绍 */}
          <div className="fp-row">
            <span className="fp-label">服务介绍</span>
            <div className="fp-content">
              <RichEditor placeholder="请输入正文" />
              <div className="fp-info">① 可留空，此内容将作为本类目下所有收款项目的默认介绍</div>
            </div>
          </div>

          {/* 须知条 */}
          <div className="fp-notice">
            <div className="fp-notice-title">须知</div>
            <div className="fp-notice-body">下面的设置应用到本类目的聚合页面。所有本类目下的收款项目独立页面</div>
          </div>

          {/* 分享标题 */}
          <div className="fp-row">
            <span className="fp-label">分享标题</span>
            <div className="fp-content">
              <input className="fp-input fp-input-wide" placeholder="请输入分享标题" />
              <div className="fp-info">① 留空则自动默认为类目名称</div>
            </div>
          </div>

          {/* 分享图标 */}
          <div className="fp-row">
            <span className="fp-label">分享图标</span>
            <div className="fp-content">
              <div className="fp-cover fp-cover-sm"><span>+300*300</span></div>
              <div className="fp-info">① 留空则自动默认以平台首页分享图标</div>
            </div>
          </div>

          {/* 分享描述 */}
          <div className="fp-row">
            <span className="fp-label">分享描述</span>
            <div className="fp-content">
              <textarea className="fp-textarea" placeholder="请输入描述" rows={3} />
              <div className="fp-info">① 留空则自动默认以平台首页分享描述</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RewardLine({ label, labelClass, info }: { label: string; labelClass?: string; info: string }) {
  return (
    <div className="fp-reward">
      <span className={`fp-label ${labelClass || ""}`}>{label}</span>
      <div className="fp-content">
        <div className="fp-reward-row">
          <label className="fp-radio"><input type="radio" name={label} defaultChecked /><span>统一设置</span></label>
          <label className="fp-radio"><input type="radio" name={label} /><span>按级别设置分成</span></label>
          <select className="fp-select"><option>固定金额</option><option>按比例</option></select>
          <input className="fp-input fp-input-num" defaultValue="0" />
          <span className="fp-unit">元</span>
        </div>
        <div className="fp-info">{info}</div>
      </div>
    </div>
  );
}

function AddItemDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel fp-panel">
        <DrawerHead title="添加收款项目" onClose={onClose} />
        <div className="tlc-panel-body">
          {/* 收款名称 */}
          <div className="fp-row">
            <span className="fp-label">＊收款名称</span>
            <input className="fp-input fp-input-wide" placeholder="不要超过10汉字" />
          </div>

          {/* 归集类目 */}
          <div className="fp-row">
            <span className="fp-label">＊归集类目</span>
            <select className="fp-select fp-select-wide"><option></option></select>
          </div>

          {/* 收款金额 */}
          <div className="fp-row">
            <span className="fp-label">＊收款金额</span>
            <div className="fp-content">
              <div className="fp-amount">
                <input className="fp-input fp-input-num" defaultValue="0" />
                <span className="fp-unit">元</span>
              </div>
              <div className="fp-info">① 客户在线支付的金额</div>
            </div>
          </div>

          {/* 推广红娘奖励 */}
          <RewardLine
            label="推广红娘奖励"
            info="① 客户付款后，其所属的推广红娘将获得对应的金额奖励，系统自动计入到其账号余额中"
          />

          {/* 服务红娘奖励 */}
          <div className="fp-row">
            <span className="fp-label">服务红娘奖励</span>
            <div className="fp-content">
              <div className="fp-reward-row">
                <select className="fp-select"><option>固定金额</option><option>按比例</option></select>
                <input className="fp-input fp-input-num" defaultValue="0" />
                <span className="fp-unit">元</span>
              </div>
              <div className="fp-info">① 客户付款后，其所属的服务红娘将获得对应的金额奖励，系统自动计入到其账号余额中</div>
            </div>
          </div>

          {/* 合伙红娘分成 */}
          <RewardLine
            label="合伙红娘分成"
            info={`① 如果该付款客户有归属合伙红娘，将获得对应的金额分成，自动计入到该"合伙红娘"账号余额中`}
          />

          {/* 分店分成 */}
          <div className="fp-row">
            <span className="fp-label">分店分成</span>
            <div className="fp-content">
              <div className="fp-reward-row">
                <select className="fp-select"><option>固定金额</option><option>按比例</option></select>
                <input className="fp-input fp-input-num" defaultValue="0" />
                <span className="fp-unit">元</span>
              </div>
              <div className="fp-info">① 如果付款客户归属分店，将获得对应的金额分成，金额自动计入到分店的"店长红娘"账号余额中。 特别提醒：若系统已给予分成红包，则所属"服务红娘"系统上不给分成。</div>
            </div>
          </div>

          {/* 收费介绍 */}
          <div className="fp-row">
            <span className="fp-label">收费介绍</span>
            <div className="fp-options">
              <label className="fp-radio"><input type="radio" name="intro" defaultChecked /><span>使用本类目默认统一内容</span></label>
              <label className="fp-radio"><input type="radio" name="intro" /><span>独立设置</span></label>
            </div>
          </div>

          {/* 页面头图 */}
          <div className="fp-row">
            <span className="fp-label">页面头图</span>
            <div className="fp-content">
              <div className="fp-cover"><span>+750*350</span></div>
              <div className="fp-info">① 留空则不显示</div>
            </div>
          </div>

          {/* 聚合页面中的显示排序 */}
          <div className="fp-row">
            <span className="fp-label">聚合页面中的显示排序</span>
            <div className="fp-content">
              <input className="fp-input fp-input-num" />
              <div className="fp-info">① 数字越大显示越靠前</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}