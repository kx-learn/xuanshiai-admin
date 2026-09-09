"use client";

import { useEffect, useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import {
  useConfigDomain,
  showConfigToast,
  asStr,
  asObject,
  type Dict,
} from "@/lib/platform-config";

/* ------------------------------------------------------------------ */
/* 通用小组件                                                          */
/* ------------------------------------------------------------------ */

/* 开关（复用 mp-switch 滑块式，与其他页面一致） */
function Switch({ on, text, onChange }: { on: boolean; text?: string; onChange: () => void }) {
  return (
    <button type="button" className={`mp-switch ${on ? "on" : ""}`} onClick={onChange}>
      {on && <span className="mp-switch-label">{text ?? "开"}</span>}
      <span className="mp-switch-knob" />
    </button>
  );
}

function Move({ dir, disabled, onClick }: { dir: -1 | 1; disabled?: boolean; onClick: () => void }) {
  return (
    <button type="button" className="nv-move" disabled={disabled} onClick={onClick}>
      {dir === -1 ? "↑ 上移" : "↓ 下移"}
    </button>
  );
}

/* 圆形单选 */
function Radio({ checked, label, onClick }: { checked: boolean; label: string; onClick: () => void }) {
  return (
    <span className="pcfg-radio" onClick={onClick}>
      <input type="radio" readOnly checked={checked} />
      <i className="pcfg-radio-dot"></i>
      <span className="pcfg-radio-label">{label}</span>
    </span>
  );
}

/* 手机样机占位 */
function PhoneThumb({ tone = "#8a6ee8" }: { tone?: string }) {
  return (
    <div className="pl-phone">
      <div className="pl-phone-notch"></div>
      <div className="pl-phone-hero" style={{ background: `linear-gradient(150deg, ${tone}, ${tone}bb)` }}></div>
      <div className="pl-phone-line"></div>
      <div className="pl-phone-line short"></div>
      <div className="pl-phone-grid">
        <i style={{ background: tone }}></i>
        <i style={{ background: "#ff7aa2" }}></i>
        <i style={{ background: "#5b8cff" }}></i>
        <i style={{ background: "#57c98a" }}></i>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 数据定义                                                            */
/* ------------------------------------------------------------------ */

interface HomeRow {
  key: string;
  label: string;
  on: boolean;
  link?: string; // 右侧链接文字（如「配置图片」）
}

const HOME_ROWS: HomeRow[] = [
  { key: "carousel", label: "轮播图片", on: true, link: "配置图片" },
  { key: "iconnav", label: "图标导航", on: true, link: "配置导航" },
  { key: "stats", label: "数据统计", on: false },
  { key: "xixun", label: "红娘喜讯", on: true },
  { key: "textnav", label: "文字导航", on: false },
];

interface NavbarItem {
  key: string;
  name: string; // 原始名称（最新/附近/活动...）
  custom: string; // 自定义显示名称
  on: boolean;
  category?: boolean; // 是否显示「选择活动分类」下拉
  categoryValue?: string; // 已选择的活动分类
}

const NAVBAR_ITEMS: NavbarItem[] = [
  { key: "latest", name: "最新", custom: "自救青年", on: true },
  { key: "near", name: "附近", custom: "与你相遇", on: true },
  { key: "active", name: "活动", custom: "活动交友", on: true },
  { key: "match", name: "匹配", custom: "适配的Ta", on: false },
  { key: "official", name: "官宣", custom: "官宣", on: false },
  { key: "video", name: "视频", custom: "视频", on: false },
  { key: "delegate", name: "委托", custom: "委托", on: false },
  { key: "recommend", name: "荐语", custom: "荐语", on: false },
  { key: "realname", name: "实名", custom: "实名", on: false },
  { key: "cat1", name: "最新", custom: "活动指定分", on: false, category: true },
  { key: "cat2", name: "最新", custom: "活动指定分", on: false, category: true },
  { key: "cat3", name: "最新", custom: "活动指定分", on: false, category: true },
];

interface ProfileRow {
  key: string;
  name: string;
  on: boolean;
}

const PROFILE_ROWS: ProfileRow[] = [
  { key: "tauth", name: "Ta的认证", on: true },
  { key: "profile", name: "个人资料", on: true },
  { key: "intro", name: "自我介绍", on: true },
  { key: "more", name: "更多信息", on: true },
  { key: "voice", name: "Ta的语音", on: true },
  { key: "ideal", name: "理想另一半", on: true },
  { key: "hongniang", name: "红娘说", on: false },
  { key: "light", name: "爆灯嘉宾", on: true },
  { key: "gift", name: "收到的礼物", on: true },
  { key: "contact", name: "联系方式", on: true },
];

interface CarouselItem {
  key: string;
  title: string;
  sub: string;
  tone: string;
}

const CAROUSEL: CarouselItem[] = [
  { key: "c1", title: "助你恋爱、伴你成家", sub: "专业红娘团队1对1服务", tone: "#ff6a9a" },
  { key: "c2", title: "Ta们都在为平台热心介绍", sub: "身边真实单身资源", tone: "#7a5cff" },
];

const STAT_STYLES = ["#57c98a", "#5b8cff", "#ff7aa2", "#f5a623", "#8a6ee8", "#3ec6c0"];
const TEXT_NAV_STYLES = ["#3d5cf1", "#8a5cff", "#ff6a9a", "#f5a623", "#3ec6c0", "#d93b8f", "#5b8cff", "#e8506b", "#a25cff", "#ef5da8"];
const MEMBER_STYLES = ["双列模式", "列表模式", "大图模式", "简介模式", "简约模式", "醒目模式"];
const FREE_SWITCH = ["双列", "列表", "大图", "简介", "简约", "醒目"];
const DELEGATE = ["联系方为被浏览人的服务红娘（默认）", "联系方为平台统一客服", "联系方为浏览人的服务红娘"];

const STAT_DEFAULTS = { male: "12987", female: "8679", fresh: "280", success: "520" };

const LAYOUT_DEFAULTS: Dict = {
  home: {
    modules: HOME_ROWS,
    stat_style: 0,
    text_nav_style: 0,
    xixun_style: 0,
    member_style: 4,
    delegate: 0,
    navbar_items: NAVBAR_ITEMS,
    top_count: "15",
    vip_count: "15",
    top_sort: "random",
    vip_sort: "random",
    new_sort: "random",
    free_switch: "简约",
    statistics: STAT_DEFAULTS,
  },
  member: {
    promote_radio: "显示",
    vip_popup: "开启",
    layout: PROFILE_ROWS,
    main_btn: "线上牵线",
    login_text: "加Ta微信",
    after_login_text: "申请牵线",
    next_btn: "打招呼",
    next_text: "打招呼",
  },
  team: {
    nav1: "专业红娘",
    nav2: "热心红娘",
    title: "红娘团队",
    share_icon: "默认",
    share_desc: "同城专业红娘团队为您牵线搭桥，助你成家！",
    carousels: CAROUSEL,
    join_text: "我要做红娘",
    manage_text: "红娘管理中心",
  },
  pc: { template: 3 },
};

function rowsAs<T>(value: unknown, fallback: T[]): T[] {
  return Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
}
function numStr(value: unknown, fallback: string): string {
  return asStr(value, fallback);
}

/* ------------------------------------------------------------------ */
/* 主页面                                                              */
/* ------------------------------------------------------------------ */

export default function PlatformPagePage() {
  const layoutDomain = useConfigDomain<Dict>("platform_layout", LAYOUT_DEFAULTS);
  const [tab, setTab] = useState<"home" | "member" | "team" | "pc">("home");

  /* 手机端首页 */
  const [homeRows, setHomeRows] = useState<HomeRow[]>(HOME_ROWS);
  const [statStyle, setStatStyle] = useState(0);
  const [textNavStyle, setTextNavStyle] = useState(0);
  const [xixunStyle, setXixunStyle] = useState(0);
  const [memberStyle, setMemberStyle] = useState(4);
  const [delegate, setDelegate] = useState(0);
  const [navItems, setNavItems] = useState<NavbarItem[]>(NAVBAR_ITEMS);
  const [topCount, setTopCount] = useState("15");
  const [vipCount, setVipCount] = useState("15");
  const [topSort, setTopSort] = useState("random");
  const [vipSort, setVipSort] = useState("random");
  const [newSort, setNewSort] = useState("random");
  const [freeSwitch, setFreeSwitch] = useState("简约");

  /* 会员资料页 */
  const [promoteRadio, setPromoteRadio] = useState("显示");
  const [vipPopup, setVipPopup] = useState("开启");
  const [profileRows, setProfileRows] = useState<ProfileRow[]>(PROFILE_ROWS);
  const [mainBtn, setMainBtn] = useState("线上牵线");
  const [loginText, setLoginText] = useState("加Ta微信");
  const [afterLoginText, setAfterLoginText] = useState("申请牵线");
  const [nextBtn, setNextBtn] = useState("打招呼");
  const [nextText, setNextText] = useState("打招呼");

  /* 红娘团队展示页 */
  const [teamTitle, setTeamTitle] = useState("红娘团队");
  const [teamNav1, setTeamNav1] = useState("专业红娘");
  const [teamNav2, setTeamNav2] = useState("热心红娘");
  const [shareIcon, setShareIcon] = useState("默认");
  const [shareDesc, setShareDesc] = useState("同城专业红娘团队为您牵线搭桥，助你成家！");
  const [carousels, setCarousels] = useState<CarouselItem[]>(CAROUSEL);
  const [joinText, setJoinText] = useState("我要做红娘");
  const [manageText, setManageText] = useState("红娘管理中心");

  /* 电脑端 */
  const [pcTemplate, setPcTemplate] = useState(3);
  /* 数据统计栏数据（受控，便于落库） */
  const [stats, setStats] = useState(STAT_DEFAULTS);

  // 初次加载：服务端配置回填页面
  useEffect(() => {
    if (!layoutDomain.ready) return;
    const cfg = layoutDomain.snapshot?.config ?? {};
    const home = asObject(cfg.home, LAYOUT_DEFAULTS.home as Dict);
    const member = asObject(cfg.member, LAYOUT_DEFAULTS.member as Dict);
    const team = asObject(cfg.team, LAYOUT_DEFAULTS.team as Dict);
    const pc = asObject(cfg.pc, LAYOUT_DEFAULTS.pc as Dict);
    setHomeRows(rowsAs<HomeRow>(home.modules, HOME_ROWS));
    setStatStyle(typeof home.stat_style === "number" ? home.stat_style : 0);
    setTextNavStyle(typeof home.text_nav_style === "number" ? home.text_nav_style : 0);
    setXixunStyle(typeof home.xixun_style === "number" ? home.xixun_style : 0);
    setMemberStyle(typeof home.member_style === "number" ? home.member_style : 4);
    setDelegate(typeof home.delegate === "number" ? home.delegate : 0);
    setNavItems(rowsAs<NavbarItem>(home.navbar_items, NAVBAR_ITEMS));
    setTopCount(numStr(home.top_count, "15"));
    setVipCount(numStr(home.vip_count, "15"));
    setTopSort((home.top_sort as string) === "fixed" ? "fixed" : "random");
    setVipSort((home.vip_sort as string) === "fixed" ? "fixed" : "random");
    setNewSort((home.new_sort as string) === "fixed" ? "fixed" : "random");
    setFreeSwitch(asStr(home.free_switch, "简约"));
    const statBox = asObject(home.statistics, STAT_DEFAULTS);
    setStats({
      male: numStr(statBox.male, "12987"),
      female: numStr(statBox.female, "8679"),
      fresh: numStr(statBox.fresh, "280"),
      success: numStr(statBox.success, "520"),
    });
    setPromoteRadio((member.promote_radio as string) === "不显示" ? "不显示" : "显示");
    setVipPopup((member.vip_popup as string) === "关闭" ? "关闭" : "开启");
    setProfileRows(rowsAs<ProfileRow>(member.layout, PROFILE_ROWS));
    setMainBtn((member.main_btn as string) || "线上牵线");
    setLoginText(asStr(member.login_text, "加Ta微信"));
    setAfterLoginText(asStr(member.after_login_text, "申请牵线"));
    setNextBtn((member.next_btn as string) || "打招呼");
    setNextText(asStr(member.next_text, "打招呼"));
    setTeamTitle(asStr(team.title, "红娘团队"));
    setTeamNav1(asStr(team.nav1, "专业红娘"));
    setTeamNav2(asStr(team.nav2, "热心红娘"));
    setShareIcon((team.share_icon as string) === "云端素材库" ? "云端素材库" : "默认");
    setShareDesc(asStr(team.share_desc, "同城专业红娘团队为您牵线搭桥，助你成家！"));
    setCarousels(rowsAs<CarouselItem>(team.carousels, CAROUSEL));
    setJoinText(asStr(team.join_text, "我要做红娘"));
    setManageText(asStr(team.manage_text, "红娘管理中心"));
    setPcTemplate(typeof pc.template === "number" ? pc.template : 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutDomain.ready]);

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    void layoutDomain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveLayout = async (summary = "保存平台布局") => {
    const ok = await layoutDomain.save(
      {
        home: {
          modules: homeRows,
          stat_style: statStyle,
          text_nav_style: textNavStyle,
          xixun_style: xixunStyle,
          member_style: memberStyle,
          delegate,
          navbar_items: navItems,
          top_count: topCount,
          vip_count: vipCount,
          top_sort: topSort,
          vip_sort: vipSort,
          new_sort: newSort,
          free_switch: freeSwitch,
          statistics: stats,
        },
        member: {
          promote_radio: promoteRadio,
          vip_popup: vipPopup,
          layout: profileRows,
          main_btn: mainBtn,
          login_text: loginText,
          after_login_text: afterLoginText,
          next_btn: nextBtn,
          next_text: nextText,
        },
        team: {
          nav1: teamNav1,
          nav2: teamNav2,
          title: teamTitle,
          share_icon: shareIcon,
          share_desc: shareDesc,
          carousels,
          join_text: joinText,
          manage_text: manageText,
        },
        pc: { template: pcTemplate },
      },
      summary,
    );
    if (!ok && layoutDomain.error) showConfigToast(layoutDomain.error, "error");
    return ok;
  };

  // 改动即自动保存
  useEffect(() => {
    if (!layoutDomain.ready) return;
    const timer = setTimeout(() => void saveLayout("自动保存平台布局"), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutDomain.ready, homeRows, statStyle, textNavStyle, xixunStyle, memberStyle, delegate, navItems, topCount, vipCount, topSort, vipSort, newSort, freeSwitch, stats, promoteRadio, vipPopup, profileRows, mainBtn, loginText, afterLoginText, nextBtn, nextText, teamTitle, teamNav1, teamNav2, shareIcon, shareDesc, carousels, joinText, manageText, pcTemplate]);

  const moveRow = (key: string, dir: -1 | 1) =>
    setHomeRows((rows) => {
      const i = rows.findIndex((r) => r.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= rows.length) return rows;
      const copy = [...rows];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const toggleRow = (key: string) =>
    setHomeRows((rows) => rows.map((r) => (r.key === key ? { ...r, on: !r.on } : r)));

  const moveNav = (key: string, dir: -1 | 1) =>
    setNavItems((items) => {
      const i = items.findIndex((r) => r.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= items.length) return items;
      const copy = [...items];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const patchNav = (key: string, patch: Partial<NavbarItem>) =>
    setNavItems((items) => items.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const moveProfile = (key: string, dir: -1 | 1) =>
    setProfileRows((rows) => {
      const i = rows.findIndex((r) => r.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= rows.length) return rows;
      const copy = [...rows];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const patchProfile = (key: string, patch: Partial<ProfileRow>) =>
    setProfileRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const moveCarousel = (key: string, dir: -1 | 1) =>
    setCarousels((items) => {
      const i = items.findIndex((r) => r.key === key);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= items.length) return items;
      const copy = [...items];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const deleteCarousel = (key: string) =>
    setCarousels((items) => items.filter((r) => r.key !== key));

  const updateStat = (key: keyof typeof STAT_DEFAULTS, v: string) =>
    setStats((prev) => ({ ...prev, [key]: v }));

  return (
    <div className="pl-page">
      <AdminBreadcrumb items={[{ label: "首页", href: "/" }, { label: "平台配置", href: "/platform-config-basic" }, { label: "平台布局" }]} />

      <div className="nv-notice">
        <span className="nv-notice-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></svg>
        </span>
        <div className="nv-notice-body">
          <div className="nv-notice-title">须知</div>
          <div className="nv-notice-line">在这里可以针对您的线上平台用户端的界面和样式自由排版和布局，打造出符合您需求的效果；更丰富功能组件和内置样式模板。</div>
        </div>
      </div>

      <div className="admin-card pl-card">
        <div className="admin-card-body pl-card-body">
          {/* Tabs */}
          <div className="pl-tabs">
            {([
              ["home", "手机端首页"],
              ["member", "会员资料页"],
              ["team", "红娘团队展示页"],
              ["pc", "电脑端"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                className={`pl-tab ${tab === k ? "active" : ""}`}
                onClick={() => setTab(k)}
              >
                {label}
                {tab === k && <span className="pl-tab-line"></span>}
              </button>
            ))}
          </div>

          {/* ============ 手机端首页 ============ */}
          {tab === "home" && (
            <div className="pl-pane">
              {/* 首页布局设置 */}
              <div className="pl-block">
                <div className="pl-block-title">手机端首页布局设置</div>
                {homeRows.map((row, i) => (
                  <div className="pl-row" key={row.key}>
                    <span className="pl-row-label">{row.label}</span>
                    <Switch on={row.on} onChange={() => toggleRow(row.key)} />
                    <div className="pl-row-ops">
                      {i !== 0 && <Move dir={-1} disabled={i === 0} onClick={() => moveRow(row.key, -1)} />}
                      {i !== homeRows.length - 1 && <Move dir={1} onClick={() => moveRow(row.key, 1)} />}
                      {row.link && <span className="pl-row-link">{row.link} <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg></span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* 数据统计样式选择 */}
              <div className="pl-block">
                <div className="pl-block-title">数据统计样式选择</div>
                <div className="pl-styles">
                  {STAT_STYLES.map((c, i) => (
                    <div className={`pl-style ${statStyle === i ? "selected" : ""}`} key={i} onClick={() => setStatStyle(i)}>
                      <span className="pl-style-radio"></span>
                      <div className="pl-stat-preview">
                        {[0, 1, 2].map((n) => (
                          <i key={n} style={{ background: n % 2 === 0 ? c : "#c9cfdb" }}></i>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 文字导航样式选择 */}
              <div className="pl-block">
                <div className="pl-block-title">文字导航样式选择</div>
                <div className="pl-styles">
                  {TEXT_NAV_STYLES.map((c, i) => (
                    <div className={`pl-style ${textNavStyle === i ? "selected" : ""}`} key={i} onClick={() => setTextNavStyle(i)}>
                      <span className="pl-style-radio"></span>
                      <span className="pl-text-pill" style={{ background: c }}>最新</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 红娘喜讯样式选择 */}
              <div className="pl-block">
                <div className="pl-block-title">红娘喜讯样式选择</div>
                <div className="pl-styles">
                  {[0, 1, 2, 3].map((i) => (
                    <div className={`pl-style ${xixunStyle === i ? "selected" : ""}`} key={i} onClick={() => setXixunStyle(i)}>
                      <span className="pl-style-radio"></span>
                      <span className="pl-xixun-bar"><i></i></span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 默认会员展示样式 */}
              <div className="pl-block">
                <div className="pl-block-title">默认会员展示样式</div>
                <div className="pl-styles pl-styles-phone">
                  {MEMBER_STYLES.map((m, i) => (
                    <div className={`pl-style pl-style-phone ${memberStyle === i ? "selected" : ""}`} key={m} onClick={() => setMemberStyle(i)}>
                      <span className="pl-style-radio"></span>
                      <div className="pl-phone-duo">
                        <PhoneThumb />
                        <PhoneThumb />
                      </div>
                      <span className="pl-phone-label">{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 委托红娘模板 */}
              <div className="pl-block">
                <div className="pl-block-title">委托红娘模板</div>
                <div className="pl-styles pl-styles-delegate">
                  {DELEGATE.map((d, i) => (
                    <div className={`pl-style pl-style-phone ${delegate === i ? "selected" : ""}`} key={d} onClick={() => setDelegate(i)}>
                      <span className="pl-style-radio"></span>
                      <div className="pl-phone-single">
                        <PhoneThumb tone="#ff6a9a" />
                        <div className="pl-delegate-line"></div>
                      </div>
                      <span className="pl-phone-label">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 文字导航栏配置 */}
              <div className="pl-block pl-block-wide">
                <div className="pl-block-title">文字导航栏配置</div>
                <div className="pl-info">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
                  请不要开启超过5项，超出前台将不会显示
                </div>
                {navItems.map((it, i) => (
                  <div className="pl-navbar-row" key={it.key}>
                    <span className="pl-navbar-name">{it.name}</span>
                    <span className="pl-navbar-label">自定义显示名称:</span>
                    <input className="nv-input pl-nav-input" value={it.custom} onChange={(e) => patchNav(it.key, { custom: e.target.value })} />
                    {it.category && (
                      <span className="pl-dropdown">
                        <select value={it.categoryValue ?? "选择活动分类"} onChange={(e) => patchNav(it.key, { categoryValue: e.target.value })} className="pl-dropdown-select">
                          <option value="选择活动分类">选择活动分类</option>
                          <option value="脱单交友">脱单交友</option>
                          <option value="兴趣活动">兴趣活动</option>
                        </select>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                      </span>
                    )}
                    <Switch on={it.on} text={it.on ? "开" : "关"} onChange={() => patchNav(it.key, { on: !it.on })} />
                    <div className="pl-nav-ops">
                      {i !== 0 && <Move dir={-1} onClick={() => moveNav(it.key, -1)} />}
                      {i !== navItems.length - 1 && <Move dir={1} onClick={() => moveNav(it.key, 1)} />}
                    </div>
                  </div>
                ))}
              </div>

              {/* 首页置顶会员显示数量 */}
              <div className="pl-block">
                <div className="pl-block-title">首页置顶会员显示数量</div>
                <div className="pl-count-row">
                  <span className="pl-count-label">最多</span>
                  <input className="nv-input pl-num-input" value={topCount} onChange={(e) => setTopCount(e.target.value)} />
                  <span className="pl-count-unit">人</span>
                </div>
                <div className="pl-tip">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
                  建议不要超过20人，设为0则隐藏整个置顶展示区
                </div>
              </div>

              {/* 首页VIP会员显示数量 */}
              <div className="pl-block">
                <div className="pl-block-title">首页VIP会员显示数量</div>
                <div className="pl-count-row">
                  <span className="pl-count-label">最多</span>
                  <input className="nv-input pl-num-input" value={vipCount} onChange={(e) => setVipCount(e.target.value)} />
                  <span className="pl-count-unit">人</span>
                </div>
                <div className="pl-tip">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
                  建议不要超过20人，设为0则隐藏整个VIP会员展示区
                </div>
              </div>

              {/* 排序规则 */}
              <div className="pl-block">
                <div className="pl-block-title">首页置顶会员排序规则</div>
                <div className="pl-radio-row">
                  <Radio checked={topSort === "fixed"} label="按排序值大小固定" onClick={() => setTopSort("fixed")} />
                  <Radio checked={topSort === "random"} label="随机" onClick={() => setTopSort("random")} />
                </div>
                <div className="pl-tip">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
                  当设置随机后，系统将从所有置顶中的会员中随机调用循环展示
                </div>
              </div>

              <div className="pl-block">
                <div className="pl-block-title">首页VIP会员排序规则</div>
                <div className="pl-radio-row">
                  <Radio checked={vipSort === "fixed"} label="按排序值大小固定" onClick={() => setVipSort("fixed")} />
                  <Radio checked={vipSort === "random"} label="随机" onClick={() => setVipSort("random")} />
                </div>
                <div className="pl-tip">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
                  当设置随机后，系统将从所有线上VIP会员中随机调用循环展示
                </div>
              </div>

              <div className="pl-block">
                <div className="pl-block-title">首页新人推荐排序规则</div>
                <div className="pl-radio-row">
                  <Radio checked={newSort === "fixed"} label="按排序值默认固定" onClick={() => setNewSort("fixed")} />
                  <Radio checked={newSort === "random"} label="随机" onClick={() => setNewSort("random")} />
                </div>
                <div className="pl-tip">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
                  当设置随机后，系统将从所有的“新人推荐”中随机调用循环展示
                </div>
              </div>

              {/* 数据统计栏的数据设置 */}
              <div className="pl-block">
                <div className="pl-block-title">数据统计栏的数据设置</div>
                <div className="pl-stat-inputs">
                  {([
                    ["男嘉宾数", "male"],
                    ["女嘉宾数", "female"],
                    ["本月新加入数", "fresh"],
                    ["成功脱单数", "success"],
                  ] as const).map(([lab, key]) => (
                    <div className="pl-stat-field" key={lab}>
                      <span className="pl-stat-label">{lab}</span>
                      <input className="nv-input pl-stat-num" value={stats[key]} onChange={(e) => updateStat(key, e.target.value)} />
                    </div>
                  ))}
                </div>
                <div className="pl-tip">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
                  修改后将在该基数上与真实数据进行累加显示在首页，设置为0显示真实数据
                </div>
              </div>

              {/* 允许用户自由切换样式 */}
              <div className="pl-block">
                <div className="pl-block-title">允许用户自由切换样式</div>
                <div className="pl-radio-pills">
                  {FREE_SWITCH.map((f) => (
                    <span
                      key={f}
                      className={`pl-pill ${freeSwitch === f ? "selected" : ""}`}
                      onClick={() => setFreeSwitch(f)}
                    >
                      <i className="pl-pill-radio"></i>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pl-submit"><button
                type="button"
                className="nv-ok-btn pl-submit-btn"
                onClick={async () => {
                  const ok = await saveLayout("保存平台布局");
                  if (ok) showConfigToast("平台布局已保存");
                }}
              >确定提交</button></div>
            </div>
          )}

          {/* ============ 会员资料页 ============ */}
          {tab === "member" && (
            <div className="pl-pane">
              <div className="pl-row pl-view-row">
                <span className="pl-row-label">会员资料页设计效果图</span>
                <button type="button" className="nv-ok-btn">点击查看</button>
              </div>

              <div className="pl-row pl-view-row">
                <span className="pl-row-label">会员的推广红娘信息</span>
                <div className="pl-radio-row">
                  <Radio checked={promoteRadio === "显示"} label="显示" onClick={() => setPromoteRadio("显示")} />
                  <Radio checked={promoteRadio === "不显示"} label="不显示" onClick={() => setPromoteRadio("不显示")} />
                </div>
                <button type="button" className="nv-ok-btn">效果查看</button>
              </div>

              <div className="pl-block">
                <div className="pl-row pl-view-row">
                  <span className="pl-row-label">VIP宣传弹窗</span>
                  <div className="pl-radio-row">
                    <Radio checked={vipPopup === "开启"} label="开启" onClick={() => setVipPopup("开启")} />
                    <Radio checked={vipPopup === "关闭"} label="关闭" onClick={() => setVipPopup("关闭")} />
                  </div>
                  <button type="button" className="nv-ok-btn">点击查看</button>
                </div>
                <div className="pl-tip">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
                  开启状态下，用户在平台中浏览他人资料页的时候会弹出开通VIP会员宣传提示页面（24小时内仅弹出一次）
                </div>
              </div>

              {/* 布局配置 */}
              <div className="pl-block pl-block-wide">
                <div className="pl-block-title pl-block-title-left">布局配置</div>
                {profileRows.map((row, i) => (
                  <div className="pl-navbar-row" key={row.key}>
                    <span className="pl-navbar-name">{row.name}</span>
                    <span className="pl-navbar-label">自定义显示名称:</span>
                    <input className="nv-input pl-nav-input" value={row.name} onChange={(e) => patchProfile(row.key, { name: e.target.value })} />
                    <Switch on={row.on} text={row.on ? "显示" : "隐藏"} onChange={() => patchProfile(row.key, { on: !row.on })} />
                    <div className="pl-nav-ops">
                      {i !== 0 && <Move dir={-1} onClick={() => moveProfile(row.key, -1)} />}
                      {i !== profileRows.length - 1 && <Move dir={1} onClick={() => moveProfile(row.key, 1)} />}
                    </div>
                  </div>
                ))}
              </div>

              {/* 底部按钮 */}
              <div className="pl-block pl-block-wide">
                <div className="pl-block-title">底部按钮</div>
                <div className="pl-tip">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
                  以下设置在“线下模式”中不生效
                </div>

                <div className="pl-row pl-form-row">
                  <span className="pl-row-label">主按钮功能:</span>
                  <div className="pl-radio-row">
                    <Radio checked={mainBtn === "线上牵线"} label="线上牵线" onClick={() => setMainBtn("线上牵线")} />
                  </div>
                </div>

                <div className="pl-row pl-form-row">
                  <span className="pl-row-label">登录前显示文案:</span>
                  <input className="nv-input pl-text-input" value={loginText} onChange={(e) => setLoginText(e.target.value)} />
                  <span className="pl-row-label pl-row-label-gap">登录后显示文案:</span>
                  <input className="nv-input pl-text-input" value={afterLoginText} onChange={(e) => setAfterLoginText(e.target.value)} />
                </div>

                <div className="pl-row pl-form-row">
                  <span className="pl-row-label">次按钮功能:</span>
                  <div className="pl-radio-row">
                    <Radio checked={nextBtn === "爆灯"} label="爆灯" onClick={() => setNextBtn("爆灯")} />
                    <Radio checked={nextBtn === "申请约见"} label="申请约见" onClick={() => setNextBtn("申请约见")} />
                    <Radio checked={nextBtn === "打招呼"} label="打招呼" onClick={() => setNextBtn("打招呼")} />
                  </div>
                </div>

                <div className="pl-row pl-form-row">
                  <span className="pl-row-label">显示文案:</span>
                  <input className="nv-input pl-text-input" value={nextText} onChange={(e) => setNextText(e.target.value)} />
                </div>

                <div className="pl-submit"><button
                type="button"
                className="nv-ok-btn pl-submit-btn"
                onClick={async () => {
                  const ok = await saveLayout("保存平台布局");
                  if (ok) showConfigToast("平台布局已保存");
                }}
              >确定提交</button></div>
              </div>
            </div>
          )}

          {/* ============ 红娘团队展示页 ============ */}
          {tab === "team" && (
            <div className="pl-pane">
              <div className="pl-row pl-view-row">
                <span className="pl-row-label">预览红娘团队展示页面效果</span>
                <span className="pl-link">点击这里</span>
              </div>

              <div className="pl-row pl-form-row">
                <span className="pl-row-label">导航文案</span>
                <input className="nv-input pl-text-input" value={teamNav1} onChange={(e) => setTeamNav1(e.target.value)} />
                <input className="nv-input pl-text-input" value={teamNav2} onChange={(e) => setTeamNav2(e.target.value)} />
              </div>

              <div className="pl-row pl-form-row">
                <span className="pl-row-label">页面标题</span>
                <input className="nv-input pl-text-input" value={teamTitle} onChange={(e) => setTeamTitle(e.target.value)} />
              </div>

              <div className="pl-row pl-form-row">
                <span className="pl-row-label">分享图标</span>
                <div className="pl-radio-row">
                  <Radio checked={shareIcon === "默认"} label="默认" onClick={() => setShareIcon("默认")} />
                  <Radio checked={shareIcon === "云端素材库"} label="云端素材库" onClick={() => setShareIcon("云端素材库")} />
                </div>
                <span className="pl-share-thumb">
                  <b>红娘</b>
                  <i>团队</i>
                </span>
                <div className="pl-tip">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
                  选“默认”展示系统默认分享图标，选“云端素材库”展示从素材库选择的图片
                </div>
              </div>

              <div className="pl-row pl-form-row">
                <span className="pl-row-label">分享描述</span>
                <input className="nv-input pl-text-input pl-text-long" value={shareDesc} onChange={(e) => setShareDesc(e.target.value)} />
              </div>

              <div className="pl-block pl-block-wide">
                <div className="pl-row pl-form-row pl-head-row">
                  <span className="pl-row-label">头部轮播图</span>
                  <button type="button" className="nv-icon-btn">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" /></svg>
                    上传
                  </button>
                  <span className="pl-size-note">最佳尺寸: 700像素×240像素</span>
                </div>
                <div className="pl-carousel-list">
                  {carousels.map((c, i) => (
                    <div className="pl-carousel" key={c.key}>
                      <div className="pl-carousel-img" style={{ background: `linear-gradient(135deg, ${c.tone}, ${c.tone}99 60%, #ffd0e2)` }}>
                        <div className="pl-carousel-tag">专业匹配</div>
                        <div className="pl-carousel-title">{c.title}</div>
                        <div className="pl-carousel-sub">{c.sub}</div>
                      </div>
                      <div className="pl-carousel-ops">
                        {i !== 0 && <Move dir={-1} onClick={() => moveCarousel(c.key, -1)} />}
                        {i !== carousels.length - 1 && <Move dir={1} onClick={() => moveCarousel(c.key, 1)} />}
                        <button type="button" className="pl-del" onClick={() => deleteCarousel(c.key)}>
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" /></svg>
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pl-row pl-form-row">
                <span className="pl-row-label">加入红娘按钮文案</span>
                <input className="nv-input pl-text-input" value={joinText} onChange={(e) => setJoinText(e.target.value)} />
              </div>

              <div className="pl-row pl-form-row">
                <span className="pl-row-label">红娘管理按钮文案</span>
                <input className="nv-input pl-text-input" value={manageText} onChange={(e) => setManageText(e.target.value)} />
              </div>

              <div className="pl-submit"><button
                type="button"
                className="nv-ok-btn pl-submit-btn"
                onClick={async () => {
                  const ok = await saveLayout("保存平台布局");
                  if (ok) showConfigToast("平台布局已保存");
                }}
              >确定提交</button></div>
            </div>
          )}

          {/* ============ 电脑端 ============ */}
          {tab === "pc" && (
            <div className="pl-pane">
              <div className="pl-block">
                <div className="pl-block-title">电脑端引导页模板</div>
                <div className="pl-styles pl-styles-pc">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div className={`pl-style pl-style-pc ${pcTemplate === i ? "selected" : ""}`} key={i} onClick={() => setPcTemplate(i)}>
                      <span className="pl-style-radio"></span>
                      <div className="pl-pc-thumb" style={{ background: `linear-gradient(160deg, ${["#8a6ee8", "#b48be8", "#9a6ee8", "#7a5cff", "#a37ce8"][i]}, #f3d9ff)` }}>
                        <span>引导页面</span>
                      </div>
                    </div>
                  ))}
                  <div className={`pl-style pl-style-pc ${pcTemplate === 5 ? "selected" : ""}`} onClick={() => setPcTemplate(5)}>
                    <span className="pl-style-radio"></span>
                    <div className="pl-pc-thumb pl-pc-custom">
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M12 8v8m4-4H8" /></svg>
                    </div>
                    <span className="pl-phone-label">自定义</span>
                  </div>
                </div>
              </div>

              <div className="pl-submit"><button
                type="button"
                className="nv-ok-btn pl-submit-btn"
                onClick={async () => {
                  const ok = await saveLayout("保存平台布局");
                  if (ok) showConfigToast("平台布局已保存");
                }}
              >确定提交</button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
