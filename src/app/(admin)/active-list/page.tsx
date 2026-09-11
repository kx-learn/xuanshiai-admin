"use client";

import { useState } from "react";
import { X, Plus, Eye, Type, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, Quote, List, ListOrdered, Link2, Image as ImageIcon, Smile, Code, Heading1, Heading2, RotateCcw, RotateCw, Maximize2, Minus } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("活动报名", "活动管理");

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

const SIDEBAR_SECTIONS = [
  "基本信息", "时间地点", "活动费用", "报名要求", "人数限额", "红娘奖励", "活动详情", "活动提醒", "其他设置", "管理设置",
];

interface Row {
  id: number;
  cover: string;
  name: string;
  category: string;
  time: string;
  place: string;
  manager: string;
  activityStatus: string;
  boys: number;
  girls: number;
  createdAt: string;
  auditStatus: string;
  online: boolean;
}

const rows: Row[] = [
  { id: 8, cover: "择偶竞争力评分", name: "单身青年 免费择偶竞争力评分", category: "免费活动", time: "持续进行中", place: "单身青年 免费择偶竞争力评分", manager: "荟希老师 六月", activityStatus: "报名中", boys: 27, girls: 14, createdAt: "2026-07-01 13:31:24", auditStatus: "通过", online: true },
  { id: 7, cover: "7.26 一年内结婚专场", name: "7.26 一年内结婚专场", category: "专场活动", time: "7月26日14:00-17:00", place: "7.26 一年内结婚专场", manager: "荟希老师 六月", activityStatus: "活动结束", boys: 1, girls: 1, createdAt: "2026-06-27 17:44:18", auditStatus: "通过", online: true },
  { id: 6, cover: "黒心媒婆大赛", name: "7.19 黒心媒婆大赛", category: "专场活动", time: "7月19日14:00-17:00", place: "7.19 黒心媒婆大赛", manager: "荟希老师 六月", activityStatus: "活动结束", boys: 0, girls: 1, createdAt: "2026-06-27 17:39:41", auditStatus: "通过", online: false },
];

const columns = ["ID", "活动", "链接/二维码", "分享海报", "签到码", "活动状态", "报名人数", "创建时间", "审核状态", "上线", "操作"];

export default function ActiveListPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("基本信息");
  const [onlineMap, setOnlineMap] = useState<Record<number, boolean>>(() => rows.reduce((acc, r) => ({ ...acc, [r.id]: r.online }), {}));

  const toggleOnline = (id: number) => setOnlineMap((m) => ({ ...m, [id]: !m[id] }));

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>本系统实现：活动发布、生成招募海报/二维码/报名链接、在线报名、在线收款、短信通知、活动签到、报名信息一键导入会员库、财务管理等功能</p>
            <p>活动分为四种状态："报名中"、"已满额"、"报名截止"、"已结束"，仅状态为"报名中"中可以报名</p>
            <p>活动为"审核通过"且"上线"才会在平台上显示</p>
          </div>
        </div>
      </div>

      <div className="finord-card al-card">
        <div className="al-head">
          <h2 className="al-title">活动管理</h2>
          <div className="al-head-actions">
            <button className="finord-btn finord-btn-primary al-publish-btn" onClick={() => setAddOpen(true)}>＋ 发布活动</button>
            <button className="finord-btn finord-btn-primary al-preview-btn"><Eye size={14} /> 预览活动栏目</button>
          </div>
        </div>

        <div className="al-filters">
          <input className="al-input" placeholder="请输入关键字搜索" />
          <button className="finord-btn finord-btn-primary al-search-btn">搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table al-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="al-row-content">
                      <input type="checkbox" className="al-check" />
                      <span className="al-id">{r.id}</span>
                    </div>
                  </td>
                  <td>
                    <div className="al-activity">
                      <div className="al-cover" style={{ background: "linear-gradient(135deg, #c93b76, #f0648a)" }}>{r.cover}</div>
                      <div className="al-activity-info">
                        <div className="al-activity-name">{r.name}</div>
                        <div className="al-activity-meta">
                          <span>分类：<span className="al-meta-blue">{r.category}</span></span>
                          <span>时间：{r.time}</span>
                          <span>地点：{r.place}</span>
                          <span>管理：{r.manager}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><a className="finord-link" onClick={() => setLinkOpen(true)}>查看</a></td>
                  <td><a className="finord-link">查看</a></td>
                  <td><a className="finord-link">查看</a></td>
                  <td>
                    <span className={`al-activity-status al-activity-status-${r.activityStatus}`}>{r.activityStatus}</span>
                  </td>
                  <td>
                    <div className="al-count">
                      <div>男生 <span className="al-count-num">{r.boys}</span></div>
                      <div>女生 <span className="al-count-num">{r.girls}</span></div>
                    </div>
                  </td>
                  <td className="al-time">{r.createdAt}</td>
                  <td><span className="al-audit">{r.auditStatus}</span></td>
                  <td>
                    <button type="button" className={`mp-switch ${onlineMap[r.id] ? "on" : ""}`} onClick={() => toggleOnline(r.id)}>
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                  <td>
                    <div className="al-ops">
                      <a className="finord-link">复制</a>
                      <a className="finord-link">编辑</a>
                      <a className="finord-link">名单展示</a>
                      <a className="finord-link">删除</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && (
        <AddActiveDrawer
          onClose={() => setAddOpen(false)}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
      )}
      {linkOpen && <LinkQrDrawer onClose={() => setLinkOpen(false)} />}
    </div>
  );
}

function AddActiveDrawer({ onClose, activeSection, setActiveSection }: {
  onClose: () => void;
  activeSection: string;
  setActiveSection: (s: string) => void;
}) {
  const [signupMode, setSignupMode] = useState("任何人都可以报名");
  const [limitMode, setLimitMode] = useState("限制男女人数");
  const [customShare, setCustomShare] = useState(false);

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel al-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加活动</span>
          </div>
          <div className="al-head-actions">
            <button className="finord-btn al-cancel" onClick={onClose}>取消</button>
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body al-drawer-body">
          {/* 左侧菜单 */}
          <div className="al-drawer-sidebar">
            {SIDEBAR_SECTIONS.map((s) => (
              <button key={s} className={`al-drawer-nav ${activeSection === s ? "active" : ""}`} onClick={() => setActiveSection(s)}>
                {s}
              </button>
            ))}
          </div>

          {/* 右侧表单 */}
          <div className="al-drawer-form">
            {activeSection === "基本信息" && (
              <>
                <div className="al-section-head">| 基本信息</div>
                <div className="al-row"><span className="al-label">＊活动名称</span><input className="al-input-wide" placeholder="不要超出50汉字" /></div>
                <div className="al-row"><span className="al-label">＊活动分类</span><select className="al-input-wide al-select"><option>选择活动分类</option></select></div>
                <div className="al-row"><span className="al-label">＊活动发起</span><input className="al-input-wide" placeholder="输入主办方名称" /></div>
                <div className="al-row al-row-top">
                  <span className="al-label">封面大图</span>
                  <div className="al-content">
                    <div className="al-cover-pick al-cover-pick-wide"><Plus size={18} /><span>上传图片</span></div>
                    <div className="al-info">① 最佳尺寸：900×383（与公众号首图一致）</div>
                  </div>
                </div>
                <div className="al-row al-row-top">
                  <span className="al-label">封面小图</span>
                  <div className="al-content">
                    <div className="al-cover-pick al-cover-pick-square"><Plus size={18} /><span>上传图片</span></div>
                    <div className="al-info">① 最佳尺寸：300像素x300像素</div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "时间地点" && (
              <>
                <div className="al-section-head">| 时间地点</div>
                <div className="al-row"><span className="al-label">活动时间</span><input className="al-input-wide" placeholder="请输入" /><span className="al-text-muted">建议格式示例：9月28号（周六）下午2点-6点</span></div>
                <div className="al-row"><span className="al-label">活动地址</span><input className="al-input-wide" placeholder="请输入详细地址" /></div>
                <div className="al-row"><span className="al-label">＊报名截止</span><input className="al-input-wide al-date" type="date" /></div>
                <div className="al-row"><span className="al-label">＊活动结束</span><input className="al-input-wide al-date" type="date" /></div>
                <div className="al-info-block">① 该时间后活动状态自动变更为已结束</div>
              </>
            )}

            {activeSection === "活动费用" && (
              <>
                <div className="al-section-head">| 活动费用</div>
                <div className="al-row">
                  <span className="al-label">活动费用</span>
                  <div className="al-content">
                    <div className="al-fee-row">
                      <span>活动费用</span>
                      <input className="al-num" defaultValue="0" />
                      <span className="al-unit">元</span>
                      <span>女生</span>
                      <input className="al-num" defaultValue="0" />
                      <span className="al-unit">元</span>
                    </div>
                    <div className="al-info">① 表示免费。本费用按报名人在性别支付；VIP会员包含线上和线下的两种类型</div>
                  </div>
                </div>
                <div className="al-row"><span className="al-label">费用名称</span><input className="al-input-wide" defaultValue="报名费" /></div>
              </>
            )}

            {activeSection === "报名要求" && (
              <>
                <div className="al-section-head">| 报名要求</div>
                <div className="al-row al-row-top">
                  <span className="al-label">报名要求</span>
                  <div className="al-content">
                    <div className="al-radio-row">
                      {["任何人都可以报名", "相亲会员才可以报名"].map((o) => (
                        <label key={o} className={`al-radio ${signupMode === o ? "active" : ""}`}>
                          <input type="radio" name="signupMode" value={o} checked={signupMode === o} onChange={() => setSignupMode(o)} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                    <div className="al-info">① 用户只需要在平台一微信登录并绑定手机号后（无需完善资料和相亲会员）按照表单填写资料即可完成报名，报名后可浏览到以及一键将客户加入到会员CRM中分成奖励顾客</div>
                    <div className="al-form-grid">
                      <span>姓名：<span className="al-req">必填</span></span>
                      <span>手机：<span className="al-req">必填</span></span>
                      <span>性别：<span className="al-req">必填</span></span>
                      <span>年龄：<span className="al-req">必填</span></span>
                      <span>身高：</span>
                      <span>婚况：</span>
                      <span>单位：</span>
                      <span>收入：</span>
                      <span>学历：</span>
                      <span>头像：</span>
                      <span>身份证号：</span>
                    </div>
                    <label className="al-checkbox">
                      <input type="checkbox" />
                      <span>必须实名认证</span>
                    </label>
                    <div className="al-info">② 勾选后，客户报名时会自动提示并引导客户完成实名认证再行报名</div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "人数限额" && (
              <>
                <div className="al-section-head">| 人数限额</div>
                <div className="al-row al-row-top">
                  <span className="al-label">名额限制</span>
                  <div className="al-content">
                    <div className="al-radio-row">
                      {["限制男女人数", "仅限制总人数"].map((o) => (
                        <label key={o} className={`al-radio ${limitMode === o ? "active" : ""}`}>
                          <input type="radio" name="limitMode" value={o} checked={limitMode === o} onChange={() => setLimitMode(o)} />
                          <span>{o}</span>
                        </label>
                      ))}
                    </div>
                    <div className="al-fee-row">
                      <span>男生</span>
                      <input className="al-num" defaultValue="0" />
                      <span className="al-unit">人</span>
                      <span>女生</span>
                      <input className="al-num" defaultValue="0" />
                      <span className="al-unit">人</span>
                    </div>
                    <div className="al-info">① 默认均为不限制。报名数超出所设置后无法继续报名</div>
                    <div className="al-fee-row">
                      <span>报名人数</span>
                      <input className="al-num" defaultValue="0" />
                      <span className="al-unit">人</span>
                      <span>女生</span>
                      <input className="al-num" defaultValue="0" />
                      <span className="al-unit">人</span>
                    </div>
                    <div className="al-info">② 显示人数在此基础上累计</div>
                    <div className="al-switch-row">
                      <span>隐藏报名数</span>
                      <button type="button" className="mp-switch"><span className="mp-switch-knob"></span></button>
                    </div>
                    <div className="al-info">③ 当设置为开启的状态下，在活动报名的页面中将不显示本次活动数</div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "红娘奖励" && (
              <>
                <div className="al-section-head">| 红娘奖励</div>
                <div className="al-row al-row-top">
                  <span className="al-label">奖励</span>
                  <div className="al-content">
                    <div className="al-fee-row">
                      <span>推广红娘奖励</span>
                      <input className="al-num" />
                      <span className="al-unit">元</span>
                      <span>服务红娘奖励</span>
                      <input className="al-num" />
                      <span className="al-unit">元</span>
                      <span>合伙红娘奖励</span>
                      <input className="al-num" />
                      <span className="al-unit">元</span>
                    </div>
                    <div className="al-info">① 用户会员报名本活动支付费用后，其所属推广红娘、服务红娘获得的奖励金额，0表示不奖励<br />特别提醒：报名人未完善资料（非会员）的情况下，所属推广红娘照可获得分成</div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "活动详情" && (
              <>
                <div className="al-section-head">| 活动详情</div>
                <div className="al-row al-row-top">
                  <span className="al-label">＊活动详情</span>
                  <div className="al-content">
                    <div className="al-editor">
                      <div className="al-editor-toolbar">
                        {TOOLBAR.map((it, idx) => (
                          <button key={idx} type="button" className="al-editor-tool" title={it.title}>{it.icon}</button>
                        ))}
                      </div>
                      <div className="al-editor-body" contentEditable suppressContentEditableWarning>
                        <p className="al-editor-placeholder">请输入活动详情</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "活动提醒" && (
              <>
                <div className="al-section-head">| 活动提醒</div>
                <div className="al-row al-row-top">
                  <span className="al-label">活动提醒</span>
                  <div className="al-content">
                    <div className="al-editor">
                      <div className="al-editor-toolbar">
                        {TOOLBAR.map((it, idx) => (
                          <button key={idx} type="button" className="al-editor-tool" title={it.title}>{it.icon}</button>
                        ))}
                      </div>
                      <div className="al-editor-body" contentEditable suppressContentEditableWarning>
                        <p className="al-editor-placeholder">请输入正文</p>
                      </div>
                    </div>
                    <div className="al-info">① 本内容将会显示在报名成功后的提醒页面</div>
                  </div>
                </div>
              </>
            )}

            {activeSection === "其他设置" && (
              <>
                <div className="al-section-head">| 其他设置</div>
                <div className="al-row"><span className="al-label">客服微信</span><input className="al-input-wide" /></div>
                <div className="al-row al-row-top">
                  <span className="al-label">客服二维码</span>
                  <div className="al-content">
                    <div className="al-cover-pick al-cover-pick-square"><Plus size={18} /><span>上传图片</span></div>
                    <div className="al-info">① 留空则自动默认显示平台客服的微信号和二维码（系统管理-系统配置中修改）</div>
                  </div>
                </div>
                <div className="al-row"><span className="al-label">浏览人气</span><input className="al-num" defaultValue="0" /></div>
                <div className="al-row"><span className="al-label">显示排序</span><input className="al-num" defaultValue="0" /></div>
                <div className="al-info-block">① 数字越大显示越靠前</div>
                <div className="al-switch-row">
                  <span>自定义分享</span>
                  <button type="button" className={`mp-switch ${customShare ? "on" : ""}`} onClick={() => setCustomShare(!customShare)}>
                    <span className="mp-switch-knob"></span>
                  </button>
                </div>
                <div className="al-info">② 若不启用则使用系统默认的分享封面、标题、摘要、预览效果</div>
              </>
            )}

            {activeSection === "管理设置" && (
              <>
                <div className="al-section-head">| 管理设置</div>
                <div className="al-row al-row-top">
                  <span className="al-label">＊管理红娘</span>
                  <div className="al-content">
                    <input className="al-input-wide" placeholder="请输入服务红娘的账号昵称" />
                    <div className="al-info">① 可以设置多个红娘来管理、查看此活动的报名资料、扫码签到；超级红娘可管理查看所有活动的报名</div>
                  </div>
                </div>
                <div className="al-row al-row-top">
                  <span className="al-label">短信通知</span>
                  <div className="al-content">
                    <input className="al-input-wide" placeholder="请输入手机号" />
                    <div className="al-info">① 设置号码后，有人报名活动时，将发送短信提醒到该指定手机号；最多可设置3个，多个手机号用逗号隔开；若留空则自动通知所有活动的管理红娘</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function LinkQrDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel al-link-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">链接/二维码</span>
          </div>
          <div className="al-head-actions">
            <button className="finord-btn al-cancel" onClick={onClose}>关闭</button>
          </div>
        </div>
        <div className="tlc-panel-body al-link-body">
          <div className="al-link-url">链接地址</div>
          <input className="al-input-wide al-link-url-input" defaultValue="https://www.xuanshi.com/subpages/active/index" />
          <div className="al-link-qr-title">二维码</div>
          <div className="al-link-qr">
            <div className="al-phone">
              <div className="al-phone-bar" />
              <div className="al-phone-screen">
                <div className="al-phone-banner">
                  <div className="al-phone-banner-top">同城活动</div>
                  <div className="al-phone-banner-pill">百聊不如一见</div>
                  <div className="al-phone-banner-sub">同城相亲 交流活动</div>
                  <div className="al-phone-banner-btn">
                    <span className="al-phone-banner-btn-pink">线下活动</span>
                    <span className="al-phone-banner-btn-yellow">线上互选</span>
                  </div>
                  <div className="al-phone-qr">
                    <div className="al-phone-qr-grid">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className="al-phone-qr-cell" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="al-phone-poster">
                  <div className="al-phone-poster-text">单身青年<br />免费择偶<br />竞争力评分</div>
                </div>
                <div className="al-phone-poster-small">
                  <div className="al-phone-poster-small-text">1年内结婚 专场脱单</div>
                </div>
                <div className="al-phone-card">
                  <div className="al-phone-card-cover" />
                  <div className="al-phone-card-info">
                    <div className="al-phone-card-name">7.26 一年内结婚专场</div>
                    <div className="al-phone-card-tag">报名专享 · 7.26 14点 持续进行中</div>
                  </div>
                </div>
                <div className="al-phone-tab-bar">
                  <span className="al-phone-tab">最新发布</span>
                  <span className="al-phone-tab">会员专区</span>
                  <span className="al-phone-tab">已订婚会员</span>
                  <span className="al-phone-tab">脱单情报员</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}