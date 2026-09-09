"use client";

import { useEffect, useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import {
  useConfigDomain,
  showConfigToast,
  asStr,
  asBool,
  type Dict,
} from "@/lib/platform-config";

/* ------------------------------------------------------------------ */
/* 富文本编辑器（复用 cf-editor 样式）                                */
/* ------------------------------------------------------------------ */
const TOOLS = ["H", "B", "T₁", "T₂", "I", "U", "S", "字体", "引用", "✓", "链接", "🖼", "表格", "代码", "😊"];

function RichEditor({ seed, onEdit }: { seed?: string; onEdit?: (html: string) => void }) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const dirtyRef = useRef(false);
  const appliedSeedRef = useRef<string | null>(null);
  useEffect(() => {
    if (dirtyRef.current) return;
    if (appliedSeedRef.current === (seed ?? "")) return;
    appliedSeedRef.current = seed ?? "";
    if (editorRef.current && seed) editorRef.current.innerHTML = seed;
  }, [seed]);
  return (
    <div className="cc-editor">
      <div className="cc-editor-toolbar">
        {TOOLS.map((t) => (
          <button type="button" key={t} className="cf-tool">{t}</button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="cc-editor-text"
        contentEditable
        suppressContentEditableWarning
        onInput={() => {
          dirtyRef.current = true;
          onEdit?.(editorRef.current?.innerHTML ?? "");
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 通用组件                                                          */
/* ------------------------------------------------------------------ */
function Switch({ on, text, onChange }: { on: boolean; text?: string; onChange: () => void }) {
  return (
    <button type="button" className={`mp-switch ${on ? "on" : ""}`} onClick={onChange}>
      {on && <span className="mp-switch-label">{text ?? "开"}</span>}
      <span className="mp-switch-knob" />
    </button>
  );
}

function BlueTip({ children }: { children: React.ReactNode }) {
  return <div className="cc-blue-tip">{children}</div>;
}

function Row({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="cc-row">
      <div className="cc-row-label">
        {required && <span className="cc-req">*</span>}
        {label}
      </div>
      <div className="cc-row-body">{children}</div>
    </div>
  );
}

/* 渐变横幅海报 */
function Banner({ title, from, to, height }: { title: string; from: string; to: string; height?: number }) {
  return (
    <div className="cc-banner" style={{ background: `linear-gradient(120deg, ${from}, ${to})`, minHeight: height ?? 150 }}>
      <span className="cc-banner-title">{title}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 文案配置 Tab                                                        */
/* ------------------------------------------------------------------ */
const memberAgreement = `本相亲平台（以下简称"相亲平台"）在此特别提醒您（用户）在注册成为用户之前，请认真阅读本《用户协议》（以下简称"协议"），确保您充分理解本协议中各条款。

请您审慎阅读并选择接受或不接受本协议。除非您接受本协议所有条款，否则您无权注册、登录或使用本协议所涉服务。

您的注册、登录、使用等行为将视为对本协议的接受，并同意接受本协议各项条款的约束。

本协议约定相亲平台与用户之间关于本平台服务（以下简称"服务"）的权利义务。

"用户"是指注册、登录、使用本服务的个人。本协议可由相亲平台随时更新，更新后的协议条款一旦公布即代替原来的协议条款，恕不再另行通知，用户可在本网站查阅最新版协议条款。在相亲平台修改协议条款后，如果用户不接受修改后的条款，请立即停止使用相亲平台提供的服务，用户继续使用相亲平台提供的服务将被视为接受修改后的协议。

一、帐号注册

1. 用户在使用本服务前需要注册一个帐号。帐号可与微信帐号绑定，以及未被相亲平台根据本协议封禁的帐号。相亲平台可以根据用户需求或产品需要对帐号注册和绑定的方式进行变更，`;

const vipText = `一、挚爱专享会员权益：
1、身份加VIP标识，赠送线上牵线20次
2、赠送公众号和朋友圈推荐1次
3、解锁图片视频浏览限制
4、解锁语音介绍收听限制
5、解锁红娘说查看限制
6、搜索结果、匹配结果优先显示
7、在平台首页的VIP板块展示推荐`;

const registerTip = `我们作为一个平台，从技术上和能力上，虽无法确保每一条信息的真实性，会员资料与填写可能存在差异，也无法确保每一个会员的人品及其对待感情的态度。为了您的相亲安全，请您承诺做到如下三点：
1、承诺在本平台所登记信息均为真实，并承担虚假信息引起的一切后果
2、不借钱给任何会员，也不与对方发生任何形式的经济关系。
3、拒绝一夜情，自尊自爱，理性交友，不易发生亲密关系。`;

const privateItems = [
  { icon: "🎯", title: "深度了解会员", desc: "红娘一对一了解会员需求，推荐更精准" },
  { icon: "🎗", title: "开放隐藏会员", desc: "名校海归、高颜值、优质资源库为您优先匹配" },
  { icon: "💠", title: "红娘为您推荐", desc: "不用自己海量筛选，红娘定期推送合适人选" },
  { icon: "🕵", title: "个人形象指导", desc: "" },
];

const warnItems = [
  "索要礼物",
  "一定要去某个店约会",
  "让你买茶叶",
  "邀你去外地工作",
  "借钱看病",
  "开业送贺礼",
  "丢钱包",
];

function CopyTab() {
  const copyDomain = useConfigDomain<Dict>("platform_content", {
    home_popup_enabled: true,
    join_service_html: "",
    join_promoter_html: "",
    promoter_center_html: "",
    promoter_slogan: "帮别人脱单的时候，你的生活也会变得更甜~",
    offline_appointment_intro: "",
    offline_vip_tip: "",
  });

  const [homePopup, setHomePopup] = useState(true);
  const [appointment, setAppointment] = useState(
    "线下约见是我们的线下高端1对1服务 红娘根据您的择偶需求撮合安排与您心仪的嘉宾线下见面，完成初次约会。在这里您可以查看到您所有的约会记录，并可以针对每次的约会进行反馈，以及对红娘的服务打分。"
  );
  const [vipTip, setVipTip] = useState(
    "该会员已在线下门店进行了资料认证和证件留档，红娘对该会员情况已非常了解，赶快联系红娘安排与ta直接见面相互了解吧！"
  );
  const [slogan, setSlogan] = useState("帮别人脱单的时候，你的生活也会变得更甜~");
  const [joinServiceHtml, setJoinServiceHtml] = useState("");
  const [joinPromoterHtml, setJoinPromoterHtml] = useState("");
  const [promoterCenterHtml, setPromoterCenterHtml] = useState("");

  useEffect(() => {
    if (!copyDomain.ready) return;
    const c = copyDomain.snapshot?.config ?? {};
    setHomePopup(asBool(c.home_popup_enabled, true));
    setAppointment(asStr(c.offline_appointment_intro, appointment));
    setVipTip(asStr(c.offline_vip_tip, vipTip));
    setSlogan(asStr(c.promoter_slogan, "帮别人脱单的时候，你的生活也会变得更甜~"));
    setJoinServiceHtml(asStr(c.join_service_html, ""));
    setJoinPromoterHtml(asStr(c.join_promoter_html, ""));
    setPromoterCenterHtml(asStr(c.promoter_center_html, ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copyDomain.ready]);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    void copyDomain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCopy = async (summary = "保存文案配置") => {
    const ok = await copyDomain.save(
      {
        home_popup_enabled: homePopup,
        join_service_html: joinServiceHtml,
        join_promoter_html: joinPromoterHtml,
        promoter_center_html: promoterCenterHtml,
        promoter_slogan: slogan,
        offline_appointment_intro: appointment,
        offline_vip_tip: vipTip,
      },
      summary,
    );
    if (!ok && copyDomain.error) showConfigToast(copyDomain.error, "error");
    return ok;
  };

  useEffect(() => {
    if (!copyDomain.ready) return;
    const timer = setTimeout(() => void saveCopy("自动保存文案配置"), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copyDomain.ready, homePopup, appointment, vipTip, slogan, joinServiceHtml, joinPromoterHtml, promoterCenterHtml]);

  return (
    <div className="cc-form">
      <Row label="平台首页弹窗">
        <div className="cc-inline">
          <Switch on={homePopup} text="开启" onChange={() => setHomePopup(!homePopup)} />
        </div>
        <BlueTip>同一IP每1小时只弹出一次</BlueTip>
      </Row>

      <Row label="非会员查看他人资料弹窗">
        <div className="cc-plain">真诚的态度是感情的基础，请完善您的个人信息，再查看TA的更多资料。</div>
      </Row>

      <Row label="相亲会员注册弹窗">
        <div className="cc-plain-tip">{registerTip}</div>
      </Row>

      <Row label="相亲会员协议">
        <div className="cc-plain-tip">{memberAgreement}</div>
      </Row>

      <Row label="VIP-挚爱专享服务描述">
        <div className="cc-plain-tip">{vipText}</div>
      </Row>

      <Row label="加入服务红娘">
        <RichEditor seed={joinServiceHtml} onEdit={setJoinServiceHtml} />
        <Banner title="红娘顾问招聘启事" from="#e8d5ff" to="#cbd6ff" height={170} />
        <div className="cc-plain pt12">
          🌟 公司简介
          <div className="mt6">我们是一家专注于高端婚恋服务的专业机构，致力于通过精准匹配和个性化服务，帮助单身人士找到理想伴侣。公司拥有专业的红娘团队、丰富的会员资源和完善的服务体系，在市场上享有良好的口碑。</div>
        </div>
      </Row>

      <Row label="加入推广红娘">
        <RichEditor seed={joinPromoterHtml} onEdit={setJoinPromoterHtml} />
        <Banner title="全民做红娘 成就好姻缘" from="#f7d6e6" to="#d6c6ff" height={160} />
        <div className="cc-plain mt12">
          成为本平台的推广红娘您不仅能获得红娘拉新奖励，还能获得名下客户日后在平台上所有消费的分成，同时还能够实现有经验的业务进行融合，合作共赢！欢迎社会各界商家、个人加入合作。
          <div className="mt6">💜 如果您是个人</div>
          <div className="mt6">进行培训指导，轻松入手操作流程</div>
          <div className="mt6">💜 如果您是商家</div>
          <div className="mt6">（后续文案…）</div>
        </div>
      </Row>

      <Row label="推广红娘中心介绍">
        <RichEditor seed={promoterCenterHtml} onEdit={setPromoterCenterHtml} />
        <div className="cc-plain mt12">
          在平台中登录状态下分享/转发 会员详情页面/会员海报/活动详情页/活动海报会包含你的专属参数，引流进来的注册会员均计入到你的推广名下，该会员资料审核通过后你即可获得提成。
        </div>
      </Row>

      <Row label="全民推广红娘宣传口号" required>
        <input className="cf-input" value={slogan} onChange={(e) => setSlogan(e.target.value)} />
      </Row>

      <Row label="线下约见服务介绍">
        <textarea className="cc-textarea" value={appointment} onChange={(e) => setAppointment(e.target.value)} rows={4} />
      </Row>

      <Row label="线下VIP会员提示">
        <textarea className="cc-textarea" value={vipTip} onChange={(e) => setVipTip(e.target.value)} rows={4} />
      </Row>

      <Row label="资料推广描述文案">
        <div className="cc-plain">在平台公众号和红娘朋友圈推广展示</div>
      </Row>

      <div className="cc-submit">
        <button
          type="button"
          className="nv-ok-btn"
          onClick={async () => {
            const ok = await saveCopy("保存文案配置");
            if (ok) showConfigToast("文案配置已保存");
          }}
        >
          确定提交
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 自定义页面 Tab                                                      */
/* ------------------------------------------------------------------ */
function CustomTab() {
  const customDomain = useConfigDomain<Dict>("platform_custom_pages", {
    about_html: "",
    custom_name: "私人定制",
    custom_desc_html: "",
    cheat_title: "防骗提醒",
    cheat_html: "",
  });
  const [customName, setCustomName] = useState("私人定制");
  const [aboutHtml, setAboutHtml] = useState("");
  const [customDescHtml, setCustomDescHtml] = useState("");
  const [cheatTitle, setCheatTitle] = useState("防骗提醒");
  const [cheatHtml, setCheatHtml] = useState("");

  useEffect(() => {
    if (!customDomain.ready) return;
    const c = customDomain.snapshot?.config ?? {};
    setCustomName(asStr(c.custom_name, "私人定制"));
    setAboutHtml(asStr(c.about_html, ""));
    setCustomDescHtml(asStr(c.custom_desc_html, ""));
    setCheatTitle(asStr(c.cheat_title, "防骗提醒"));
    setCheatHtml(asStr(c.cheat_html, ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDomain.ready]);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    void customDomain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCustom = async (summary = "保存自定义页面") => {
    const ok = await customDomain.save(
      {
        about_html: aboutHtml,
        custom_name: customName,
        custom_desc_html: customDescHtml,
        cheat_title: cheatTitle,
        cheat_html: cheatHtml,
      },
      summary,
    );
    if (!ok && customDomain.error) showConfigToast(customDomain.error, "error");
    return ok;
  };

  useEffect(() => {
    if (!customDomain.ready) return;
    const timer = setTimeout(() => void saveCustom("自动保存自定义页面"), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customDomain.ready, customName, aboutHtml, customDescHtml, cheatTitle, cheatHtml]);

  return (
    <div className="cc-form">
      <Row label="关于我们">
        <RichEditor seed={aboutHtml} onEdit={setAboutHtml} />
        <Banner title="指纹图案" from="#e8d5ff" to="#cbd6ff" height={200} />
      </Row>

      <Row label="私人定制名称">
        <input className="cf-input" value={customName} onChange={(e) => setCustomName(e.target.value)} />
      </Row>

      <Row label="私人定制描述">
        <RichEditor seed={customDescHtml} onEdit={setCustomDescHtml} />
        <Banner title="无需注册曝光" from="#f7d6e6" to="#d6c6ff" height={150} />
        <div className="cc-item-list">
          {privateItems.map((it, i) => (
            <div className="cc-item" key={i}>
              <span className="cc-item-icon">{it.icon}</span>
              <div>
                <div className="cc-item-title">{it.title}</div>
                {it.desc && <div className="cc-item-desc">{it.desc}</div>}
              </div>
            </div>
          ))}
        </div>
      </Row>

      <Row label="相亲防骗提醒">
        <input className="cf-input" value={cheatTitle} onChange={(e) => setCheatTitle(e.target.value)} />
        <RichEditor seed={cheatHtml} onEdit={setCheatHtml} />
        <Banner title="恋爱" from="#e8f0ff" to="#d6c6ff" height={180} />
      </Row>

      <Row label="小心以下行为的用户">
        <div className="cc-warn">
          <div className="cc-warn-side">小心有以下行为的用户</div>
          <div className="cc-warn-list">
            {warnItems.map((w, i) => (
              <div className="cc-warn-chip" key={i}>{w}</div>
            ))}
          </div>
        </div>
      </Row>

      <div className="cc-submit">
        <button
          type="button"
          className="nv-ok-btn"
          onClick={async () => {
            const ok = await saveCustom("保存自定义页面");
            if (ok) showConfigToast("自定义页面已保存");
          }}
        >
          确定提交
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 会员中心 Tab                                                        */
/* ------------------------------------------------------------------ */
const memberRows = [
  { name: "公开展示", desc: "在平台中公开显示头像，其他会员可查看您的详细资料(不含任何联系方式)" },
  { name: "委托红娘", desc: "在平台中只公开显示昵称、学历、年龄、身高、职业、月入这六项基本信息，其他资料均只有红娘在后台可见，充分保护您的隐私信息.红娘从资源库中为您人工筛选符合条件的嘉宾推荐给您.您也可以主动找红娘帮您在平台中相中的嘉宾进行牵线" },
  { name: "暂停服务", desc: "平台中将不再展示您的资料，红娘老师将停止为您服务" },
  { name: "已经脱单", desc: "已在本平台结识缘分结束了单身" },
  { name: "完全私密", desc: "在平台中不展示您的任何资料.也不会被会员搜索到.完全保护您的个人隐私" },
];

const MEMBER_CODES = ["public", "delegate", "pause", "single", "secret"];

function MemberTab() {
  const memberDomain = useConfigDomain<Dict>("platform_member_states", { items: [] });
  const [texts, setTexts] = useState<string[]>(memberRows.map((r) => r.name));
  const [descs, setDescs] = useState<string[]>(memberRows.map((r) => r.desc));

  useEffect(() => {
    if (!memberDomain.ready) return;
    const raw = memberDomain.snapshot?.config?.items;
    if (Array.isArray(raw) && raw.length > 0) {
      const list = raw as unknown as { code?: string; text: string; desc: string }[];
      const byCode = new Map(list.map((item, idx) => [item.code ?? MEMBER_CODES[idx] ?? String(idx), item]));
      setTexts(memberRows.map((r, i) => byCode.get(MEMBER_CODES[i])?.text ?? texts[i]));
      setDescs(memberRows.map((r, i) => byCode.get(MEMBER_CODES[i])?.desc ?? descs[i]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberDomain.ready]);

  const mountedRef = useRef(false);
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    void memberDomain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveMember = async (summary = "保存会员中心状态文案") => {
    const ok = await memberDomain.save(
      {
        items: memberRows.map((r, i) => ({
          code: MEMBER_CODES[i],
          state: r.name,
          text: texts[i],
          desc: descs[i],
        })),
      },
      summary,
    );
    if (!ok && memberDomain.error) showConfigToast(memberDomain.error, "error");
    return ok;
  };

  useEffect(() => {
    if (!memberDomain.ready) return;
    const timer = setTimeout(() => void saveMember("自动保存会员中心状态文案"), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberDomain.ready, texts, descs]);

  return (
    <div className="cc-form">
      <div className="nv-notice">
        <span className="nv-notice-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
        </span>
        <div className="nv-notice-body">
          <div className="nv-notice-title">须知</div>
          <div className="nv-notice-line">以下内容的设置会在您线上平台的"会员中心-状态设置"页面中生效 <button type="button" className="nv-link">页面效果</button></div>
        </div>
      </div>

      <div className="cc-table">
        <div className="cc-tr cc-thead">
          <span className="cc-th cc-col-state">状态名</span>
          <span className="cc-th cc-col-name">自定义状态名文案 (限6个字)</span>
          <span className="cc-th cc-col-desc">描述文案</span>
        </div>
        {memberRows.map((r, i) => (
          <div className="cc-tr" key={r.name}>
            <span className="cc-td cc-col-state">{r.name}</span>
            <span className="cc-td cc-col-name">
              <input className="cc-table-input" value={texts[i]} maxLength={6} onChange={(e) => {
                const next = [...texts];
                next[i] = e.target.value;
                setTexts(next);
              }} />
            </span>
            <span className="cc-td cc-col-desc">
              <textarea className="cc-table-area" value={descs[i]} onChange={(e) => {
                const next = [...descs];
                next[i] = e.target.value;
                setDescs(next);
              }} rows={4} />
            </span>
          </div>
        ))}
      </div>

      <div className="cc-submit">
        <button
          type="button"
          className="nv-ok-btn"
          onClick={async () => {
            const ok = await saveMember("保存会员中心状态文案");
            if (ok) showConfigToast("会员中心状态文案已保存");
          }}
        >
          确定提交
        </button>
      </div>
    </div>
  );
}
/* ------------------------------------------------------------------ */
const TABS = ["文案配置", "自定义页面", "会员中心"];

export default function PlatformContentPage() {
  const [tab, setTab] = useState("文案配置");
  return (
    <div className="cc-page">
      <AdminBreadcrumb items={getBreadcrumb("平台配置", "内容配置")} />
      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-card-title">内容配置</div>
        </div>
        <div className="admin-card-body">
          <div className="cc-tabs">
            {TABS.map((t) => (
              <button type="button" key={t} className={`cc-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                {t}
              </button>
            ))}
          </div>
          {tab === "文案配置" && <CopyTab />}
          {tab === "自定义页面" && <CustomTab />}
          {tab === "会员中心" && <MemberTab />}
        </div>
      </div>
    </div>
  );
}
