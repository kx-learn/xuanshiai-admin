"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

/* ------------------------------------------------------------------ */
/* 通用小组件                                                          */
/* ------------------------------------------------------------------ */

/* 圆形单选（复用 pcfg-radio） */
function Radio({
  checked,
  label,
  note,
  onClick,
}: {
  checked: boolean;
  label?: string;
  note?: string;
  onClick: () => void;
}) {
  return (
    <>
      <span className="pcfg-radio" onClick={onClick}>
        <input type="radio" readOnly checked={checked} />
        <i className="pcfg-radio-dot"></i>
        {label && <span className="pcfg-radio-label">{label}</span>}
      </span>
      {note && <span className="pm-note">{note}</span>}
    </>
  );
}

/* 权限卡片：标题（可带右上工具）+ 内容 */
function Card({
  title,
  tools,
  children,
}: {
  title: string;
  tools?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-card pm-card">
      <div className="pm-card-head">
        <div className="pm-card-title">{title}</div>
        {tools && <div className="pm-card-tools">{tools}</div>}
      </div>
      <div className="admin-card-body pm-card-body">{children}</div>
    </div>
  );
}

/* 设置行：左侧 label + 右侧内容 */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pm-row">
      <span className="pm-row-label">{label}</span>
      <div className="pm-row-body">{children}</div>
    </div>
  );
}

/* 蓝底信息框（可缩进到内容列） */
function Info({ indent, children }: { indent?: boolean; children: React.ReactNode }) {
  return (
    <div className={`pm-info ${indent ? "pm-info-indent" : ""}`}>
      <svg className="pm-info-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5m0-8h.01" />
      </svg>
      <div className="pm-info-body">{children}</div>
    </div>
  );
}

/* 迷你数字输入框（图片/视频数量、次数、页数） */
function MiniInput({ value, width = 56, onChange }: { value: string; width?: number; onChange: (v: string) => void }) {
  return (
    <input
      className="pm-mini-input"
      style={{ width }}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 主页面                                                              */
/* ------------------------------------------------------------------ */

export default function PowerConfigPage() {
  /* 卡片1 平台浏览展示权限 */
  const [browse, setBrowse] = useState({
    gender: "same", // 默认显示：异性/同性/所有
    pageLimit: "2", // 未完善资料用户浏览量限制（页数）
    otherPage: "allow", // 进入其他会员资料页权限（未完善资料）：禁止/允许
    single: "hide", // 已脱单会员是否展示：展示/隐藏
  });

  /* 卡片2 会员资料页内容查看权限 */
  const [view, setView] = useState({
    photo: "1", // 非VIP可浏览照片数量
    video: "0", // 非VIP可浏览视频数量
    voice: "vip", // 语音介绍收听权限：all/vip
    hongniang: "vip", // 红娘说查看权限
    mate: "vip", // 择偶要求查看权限
    profile: "all", // 个人资料查看权限
    intro: "vip", // 自我介绍查看权限
    more: "vip", // 更多资料查看权限
  });

  /* 卡片3 会员状态更改权限 */
  const [stateAuth, setStateAuth] = useState({
    delegate: "diamond", // 委托红娘
    secret: "diamond", // 完全私密
    pause: "no", // 暂停服务：yes/no
    single: "no", // 我已脱单：yes/no
  });

  /* 卡片4 会员线上牵线权限 */
  const [line, setLine] = useState({
    realname: "no", // 没有实名认证是否允许发起牵线：yes/no
    agreement: "no", // 没有签署承诺书是否允许发起牵线：yes/no
    times: "0", // 发起线上牵线的次数限制（次/天）
    beLinked: "no", // 没有实名认证的是否允许被牵线：yes/no
  });

  /* 卡片5 其他权限配置 */
  const [other, setOther] = useState({
    idcard: "off", // 实名时是否强制上传身份证照片：off=不强制/on=强制
    hongniangShow: "on", // 会员中心是否展示专属红娘：on=显示/off=隐藏
    multiAccount: "no", // 同一身份证号是否允许实名多个账号：yes/no
    avatar: "on", // 强制用户上传头像：on=开启/off=关闭
    photo: "on", // 强制用户上传照片
    martial: "no", // 是否允许会员自行修改婚况：yes/no
    edu: "no", // 是否允许会员自行修改学历：yes/no
  });

  /* 卡片4「图文解说」点击态（仅弹提示，前端模拟） */
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <div className="pm-page">
      <AdminBreadcrumb
        items={[{ label: "首页", href: "/" }, { label: "平台配置", href: "/platform-config-basic" }, { label: "权限配置" }]}
      />

      {/* 须知 */}
      <div className="nv-notice">
        <span className="nv-notice-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></svg>
        </span>
        <div className="nv-notice-body">
          <div className="nv-notice-title">须知</div>
          <div className="nv-notice-line">下面配置权限中提到的VIP会员：指线上VIP会员；</div>
          <div className="nv-notice-line">会员：是指在平台中注册并完善了个人信息，已存在于“会员CRM库中”；</div>
          <div className="nv-notice-line">用户：是指只是在平台中注册了一个账号，并没有去完善相亲资料，仅存在于“用户管理”中。</div>
        </div>
      </div>

      {/* ===================== 卡片1 平台浏览展示权限 ===================== */}
      <Card title="平台浏览展示权限">
        <Row label="会员登录后在平台中默认显示">
          <Radio checked={browse.gender === "man"} label="异性资料" onClick={() => setBrowse({ ...browse, gender: "man" })} />
          <Radio checked={browse.gender === "same"} label="同性资料" onClick={() => setBrowse({ ...browse, gender: "same" })} />
          <Radio checked={browse.gender === "all"} label="所有性别资料" onClick={() => setBrowse({ ...browse, gender: "all" })} />
        </Row>

        <Row label="未完善资料的用户浏览量限制">
          <MiniInput value={browse.pageLimit} onChange={(v) => setBrowse({ ...browse, pageLimit: v })} />
          <span className="pm-inline-unit">页</span>
          <Radio
            checked
            note="每页显示10人，超过这个页数后，将提示必须是相亲会员才可以浏览更多"
            onClick={() => {}}
          />
        </Row>

        <Row label="进入其他会员的资料页的权限">
          <span className="pm-inline-label">未完善资料:</span>
          <Radio checked={browse.otherPage === "forbid"} label="禁止" onClick={() => setBrowse({ ...browse, otherPage: "forbid" })} />
          <Radio checked={browse.otherPage === "allow"} label="允许" onClick={() => setBrowse({ ...browse, otherPage: "allow" })} />
        </Row>

        <Row label="已脱单会员是否展示">
          <Radio checked={browse.single === "show"} label="展示" onClick={() => setBrowse({ ...browse, single: "show" })} />
          <Radio checked={browse.single === "hide"} label="隐藏" note='，仅在“官宣”列表中显示' onClick={() => setBrowse({ ...browse, single: "hide" })} />
        </Row>

        <div className="pm-submit">
          <button type="button" className="nv-ok-btn pm-submit-btn">确定提交</button>
        </div>
      </Card>

      {/* ===================== 卡片2 会员资料页内容查看权限 ===================== */}
      <Card title="会员资料页内容查看权限">
        <Row label="照片视频查看权限">
          <span className="pm-inline-label">非VIP会员可浏览照片数量</span>
          <MiniInput value={view.photo} onChange={(v) => setView({ ...view, photo: v })} />
          <span className="pm-inline-unit">张，非VIP会员可浏览视频数量</span>
          <MiniInput value={view.video} onChange={(v) => setView({ ...view, video: v })} />
          <span className="pm-inline-unit">个</span>
        </Row>

        <Row label="语音介绍收听权限">
          <Radio checked={view.voice === "all"} label="所有会员可播放" onClick={() => setView({ ...view, voice: "all" })} />
          <Radio checked={view.voice === "vip"} label="仅VIP会员可播放" onClick={() => setView({ ...view, voice: "vip" })} />
        </Row>

        <Row label="红娘说查看权限">
          <Radio checked={view.hongniang === "all"} label="所有会员可查看" onClick={() => setView({ ...view, hongniang: "all" })} />
          <Radio checked={view.hongniang === "vip"} label="仅VIP会员可查看" onClick={() => setView({ ...view, hongniang: "vip" })} />
        </Row>

        <Row label="择偶要求查看权限">
          <Radio checked={view.mate === "all"} label="所有会员可查看" onClick={() => setView({ ...view, mate: "all" })} />
          <Radio checked={view.mate === "vip"} label="仅VIP会员可查看" onClick={() => setView({ ...view, mate: "vip" })} />
        </Row>

        <Row label="个人资料查看权限">
          <Radio checked={view.profile === "all"} label="所有会员可查看" onClick={() => setView({ ...view, profile: "all" })} />
          <Radio checked={view.profile === "vip"} label="仅VIP会员可查看" onClick={() => setView({ ...view, profile: "vip" })} />
        </Row>

        <Row label="自我介绍查看权限">
          <Radio checked={view.intro === "all"} label="所有会员可查看" onClick={() => setView({ ...view, intro: "all" })} />
          <Radio checked={view.intro === "vip"} label="仅VIP会员可查看" onClick={() => setView({ ...view, intro: "vip" })} />
        </Row>

        <Row label="更多资料查看权限">
          <Radio checked={view.more === "all"} label="所有会员可查看" onClick={() => setView({ ...view, more: "all" })} />
          <Radio checked={view.more === "vip"} label="仅VIP会员可查看" onClick={() => setView({ ...view, more: "vip" })} />
        </Row>

        <div className="pm-submit">
          <button type="button" className="nv-ok-btn pm-submit-btn">确定提交</button>
        </div>
      </Card>

      {/* ===================== 卡片3 会员状态更改权限 ===================== */}
      <Card title="会员状态更改权限">
        <Info>
          这里是指会员自己在“会员中心-状态设置”的设置权限，这些状态的名称和描述文案在这里可以配置。
        </Info>

        <Row label="委托红娘">
          <Radio checked={stateAuth.delegate === "self"} label="所有会员可自己设置" onClick={() => setStateAuth({ ...stateAuth, delegate: "self" })} />
          <Radio checked={stateAuth.delegate === "silver"} label="VIP-银卡会员及以上" onClick={() => setStateAuth({ ...stateAuth, delegate: "silver" })} />
          <Radio checked={stateAuth.delegate === "gold"} label="VIP-金卡会员及以上" onClick={() => setStateAuth({ ...stateAuth, delegate: "gold" })} />
          <Radio checked={stateAuth.delegate === "diamond"} label="VIP-钻石会员" onClick={() => setStateAuth({ ...stateAuth, delegate: "diamond" })} />
        </Row>

        <Row label="完全私密">
          <Radio checked={stateAuth.secret === "self"} label="所有会员可自己设置" onClick={() => setStateAuth({ ...stateAuth, secret: "self" })} />
          <Radio checked={stateAuth.secret === "silver"} label="VIP-银卡会员及以上" onClick={() => setStateAuth({ ...stateAuth, secret: "silver" })} />
          <Radio checked={stateAuth.secret === "gold"} label="VIP-金卡会员及以上" onClick={() => setStateAuth({ ...stateAuth, secret: "gold" })} />
          <Radio checked={stateAuth.secret === "diamond"} label="VIP-钻石会员" onClick={() => setStateAuth({ ...stateAuth, secret: "diamond" })} />
          <Radio checked={stateAuth.secret === "no"} label="不允许会员自己设置" onClick={() => setStateAuth({ ...stateAuth, secret: "no" })} />
        </Row>

        <Row label="暂停服务">
          <Radio checked={stateAuth.pause === "yes"} label="允许会员自己设置" onClick={() => setStateAuth({ ...stateAuth, pause: "yes" })} />
          <Radio checked={stateAuth.pause === "no"} label="不允许会员自己设置" note="（会员操作时弹出提示“请联系您的红娘”）" onClick={() => setStateAuth({ ...stateAuth, pause: "no" })} />
        </Row>

        <Row label="我已脱单">
          <Radio checked={stateAuth.single === "yes"} label="允许会员自己设置" onClick={() => setStateAuth({ ...stateAuth, single: "yes" })} />
          <Radio checked={stateAuth.single === "no"} label="不允许会员自己设置" note="（会员操作时弹出提示“请联系您的红娘”）" onClick={() => setStateAuth({ ...stateAuth, single: "no" })} />
        </Row>

        <div className="pm-submit">
          <button type="button" className="nv-ok-btn pm-submit-btn">确定提交</button>
        </div>
      </Card>

      {/* ===================== 卡片4 会员线上牵线权限 ===================== */}
      <Card
        title="会员线上牵线权限"
        tools={
          <button type="button" className="pm-tool-sm" onClick={() => setGuideOpen(!guideOpen)}>
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></svg>
            图文解说
          </button>
        }
      >
        {guideOpen && (
          <Info>
            “发起牵线”是指会员主动向他人发起牵线申请；被牵线人需要完成实名认证与承诺书签署后方可正常牵线。
          </Info>
        )}

        <Row label="没有实名认证是否允许发起牵线">
          <Radio checked={line.realname === "yes"} label="允许" onClick={() => setLine({ ...line, realname: "yes" })} />
          <Radio checked={line.realname === "no"} label="禁止" note="（会弹出提示要求先进行实名认证，并自动转到认证提交页面）" onClick={() => setLine({ ...line, realname: "no" })} />
        </Row>

        <Row label="没有签署承诺书是否允许发起牵线">
          <Radio checked={line.agreement === "yes"} label="允许" onClick={() => setLine({ ...line, agreement: "yes" })} />
          <Radio checked={line.agreement === "no"} label="禁止" note="（会弹出提示要求先签署承诺书，点击后转到诚信认证页面，并且在签署承诺书之前系统会强制要求实名认证）" onClick={() => setLine({ ...line, agreement: "no" })} />
        </Row>

        <Row label="发起线上牵线的次数限制">
          <MiniInput value={line.times} onChange={(v) => setLine({ ...line, times: v })} />
          <span className="pm-inline-unit">次/天（0表示不限制）</span>
          <span className="pm-hint">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></svg>
            此功能对于“介绍到结婚为止”的收费模式非常关键。
          </span>
        </Row>

        <Row label="没有实名认证的是否允许被牵线">
          <Radio checked={line.beLinked === "no"} label="禁止" onClick={() => setLine({ ...line, beLinked: "no" })} />
          <Radio checked={line.beLinked === "yes"} label="允许" onClick={() => setLine({ ...line, beLinked: "yes" })} />
        </Row>

        <Info indent>
          设置为“禁止”，被牵线的人如果没有实名认证，被发起牵线的时候会弹出提示“提醒被牵线人未实名，无法发起牵线”，将触发系统自动发送短信提醒被牵线人进行实名；设置为“允许”，被牵线的人如果没有实名认证，也能正常被发起牵线
        </Info>

        <div className="pm-submit">
          <button type="button" className="nv-ok-btn pm-submit-btn">确定提交</button>
        </div>
      </Card>

      {/* ===================== 卡片5 其他权限配置 ===================== */}
      <Card title="其他权限配置">
        <Row label="实名时是否强制上传身份证照片">
          <Radio checked={other.idcard === "off"} label="不强制上传" onClick={() => setOther({ ...other, idcard: "off" })} />
          <Radio checked={other.idcard === "on"} label="强制上传" note="（在实名认证时除了人脸识别之外，还将强制要求客户必须上传身份证的照片给平台，开启本功能后可能会降低到实名认证率，请注意系统并不对身份证照片进行验证）" onClick={() => setOther({ ...other, idcard: "on" })} />
        </Row>

        <Row label="会员中心是否展示专属红娘">
          <Radio checked={other.hongniangShow === "on"} label="显示" onClick={() => setOther({ ...other, hongniangShow: "on" })} />
          <Radio checked={other.hongniangShow === "off"} label="隐藏" onClick={() => setOther({ ...other, hongniangShow: "off" })} />
        </Row>

        <Row label="同一身份证号是否允许实名多个账号">
          <Radio checked={other.multiAccount === "yes"} label="允许" onClick={() => setOther({ ...other, multiAccount: "yes" })} />
          <Radio checked={other.multiAccount === "no"} label="不允许" onClick={() => setOther({ ...other, multiAccount: "no" })} />
        </Row>

        <Row label="强制用户上传头像">
          <Radio checked={other.avatar === "on"} label="开启" onClick={() => setOther({ ...other, avatar: "on" })} />
          <Radio checked={other.avatar === "off"} label="关闭" onClick={() => setOther({ ...other, avatar: "off" })} />
        </Row>
        <Info indent>开启后会员在注册资料的引导页面中必须上传头像</Info>

        <Row label="强制用户上传照片">
          <Radio checked={other.photo === "on"} label="开启" onClick={() => setOther({ ...other, photo: "on" })} />
          <Radio checked={other.photo === "off"} label="关闭" onClick={() => setOther({ ...other, photo: "off" })} />
        </Row>
        <Info indent>开启后会员在注册资料的引导页面中必须上传照片</Info>

        <Row label="是否允许会员自行修改婚况">
          <Radio checked={other.martial === "yes"} label="允许" onClick={() => setOther({ ...other, martial: "yes" })} />
          <Radio checked={other.martial === "no"} label="不允许" onClick={() => setOther({ ...other, martial: "no" })} />
        </Row>
        <Info indent>不允许的状态下会员自己将无法自行修改婚况，仅红娘可修改</Info>

        <Row label="是否允许会员自行修改学历">
          <Radio checked={other.edu === "yes"} label="允许" onClick={() => setOther({ ...other, edu: "yes" })} />
          <Radio checked={other.edu === "no"} label="不允许" onClick={() => setOther({ ...other, edu: "no" })} />
        </Row>
        <Info indent>会员在学员“已认证”的情况下，无法自行修改学历</Info>

        <div className="pm-submit">
          <button type="button" className="nv-ok-btn pm-submit-btn">确定提交</button>
        </div>
      </Card>
    </div>
  );
}
