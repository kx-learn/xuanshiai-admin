"use client";

import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* 数据定义                                                            */
/* ------------------------------------------------------------------ */

type Badge = "必看" | "新上";

interface DocItem {
  id: number;
  badge?: Badge;
  title: string;
  date: string;
  banner?: { text: string; sub: string };
  body: Array<{ h?: string; p: string }>;
}

const docs: DocItem[] = [
  {
    id: 1,
    badge: "必看",
    title: "销售匹配库(眼缘库)使用教程",
    date: "01月07日",
    banner: { text: "销售红娘匹配库", sub: "线下面谈开单神器" },
    body: [
      { h: "什么是眼缘库？红娘大单都靠它！", p: "销售红娘匹配库（也叫“眼缘库”），是专业婚恋机构中最常用的、最有效的“销售利器”，它在提升客户体验与服务效率方面展现出了无可比拟的优势。这一方法不仅巧妙地为客户提供了直观、高效的服务价值传递途径，极大地减轻了销售过程中的复杂性与挑战性，显著提升了成交转化率，而且还为后续的红娘精准匹配服务奠定了坚实的基础，成为机构内部既能驱动业绩增长，又能优化服务品质的双重保障。" },
      { h: "怎么用？很简单", p: "红娘在客户到店之前，就先根据聊过的情况，从会员资料库中挑选5至10位与客户条件相契合、极具吸引力的候选人，作为初步的“红娘推荐”，给他们建个专属的“爱情候选名单”。然后，红娘把这个名单的链接或者二维码存手机里。等客户到店了，就拿IPAD或者专用手机给客户看，让客户有个初步的感觉。接着，就让客户自己动手，从嘉宾海选库里再挑挑看，把喜欢的加到“眼缘清单”里，帮助客户初步构建对理想伴侣的轮廓认知。这一互动环节不仅增强了客户的参与感与主动性，也为红娘后续的服务提供了宝贵的客户偏好数据。" },
      { h: "眼缘库和线上平台的区别", p: "眼缘库与面向公众的线上平台在信息安全与隐私保护方面存在显著差异，页面的设计和风格更加的简单明了。在眼缘库里面，嘉宾的头像、照片等个人信息不受权限限制，即便是" },
    ],
  },
  {
    id: 2,
    badge: "新上",
    title: "账号申请注销流程",
    date: "07月06日",
    body: [{ p: "本教程演示账号申请与注销的完整操作流程，帮助管理员熟悉系统账号的生命周期管理。" }],
  },
  {
    id: 3,
    badge: "新上",
    title: "会员资料页设计效果图展示",
    date: "07月03日",
    body: [{ p: "会员资料页设计效果图展示，帮助您了解会员信息在页面上的呈现方式与排版规范。" }],
  },
  {
    id: 4,
    badge: "新上",
    title: "客户婚姻状态查询使用流程",
    date: "06月30日",
    body: [{ p: "客户婚姻状态查询使用流程说明，教会您如何快速锁定客户当前的情感状态。" }],
  },
  {
    id: 5,
    title: "云端素材库使用、改图小技巧",
    date: "06月08日",
    body: [{ p: "云端素材库的日常使用与改图小技巧，让您高效产出高质感的推广素材。" }],
  },
  {
    id: 6,
    title: "会员资料信息收集模板（线下纸质打印）",
    date: "03月11日",
    body: [{ p: "会员资料信息收集的线下纸质打印模板，方便门店一对一收集会员信息。" }],
  },
  {
    id: 7,
    title: "会员资料信息收集模板（线上）",
    date: "03月11日",
    body: [{ p: "会员资料信息收集的线上模板，支持分享填写与自动归档。" }],
  },
  {
    id: 8,
    title: "红娘如何将新登记客户归属到自己名下",
    date: "12月23日",
    body: [{ p: "讲解新登记客户归属操作，确保每位红娘的客源分配准确无误。" }],
  },
  {
    id: 9,
    title: "如何添加红娘账号，红娘如何登录自己的平台",
    date: "12月12日",
    body: [{ p: "添加红娘账号并配置登录权限的方法，帮助红娘快速上手自己的平台。" }],
  },
  {
    id: 10,
    title: "腾讯电子合同使用教程（视频版）",
    date: "12月09日",
    body: [{ p: "腾讯电子合同的使用教程，涵盖发起、签署、归档的完整流程。" }],
  },
];

/* ------------------------------------------------------------------ */
/* 小组件                                                              */
/* ------------------------------------------------------------------ */

function BadgeTag({ badge }: { badge: Badge }) {
  return <span className={`us-badge us-badge-${badge === "必看" ? "red" : "orange"}`}>{badge}</span>;
}

function EmptyState() {
  return (
    <div className="us-empty">
      <div className="us-empty-text">暂无数据</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 弹窗主体                                                            */
/* ------------------------------------------------------------------ */

export default function UseSystemModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [keyword, setKeyword] = useState("");
  const [activeDoc, setActiveDoc] = useState<DocItem | null>(null);

  // 打开时重置
  useEffect(() => {
    if (open) {
      setActiveDoc(null);
      setKeyword("");
    }
  }, [open]);

  if (!open) return null;

  const shown = keyword.trim()
    ? docs.filter((d) => d.title.toLowerCase().includes(keyword.trim().toLowerCase()))
    : docs;

  return (
    <div className="us-mask" onClick={onClose}>
      <div className={`us-panel ${activeDoc ? "us-wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="us-head">
          <span className="us-title">用好系统</span>
          <button type="button" className="us-close" onClick={onClose}>关闭</button>
        </div>

        <div className="us-banner">
          <span className="us-banner-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 4.5v15l13-7.5z" /></svg>
          </span>
          <span className="us-banner-title">教您用好婚恋系统</span>
        </div>

        <div className="us-search">
          <input
            className="us-search-input"
            placeholder="输入关键词搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setKeyword(e.currentTarget.value); }}
          />
          <button type="button" className="us-search-btn" onClick={() => setKeyword(keyword)}>搜索</button>
        </div>

        <div className="us-body">
          <div className="us-list">
            {shown.length === 0 ? (
              <EmptyState />
            ) : (
              shown.map((doc) => (
                <button key={doc.id} type="button" className={`us-item ${activeDoc?.id === doc.id ? "active" : ""}`} onClick={() => setActiveDoc(doc)}>
                  <div className="us-item-top">
                    {doc.badge && <BadgeTag badge={doc.badge} />}
                    <span className="us-item-title">{doc.title}</span>
                  </div>
                  <div className="us-item-date">{doc.date}</div>
                </button>
              ))
            )}
            <div className="us-footer">
              <span className="us-count">共 72 条</span>
              <span className="us-pager">
                <button type="button" className="us-page" disabled>‹</button>
                <span className="us-page cur">1</span>
                <span className="us-dots">…</span>
                <span className="us-page">4</span>
                <button type="button" className="us-page" disabled>›</button>
              </span>
            </div>
          </div>

          {activeDoc && (
            <div className="us-detail">
              {activeDoc.banner && (
                <div className="us-detail-cover">
                  <div className="us-cover-glow"></div>
                  <div className="us-cover-text">{activeDoc.banner.text}</div>
                  <div className="us-cover-sub">{activeDoc.banner.sub}</div>
                </div>
              )}
              {activeDoc.body.map((block, i) => (
                <div key={i}>
                  {block.h && <h3 className="us-detail-h">{block.h}</h3>}
                  <p className="us-detail-p">{block.p}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
