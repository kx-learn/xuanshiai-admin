"use client";
import { useState } from "react";
import { X, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2, Image as ImageIcon, Smile, Quote, Code, Heading1, Heading2, RotateCcw, RotateCw, Trash2, Maximize2, Plus, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("运营工具", "内容单页");

const initialRows = [
  { id: 4, title: "活动", match: false, realname: false, vip: false, enabled: true },
  { id: 3, title: "本周活动", match: false, realname: false, vip: false, enabled: true },
  { id: 1, title: "历史活动", match: false, realname: false, vip: false, enabled: true },
];

export default function SinglePage() {
  const [checked, setChecked] = useState<number[]>([]);
  const [rows, setRows] = useState(initialRows);

  const toggleAll = () => {
    setChecked((current) => (current.length === rows.length ? [] : rows.map((r) => r.id)));
  };

  const toggleRow = (id: number) => {
    setChecked((current) => (current.includes(id) ? current.filter((v) => v !== id) : [...current, id]));
  };

  const toggleKey = (id: number, key: "match" | "realname" | "vip" | "enabled") => {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, [key]: !r[key] } : r)));
  };

  const allChecked = rows.length > 0 && checked.length === rows.length;
  const [addOpen, setAddOpen] = useState(false);
  const [jumpTo, setJumpTo] = useState("否");

  const renderSwitch = (on: boolean, onChange: () => void) => (
    <span className="sp-switch-wrap">
      <button type="button" className={`mp-switch ${on ? "on" : ""}`} onClick={onChange}>
        <span className="mp-switch-knob"></span>
      </button>
      <span className={`sp-switch-text ${on ? "on" : ""}`}>{on ? "开" : "关闭"}</span>
    </span>
  );

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色信息条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>自定义单页可以让平台运营者自由创建无限个自由内容的页面，可以将单页插入到平台的各处导航的链接中，也可以用来发布平台相关业务介绍等内容，独立用于宣传推广用途。</p>
            <p>关闭状态下，页面会自动跳转到平台首页。</p>
            <p>可以通过"内容专辑"功能灵活打造专属使用场景，比如：往期活动回顾、成功案例故事、团队发展纪实...</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        {/* 标题行 */}
        <div className="sp-head">
          <div className="sp-title">内容单页</div>
          <button className="finord-btn finord-btn-primary" onClick={() => setAddOpen(true)}>＋ 添加单页</button>
        </div>

        {/* 筛选条 */}
        <div className="finord-filters sp-filters">
          <input className="finord-search-input sp-search" placeholder="请输入关键字" />
          <button className="finord-btn finord-btn-primary">搜索</button>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table sp-table">
            <thead>
              <tr>
                <th className="sp-col-check"><input type="checkbox" className="sp-check" checked={allChecked} onChange={toggleAll} /></th>
                <th>ID</th>
                <th>页面标题</th>
                <th>仅相亲会员可浏览</th>
                <th>仅实名会员可浏览</th>
                <th>仅VIP会员可浏览</th>
                <th>浏览明细</th>
                <th>链接/二维码</th>
                <th>预览效果</th>
                <th>启用/关闭</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="sp-col-check"><input type="checkbox" className="sp-check" checked={checked.includes(row.id)} onChange={() => toggleRow(row.id)} /></td>
                  <td>{row.id}</td>
                  <td>
                    <span className="sp-title-cell">{row.title}</span>
                    <button className="sp-edit-ic" aria-label="编辑标题">✎</button>
                  </td>
                  <td>{renderSwitch(row.match, () => toggleKey(row.id, "match"))}</td>
                  <td>{renderSwitch(row.realname, () => toggleKey(row.id, "realname"))}</td>
                  <td>{renderSwitch(row.vip, () => toggleKey(row.id, "vip"))}</td>
                  <td>-</td>
                  <td><a className="finord-link" href="#">查看</a></td>
                  <td><a className="finord-link" href="#">预览</a></td>
                  <td>{renderSwitch(row.enabled, () => toggleKey(row.id, "enabled"))}</td>
                  <td>
                    <div className="sp-ops">
                      <a className="finord-link" href="#">复制</a>
                      <a className="finord-link" href="#">编辑</a>
                      <a className="finord-link sp-op-del" href="#">删除</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="finord-pagination sp-pagination">
          <div className="finord-pages">
            <button className="finord-page nav">‹</button>
            <button className="finord-page active">1</button>
            <button className="finord-page nav">›</button>
          </div>
        </div>
      </div>

      {addOpen && <AddSinglePageDrawer onClose={() => setAddOpen(false)} jumpTo={jumpTo} setJumpTo={setJumpTo} />}
    </div>
  );
}

const SSP_TOOLBAR: { icon: React.ReactNode; title: string }[] = [
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
  { icon: <Link2 size={14} />, title: "链接" },
  { icon: <ImageIcon size={14} />, title: "图片" },
  { icon: <Smile size={14} />, title: "表情" },
  { icon: <Quote size={14} />, title: "引用" },
  { icon: <Code size={14} />, title: "代码" },
  { icon: <Plus size={14} />, title: "更多" },
  { icon: <RotateCcw size={14} />, title: "撤销" },
  { icon: <RotateCw size={14} />, title: "重做" },
  { icon: <Minus size={14} />, title: "分割线" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
  { icon: <Trash2 size={14} />, title: "清空" },
];

function AddSinglePageDrawer({ onClose, jumpTo, setJumpTo }: {
  onClose: () => void;
  jumpTo: string;
  setJumpTo: (v: string) => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel ssp-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加/编辑单页</span>
          </div>
          <div className="ssp-head-actions">
            <button className="finord-btn ssp-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 页面标题 */}
          <div className="ssp-row">
            <span className="ssp-label">＊页面标题</span>
            <input className="ssp-input ssp-input-wide" placeholder="最多6汉字" />
          </div>

          {/* 跳转到指定页面 */}
          <div className="ssp-row">
            <span className="ssp-label">跳转到指定页面</span>
            <div className="ssp-options">
              {["是", "否"].map((o) => (
                <label key={o} className={`ssp-radio ${jumpTo === o ? "active" : ""}`}>
                  <input type="radio" name="jumpTo" value={o} checked={jumpTo === o} onChange={() => setJumpTo(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 页面内容 */}
          <div className="ssp-row ssp-row-top">
            <span className="ssp-label">页面内容</span>
            <div className="ssp-content">
              <div className="ssp-editor">
                <div className="ssp-editor-toolbar">
                  {SSP_TOOLBAR.map((it, idx) => (
                    <button key={idx} type="button" className="ssp-editor-tool" title={it.title}>{it.icon}</button>
                  ))}
                </div>
                <div className="ssp-editor-body" contentEditable suppressContentEditableWarning>
                  <p className="ssp-editor-placeholder">请输入正文</p>
                </div>
              </div>
            </div>
          </div>

          {/* 分享图标 */}
          <div className="ssp-row ssp-row-top">
            <span className="ssp-label">分享图标</span>
            <div className="ssp-content">
              <div className="ssp-pick"><Plus size={18} /><span>上传图片</span></div>
            </div>
          </div>

          {/* 分享标题 */}
          <div className="ssp-row ssp-row-top">
            <span className="ssp-label">分享标题</span>
            <input className="ssp-input ssp-input-wide" placeholder="请输入分享标题" />
          </div>

          {/* 分享摘要 */}
          <div className="ssp-row ssp-row-top">
            <span className="ssp-label">分享摘要</span>
            <textarea className="ssp-textarea" placeholder="请输入分享摘要" rows={3} />
          </div>

          {/* 确定提交 */}
          <div className="ssp-submit-row">
            <button className="finord-btn finord-btn-primary ssp-submit">确定提交</button>
          </div>
        </div>
      </div>
    </>
  );
}
