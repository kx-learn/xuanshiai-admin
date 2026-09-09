"use client";

import { useEffect, useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import {
  useConfigDomain,
  showConfigToast,
  type Dict,
} from "@/lib/platform-config";

/* ------------------------------------------------------------------ */
/* 数据类型                                                            */
/* ------------------------------------------------------------------ */

interface StyleIcon {
  color: string; // 图标主色
  glyph: string; // 图标内符号占位
  label: string; // 图标名
}

interface StyleSet {
  name: string; // 风格1/风格2...
  icons: StyleIcon[];
}

interface NavItem {
  name: string;
  path: string;
  show: boolean;
  tip?: string; // 状态提示（如「游客状态下显示的图标」）
}

interface Section {
  key: string;
  title: string;
  styles?: StyleSet[];
  items: NavItem[];
  expand?: boolean; // 默认展开
}

const SECTIONS: Section[] = [
  {
    key: "head",
    title: "头部主导航",
    expand: true,
    styles: [
      { name: "风格1", icons: [{ color: "#e8506b", glyph: "＊", label: "筛选" }, { color: "#7a5cff", glyph: "▤", label: "双列模式" }, { color: "#5b8cff", glyph: "▦", label: "单图模式" }, { color: "#3ec6c0", glyph: "▥", label: "大图模式" }, { color: "#8a6ee8", glyph: "▣", label: "简约模式" }] },
      { name: "风格2", icons: [{ color: "#e8506b", glyph: "＊", label: "筛选" }, { color: "#8a5cff", glyph: "▤", label: "多格模式" }, { color: "#4a7dff", glyph: "▦", label: "单图模式" }, { color: "#f0629e", glyph: "▥", label: "大图模式" }, { color: "#f5a623", glyph: "▣", label: "简约模式" }] },
      { name: "风格3", icons: [{ color: "#e8506b", glyph: "＊", label: "筛选" }, { color: "#8a5cff", glyph: "▤", label: "单格模式" }, { color: "#4a7dff", glyph: "▥", label: "大图模式" }, { color: "#52c774", glyph: "▣", label: "简约模式" }, { color: "#3ec6c0", glyph: "▦", label: "卡片模式" }] },
      { name: "风格4", icons: [{ color: "#e8506b", glyph: "＊", label: "筛选" }, { color: "#7a5cff", glyph: "▤", label: "双列模式" }, { color: "#5b8cff", glyph: "▦", label: "多格模式" }, { color: "#f5a623", glyph: "▣", label: "简约模式" }, { color: "#f0629e", glyph: "▥", label: "列表模式" }] },
      { name: "风格5", icons: [{ color: "#e8506b", glyph: "＊", label: "筛选" }, { color: "#8a5cff", glyph: "▤", label: "双列模式" }, { color: "#4a7dff", glyph: "▦", label: "单图模式" }, { color: "#52c774", glyph: "▣", label: "简约模式" }, { color: "#a25cff", glyph: "♛", label: "置顶推荐" }] },
    ],
    items: [
      { name: "会员分区", path: "/pages/love/theme", show: true },
      { name: "条件筛选", path: "/pages/index/index?filter=~", show: true },
      { name: "最新会员", path: "/pages/index/index", show: false },
      { name: "相亲活动", path: "/subpages/active/index", show: true },
      { name: "短视频", path: "/subpages/shortvideo/index", show: true },
    ],
  },
  {
    key: "head2",
    title: "头部主导航二",
    expand: true,
    styles: [
      { name: "风格1", icons: [{ color: "#e8506b", glyph: "＊", label: "筛选" }, { color: "#8a5cff", glyph: "▤", label: "双列模式" }, { color: "#4a7dff", glyph: "▦", label: "单图模式" }, { color: "#3ec6c0", glyph: "▥", label: "大图模式" }, { color: "#f5a623", glyph: "▣", label: "简约模式" }] },
      { name: "风格2", icons: [{ color: "#e8506b", glyph: "＊", label: "筛选" }, { color: "#7a5cff", glyph: "▤", label: "多格模式" }, { color: "#5b8cff", glyph: "▦", label: "单图模式" }, { color: "#52c774", glyph: "▣", label: "简约模式" }, { color: "#3ec6c0", glyph: "▥", label: "列表模式" }] },
      { name: "风格3", icons: [{ color: "#e8506b", glyph: "＊", label: "筛选" }, { color: "#8a5cff", glyph: "▤", label: "单格模式" }, { color: "#f0629e", glyph: "▥", label: "大图模式" }, { color: "#4a7dff", glyph: "▣", label: "简约模式" }, { color: "#52c774", glyph: "▦", label: "卡片模式" }] },
      { name: "风格4", icons: [{ color: "#e8506b", glyph: "＊", label: "筛选" }, { color: "#8a5cff", glyph: "▤", label: "双列模式" }, { color: "#5b8cff", glyph: "▦", label: "多格模式" }, { color: "#52c774", glyph: "▣", label: "简约模式" }, { color: "#f5a623", glyph: "▥", label: "列表模式" }] },
      { name: "风格5", icons: [{ color: "#e8506b", glyph: "＊", label: "筛选" }, { color: "#7a5cff", glyph: "▤", label: "双列模式" }, { color: "#f5a623", glyph: "▦", label: "单图模式" }, { color: "#4a7dff", glyph: "▣", label: "简约模式" }, { color: "#f0629e", glyph: "♛", label: "置顶推荐" }] },
    ],
    items: [
      { name: "会员分区", path: "/pages/love/theme", show: true },
      { name: "条件筛选", path: "/pages/index/index?filter=~", show: true },
      { name: "最新会员", path: "/pages/index/index", show: false },
      { name: "相亲活动", path: "/subpages/active/index", show: true },
      { name: "短视频", path: "/subpages/shortvideo/index", show: true },
      { name: "红娘喜讯", path: "/subpages/xixun/index", show: true },
      { name: "合作商家", path: "/subpages/hezuo/index", show: false },
    ],
  },
  {
    key: "foot",
    title: "底部导航",
    expand: true,
    styles: [
      { name: "风格1", icons: [{ color: "#e8506b", glyph: "⌂", label: "首页" }, { color: "#8a5cff", glyph: "◈", label: "会员" }, { color: "#4a7dff", glyph: "✎", label: "登记" }, { color: "#52c774", glyph: "♛", label: "VIP" }, { color: "#f5a623", glyph: "♥", label: "定制" }] },
      { name: "风格2", icons: [{ color: "#e8506b", glyph: "⌂", label: "首页" }, { color: "#7a5cff", glyph: "▤", label: "会员" }, { color: "#5b8cff", glyph: "✎", label: "登记" }, { color: "#3ec6c0", glyph: "♛", label: "VIP" }, { color: "#52c774", glyph: "◈", label: "我的" }] },
      { name: "风格3", icons: [{ color: "#e8506b", glyph: "⌂", label: "首页" }, { color: "#8a5cff", glyph: "▦", label: "会员" }, { color: "#f0629e", glyph: "✎", label: "登记" }, { color: "#4a7dff", glyph: "♛", label: "VIP" }, { color: "#52c774", glyph: "♥", label: "定制" }] },
      { name: "风格4", icons: [{ color: "#e8506b", glyph: "⌂", label: "首页" }, { color: "#7a5cff", glyph: "▤", label: "会员" }, { color: "#f5a623", glyph: "✎", label: "登记" }, { color: "#4a7dff", glyph: "♛", label: "VIP" }, { color: "#52c774", glyph: "◈", label: "我的" }] },
      { name: "风格5", icons: [{ color: "#e8506b", glyph: "⌂", label: "首页" }, { color: "#8a5cff", glyph: "▦", label: "会员" }, { color: "#52c774", glyph: "✎", label: "登记" }, { color: "#f0629e", glyph: "♛", label: "VIP" }, { color: "#4a7dff", glyph: "♥", label: "定制" }] },
    ],
    items: [
      { name: "自营专区", path: "/pages/index/index", show: true },
      { name: "会员专区", path: "/pages/love/theme", show: false },
      { name: "登记注册", path: "/member/love/signuplove", show: true, tip: "游客状态下显示的图标" },
      { name: "升级VIP", path: "/member/love/vip", show: true, tip: "普通会员状态下显示的图标" },
      { name: "私人定制", path: "/member/love/onetoone", show: true, tip: "VIP会员状态下显示的图标" },
      { name: "脱单辅导员", path: "/pages/love/hongniang", show: true },
      { name: "我的信息", path: "/member/love/index", show: true },
    ],
  },
  {
    key: "home",
    title: "首页专用导航",
    expand: true,
    styles: [
      { name: "风格1", icons: [{ color: "#e8506b", glyph: "▣", label: "活动" }, { color: "#8a5cff", glyph: "▦", label: "会员" }, { color: "#4a7dff", glyph: "◈", label: "互选" }, { color: "#52c774", glyph: "▥", label: "线下" }, { color: "#f5a623", glyph: "✎", label: "课堂" }] },
      { name: "风格2", icons: [{ color: "#e8506b", glyph: "▣", label: "活动" }, { color: "#7a5cff", glyph: "▤", label: "会员" }, { color: "#5b8cff", glyph: "◈", label: "互选" }, { color: "#f0629e", glyph: "▥", label: "线下" }, { color: "#3ec6c0", glyph: "✎", label: "我的" }] },
      { name: "风格3", icons: [{ color: "#e8506b", glyph: "▣", label: "活动" }, { color: "#8a5cff", glyph: "▦", label: "会员" }, { color: "#4a7dff", glyph: "◈", label: "互选" }, { color: "#3ec6c0", glyph: "▥", label: "线下" }, { color: "#52c774", glyph: "✎", label: "课堂" }] },
      { name: "风格4", icons: [{ color: "#e8506b", glyph: "▣", label: "活动" }, { color: "#7a5cff", glyph: "▤", label: "会员" }, { color: "#f5a623", glyph: "◈", label: "互选" }, { color: "#4a7dff", glyph: "▥", label: "线下" }, { color: "#f0629e", glyph: "✎", label: "我的" }] },
      { name: "风格5", icons: [{ color: "#e8506b", glyph: "▣", label: "活动" }, { color: "#8a5cff", glyph: "▦", label: "会员" }, { color: "#52c774", glyph: "◈", label: "互选" }, { color: "#f0629e", glyph: "▥", label: "线下" }, { color: "#3ec6c0", glyph: "✎", label: "我的" }] },
    ],
    items: [
      { name: "本周活动", path: "/subpages/simple_page/index", show: false },
      { name: "会员分区", path: "/pages/love/theme", show: false },
      { name: "线上互选", path: "/subpages/active/index?tab=", show: true },
      { name: "线下活动", path: "/subpages/active/index", show: true },
      { name: "情感课堂", path: "/subpages/shortvideo/index", show: true },
      { name: "我的牵线", path: "/member/love/line", show: true },
      { name: "私人定制", path: "/member/love/onetoone", show: true },
      { name: "红娘团队", path: "/pages/love/hongniang", show: false },
      { name: "我的约会", path: "/subpages/appointment/index", show: false },
      { name: "找搭子", path: "/subpages/partner/index", show: false },
      { name: "红娘喜讯", path: "/subpages/xixun/index", show: false },
      { name: "防骗提醒", path: "/pages/love/precheat", show: false },
      { name: "合作商家", path: "/subpages/hezuo/index", show: false },
    ],
  },
  {
    key: "member",
    title: "会员中心导航",
    expand: true,
    styles: [
      { name: "风格1", icons: [{ color: "#e8506b", glyph: "♛", label: "置顶" }, { color: "#8a5cff", glyph: "◈", label: "定制" }, { color: "#4a7dff", glyph: "♥", label: "牵线" }, { color: "#52c774", glyph: "✎", label: "推广" }, { color: "#f5a623", glyph: "▣", label: "资料" }] },
      { name: "风格2", icons: [{ color: "#e8506b", glyph: "♛", label: "置顶" }, { color: "#7a5cff", glyph: "▤", label: "定制" }, { color: "#5b8cff", glyph: "♥", label: "牵线" }, { color: "#f0629e", glyph: "✎", label: "推广" }, { color: "#3ec6c0", glyph: "▣", label: "资料" }] },
      { name: "风格3", icons: [{ color: "#e8506b", glyph: "♛", label: "置顶" }, { color: "#8a5cff", glyph: "▦", label: "定制" }, { color: "#4a7dff", glyph: "♥", label: "牵线" }, { color: "#3ec6c0", glyph: "✎", label: "推广" }, { color: "#52c774", glyph: "▣", label: "资料" }] },
      { name: "风格4", icons: [{ color: "#e8506b", glyph: "♛", label: "置顶" }, { color: "#7a5cff", glyph: "▤", label: "定制" }, { color: "#f5a623", glyph: "♥", label: "牵线" }, { color: "#4a7dff", glyph: "✎", label: "推广" }, { color: "#f0629e", glyph: "▣", label: "资料" }] },
      { name: "风格5", icons: [{ color: "#e8506b", glyph: "♛", label: "置顶" }, { color: "#8a5cff", glyph: "▦", label: "定制" }, { color: "#52c774", glyph: "♥", label: "牵线" }, { color: "#f0629e", glyph: "✎", label: "推广" }, { color: "#3ec6c0", glyph: "▣", label: "资料" }] },
    ],
    items: [
      { name: "我要置顶", path: "/member/love/top", show: true },
      { name: "私人订制", path: "/member/love/onetoone", show: true },
      { name: "红娘牵线", path: "/member/love/line", show: true },
      { name: "资料推广", path: "/member/love/promote", show: false },
      { name: "完善资料", path: "/member/love/editInfo", show: true },
      { name: "最新会员", path: "/pages/index/index", show: false },
      { name: "附近的人", path: "/pages/index/index?tab=Ne", show: true },
      { name: "智能匹配", path: "/pages/index/index?tab=Ma", show: false },
      { name: "线下活动", path: "/subpages/active/index", show: false },
      { name: "我的约会", path: "/subpages/appointment/index", show: false },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 图标更换表格数据                                                    */
/* ------------------------------------------------------------------ */

interface IconRow {
  position: string;
  color: string;
  glyph: string;
  name: string;
  size: string;
  colorAction?: boolean; // 是否有「更换颜色」按钮
}

const ICON_ROWS: IconRow[] = [
  { position: "首页", color: "#e8506b", glyph: "＊", name: "筛选", size: "44*44" },
  { position: "首页", color: "#7a5cff", glyph: "▤", name: "双列模式", size: "44*44" },
  { position: "首页", color: "#5b8cff", glyph: "▦", name: "单图模式", size: "44*44" },
  { position: "首页", color: "#3ec6c0", glyph: "▥", name: "大图模式", size: "44*44" },
  { position: "首页", color: "#8a6ee8", glyph: "▣", name: "简约模式", size: "45*44" },
  { position: "首页", color: "#5b8cff", glyph: "▣", name: "简约模式", size: "44*44" },
  { position: "首页", color: "#8a5cff", glyph: "♛", name: "置顶推荐", size: "42*42" },
  { position: "首页", color: "#7a5cff", glyph: "♕", name: "VIP会员", size: "42*42" },
  { position: "首页", color: "#3ec6c0", glyph: "⟳", name: "最新加入", size: "42*42" },
  { position: "首页", color: "#a25cff", glyph: "", name: "我要置顶", size: "", colorAction: true },
  { position: "首页", color: "#f0629e", glyph: "", name: "开通会员", size: "", colorAction: true },
  { position: "资料页", color: "#b8bcc8", glyph: "✕", name: "下一位", size: "64*28" },
  { position: "资料页", color: "#52c774", glyph: "✉", name: "打招呼", size: "48*48" },
  { position: "资料页", color: "#7a5cff", glyph: "↗", name: "分享", size: "44*36" },
  { position: "资料页", color: "#8a5cff", glyph: "👩", name: "红娘", size: "36*38" },
  { position: "资料页", color: "#4a7dff", glyph: "⌂", name: "首页", size: "32*32" },
  { position: "资料页", color: "#e8506b", glyph: "⚑", name: "举报", size: "32*32" },
  { position: "资料页", color: "#52c774", glyph: "✆", name: "加Ta微信", size: "", colorAction: true },
  { position: "资料页", color: "#a25cff", glyph: "", name: "申请牵线", size: "", colorAction: true },
  { position: "资料页", color: "#f0629e", glyph: "", name: "我要爆灯", size: "", colorAction: true },
];

/* ------------------------------------------------------------------ */
/* 小组件                                                              */
/* ------------------------------------------------------------------ */

const NAV_DEFAULTS: Dict = { sections: SECTIONS, icon_rows: ICON_ROWS };

function StyleEntry({ style }: { style: StyleSet }) {
  return (
    <div className="nv-style">
      <div className="nv-style-icons">
        {style.icons.map((icon, i) => (
          <div className="nv-style-icon" key={`${icon.label}-${i}`}>
            <span className="nv-style-glyph" style={{ background: icon.color }}>{icon.glyph}</span>
            <span className="nv-style-label">{icon.label}</span>
          </div>
        ))}
      </div>
      <div className="nv-style-name">{style.name}</div>
      <button type="button" className="nv-switch-btn">一键切换</button>
    </div>
  );
}

function ItemRow({ item, index, total, onChange, onMove, onOk }: {
  item: NavItem;
  index: number;
  total: number;
  onChange: (patch: Partial<NavItem>) => void;
  onMove: (dir: -1 | 1) => void;
  onOk?: () => void;
}) {
  return (
    <div className="nv-item">
      <input className="nv-input nv-input-name" value={item.name} onChange={(e) => onChange({ name: e.target.value })} />
      <input className="nv-input nv-input-path" value={item.path} onChange={(e) => onChange({ path: e.target.value })} />
      <button type="button" className="nv-icon-btn">
        <span className="nv-icon-swatch">🎨</span>
        更改图标
      </button>
      <button type="button" className="nv-ok-btn" onClick={onOk}>确定</button>
      <button
        type="button"
        className={`nv-switch ${item.show ? "on" : ""}`}
        onClick={() => onChange({ show: !item.show })}
      >
        <span className="nv-switch-dot"></span>
        {item.show ? "显示" : "隐藏"}
      </button>
      {item.tip && (
        <span className="nv-tip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5m0 3h.01" /></svg>
          {item.tip}
        </span>
      )}
      <button type="button" className="nv-move" disabled={index === 0} onClick={() => onMove(-1)}>↑ 上移</button>
      <button type="button" className="nv-move" disabled={index === total - 1} onClick={() => onMove(1)}>↓ 下移</button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 主页面                                                              */
/* ------------------------------------------------------------------ */

export default function PlatformNavconfigPage() {
  const navDomain = useConfigDomain<Dict>("platform_navigation", NAV_DEFAULTS);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [sections, setSections] = useState<Section[]>(SECTIONS);

  // 初次加载：服务端回填（保留默认“风格”配置，避免纯展示样式丢失）
  useEffect(() => {
    if (!navDomain.ready) return;
    const raw = navDomain.snapshot?.config?.sections;
    if (Array.isArray(raw) && raw.length > 0) {
      const defaultsByKey = Object.fromEntries(SECTIONS.map((s) => [s.key, s.styles]));
      setSections(
        (raw as unknown as Section[]).map((sec) => ({
          styles: sec.styles ?? defaultsByKey[sec.key],
          ...sec,
        })),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navDomain.ready]);

  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    void navDomain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveNav = async (summary = "保存导航配置") => {
    const ok = await navDomain.save({ sections }, summary);
    if (!ok && navDomain.error) showConfigToast(navDomain.error, "error");
    return ok;
  };

  // 改动即自动保存
  useEffect(() => {
    if (!navDomain.ready) return;
    const timer = setTimeout(() => void saveNav("自动保存导航配置"), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navDomain.ready, sections]);

  const toggleCollapse = (key: string) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  const updateItem = (secKey: string, index: number, patch: Partial<NavItem>) => {
    setSections((secs) => secs.map((s) => s.key !== secKey ? s : { ...s, items: s.items.map((it, i) => i === index ? { ...it, ...patch } : it) }));
  };

  const moveItem = (secKey: string, index: number, dir: -1 | 1) => {
    setSections((secs) => secs.map((s) => s.key !== secKey ? s : {
      ...s,
      items: (() => {
        const arr = [...s.items];
        const j = index + dir;
        if (j < 0 || j >= arr.length) return arr;
        [arr[index], arr[j]] = [arr[j], arr[index]];
        return arr;
      })(),
    }));
  };

  return (
    <div className="nv-page">
      <AdminBreadcrumb items={[{ label: "首页", href: "/" }, { label: "平台配置", href: "/platform-config-basic" }, { label: "导航配置" }]} />

      <div className="nv-notice">
        <span className="nv-notice-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></svg>
        </span>
        <div className="nv-notice-body">
          <div className="nv-notice-title">须知</div>
          <div className="nv-notice-line">若需调整过导航顺序，请按照示例图片顺序恢复再批量切换图标风格。批量切换后也能再次自定义修改图标：</div>
          <div className="nv-notice-line">您可以在「运营工具-内容单页」中创建页面，然后在任意自定义导航中可以进行链接调用</div>
          <div className="nv-notice-line">若需要链接到第三方的外部网址，请在「运营工具-内容单页」中创建页面，设置为"跳转到指定页面"，然后在导航中设置页面的链接即可&nbsp;<span className="nv-link">常用链接地址</span></div>
        </div>
      </div>

      <div className="admin-card nv-card">
        <div className="admin-card-header">
          <span className="admin-card-title">导航配置</span>
        </div>
        <div className="admin-card-body nv-card-body">
          {sections.map((sec) => {
            const isCollapsed = !!collapsed[sec.key];
            return (
              <div className="nv-block" key={sec.key}>
                <button type="button" className="nv-block-head" onClick={() => toggleCollapse(sec.key)}>
                  <span className="nv-block-title">{sec.title}</span>
                  <svg className={`nv-caret ${isCollapsed ? "collapsed" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>

                {!isCollapsed && (
                  <div className="nv-block-body">
                    {sec.styles && (
                      <div className="nv-styles">
                        {sec.styles.map((st) => <StyleEntry key={st.name} style={st} />)}
                      </div>
                    )}

                    <div className="nv-items">
                      {sec.items.map((item, i) => (
                        <ItemRow
                          key={`${sec.key}-${i}`}
                          item={item}
                          index={i}
                          total={sec.items.length}
                          onChange={(patch) => updateItem(sec.key, i, patch)}
                          onMove={(dir) => moveItem(sec.key, i, dir)}
                          onOk={() => {
                            void saveNav("保存导航配置").then((ok) => {
                              if (ok) showConfigToast("导航配置已保存");
                            });
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 更多图标样式自由换装 · 表格 */}
          <div className="nv-block">
            <div className="nv-block-head nv-block-head-static">
              <span className="nv-block-title">更多图标样式自由换装</span>
            </div>
            <div className="nv-block-body nv-block-body-static">
              <div className="nv-table">
                <div className="nv-table-head">
                  <span className="nv-th nv-th-pos">图标位置</span>
                  <span className="nv-th nv-th-icon">当前图标</span>
                  <span className="nv-th nv-th-name">图标名称</span>
                  <span className="nv-th nv-th-size">最佳尺寸</span>
                  <span className="nv-th nv-th-act">操作</span>
                </div>
                {ICON_ROWS.map((row, i) => (
                  <div className="nv-table-row" key={`${row.name}-${i}`}>
                    <span className="nv-td nv-td-pos">{row.position}</span>
                    <span className="nv-td nv-td-icon">
                      <span className="nv-glyph-box" style={{ background: row.color }}>{row.glyph}</span>
                    </span>
                    <span className="nv-td nv-td-name">{row.name}</span>
                    <span className="nv-td nv-td-size">{row.size}</span>
                    <span className="nv-td nv-td-act">
                      {row.colorAction && <button type="button" className="nv-link nv-link-blue">更换颜色</button>}
                      <button type="button" className="nv-link">恢复默认</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
