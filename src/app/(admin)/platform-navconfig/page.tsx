"use client";

import { useEffect, useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import ConfirmDialog from "@/components/ConfirmDialog";
import { CU, styleCardImage } from "@/lib/nav-icon-data";
import {
  useConfigDomain,
  pickAndUploadImage,
  showConfigToast,
  type Dict,
} from "@/lib/platform-config";

/* ------------------------------------------------------------------ */
/* 数据类型                                                            */
/* ------------------------------------------------------------------ */

const I = (name: string) => `/refimg/icons/${name}`;

interface NavItem {
  name: string;
  path: string;
  show: boolean;
  tip?: string; // 状态提示（如「游客状态下显示的图标」）
  icon: string; // 原站当前图标
}

interface Section {
  key: string;
  title: string;
  /** 对应 CU 的区块下标；有值才渲染「风格1-5」卡（原站仅前 3 个区块有） */
  styleGroup?: number;
  items: NavItem[];
  expand?: boolean; // 默认展开
}

const SECTIONS: Section[] = [
  {
    key: "head",
    title: "头部主导航一",
    styleGroup: 0,
    expand: true,
    items: [
      // 原站当前为 风格2 图标（CU[0][1]）；红娘喜讯/合作商家取原站快照图标
      { name: "会员分区", path: "/pages/love/theme", show: true, icon: CU[0][1][0] },
      { name: "条件筛选", path: "/pages/index/index?filter=~", show: true, icon: CU[0][1][1] },
      { name: "最新会员", path: "/pages/index/index", show: false, icon: CU[0][1][2] },
      { name: "相亲活动", path: "/subpages/active/index", show: true, icon: CU[0][1][3] },
      { name: "短视频", path: "/subpages/shortvideo/index", show: true, icon: CU[0][1][4] },
      { name: "红娘喜讯", path: "/subpages/xixun/index", show: true, icon: I("20241111081929955582.png") },
      { name: "合作商家", path: "/subpages/hezuo/index", show: false, icon: I("20250430221926187650.png") },
    ],
  },
  {
    key: "head2",
    title: "头部主导航二",
    styleGroup: 1,
    expand: true,
    items: [
      // 原站当前为 风格3 图标（CU[1][2]）；红娘喜讯/合作商家取原站快照图标
      { name: "会员分区", path: "/pages/love/theme", show: true, icon: CU[1][2][0] },
      { name: "条件筛选", path: "/pages/index/index?filter=~", show: true, icon: CU[1][2][1] },
      { name: "最新会员", path: "/pages/index/index", show: false, icon: CU[1][2][2] },
      { name: "相亲活动", path: "/subpages/active/index", show: true, icon: CU[1][2][3] },
      { name: "短视频", path: "/subpages/shortvideo/index", show: true, icon: CU[1][2][4] },
      { name: "红娘喜讯", path: "/subpages/xixun/index", show: true, icon: I("20241111081929955582.png") },
      { name: "合作商家", path: "/subpages/hezuo/index", show: false, icon: I("20250430221926187650.png") },
    ],
  },
  {
    key: "foot",
    title: "底部导航",
    styleGroup: 2,
    expand: true,
    items: [
      // 原站当前底部导航为自定义图标（页面快照）
      { name: "自营专区", path: "/pages/index/index", show: true, icon: I("20240910120202841933.png") },
      { name: "会员专区", path: "/pages/love/theme", show: false, icon: I("20240802172619351129.png") },
      { name: "登记注册", path: "/member/love/signuplove", show: true, tip: "游客状态下显示的图标", icon: I("20240910120224405249.png") },
      { name: "升级VIP", path: "/member/love/vip", show: true, tip: "普通会员状态下显示的图标", icon: I("20240910120236304388.png") },
      { name: "私人定制", path: "/member/love/onetoone", show: true, tip: "VIP会员状态下显示的图标", icon: I("20240910120248227322.png") },
      { name: "脱单辅导员", path: "/pages/love/hongniang", show: true, icon: I("20240910120259757594.png") },
      { name: "我的信息", path: "/member/love/index", show: true, icon: I("20240910120311244343.png") },
    ],
  },
  {
    key: "home",
    title: "首页专用导航",
    expand: true,
    items: [
      { name: "本周活动", path: "/subpages/simple_page/index", show: false, icon: I("20230303155848273795.png") },
      { name: "会员分区", path: "/pages/love/theme", show: false, icon: I("20230303155953143287.png") },
      { name: "线上互选", path: "/subpages/active/index?tab=", show: true, icon: I("20230303155959311835.png") },
      { name: "线下活动", path: "/subpages/active/index", show: true, icon: I("20230303160007462197.png") },
      { name: "情感课堂", path: "/subpages/shortvideo/index", show: true, icon: I("20230303160013812300.png") },
      { name: "我的牵线", path: "/member/love/line", show: true, icon: I("20230303160036939304.png") },
      { name: "私人定制", path: "/member/love/onetoone", show: true, icon: I("20230303160055133865.png") },
      { name: "红娘团队", path: "/pages/love/hongniang", show: false, icon: I("20230303160050612659.png") },
      { name: "我的约会", path: "/subpages/appointment/index", show: false, icon: I("20230303160041983636.png") },
      { name: "找搭子", path: "/subpages/partner/index", show: false, icon: I("20240726130418266910.jpg") },
      { name: "红娘喜讯", path: "/subpages/xixun/index", show: false, icon: I("20241111081929955582.png") },
      { name: "防骗提醒", path: "/pages/love/precheat", show: false, icon: I("20230303160103981529.png") },
      { name: "合作商家", path: "/subpages/hezuo/index", show: false, icon: I("20250430221926187650.png") },
    ],
  },
  {
    key: "member",
    title: "会员中心导航",
    expand: true,
    items: [
      { name: "我要置顶", path: "/member/love/top", show: true, icon: I("20240308175726318208.png") },
      { name: "私人订制", path: "/member/love/onetoone", show: true, icon: I("20240308175354587939.png") },
      { name: "红娘牵线", path: "/member/love/line", show: true, icon: I("20240308175420930466.png") },
      { name: "资料推广", path: "/member/love/promote", show: false, icon: I("20240308175830396572.png") },
      { name: "完善资料", path: "/member/love/editInfo", show: true, icon: I("20240308175915558276.png") },
      { name: "最新会员", path: "/pages/index/index", show: false, icon: I("20240308180005964839.png") },
      { name: "附近的人", path: "/pages/index/index?tab=Ne", show: true, icon: I("20240308180914692430.png") },
      { name: "智能匹配", path: "/pages/index/index?tab=Ma", show: false, icon: I("20230303155959311835.png") },
      { name: "线下活动", path: "/subpages/active/index", show: false, icon: I("20230303160007462197.png") },
      { name: "我的约会", path: "/subpages/appointment/index", show: false, icon: I("20230303160041983636.png") },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 图标更换表格数据（原站「更多图标样式自由换装」清单）                   */
/* ------------------------------------------------------------------ */

interface IconRow {
  position: string;
  name: string;
  size: string;
  /** 图标图片；纯色/渐变项为空，用 color 渲染色块 */
  icon?: string;
  /** 纯色或 CSS 渐变背景 */
  color?: string;
  colorAction?: boolean; // 是否有「更换颜色」按钮
}

const ICON_ROWS: IconRow[] = [
  { position: "首页", name: "筛选", size: "44*44", icon: I("u-background-image-sp-he_402.png") },
  { position: "首页", name: "双列模式", size: "44*44", icon: I("u-background-image-sp-he_403_0.png") },
  { position: "首页", name: "单图模式", size: "44*44", icon: I("u-background-image-sp-he_403_1.png") },
  { position: "首页", name: "大图模式", size: "44*44", icon: I("u-background-image-sp-he_403_2.png") },
  { position: "首页", name: "简介模式", size: "44*44", icon: I("u-background-image-sp-he_403_3.png") },
  { position: "首页", name: "简约模式", size: "44*44", icon: I("u-background-image-sp-he_403_4.png") },
  { position: "首页", name: "置顶推荐", size: "42*42", icon: I("u-background-image-sp-he_405.png") },
  { position: "首页", name: "VIP会员", size: "42*42", icon: I("u-background-image-sp-he_325.png") },
  { position: "首页", name: "最新加入", size: "42*42", icon: I("u-background-image-sp-he_326.png") },
  { position: "首页", name: "我要置顶", size: "42*42", color: "#bd5ad3", colorAction: true },
  { position: "首页", name: "开通会员", size: "42*42", color: "#bd5ad3", colorAction: true },
  { position: "资料页", name: "下一位", size: "64*28", icon: I("next-icon.png") },
  { position: "资料页", name: "打招呼", size: "48*48", icon: I("hi-icon.png") },
  { position: "资料页", name: "分享", size: "44*36", icon: I("share-icon.png") },
  { position: "资料页", name: "红娘", size: "36*38", icon: I("matchmaker-icon.png") },
  { position: "资料页", name: "首页", size: "32*32", icon: I("home-icon.png") },
  { position: "资料页", name: "举报", size: "32*32", icon: I("jubao-icon.png") },
  { position: "资料页", name: "加Ta微信", size: "", color: "linear-gradient(90deg, rgba(140,87,255,1) 0, rgba(60,67,255,1) 100%)", colorAction: true },
  { position: "资料页", name: "申请牵线", size: "", color: "linear-gradient(90deg, rgba(140,87,255,1) 0, rgba(60,67,255,1) 100%)", colorAction: true },
  { position: "资料页", name: "我要爆灯", size: "", color: "linear-gradient(270deg, rgba(255,39,137,1) 0, rgba(255,124,160,1) 100%)", colorAction: true },
];

/* ------------------------------------------------------------------ */
/* 小组件                                                              */
/* ------------------------------------------------------------------ */

const NAV_DEFAULTS: Dict = { sections: SECTIONS, icon_rows: ICON_ROWS };

/** 风格卡：原站为一张整图（u-admin-loveindex-ft{区块}-{风格}.jpg） */
function StyleCard({ group, style, onApply }: { group: number; style: number; onApply: () => void }) {
  return (
    <div className="nv-style">
      <img className="nv-style-img" src={styleCardImage(group, style)} alt={`风格${style + 1}`} />
      <div className="nv-style-name">风格{style + 1}</div>
      <button type="button" className="nv-switch-btn" onClick={onApply}>一键切换</button>
    </div>
  );
}

function ItemRow({ item, index, total, onChange, onMove, onOk, onDelete }: {
  item: NavItem;
  index: number;
  total: number;
  onChange: (patch: Partial<NavItem>) => void;
  onMove: (dir: -1 | 1) => void;
  onOk?: () => void;
  onDelete: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  return (
    <div className="nv-item">
      <input className="nv-input nv-input-name" value={item.name} onChange={(e) => onChange({ name: e.target.value })} />
      <input className="nv-input nv-input-path" value={item.path} onChange={(e) => onChange({ path: e.target.value })} />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          setUploading(true);
          pickAndUploadImage(
            file,
            (url) => {
              setUploading(false);
              onChange({ icon: url });
              showConfigToast("图标已更新");
            },
            (message) => {
              setUploading(false);
              showConfigToast(message, "error");
            },
          );
        }}
      />
      <button type="button" className="nv-icon-btn" disabled={uploading} onClick={() => fileRef.current?.click()}>
        {item.icon ? (
          <img className="nv-icon-img" src={item.icon} alt="" />
        ) : (
          <span className="nv-icon-swatch">🎨</span>
        )}
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
      <button type="button" className="nv-move" onClick={onDelete}>删除</button>
    </div>
  );
}

/** 更多图标样式表格行：更换颜色（隐藏的 color 取色器）+ 恢复默认 */
function IconTableRow({ row, onColor, onRestore }: {
  row: IconRow;
  onColor: (hex: string) => void;
  onRestore: () => void;
}) {
  const colorRef = useRef<HTMLInputElement | null>(null);
  const hex = row.color && /^#[0-9a-f]{6}$/i.test(row.color) ? row.color : "#8c57ff";
  return (
    <div className="nv-table-row">
      <span className="nv-td nv-td-pos">{row.position}</span>
      <span className="nv-td nv-td-icon">
        {row.icon ? (
          <img className="nv-glyph-img" src={row.icon} alt={row.name} />
        ) : (
          <span className="nv-glyph-box" style={{ background: row.color }} />
        )}
      </span>
      <span className="nv-td nv-td-name">{row.name}</span>
      <span className="nv-td nv-td-size">{row.size}</span>
      <span className="nv-td nv-td-act">
        {row.colorAction && (
          <>
            <input
              ref={colorRef}
              type="color"
              value={hex}
              hidden
              onChange={(e) => onColor(e.target.value)}
            />
            <button type="button" className="nv-link nv-link-blue" onClick={() => colorRef.current?.click()}>更换颜色</button>
          </>
        )}
        <button type="button" className="nv-link" onClick={onRestore}>恢复默认</button>
      </span>
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
  const [iconRows, setIconRows] = useState<IconRow[]>(ICON_ROWS);
  const [pendingDelete, setPendingDelete] = useState<{ secKey: string; index: number } | null>(null);

  // 初次加载：服务端回填。结构字段（title/styleGroup）以代码里的 SECTIONS 为准；
  // items 以服务端保存的列表为准（支持删除/新增），缺省字段（tip/icon）回退到同路径默认项
  useEffect(() => {
    if (!navDomain.ready) return;
    const cfg = navDomain.snapshot?.config ?? {};
    const raw = cfg.sections;
    if (Array.isArray(raw) && raw.length > 0) {
      const defaultsByKey = Object.fromEntries(SECTIONS.map((s) => [s.key, s]));
      setSections(
        (raw as unknown as Section[]).map((sec) => {
          const fallback = defaultsByKey[sec.key];
          const savedItems: NavItem[] = (sec.items ?? []) as NavItem[];
          const items = savedItems.map((it) => {
            const def = fallback?.items.find((d) => d.path === it.path);
            return { ...(def ?? {}), ...it, icon: it.icon ?? def?.icon ?? "" } as NavItem;
          });
          return {
            ...(fallback ?? sec),
            ...sec,
            key: fallback?.key ?? sec.key,
            title: fallback?.title ?? sec.title,
            styleGroup: sec.styleGroup ?? fallback?.styleGroup,
            items,
          };
        }),
      );
    }
    const savedRows = cfg.icon_rows;
    if (Array.isArray(savedRows) && savedRows.length > 0) setIconRows(savedRows as unknown as IconRow[]);
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
    const ok = await navDomain.save({ sections, icon_rows: iconRows }, summary);
    if (!ok && navDomain.error) showConfigToast(navDomain.error, "error");
    return ok;
  };

  // 改动即自动保存
  useEffect(() => {
    if (!navDomain.ready) return;
    const timer = setTimeout(() => void saveNav("自动保存导航配置"), 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navDomain.ready, sections, iconRows]);

  const addItem = (secKey: string) => {
    setSections((secs) => secs.map((s) => s.key !== secKey ? s : {
      ...s,
      items: [...s.items, { name: "新导航项", path: "", show: true, icon: "" }],
    }));
  };

  const removeItem = (secKey: string, index: number) => {
    setSections((secs) => secs.map((s) => s.key !== secKey ? s : {
      ...s,
      items: s.items.filter((_, i) => i !== index),
    }));
  };

  /** 图标表格：恢复为代码内默认值（按位置+名称匹配） */
  const restoreIconRow = (index: number) => {
    setIconRows((rows) => rows.map((r, i) => {
      if (i !== index) return r;
      return ICON_ROWS.find((d) => d.position === r.position && d.name === r.name) ?? r;
    }));
  };

  const setIconRowColor = (index: number, color: string) => {
    setIconRows((rows) => rows.map((r, i) => (i === index ? { ...r, color } : r)));
  };

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

  /** 一键切换：把该区块导航项图标批量换成原站对应风格（cu[区块][风格][项]） */
  const applyStyle = (secKey: string, group: number, style: number) => {
    const icons = CU[group]?.[style];
    if (!icons) return;
    setSections((secs) =>
      secs.map((s) =>
        s.key !== secKey
          ? s
          : { ...s, items: s.items.map((it, k) => (k < icons.length ? { ...it, icon: icons[k] } : it)) },
      ),
    );
    showConfigToast(`已切换为风格${style + 1}图标`);
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
                    {typeof sec.styleGroup === "number" && (
                      <div className="nv-styles">
                        {[0, 1, 2, 3, 4].map((l) => (
                          <StyleCard
                            key={l}
                            group={sec.styleGroup as number}
                            style={l}
                            onApply={() => applyStyle(sec.key, sec.styleGroup as number, l)}
                          />
                        ))}
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
                          onDelete={() => setPendingDelete({ secKey: sec.key, index: i })}
                        />
                      ))}
                      <div>
                        <button type="button" className="nv-move" onClick={() => addItem(sec.key)}>添加导航项</button>
                      </div>
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
                {iconRows.map((row, i) => (
                  <IconTableRow
                    key={`${row.position}-${row.name}`}
                    row={row}
                    onColor={(hex) => setIconRowColor(i, hex)}
                    onRestore={() => restoreIconRow(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title="删除导航项"
        message={`确定删除导航项「${sections.find((s) => s.key === pendingDelete?.secKey)?.items[pendingDelete?.index ?? 0]?.name ?? ""}」吗？`}
        confirmText="删除"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeItem(pendingDelete.secKey, pendingDelete.index);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
