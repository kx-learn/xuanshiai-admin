"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { useState } from "react";

const TABS = [
  { key: "basic", label: "基本配置" },
  { key: "mode", label: "运营模式" },
  { key: "guide", label: "信息登记引导页配置" },
  { key: "profile", label: "基本资料登记配置" },
  { key: "private", label: "私密信息登记与展示配置" },
  { key: "filter", label: "筛选功能配置" },
];

/** 通用开关：on=蓝底白字，off=灰底白字 */
function Switch({ on, onChange, onText = "开", offText = "关", width = 46 }: { on: boolean; onChange: (v: boolean) => void; onText?: string; offText?: string; width?: number }) {
  return (
    <button
      type="button"
      className={`pcfg-switch${on ? " on" : ""}`}
      style={{ width }}
      onClick={() => onChange(!on)}
    >
      <span className="pcfg-switch-text">{on ? onText : offText}</span>
      <span className="pcfg-switch-knob" />
    </button>
  );
}

/** 排序链接：提供 上移/下移，第一行无上移、最后一行无下移 */
function SortLinks({ index, total, onMove }: { index: number; total: number; onMove: (from: number, to: number) => void }) {
  const hasUp = index > 0;
  const hasDown = index < total - 1;
  return (
    <span className="pcfg-sort">
      {hasUp && (
        <button type="button" className="pcfg-sort-btn" onClick={() => onMove(index, index - 1)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
          上移
        </button>
      )}
      {hasDown && (
        <button type="button" className="pcfg-sort-btn" onClick={() => onMove(index, index + 1)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
          下移
        </button>
      )}
    </span>
  );
}

/** 淡蓝须知框 */
function Notice({ text }: { text: string }) {
  return (
    <div className="pcfg-notice">
      <span className="pcfg-notice-icon"><svg width="12" height="12" viewBox="0 0 1024 1024" fill="currentColor"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zM464 336c0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48-48-21.5-48-48zm72 304c0 13.3-10.7 24-24 24s-24-10.7-24-24V480h-8c-13.3 0-24-10.7-24-24s10.7-24 24-24h32c13.3 0 24 10.7 24 24v160z"/></svg></span>
      <span className="pcfg-notice-text">{text}</span>
    </div>
  );
}

/* ==================== 基本配置数据 ==================== */
const PERMISSIONS = [
  { label: "所有入口可见", value: "all" },
  { label: "会员注册流程可见", value: "register" },
  { label: "仅会员可见", value: "member" },
  { label: "隐藏", value: "hidden" },
];

/** 上传图块：预览图(底部叠上传条) + 可选 云端素材 按钮 */
function UploadBox({ previewText, dark = true, cloud = false, tip, onUpload, onReset }: {
  previewText?: string;
  dark?: boolean;
  cloud?: boolean;
  tip?: string;
  onUpload?: () => void;
  onReset?: () => void;
}) {
  const [filled, setFilled] = useState(false);
  return (
    <div className="pcfg-upload-group">
      <div className="pcfg-upload-row">
        <div className={`pcfg-upload${filled ? " filled" : ""}`}>
          {filled ? (
            <span className="pcfg-upload-thumb">图</span>
          ) : (
            <span className="pcfg-upload-placeholder">{previewText ?? "预览图"}</span>
          )}
          <button
            type="button"
            className={`pcfg-upload-overlay${dark ? " dark" : ""}`}
            onClick={() => { setFilled(true); onUpload?.(); }}
          >
            上传图片
          </button>
        </div>
        {cloud && (
          <button type="button" className="pcfg-cloud-btn" title="云端素材">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 16.5A4.5 4.5 0 0 1 6.5 8.2a6 6 0 0 1 11.6-1.2A4.5 4.5 0 0 1 20 16.5H4z"/></svg>
            云端素材
          </button>
        )}
      </div>
      {tip && (
        <div className="pcfg-tipbox">
          <span className="pcfg-tip-icon">i</span>
          {tip}
        </div>
      )}
      {onReset && (
        <button type="button" className="pcfg-reset-btn" onClick={onReset}>
          恢复默认
        </button>
      )}
    </div>
  );
}

const BREADCRUMB = getBreadcrumb("平台配置", "基本配置");

export default function PlatformConfigBasicPage() {
  const [activeTab, setActiveTab] = useState("basic");

  // 基本配置
  const [platformName, setPlatformName] = useState("宣智爱");
  const [slogan, setSlogan] = useState("你的爱值得被宣告");
  const [shareTitle, setShareTitle] = useState("点击立即体验「宣智爱」本地实名社交婚恋平台");
  const [shareSummary, setShareSummary] = useState("一个有趣、有料、真实、优质的社交活动平台。");
  const [pushSummary, setPushSummary] = useState("点击底部+立即脱单！实名认证/线上相识/联谊活动/线下的约");
  const [nativePlace, setNativePlace] = useState("江苏省 / 南京市");
  const [livePlace, setLivePlace] = useState("江苏省 / 南京市");
  const [maleAvatar, setMaleAvatar] = useState(false);
  const [femaleAvatar, setFemaleAvatar] = useState(false);

  // 运营模式
  const [mode, setMode] = useState("online-offline");

  // 信息登记引导页配置
  const [guideRows, setGuideRows] = useState([
    { id: 1, title: "自己找对象", desc: "我单身，我自己找对象", show: true },
    { id: 2, title: "我是父母", desc: "替子女登记信息找对象", show: true },
    { id: 3, title: "找搭子", desc: "认识一群兴趣相投的人", show: true },
    { id: 4, title: "当红娘", desc: "当红娘，我推荐单身", show: true },
  ]);

  // 基本资料登记配置
  const [profileSubtitle, setProfileSubtitle] = useState("");
  const [profileRows, setProfileRows] = useState([
    { id: 1, field: "性别", guide: "您的性别", flow: "required" as "required" | "on" | "off" },
    { id: 2, field: "头像", guide: "头像选的好，对象少不了", flow: "required" as "required" | "on" | "off" },
    { id: 3, field: "相册", guide: "请上传您的照片，越多越好", flow: "off" as "required" | "on" | "off" },
    { id: 4, field: "姓名", guide: "填写您的真实姓名", flow: "off" as "required" | "on" | "off" },
    { id: 5, field: "家乡", guide: "您的老家是哪里的", flow: "on" as "required" | "on" | "off" },
    { id: 6, field: "户口", guide: "您的户口在哪里？", flow: "off" as "required" | "on" | "off" },
    { id: 7, field: "现居地", guide: "您的工作地区", flow: "on" as "required" | "on" | "off" },
    { id: 8, field: "身高", guide: "您的身高是多少", flow: "on" as "required" | "on" | "off" },
    { id: 9, field: "体重", guide: "您的体重是多少", flow: "on" as "required" | "on" | "off" },
    { id: 10, field: "学历", guide: "您的最高学历", flow: "on" as "required" | "on" | "off" },
    { id: 11, field: "毕业学校", guide: "填写您的毕业学校名称", flow: "off" as "required" | "on" | "off" },
    { id: 12, field: "职业", guide: "您从事何种工作", flow: "on" as "required" | "on" | "off" },
    { id: 13, field: "工作单位", guide: "填写您的工作单位名称", flow: "off" as "required" | "on" | "off" },
    { id: 14, field: "收入", guide: "您的收入状况", flow: "on" as "required" | "on" | "off" },
    { id: 15, field: "婚况", guide: "您的婚姻状况", flow: "on" as "required" | "on" | "off" },
    { id: 16, field: "性格", guide: "您的性格", flow: "off" as "required" | "on" | "off" },
    { id: 17, field: "爱好", guide: "您的爱好", flow: "off" as "required" | "on" | "off" },
    { id: 18, field: "民族", guide: "您的民族", flow: "off" as "required" | "on" | "off" },
    { id: 19, field: "吸烟", guide: "您的吸烟状况", flow: "off" as "required" | "on" | "off" },
    { id: 20, field: "喝酒", guide: "您的饮酒状况", flow: "off" as "required" | "on" | "off" },
    { id: 21, field: "购房情况", guide: "您的购房状况", flow: "off" as "required" | "on" | "off" },
    { id: 22, field: "购车情况", guide: "您的购车状况", flow: "off" as "required" | "on" | "off" },
    { id: 23, field: "宗教信仰", guide: "您的宗教信仰", flow: "off" as "required" | "on" | "off" },
    { id: 24, field: "结婚意向", guide: "您的结婚意向", flow: "off" as "required" | "on" | "off" },
    { id: 25, field: "择偶要求", guide: "您的基本择偶要求", flow: "on" as "required" | "on" | "off" },
    { id: 26, field: "联系方式", guide: "您的微信号", flow: "required" as "required" | "on" | "off" },
  ]);

  // 私密信息登记与展示配置
  const privateFields = [
    ["民族", "您是哪个民族的"], ["身材体型", "您的身材体型属于哪个类型？"], ["脸型类型", "您的脸型"],
    ["皮肤类型", "您皮肤类型"], ["眼睛类型", "您的眼睛类型"], ["恋爱经历", "谈过几次恋爱？"],
    ["最长恋爱", "最长的恋爱谈了多久？"], ["单身时长", "距离上次恋爱结束单身多久了？"], ["工作情况", "您的工作情况"],
    ["孩子情况", "您是否有孩子"], ["身体情况", "您是否有残疾"], ["传染病", "是否有传染性疾病"],
    ["遗传病史", "是否有遗传病史"], ["不良嗜好", "是否有不良嗜好"], ["犯罪记录", "是否有过犯罪记录"],
    ["休息时间", "您工作的休息时间"], ["父母婚况", "您父母的婚姻状况是？"], ["家庭结构", "您的家庭结构是？"],
    ["独生子女", "您是否是独生子女？"], ["家庭成员", "您家里有哪些成员"], ["家中排行", "您在家中排行老几？"],
    ["父亲年龄", "您父亲多大了"], ["父亲职业", "您父亲的职业是？"], ["父亲健康", "您的父亲身体健康情况"],
    ["父亲退休情况", "您的父亲的退休情况"], ["母亲年龄", "您母亲多大了？"], ["母亲职业", "您母亲的职业是？"],
    ["母亲健康", "您的母亲身体健康情况"], ["母亲退休情况", "您的母亲的退休情况"],
  ] as [string, string][];
  const [privateRows, setPrivateRows] = useState(
    privateFields.map(([name, guide], i) => ({
      id: i + 1,
      name,
      guide,
      inRegister: i === 0, // 第一行「民族」加入注册=开
      inEdit: false,
      inDetail: false,
    })),
  );

  // 筛选功能配置
  const [filterRows, setFilterRows] = useState([
    { id: 1, name: "籍贯", open: true, perm: "all" },
    { id: 2, name: "户口", open: true, perm: "all" },
    { id: 3, name: "现居", open: true, perm: "all" },
    { id: 4, name: "年龄", open: true, perm: "all" },
    { id: 5, name: "身高", open: true, perm: "all" },
    { id: 6, name: "性别", open: true, perm: "all" },
    { id: 7, name: "学历", open: true, perm: "complete" },
    { id: 8, name: "职业", open: true, perm: "complete" },
    { id: 9, name: "收入", open: true, perm: "complete" },
    { id: 10, name: "婚况", open: true, perm: "complete" },
    { id: 11, name: "购房", open: true, perm: "complete" },
    { id: 12, name: "购车", open: true, perm: "complete" },
    { id: 13, name: "吸烟", open: true, perm: "complete" },
    { id: 14, name: "喝酒", open: true, perm: "complete" },
    { id: 15, name: "认证", open: true, perm: "vip" },
    { id: 16, name: "VIP", open: true, perm: "vip" },
    { id: 17, name: "民族", open: true, perm: "all" },
    { id: 18, name: "宗教", open: true, perm: "all" },
  ]);

  const moveRow = <T,>(rows: T[], index: number, to: number): T[] => {
    if (to < 0 || to >= rows.length) return rows;
    const next = [...rows];
    [next[index], next[to]] = [next[to], next[index]];
    return next;
  };

  return (
    <div className="pcfg-page">
      {/* 面包屑 */}
      <AdminBreadcrumb items={BREADCRUMB} />

      <div className="pcfg-card">
        {/* 顶部 tab */}
        <div className="pcfg-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`pcfg-tab${activeTab === t.key ? " active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="pcfg-tab-body">
          {/* ========== Tab 1：基本配置 ========== */}
          {activeTab === "basic" && (
            <div className="pcfg-basic-wrap">
              <div className="pcfg-basic-form">
                <div className="pcfg-field">
                  <span className="pcfg-label">平台名称</span>
                  <input className="pcfg-input" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">平台宣传标语</span>
                  <input className="pcfg-input" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">PC端Logo</span>
                  <UploadBox tip="最佳尺寸：190像素x60像素，点击可重新上传" />
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">PC引导页图</span>
                  <UploadBox tip="最佳尺寸：320像素x691像素，点击可重新上传" />
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">抖音二维码</span>
                  <UploadBox tip="最佳尺寸：300像素x300像素，点击可重新上传" />
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">首页分享标题</span>
                  <input className="pcfg-input" value={shareTitle} onChange={(e) => setShareTitle(e.target.value)} />
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">首页分享摘要</span>
                  <input className="pcfg-input" value={shareSummary} onChange={(e) => setShareSummary(e.target.value)} />
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">推送消息摘要</span>
                  <div className="pcfg-field-col">
                    <input className="pcfg-input" value={pushSummary} onChange={(e) => setPushSummary(e.target.value)} />
                    <div className="pcfg-tipbox">
                      <span className="pcfg-tip-icon">i</span>
                      公众号推送消息的摘要内容
                    </div>
                  </div>
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">首页分享图片</span>
                  <UploadBox cloud tip="最佳尺寸：300像素x300像素，点击可重新上传" />
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">微信一键登录页LOGO</span>
                  <UploadBox cloud tip="最佳尺寸：300像素x300像素，点击可重新上传" />
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">登录页标语</span>
                  <UploadBox previewText="字" tip="要求：透明PNG格式，黑色字体，最佳尺寸：446像素x34像素" onReset={() => {}} />
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">默认籍贯地</span>
                  <div className="pcfg-select">
                    <select value={nativePlace} onChange={(e) => setNativePlace(e.target.value)}>
                      <option value="江苏省 / 南京市">江苏省 / 南京市</option>
                      <option value="上海市 / 上海市">上海市 / 上海市</option>
                      <option value="北京市 / 北京市">北京市 / 北京市</option>
                    </select>
                    <svg className="pcfg-select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">默认现居地</span>
                  <div className="pcfg-select">
                    <select value={livePlace} onChange={(e) => setLivePlace(e.target.value)}>
                      <option value="江苏省 / 南京市">江苏省 / 南京市</option>
                      <option value="上海市 / 上海市">上海市 / 上海市</option>
                      <option value="北京市 / 北京市">北京市 / 北京市</option>
                    </select>
                    <svg className="pcfg-select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label">自定义默认头像设置</span>
                  <div className="pcfg-avatar-group">
                    <div className="pcfg-avatar-item">
                      <div className={`pcfg-avatar${maleAvatar ? " filled" : ""}`}>
                        {maleAvatar ? <span className="pcfg-avatar-thumb">男</span> : <span className="pcfg-avatar-placeholder">男</span>}
                        <button type="button" className="pcfg-avatar-overlay" onClick={() => setMaleAvatar(true)}>上传图片</button>
                      </div>
                      <button type="button" className="pcfg-cloud-btn">从云端素材选择</button>
                      <span className="pcfg-avatar-name">男会员缺省头像</span>
                    </div>
                    <div className="pcfg-avatar-item">
                      <div className={`pcfg-avatar${femaleAvatar ? " filled" : ""}`}>
                        {femaleAvatar ? <span className="pcfg-avatar-thumb">女</span> : <span className="pcfg-avatar-placeholder">女</span>}
                        <button type="button" className="pcfg-avatar-overlay" onClick={() => setFemaleAvatar(true)}>上传图片</button>
                      </div>
                      <button type="button" className="pcfg-cloud-btn">从云端素材选择</button>
                      <span className="pcfg-avatar-name">女会员缺省头像</span>
                    </div>
                  </div>
                </div>

                <div className="pcfg-field">
                  <span className="pcfg-label" />
                  <button type="button" className="pcfg-submit">确定提交</button>
                </div>
              </div>

              {/* 右侧分享效果预览 */}
              <aside className="pcfg-preview">
                <div className="pcfg-preview-title">分享效果预览</div>
                <div className="pcfg-preview-card">
                  <div className="pcfg-preview-text">{shareTitle || "点击立即体验「宣智爱」本地实名社交婚恋平台"}</div>
                  <div className="pcfg-preview-sub">{shareSummary || "一个有趣、有料、真实、优质的社交活动平台。"}</div>
                  <div className="pcfg-preview-tag">宣智爱</div>
                </div>
              </aside>
            </div>
          )}

          {/* ========== Tab 2：运营模式 ========== */}
          {activeTab === "mode" && (
            <div className="pcfg-mode-wrap">
              <div className="pcfg-field">
                <span className="pcfg-label">选择模式</span>
                <div className="pcfg-radio-wrap">
                  {[
                    { value: "online-offline", label: "全平台线上牵线+引导线下模式" },
                    { value: "offline-only", label: "全平台纯线下模式" },
                    { value: "member-offline", label: "指定会员为纯线下模式" },
                  ].map((opt) => (
                    <label key={opt.value} className="pcfg-radio">
                      <input type="radio" name="mode" value={opt.value} checked={mode === opt.value} onChange={() => setMode(opt.value)} />
                      <span className="pcfg-radio-dot" />
                      <span className="pcfg-radio-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pcfg-mode-notice">
                <span className="pcfg-mode-notice-icon">i</span>
                该模式下平台以促成会员之间自愿交换微信为交付标准的线上牵线服务，并引导会员到门店购买1对1线下约见服务，形成线上+线下一体化结合运营模式。
              </div>

              <div className="pcfg-mode-figure">
                <div className="pcfg-phone">
                  <div className="pcfg-phone-head"><span className="pcfg-phone-dot" /><span className="pcfg-phone-title">红娘中心</span><span className="pcfg-phone-dot" /></div>
                  <div className="pcfg-phone-body">
                    <div className="pcfg-phone-photo" />
                    <div className="pcfg-phone-line" />
                    <div className="pcfg-phone-line short" />
                    <div className="pcfg-phone-btn">申请红娘牵线</div>
                  </div>
                </div>
                <div className="pcfg-phone">
                  <div className="pcfg-phone-head"><span className="pcfg-phone-dot" /><span className="pcfg-phone-title">无牵线服务</span><span className="pcfg-phone-dot" /></div>
                  <div className="pcfg-phone-body">
                    <div className="pcfg-phone-sad">☹</div>
                    <div className="pcfg-phone-line" />
                    <div className="pcfg-phone-btn light">开通VIP会员</div>
                    <div className="pcfg-phone-btn light">红娘牵线服务套餐</div>
                  </div>
                </div>
                <svg className="pcfg-mode-arrow" width="90" height="40" viewBox="0 0 90 40" fill="none" stroke="#ff5a5f" strokeWidth="2" strokeDasharray="5,4" strokeLinecap="round"><path d="M4 34 C 30 34, 50 22, 60 12 M60 12 L50 14 M60 12 L58 22" /></svg>
              </div>

              <div className="pcfg-field">
                <span className="pcfg-label" />
                <button type="button" className="pcfg-submit">确定提交</button>
              </div>
            </div>
          )}

          {/* ========== Tab 3：信息登记引导页配置 ========== */}
          {activeTab === "guide" && (
            <div>
              <Notice text="您可以隐藏不需要的类别、自由设置引导标题、描述、显示排序" />
              <div className="pcfg-table-guide">
                <table>
                  <thead>
                    <tr className="pcfg-tr-head">
                      <th className="pcfg-th w-id">ID</th>
                      <th className="pcfg-th">标题</th>
                      <th className="pcfg-th">描述</th>
                      <th className="pcfg-th w-show">是否展示</th>
                      <th className="pcfg-th w-sort">排序</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guideRows.map((row, i) => (
                      <tr key={row.id} className="pcfg-tr">
                        <td className="pcfg-td w-id">{row.id}</td>
                        <td className="pcfg-td"><input className="pcfg-input-inline" value={row.title} onChange={(e) => setGuideRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, title: e.target.value } : r)))} /></td>
                        <td className="pcfg-td"><input className="pcfg-input-inline" value={row.desc} onChange={(e) => setGuideRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, desc: e.target.value } : r)))} /></td>
                        <td className="pcfg-td w-show"><Switch on={row.show} onChange={(v) => setGuideRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, show: v } : r)))} /></td>
                        <td className="pcfg-td w-sort"><SortLinks index={i} total={guideRows.length} onMove={(from, to) => setGuideRows((prev) => moveRow(prev, from, to))} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========== Tab 4：基本资料登记配置 ========== */}
          {activeTab === "profile" && (
            <div>
              <Notice text="您可以在这里自由设置会员登记注册流程引导文案；您还可以将“私密信息”的字段加入到会员登记注册流程中" />
              <div className="pcfg-subtitle-field">
                <span className="pcfg-label">资料登记页统一副标题</span>
                <input className="pcfg-input-inline" value={profileSubtitle} onChange={(e) => setProfileSubtitle(e.target.value)} />
              </div>
              <div className="pcfg-table-guide">
                <table>
                  <thead>
                    <tr className="pcfg-tr-head">
                      <th className="pcfg-th w-id">排序</th>
                      <th className="pcfg-th">资料登记字段</th>
                      <th className="pcfg-th">引导文案</th>
                      <th className="pcfg-th w-show">加入到会员注册流程</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profileRows.map((row) => (
                      <tr key={row.id} className="pcfg-tr">
                        <td className="pcfg-td w-id">{row.id}</td>
                        <td className="pcfg-td">{row.field}</td>
                        <td className="pcfg-td"><input className="pcfg-input-inline" value={row.guide} onChange={(e) => setProfileRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, guide: e.target.value } : r)))} /></td>
                        <td className="pcfg-td w-show">
                          {row.flow === "required" ? (
                            <span className="pcfg-required-text">必选项</span>
                          ) : (
                            <Switch width={54} on={row.flow === "on"} onText="是" offText="否" onChange={(v) => setProfileRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, flow: v ? "on" : "off" } : r)))} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========== Tab 5：私密信息登记与展示配置 ========== */}
          {activeTab === "private" && (
            <div className="pcfg-table-private">
              <table>
                <thead>
                  <tr className="pcfg-tr-head">
                    <th className="pcfg-th w-id">ID</th>
                    <th className="pcfg-th">数据项目</th>
                    <th className="pcfg-th w-switch">是否加入到会员注册流程</th>
                    <th className="pcfg-th w-switch">是否展示在编辑资料</th>
                    <th className="pcfg-th">引导文案</th>
                    <th className="pcfg-th w-switch">是否展示在会员详情页</th>
                    <th className="pcfg-th w-sort">排序</th>
                  </tr>
                </thead>
                <tbody>
                  {privateRows.map((row, i) => (
                    <tr key={row.id} className="pcfg-tr">
                      <td className="pcfg-td w-id">{row.id}</td>
                      <td className="pcfg-td">{row.name}</td>
                      <td className="pcfg-td w-switch"><Switch on={row.inRegister} onChange={(v) => setPrivateRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, inRegister: v } : r)))} /></td>
                      <td className="pcfg-td w-switch"><Switch on={row.inEdit} onChange={(v) => setPrivateRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, inEdit: v } : r)))} /></td>
                      <td className="pcfg-td"><input className="pcfg-input-inline" value={row.guide} onChange={(e) => setPrivateRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, guide: e.target.value } : r)))} /></td>
                      <td className="pcfg-td w-switch"><Switch on={row.inDetail} onChange={(v) => setPrivateRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, inDetail: v } : r)))} /></td>
                      <td className="pcfg-td w-sort"><SortLinks index={i} total={privateRows.length} onMove={(from, to) => setPrivateRows((prev) => moveRow(prev, from, to))} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ========== Tab 6：筛选功能配置 ========== */}
          {activeTab === "filter" && (
            <div>
              <Notice text="您可以在这里自定义设置每个筛选条件的使用权限，将有利于引导促进用户完善资料、开通VIP会员" />
              <div className="pcfg-table-filter">
                <table>
                  <thead>
                    <tr className="pcfg-tr-head">
                      <th className="pcfg-th">筛选条件</th>
                      <th className="pcfg-th w-switch">开通/关闭</th>
                      <th className="pcfg-th w-sort">排序</th>
                      <th className="pcfg-th">使用权限</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterRows.map((row, i) => (
                      <tr key={row.id} className="pcfg-tr">
                        <td className="pcfg-td">{row.name}</td>
                        <td className="pcfg-td w-switch"><Switch width={64} on={row.open} onText="开通" offText="关闭" onChange={(v) => setFilterRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, open: v } : r)))} /></td>
                        <td className="pcfg-td w-sort"><SortLinks index={i} total={filterRows.length} onMove={(from, to) => setFilterRows((prev) => moveRow(prev, from, to))} /></td>
                        <td className="pcfg-td">
                          <div className="pcfg-select">
                            <select value={row.perm} onChange={(e) => setFilterRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, perm: e.target.value } : r)))}>
                              <option value="all">所有人可用</option>
                              <option value="complete">需完善资料可用</option>
                              <option value="vip">仅VIP会员可用</option>
                            </select>
                            <svg className="pcfg-select-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
