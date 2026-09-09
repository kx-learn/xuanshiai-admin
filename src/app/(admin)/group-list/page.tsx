"use client";
import { useState } from "react";
import { X, Camera, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link2, Image as ImageIcon, Smile, Quote, Code, Heading1, Heading2, RotateCcw, RotateCw, Trash2, Maximize2, Plus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "搭子社群", href: "/group-menu" },
  { label: "社群管理" },
];

interface Group {
  id: number;
  title: string;
  initiator: string;
  area: string;
  category: string;
  count: number;
  online: boolean;
  status: string;
  createdAt: string;
}

const groups: Group[] = [
  {
    id: 1,
    title: "美食干饭搭子",
    initiator: "",
    area: "江苏省南京市建邺区",
    category: "美食搭子",
    count: 1,
    online: true,
    status: "邀请加入",
    createdAt: "2026-05-31 17:39:14",
  },
];

export default function GroupListPage() {
  const [onlineMap, setOnlineMap] = useState<Record<number, boolean>>(() =>
    groups.reduce((acc, g) => ({ ...acc, [g.id]: g.online }), {})
  );
  const [gxOpen, setGxOpen] = useState(false);
  const [signupMode, setSignupMode] = useState("注册登录");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">ℹ</span>
          <div className="ecl-notice-text">
            您可以在<b>这里添加、管理社群</b>；状态设置为&ldquo;<b>已满</b>&rdquo;将关闭线上的入群通道，并显示状态为&ldquo;<b>已满</b>&rdquo;；状态设置为&ldquo;<b>下线</b>&rdquo;该群信息将不在平台中展示
            <br />
            所有的推广红娘，不分级别，统一按照每个社群所设置的奖励金额给予<b>分成奖励</b>，您可在&ldquo;<b>推广红娘-分成明细</b>&rdquo;中选择分成事件&ldquo;<b>社群缴费</b>&rdquo;，可查询每一笔分成记录
          </div>
        </div>
      </div>

      <div className="finord-card">
        {/* 筛选条 */}
        <div className="finord-filters gml-filters">
          <input className="finord-search-input gml-search" placeholder="输入社群标题关键词" />
          <button className="finord-btn gml-add" onClick={() => setGxOpen(true)}>＋ 添加社群信息</button>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table gml-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>社群标题</th>
                <th>发起人</th>
                <th>地区</th>
                <th>分类</th>
                <th>报名人数</th>
                <th>上线?</th>
                <th>状态</th>
                <th>海报/二维码</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id}>
                  <td className="finord-id">{g.id}</td>
                  <td>{g.title}</td>
                  <td>{g.initiator}</td>
                  <td>{g.area}</td>
                  <td>{g.category}</td>
                  <td className="gml-count">{g.count}</td>
                  <td>
                    <button
                      className={`mp-switch ${onlineMap[g.id] ? "on" : ""}`}
                      onClick={() => setOnlineMap((m) => ({ ...m, [g.id]: !m[g.id] }))}
                    >
                      <span className="mp-switch-knob" />
                    </button>
                    <span className="gml-switch-label">{onlineMap[g.id] ? "上线" : "下线"}</span>
                  </td>
                  <td>
                    <span className="gml-status">{g.status}</span>
                  </td>
                  <td>
                    <a className="finord-link" href="#">查看</a>
                  </td>
                  <td className="gml-time">{g.createdAt}</td>
                  <td>
                    <span className="gml-ops">
                      <a className="finord-link" href="#">编辑</a>
                      <span className="cs-op-sep">|</span>
                      <a className="finord-link" href="#">复制</a>
                      <span className="cs-op-sep">|</span>
                      <a className="finord-link" href="#">删除</a>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="finord-pagination">
          <button className="finord-page">&lsaquo;</button>
          <button className="finord-page active">1</button>
          <button className="finord-page">&rsaquo;</button>
          <span className="finord-page-size">10 条/页</span>
        </div>
      </div>

      {gxOpen && <AddGroupDrawer onClose={() => setGxOpen(false)} signupMode={signupMode} setSignupMode={setSignupMode} />}
    </div>
  );
}

const GX_TOOLBAR: { icon: React.ReactNode; title: string }[] = [
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
  { icon: <Trash2 size={14} />, title: "清空" },
  { icon: <Maximize2 size={14} />, title: "全屏" },
];

function AddGroupDrawer({ onClose, signupMode, setSignupMode }: {
  onClose: () => void;
  signupMode: string;
  setSignupMode: (v: string) => void;
}) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel gx-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加/编辑社群</span>
          </div>
          <div className="gx-head-actions">
            <button className="finord-btn gx-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 社群标题 */}
          <div className="gx-row">
            <span className="gx-label">＊社群标题</span>
            <div className="gx-content">
              <input className="gx-input gx-input-wide" />
              <div className="gx-info">最多30字</div>
            </div>
          </div>

          {/* 所在区域 */}
          <div className="gx-row">
            <span className="gx-label">＊所在区域</span>
            <div className="gx-content">
              <select className="gx-select gx-select-wide"><option>请选择</option></select>
            </div>
          </div>

          {/* 社群分类 */}
          <div className="gx-row">
            <span className="gx-label">＊社群分类</span>
            <div className="gx-content">
              <select className="gx-select gx-select-wide"><option>请选择社群分类</option></select>
            </div>
          </div>

          {/* 列表封面 */}
          <div className="gx-row">
            <span className="gx-label">＊列表封面</span>
            <div className="gx-content">
              <div className="gx-cover-row">
                <div className="gx-cover gx-cover-square"><span>+300*300</span></div>
                <button type="button" className="gx-pick-btn"><Camera size={14} /> 从云端素材选择</button>
              </div>
            </div>
          </div>

          {/* 内容头图 */}
          <div className="gx-row">
            <span className="gx-label">＊内容头图</span>
            <div className="gx-content">
              <div className="gx-cover-row">
                <div className="gx-cover gx-cover-wide"><span>+750*250</span></div>
                <button type="button" className="gx-pick-btn"><Camera size={14} /> 从云端素材选择</button>
              </div>
            </div>
          </div>

          {/* 社群标签 */}
          <div className="gx-row">
            <span className="gx-label">社群标签</span>
            <div className="gx-content">
              <button type="button" className="gx-add-tag"><Plus size={12} /> 添加标签</button>
            </div>
          </div>

          {/* 报名条件 */}
          <div className="gx-row">
            <span className="gx-label">报名条件</span>
            <div className="gx-options">
              {["注册登录", "完善资料（无需实名认证）", "需实名认证"].map((o) => (
                <label key={o} className={`gx-radio ${signupMode === o ? "active" : ""}`}>
                  <input type="radio" name="signupMode" value={o} checked={signupMode === o} onChange={() => setSignupMode(o)} />
                  <span>{o}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 收费金额 */}
          <div className="gx-row">
            <span className="gx-label">收费金额</span>
            <div className="gx-content">
              <div className="gx-inline">
                <input className="gx-input gx-input-num" />
                <span className="gx-unit">元</span>
              </div>
              <div className="gx-info">0元为免费</div>
            </div>
          </div>

          {/* 推广奖励 */}
          <div className="gx-row">
            <span className="gx-label">推广奖励</span>
            <div className="gx-content">
              <div className="gx-inline">
                <input className="gx-input gx-input-num" />
                <span className="gx-unit">元</span>
              </div>
              <div className="gx-info">推广红娘名下会员按照平台流程成功加入本群的奖励金额；用户付费入群后将自动计入到推广红娘账号的余额中</div>
            </div>
          </div>

          {/* 社群发起 */}
          <div className="gx-row">
            <span className="gx-label">＊社群发起</span>
            <div className="gx-content">
              <input className="gx-input" placeholder="输入昵称关键词" />
              <div className="gx-info">帐号昵称和头像将被显示在平台中展示；若发起人原本平台，请先在帐号管理增加一个以平台名作为昵称的帐号，并设置上头像，当有人报名入群时将给该发起人的帐号所指定的手机</div>
            </div>
          </div>

          {/* 本群介绍 */}
          <div className="gx-row">
            <span className="gx-label">本群介绍</span>
            <div className="gx-content">
              <div className="gx-editor">
                <div className="gx-editor-toolbar">
                  {GX_TOOLBAR.map((it, idx) => (
                    <button key={idx} type="button" className="gx-editor-tool" title={it.title}>{it.icon}</button>
                  ))}
                </div>
                <div className="gx-editor-body" contentEditable suppressContentEditableWarning>
                  <p className="gx-editor-placeholder">请输入正文</p>
                </div>
              </div>
              <div className="gx-info">本内容显示在支付完成入群费后弹出的页面</div>
            </div>
          </div>

          {/* 显示排序 */}
          <div className="gx-row">
            <span className="gx-label">显示排序</span>
            <div className="gx-content">
              <input className="gx-input gx-input-num" />
              <div className="gx-info">数字越大显示越靠前</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
