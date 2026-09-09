"use client";

import { useEffect, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/* 数据定义                                                            */
/* ------------------------------------------------------------------ */

type Owner = "班长" | "君君" | "刘欢欢" | "曾晨";

interface ClassVideo {
  id: number;
  badge?: "必看";
  title: string;
  red?: boolean; // 整行红色标题
  date: string; // 如 "01月07日"
  watched: boolean;
  owner: Owner;
}

interface ClassTab {
  key: string;
  label: string;
  videos: ClassVideo[]; // 空数组 => 空态
}

const ownerHue: Record<Owner, number> = { 班长: 214, 君君: 258, 刘欢欢: 330, 曾晨: 26 };

const tabs: ClassTab[] = [
  {
    key: "huashu",
    label: "红娘话术",
    videos: [
      { id: 401, badge: "必看", title: "红娘话术（全套文档版）", date: "01月07日", watched: true, owner: "班长" },
      { id: 402, title: "婚介离异客户，全流程沟通对话模板（直接套用）", date: "04月17日", watched: true, owner: "班长" },
      { id: 403, title: "没介绍成功，客户要退货？红娘处理流程+话术", date: "04月15日", watched: true, owner: "班长" },
      { id: 404, title: "红娘话术大全（2026最新版）", date: "03月26日", watched: false, owner: "班长" },
      { id: 405, title: "红娘等人艺术与实战话术", date: "09月26日", watched: false, owner: "班长" },
      { id: 406, badge: "必看", title: "红娘怎么回复女生要不要收费", date: "07月24日", watched: true, owner: "刘欢欢" },
      { id: 407, badge: "必看", title: "红娘怎么回复收费比其他家更贵", date: "07月24日", watched: true, owner: "刘欢欢" },
      { id: 408, title: "如何解释媒体对婚介的负面报道", date: "07月03日", watched: false, owner: "刘欢欢" },
      { id: 409, title: "客户问介绍不成功会退费吗？红娘如何回答", date: "06月19日", watched: false, owner: "刘欢欢" },
    ],
  },
  {
    key: "activity",
    label: "线下活动",
    videos: [
      { id: 410, badge: "必看", title: "2026年社交型婚恋模式线上分享会", date: "02月06日", watched: false, owner: "曾晨" },
      { id: 411, badge: "必看", title: "曾晨（柳州素荆青年）：教你玩转本地青年流量（1）", date: "06月05日", watched: false, owner: "曾晨" },
      { id: 412, badge: "必看", title: "曾晨（柳州素荆青年）：教你玩转本地青年流量（2）", date: "06月05日", watched: true, owner: "曾晨" },
      { id: 413, badge: "必看", title: "曾晨（柳州素荆青年）：教你玩转本地青年流量（3）", date: "06月05日", watched: false, owner: "曾晨" },
      { id: 414, badge: "必看", title: "曾晨（柳州素荆青年）：教你玩转本地青年流量（4）", date: "06月05日", watched: false, owner: "曾晨" },
      { id: 415, badge: "必看", title: "曾晨（柳州素荆青年）：教你玩转本地青年流量（5）", date: "06月05日", watched: false, owner: "曾晨" },
      { id: 416, badge: "必看", title: "王婆说媒全程现场实录（学习台上王婆的话术、应变能力）", date: "06月04日", watched: false, owner: "班长" },
      { id: 417, title: "高阶版的活动怎么玩", date: "07月24日", watched: false, owner: "刘欢欢" },
      { id: 418, title: "婚介线下活动如何安排流程", date: "06月19日", watched: false, owner: "刘欢欢" },
    ],
  },
  {
    key: "yinxin",
    label: "引流获客",
    videos: [
      { id: 419, badge: "必看", title: "红娘短视频促进信任文案十大选题", date: "09月23日", watched: false, owner: "班长" },
      { id: 420, badge: "必看", title: "红娘短视频爆款文案十大选题", date: "09月23日", watched: false, owner: "班长" },
      { id: 421, badge: "必看", title: "红娘短视频高留资文案十大选题", date: "09月23日", watched: false, owner: "班长" },
      { id: 422, title: "十个值得红娘学习的抖音账号", date: "09月05日", watched: false, owner: "班长" },
      { id: 423, title: "获客越来越难该如何破局", date: "07月24日", watched: false, owner: "刘欢欢" },
      { id: 424, badge: "必看", title: "红娘账号好的内容标准是什么", date: "07月24日", watched: false, owner: "刘欢欢" },
      { id: 425, badge: "必看", title: "IP的形象表现力如何去提升练习（下）", date: "07月24日", watched: false, owner: "刘欢欢" },
      { id: 426, badge: "必看", title: "IP的形象表现力如何去提升练习（上）", date: "07月24日", watched: false, owner: "刘欢欢" },
      { id: 427, title: "红娘新账号起号如何快速涨粉", date: "07月31日", watched: false, owner: "刘欢欢" },
    ],
  },
  {
    key: "sales",
    label: "红娘销售",
    videos: [
      { id: 428, title: "客户质疑见面人为托、不信任婚介，红娘应对方案", date: "04月17日", watched: false, owner: "班长" },
      { id: 429, title: "客户质疑婚托问题，红娘如何应对", date: "04月17日", watched: false, owner: "班长" },
      { id: 430, title: "50条离异客户实战经验，助你快速建立信任", date: "04月17日", watched: false, owner: "班长" },
      { id: 431, title: "父母客户：沟通技巧 + 实战经验 + 开单话术全攻略", date: "04月11日", watched: false, owner: "班长" },
      { id: 432, title: "《邀约和面谈销售》刘欢欢（2025年7月分享会PPT）", date: "06月01日", watched: false, owner: "刘欢欢" },
      { id: 433, badge: "必看", title: "客户说婚介都是骗子，红娘如何回答", date: "06月27日", watched: false, owner: "刘欢欢" },
      { id: 434, badge: "必看", title: "红娘怎样做到不被客户讨厌", date: "06月27日", watched: false, owner: "刘欢欢" },
      { id: 435, badge: "必看", title: "红娘谈单如何掌握主动权", date: "06月27日", watched: false, owner: "刘欢欢" },
      { id: 436, badge: "必看", title: "为什么你的婚介留不住女会员", date: "06月27日", watched: false, owner: "刘欢欢" },
    ],
  },
  {
    key: "service",
    label: "红娘服务",
    videos: [
      { id: 437, badge: "必看", title: "100条单身客户语言的潜在含义与应对指南", date: "01月08日", watched: true, owner: "班长" },
      { id: 438, badge: "必看", red: true, title: "感动！一位从业八年的红娘内心独白", date: "07月22日", watched: false, owner: "班长" },
      { id: 439, title: "红娘从业手册（2026版）", date: "03月18日", watched: false, owner: "班长" },
      { id: 440, badge: "必看", title: "红娘服务全流程详解", date: "11月17日", watched: false, owner: "班长" },
      { id: 441, title: "《服务如何拉动业绩》君君老师 2025年7月分享会（回放1）", date: "08月12日", watched: false, owner: "君君" },
      { id: 442, title: "《服务如何拉动业绩》君君老师 2025年7月分享会（回放2）", date: "08月12日", watched: false, owner: "君君" },
      { id: 443, title: "《高续费服务套餐实操》君君老师（2025年7月分享会PPT）", date: "06月01日", watched: false, owner: "君君" },
      { id: 444, title: "《服务如何拉动业绩》君君老师（2025年7月分享会）", date: "06月01日", watched: false, owner: "君君" },
      { id: 445, title: "红娘如何正确做好匹配服务", date: "05月17日", watched: true, owner: "君君" },
    ],
  },
  { key: "fav", label: "收藏", videos: [] },
];

/* ------------------------------------------------------------------ */
/* 小组件                                                              */
/* ------------------------------------------------------------------ */

function OwnerBadge({ owner }: { owner: Owner }) {
  return (
    <span className="mkc-owner">
      <span className="mkc-avatar" style={{ background: `linear-gradient(150deg, hsl(${ownerHue[owner]} 65% 78%), hsl(${ownerHue[owner]} 60% 62%))` }}>
        {owner.slice(0, 1)}
      </span>
      <span className="mkc-owner-name">{owner}</span>
    </span>
  );
}

function EmptyState() {
  return (
    <div className="mkc-empty">
      <div className="mkc-empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M10 9.5l5 2.5-5 2.5v-5z" fill="currentColor" stroke="none" /></svg>
      </div>
      <div className="mkc-empty-text">暂无数据</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 弹窗主体                                                            */
/* ------------------------------------------------------------------ */

export default function MatchmakerClassModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeKey, setActiveKey] = useState("huashu");
  const [keyword, setKeyword] = useState("");
  const [activeVideo, setActiveVideo] = useState<ClassVideo | null>(null);

  const tab = useMemo(() => tabs.find((t) => t.key === activeKey) ?? tabs[0], [activeKey]);

  const shown = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return tab.videos;
    return tab.videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [tab, keyword]);

  const total = tab.videos.length;

  // 打开时重置
  useEffect(() => {
    if (open) {
      setActiveVideo(null);
      setKeyword("");
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="mkc-mask" onClick={onClose}>
      <div className={`mkc-panel ${activeVideo ? "mkc-wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="mkc-head">
          <span className="mkc-title">红娘课堂</span>
          <button type="button" className="mkc-close" onClick={onClose}>关闭</button>
        </div>

        <div className="mkc-banner">
          <span className="mkc-banner-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4.5v15l13-7.5z" /></svg>
          </span>
          <span className="mkc-banner-title">资深行业老师分享婚恋运营经验</span>
        </div>

        <div className="mkc-search">
          <input
            className="mkc-search-input"
            placeholder="输入关键词搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setKeyword(e.currentTarget.value); }}
          />
          <button type="button" className="mkc-search-btn" onClick={() => setKeyword(keyword)}>搜索</button>
        </div>

        <div className="mkc-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`mkc-tab ${activeKey === t.key ? "active" : ""}`}
              onClick={() => {
                setActiveKey(t.key);
                setKeyword("");
                setActiveVideo(null);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mkc-body">
          <div className="mkc-list">
            {shown.length === 0 ? (
              <EmptyState />
            ) : (
              shown.map((v) => (
                <button key={v.id} type="button" className={`mkc-item ${activeVideo?.id === v.id ? "active" : ""}`} onClick={() => setActiveVideo(v)}>
                  <div className="mkc-item-top">
                    {v.badge && <span className="mkc-badge">{v.badge}</span>}
                    <span className={`mkc-item-title ${v.red ? "red" : ""}`}>{v.title}</span>
                  </div>
                  <div className="mkc-item-meta">
                    <span className="mkc-date">{v.date}</span>
                    <span className="mkc-dot">·</span>
                    <span className="mkc-state">{v.watched ? "已看过" : "未看过"}</span>
                    <span className="mkc-dot">·</span>
                    <span className="mkc-fav">♡ 未收藏</span>
                  </div>
                  <OwnerBadge owner={v.owner} />
                </button>
              ))
            )}
            <div className="mkc-footer">
              <span className="mkc-count">共 {total} 条</span>
              <span className="mkc-pager">
                <button type="button" className="mkc-page" disabled>‹</button>
                <span className="mkc-page cur">1</span>
                <button type="button" className="mkc-page" disabled>›</button>
              </span>
            </div>
          </div>

          {activeVideo && (
            <div className="mkc-player">
              <div className="mkc-screen">
                <span className="mkc-subtitle">从业 8 年的红娘</span>
              </div>
              <div className="mkc-controls">
                <span className="mkc-ctrl-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10-6.5z" /></svg>
                </span>
                <span className="mkc-progress">
                  <span className="mkc-progress-filled"></span>
                </span>
                <span className="mkc-ctrl-time">0:03/7:01</span>
                <span className="mkc-ctrl-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4z" /><path d="M15.5 8.5a5 5 0 010 7" /><path d="M18.5 5.5a9 9 0 010 13" /></svg>
                </span>
                <span className="mkc-ctrl-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /></svg>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
