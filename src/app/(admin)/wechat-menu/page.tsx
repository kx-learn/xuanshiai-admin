"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

type MenuType = "url" | "msg" | "miniprogram";

interface SubMenu {
  id: number;
  name: string;
  type: MenuType;
  url: string;
}

interface TopMenu {
  id: number;
  name: string;
  type: MenuType;
  url: string;
  subs: SubMenu[];
}

const DEFAULTS = { top_menus: [], sub_menus: [], published_at: null } as const;

const TYPE_OPTIONS: { value: MenuType; label: string }[] = [
  { value: "url", label: "跳转链接" },
  { value: "msg", label: "发送消息" },
  { value: "miniprogram", label: "跳转小程序" },
];

/** 须知文本（红色片段用【】标记） */
const NOTICE_LINES: { text: string; red: string[] }[] = [
  { text: "微信菜单，一级菜单{0}，每个二级菜单数目{1}", red: ["不超过3个", "不超过5个"] },
  { text: "菜单标题长度{0}", red: ["不超过5个汉字(16个字节)"] },
  { text: "发送消息回复规则长度{0}", red: ["不超过 128字节"] },
  { text: "打开链接长度{0}", red: ["不超过 256字节"] },
  { text: "菜单文字1个字母与数字为1字节，1个汉字为{0}", red: ["3字节"] },
  { text: "菜单设置成功后，手机端可能有缓存，取消重新关注公众号可马上看到最新的自定义菜单效果。", red: [] },
  { text: "在编辑菜单后，需要点击「同步菜单」，公众号里才会生效。", red: [] },
  { text: "公众号{0}。", red: ["已认证"] },
];

/** 手机顶部人形图标 */
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export default function WechatMenuPage() {
  const domain = useConfigDomain<Dict>("wechat_mp_menu", DEFAULTS as Dict);
  // 一级菜单
  const [topMenus, setTopMenus] = useState<TopMenu[]>([]);
  // 二级菜单：同级菜单，固定显示，不随一级菜单切换而消失
  const [subMenus, setSubMenus] = useState<SubMenu[]>([]);
  const [activeTopId, setActiveTopId] = useState<number>(0);
  // -1 表示当前编辑对象是一级菜单本身；否则为二级菜单 id
  const [activeSubId, setActiveSubId] = useState(-1);

  const apply = useCallback((config: Dict | null) => {
    const tops = (Array.isArray(config?.top_menus) ? config!.top_menus : []).map((m, i) => {
      const o = asObject(m as Dict);
      return {
        id: Number(o.id ?? i + 1),
        name: asStr(o.name, ""),
        type: (["url", "msg", "miniprogram"].includes(asStr(o.type, "url")) ? asStr(o.type, "url") : "url") as MenuType,
        url: asStr(o.url, ""),
        subs: [],
      };
    });
    const subs = (Array.isArray(config?.sub_menus) ? config!.sub_menus : []).map((m, i) => {
      const o = asObject(m as Dict);
      return {
        id: Number(o.id ?? 100 + i),
        name: asStr(o.name, ""),
        type: (["url", "msg", "miniprogram"].includes(asStr(o.type, "url")) ? asStr(o.type, "url") : "url") as MenuType,
        url: asStr(o.url, ""),
      };
    });
    setTopMenus(tops);
    setSubMenus(subs);
    setActiveTopId(tops[0]?.id ?? 0);
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const activeTop = useMemo(() => topMenus.find((m) => m.id === activeTopId) ?? topMenus[0], [topMenus, activeTopId]);
  const activeSub = useMemo(
    () => (activeSubId === -1 ? null : subMenus.find((s) => s.id === activeSubId) ?? null),
    [subMenus, activeSubId],
  );

  /** 当前编辑的菜单（一级或二级） */
  const editingMenu = useMemo(() => {
    if (activeSubId === -1) return activeTop;
    return activeSub ?? activeTop;
  }, [activeTop, activeSub, activeSubId]);

  /** 切换一级菜单：仅切换高亮，右侧显示该一级菜单本身信息，中间二级菜单保持不变 */
  const switchTop = (id: number) => {
    setActiveTopId(id);
    setActiveSubId(-1);
  };

  /** 追加一个空二级菜单（同级） */
  const addSub = () => {
    const newId = Date.now();
    const sub: SubMenu = { id: newId, name: "菜单项", type: "url", url: "" };
    setSubMenus((prev) => [...prev, sub]);
    setActiveSubId(newId);
  };

  /** 删除二级菜单 */
  const removeSub = (id: number) => {
    setSubMenus((prev) => prev.filter((s) => s.id !== id));
    if (activeSubId === id) setActiveSubId(subMenus.find((s) => s.id !== id)?.id ?? -1);
  };

  /** 上移 / 下移二级菜单（同级交换） */
  const moveSub = (id: number, dir: -1 | 1) => {
    setSubMenus((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const to = idx + dir;
      if (idx < 0 || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  };

  /** 更新当前编辑的菜单（一级或二级） */
  const updateMenu = (patch: Partial<SubMenu>) => {
    if (activeSubId === -1) {
      // 编辑一级菜单本身
      setTopMenus((prev) => prev.map((m) => (m.id === activeTopId ? { ...m, ...patch } : m)));
    } else if (activeSub) {
      setSubMenus((prev) => prev.map((s) => (s.id === activeSub.id ? { ...s, ...patch } : s)));
    }
  };

  const syncMenu = async () => {
    if (topMenus.length > 3) return showConfigToast("一级菜单不能超过3个", "error");
    if (subMenus.length > 5) return showConfigToast("二级菜单不能超过5个", "error");
    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const ok = await domain.save({
      top_menus: topMenus.map(({ subs: _subs, ...m }) => m),
      sub_menus: subMenus,
      published_at: stamp,
    } as Partial<Dict>, "同步公众号菜单");
    if (ok) showConfigToast("菜单已保存并记录发布时间（实际下发需公众号平台对接）");
    else if (domain.error) showConfigToast(domain.error, "error");
  };

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "公众号", href: "/wechat-fans", children: [
            { label: "参数配置", href: "/wechat-config" },
            { label: "关注粉丝", href: "/wechat-fans" },
            { label: "菜单配置", href: "/wechat-menu" },
            { label: "自动回复", href: "/wechat-autoreply" },
            { label: "模板消息", href: "/wechat-template" },
            { label: "消息群发", href: "/wechat-send" },
          ] },
          { label: "菜单配置" },
        ]}
      />

      <div className="admin-card menu-card">
        <div className="admin-card-header">菜单配置</div>
        <div className="admin-card-body menu-body">
          {/* 左：手机模拟 + 同步按钮 */}
          <div className="menu-left">
            <div className="menu-phone">
              {/* 状态栏 */}
              <div className="menu-phone-status">
                <span className="menu-status-left">
                  <span className="menu-dots">·····</span>WeChat
                </span>
                <span className="menu-status-time">1:21 AM</span>
                <span className="menu-battery">100%</span>
              </div>
              {/* 导航栏 */}
              <div className="menu-phone-nav">
                <span className="menu-back">‹ 返回</span>
                <span className="menu-nav-user"><UserIcon /></span>
              </div>
              {/* 二菜单列表：同级菜单，固定显示 */}
              <div className="menu-phone-screen">
                {subMenus.length === 0 ? (
                  <div className="menu-screen-empty">暂无二级菜单</div>
                ) : (
                  subMenus.map((item) => {
                    const selected = item.id === activeSubId;
                    return (
                      <div
                        key={item.id}
                        className={`menu-sub-row${selected ? " selected" : ""}`}
                        onClick={() => setActiveSubId(item.id)}
                      >
                        <div className="menu-sub-actions" onClick={(e) => e.stopPropagation()}>
                          <button type="button" className="menu-act-btn" title="上移" onClick={() => moveSub(item.id, -1)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                          </button>
                          <button type="button" className="menu-act-btn" title="下移" onClick={() => moveSub(item.id, 1)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                          </button>
                          <button type="button" className="menu-act-btn menu-act-del" title="删除" onClick={() => removeSub(item.id)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>
                        <span className="menu-sub-name">{item.name}</span>
                      </div>
                    );
                  })
                )}
              </div>
              {/* 底部一级菜单栏：分两行——上一行「+」，下一行「键盘图标 + 菜单名」 */}
              <div className="menu-phone-foot">
                <div className="menu-plus-row">
                  {topMenus.map((top) => (
                    <button key={top.id} type="button" className="menu-plus" title="添加二级菜单" onClick={addSub}>+</button>
                  ))}
                </div>
                <div className="menu-name-row">
                  <div className="menu-foot-key">
                    <span className="menu-key" title="菜单列表"><svg width="26" height="32" viewBox="0 0 26 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M8 3 L13 8 L18 3" /><circle cx="13" cy="20" r="10" /><circle cx="8" cy="17" r="1.5" fill="currentColor" stroke="none" /><circle cx="13" cy="17" r="1.5" fill="currentColor" stroke="none" /><circle cx="18" cy="17" r="1.5" fill="currentColor" stroke="none" /><circle cx="8" cy="22" r="1.5" fill="currentColor" stroke="none" /><circle cx="13" cy="22" r="1.5" fill="currentColor" stroke="none" /><circle cx="18" cy="22" r="1.5" fill="currentColor" stroke="none" /><circle cx="8" cy="27" r="1.5" fill="currentColor" stroke="none" /><circle cx="13" cy="27" r="1.5" fill="currentColor" stroke="none" /><circle cx="18" cy="27" r="1.5" fill="currentColor" stroke="none" /></svg></span>
                  </div>
                  {topMenus.map((top) => (
                    <button
                      key={top.id}
                      type="button"
                      className={`menu-top-name${top.id === activeTopId ? " selected" : ""}`}
                      onClick={() => switchTop(top.id)}
                    >
                      {top.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button type="button" className="menu-sync" onClick={syncMenu}>
              <span className="menu-sync-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><polyline points="12 8 12 12 15 13" /></svg>
              </span>
              同步菜单
            </button>
          </div>

          {/* 右：须知 + 表单 */}
          <div className="menu-right">
            <div className="menu-notice">
              <div className="menu-notice-title">
                <span className="menu-notice-icon">i</span>须知
              </div>
              <div className="menu-notice-list">
                {NOTICE_LINES.map((line, idx) => (
                  <p key={idx}>
                    {idx + 1}. {renderNoticeLine(line.text, line.red)}
                  </p>
                ))}
              </div>
            </div>

            <div className="menu-form">
              <div className="menu-field">
                <span className="menu-label menu-required">菜单名称</span>
                <input
                  className="menu-input"
                  value={editingMenu?.name ?? ""}
                  onChange={(e) => updateMenu({ name: e.target.value })}
                  placeholder="请输入菜单名称"
                />
              </div>

              <div className="menu-field">
                <span className="menu-label">菜单类型</span>
                <div className="menu-radio-wrap">
                  {TYPE_OPTIONS.map((opt) => (
                    <label key={opt.value} className="menu-radio">
                      <input
                        type="radio"
                        name="menuType"
                        value={opt.value}
                        checked={editingMenu?.type === opt.value}
                        onChange={() => updateMenu({ type: opt.value })}
                      />
                      <span className="menu-radio-dot" />
                      <span className="menu-radio-label">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="menu-field">
                <span className="menu-label menu-required">跳转地址</span>
                <input
                  className="menu-input"
                  value={editingMenu?.url ?? ""}
                  onChange={(e) => updateMenu({ url: e.target.value })}
                  disabled={editingMenu?.type !== "url"}
                  placeholder="请输入跳转地址"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 渲染须知文本中带红色片段的行 */
function renderNoticeLine(text: string, red: string[]) {
  let parts: React.ReactNode[] = [text];
  let key = 0;
  for (const r of red) {
    const next: React.ReactNode[] = [];
    for (const part of parts) {
      if (typeof part !== "string") {
        next.push(part);
        continue;
      }
      const at = part.indexOf(r);
      if (at < 0) {
        next.push(part);
        continue;
      }
      if (at > 0) next.push(part.slice(0, at));
      next.push(<span key={key++} className="menu-red">{r}</span>);
      const rest = part.slice(at + r.length);
      if (rest) next.push(rest);
    }
    parts = next;
  }
  return parts;
}
