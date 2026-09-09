"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

/* ------------------------------------------------------------------ */
/* 数据定义                                                            */
/* ------------------------------------------------------------------ */

type Category = "功能升级" | "细节改进" | "新功能" | "BUG修复" | "其他更新";

interface UpdateItem {
  id: number;
  category: Category;
  title: string;
  red?: boolean; // 标题红色
  time: string; // 如 "2026-07-08 09:11:03"
  hot?: boolean; // 右侧红点
  content?: string[]; // 详情正文段落
}

const catTabs: Array<{ key: string; label: string }> = [
  { key: "all", label: "全部" },
  { key: "功能升级", label: "功能升级" },
  { key: "细节改进", label: "细节改进" },
  { key: "新功能", label: "新功能" },
  { key: "BUG修复", label: "BUG修复" },
  { key: "其他更新", label: "其他更新" },
];

const items: UpdateItem[] = [
  // 新功能
  { id: 1, category: "新功能", title: "新增了客户婚姻状态查询功能", red: true, time: "2026-07-08 09:11:03", hot: true, content: ["新增了客户婚姻状态查询功能，支持在客户资料中快速查看当前婚姻状态，便于红娘针对性开展服务。"] },
  { id: 2, category: "新功能", title: "线上互选活动使用指南", time: "2025-05-25 12:57:20", hot: true, content: ["线上互选活动使用指南上线，帮助红娘快速上手线上互选活动配置与发布。"] },
  { id: 3, category: "新功能", title: "接入了全新的外呼系统-云客外呼平台", time: "2026-08-28 12:44:56", hot: true, content: ["接入了全新的外呼系统-云客外呼平台，通话效果更稳定。"] },
  { id: 4, category: "新功能", title: "系统新增了性格类型（MBTI）", time: "2026-08-08 09:18:51", hot: true },
  { id: 5, category: "新功能", title: "取消了电话外呼-外呼状态中无人用的花费全额项", time: "2026-01-16 16:03:34", hot: true },
  { id: 6, category: "新功能", title: "后台-运营工具中新增了自由收款功能，方便您在平台上快捷完成在线收款", time: "2025-12-11 17:12:49", hot: true },
  { id: 7, category: "新功能", title: "发布了商家联盟功能", time: "2025-05-21 08:34:06", hot: true },
  { id: 8, category: "新功能", title: "线上互选CP系统发布了", time: "2025-09-21 08:31:33", hot: true },
  { id: 9, category: "新功能", title: "新增了搭子社群系统", time: "2025-03-16 16:25:32", hot: true },
  { id: 10, category: "新功能", title: "新增了销售匹配库系统（脱敏库）", time: "2025-03-16 16:26:28", hot: true },
  { id: 11, category: "新功能", title: "新增了红娘喜讯系统", time: "2025-03-16 16:37:27", hot: true },
  { id: 12, category: "新功能", title: "《163K相亲系统》正式上线", time: "2025-03-16 16:42:57", hot: true },

  // 功能升级
  { id: 13, category: "功能升级", title: "新增了账号注销功能", red: true, time: "2026-07-08 09:08:17", hot: true, content: ["新增了账号注销功能，用户可在后台主动注销账号。"] },
  { id: 14, category: "功能升级", title: "活动报名新增了批量入库功能", time: "2026-09-04 11:44:31", hot: true },
  { id: 15, category: "功能升级", title: "平台账号中增加了账号关联的红娘身份的显示", time: "2026-09-03 10:57:03", hot: true },
  { id: 16, category: "功能升级", title: "活动报名增加了签到二维码功能", time: "2026-09-03 10:50:41", hot: true },
  { id: 17, category: "功能升级", title: "活动报名新增了指定手机号接收报名提醒的功能", time: "2026-08-31 07:22:41", hot: true },
  { id: 18, category: "功能升级", title: "商品分成功能进行了升级，新增了「合伙红旗分红」", time: "2026-08-28 12:42:45", hot: true },
  { id: 19, category: "功能升级", title: "后台的账号管理中新增了积分修改功能", time: "2026-08-27 15:27:36", hot: true },
  { id: 20, category: "功能升级", title: "新增了活动-任何人都可以报名的功能，支持实名认证", time: "2026-08-25 16:44:35", hot: true },
  { id: 21, category: "功能升级", title: "后台平台账号管理中新增了查看登录日志的功能", time: "2026-08-25 16:26:00", hot: true },
  { id: 22, category: "功能升级", title: "后台短信通知配置页面增加了搜索功能", time: "2026-08-25 16:31:52", hot: true },

  // 细节改进
  { id: 23, category: "细节改进", title: "会员资料页进行了全新改版", red: true, time: "2026-07-08 09:09:47", hot: true, content: ["会员资料页进行了全新改版，信息层级更清晰，操作更顺手。"] },
  { id: 24, category: "细节改进", title: "红娘团队页面头部轮播图无数据时，带入了默认图片", time: "2026-09-03 10:54:51", hot: true },
  { id: 25, category: "细节改进", title: "前台会员中心我的牵线中点击面见后增加了已加面见提示按钮", time: "2026-08-27 15:30:53", hot: true },
  { id: 26, category: "细节改进", title: "后台客源线索-功能配置中已入库到会员CRM的客源是继续在客源线索中改进为了不影响推广红娘", time: "2026-08-27 16:43:13", hot: true },
  { id: 27, category: "细节改进", title: "改进了当销售匹配库中启用智能匹配时，条件自动显示关联账号的降噪条件四要素", time: "2026-08-13 17:59:25", hot: true },
  { id: 28, category: "细节改进", title: "活动报名管理-活动筛选功能做出了改进", time: "2026-08-13 17:30:43", hot: true },
  { id: 29, category: "细节改进", title: "活动报名的报名管理导出界面改进为在页面中间显示", time: "2026-08-13 17:34:03", hot: true },
  { id: 30, category: "细节改进", title: "智能匹配库添加编辑时改进了部分提示内容", time: "2026-08-11 16:14:42", hot: true },
  { id: 31, category: "细节改进", title: "活动的添加编辑中默认封面图尺寸的提示进行了改进", time: "2026-08-11 16:15:23", hot: true },
  { id: 32, category: "细节改进", title: "改进了自动弃海规则-方便新分活会员来新添加跟进时，可以在名字下保留更长时间", time: "2026-08-08 09:27:36", hot: true },
  { id: 33, category: "细节改进", title: "改进了推广红娘没有线报可以退出限制", time: "2026-08-08 09:25:56", hot: true },

  // BUG修复
  { id: 34, category: "BUG修复", title: "修复了活动管理中封面小图选择云端素材时，封面大图变化的问题", time: "2026-09-08 09:26:10", hot: true },
  { id: 35, category: "BUG修复", title: "修复了包含特殊符号的账号注销时按钮的问题", time: "2026-09-08 09:24:38", hot: true },
  { id: 36, category: "BUG修复", title: "修复了部分情况下小程序中会员订单不显示的问题", time: "2026-09-04 11:46:19", hot: true },
  { id: 37, category: "BUG修复", title: "修复了相亲会员资料导出、选择门店下无数据时报验证码错误的问题", time: "2026-09-03 10:52:19", hot: true },
  { id: 38, category: "BUG修复", title: "修复了相亲会员按会员现居地分派红娘时，部分情况下分派红娘不正确的问题", time: "2026-08-27 16:10:32", hot: true },
  { id: 39, category: "BUG修复", title: "修复了红娘平台会员资料管理中性格爱好不显示的问题", time: "2026-08-27 15:21:58", hot: true },
  { id: 40, category: "BUG修复", title: "修复了客源线索-已入库的；点击查看 跳到的页面结果不正确的问题", time: "2026-08-25 16:41:21", hot: true },
  { id: 41, category: "BUG修复", title: "优化了红娘平台中部分外呼录音无法的问题", time: "2026-08-25 16:36:36", hot: true },
  { id: 42, category: "BUG修复", title: "修复了红娘平台手机版约会反馈页面男女反馈显示错乱的问题", time: "2026-08-25 16:35:06", hot: true },
  { id: 43, category: "BUG修复", title: "优化了新增注册用户进行会员分配并认证时出现的界面错误的问题", time: "2026-08-25 16:34:32", hot: true },
  { id: 44, category: "BUG修复", title: "修复了部分情况下商家信息不显示的问题", time: "2026-08-25 16:31:29", hot: true },

  // 其他更新
  { id: 45, category: "其他更新", title: "推广红娘进行了全新升级", time: "2026-04-09 10:51:44", hot: true },
  { id: 46, category: "其他更新", title: "由于厚朴外呼平台接口地址变化，平台更新了新的接口地址", time: "2025-04-28 10:22:16", hot: true, content: ["厚朴外呼平台接口调用的地址由 yy.51hope.com 改为了 yym.51hope.com"] },
  { id: 47, category: "其他更新", title: "更新了会员详情海报模板3和模板6", time: "2025-04-09 10:31:12" },
  { id: 48, category: "其他更新", title: "手机版的网站首页在最底部增加了备案编号显示,点击会跳转到工信部网站", time: "2025-03-29 17:12:04" },
];

const catCount: Record<string, number> = { all: 639, 功能升级: 255, 细节改进: 391, 新功能: 16, BUG修复: 169, 其他更新: 4 };

/* ------------------------------------------------------------------ */
/* 复制文字工具                                                        */
/* ------------------------------------------------------------------ */

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = (text: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* noop */
    }
  };
  return { copied, copy };
}

/* ------------------------------------------------------------------ */
/* 添加反馈抽屉                                                        */
/* ------------------------------------------------------------------ */

function FeedbackDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [type, setType] = useState("需求建议");
  if (!open) return null;
  return (
    <div className="ur-feedback-mask" onClick={onClose}>
      <div className="ur-feedback" onClick={(e) => e.stopPropagation()}>
        <div className="ur-feedback-head">
          <span className="ur-feedback-title">
            <button type="button" className="ur-feedback-close" onClick={onClose} aria-label="关闭">
              <X />
            </button>
            添加反馈
          </span>
          <div className="ur-feedback-actions">
            <button type="button" className="ur-btn-cancel" onClick={onClose}>取消</button>
            <button type="button" className="ur-btn-primary" onClick={onClose}>确定提交</button>
          </div>
        </div>
        <div className="ur-feedback-body">
          <div className="ur-frow">
            <span className="ur-flabel">反馈类型</span>
            <div className="ur-fradios">
              {["BUG反馈", "使用咨询", "需求建议", "故障诊断", "其他"].map((t) => (
                <label key={t} className="ur-fradio">
                  <input type="radio" name="ur-type" className="ur-fradio-input" checked={type === t} onChange={() => setType(t)} />
                  <span className="ur-fradio-dot"></span>
                  <span className="ur-fradio-text">{t}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="ur-frow ur-frow-top">
            <span className="ur-flabel ur-flabel-req">反馈内容<i>*</i></span>
            <div className="ur-editor">
              <div className="ur-editor-toolbar">
                {["H", "B", "T₁", "T₂", "I", "U", "S", "🖌", "🖼", "📋", "🔗", "⊕", "≡", "↔", "💬", "📈"].map((t) => (
                  <button type="button" key={t} className="ur-tool">{t}</button>
                ))}
              </div>
              <textarea className="ur-editor-text" placeholder="请输入正文" />
            </div>
          </div>

          <div className="ur-frow">
            <span className="ur-flabel ur-flabel-req">手机<i>*</i></span>
            <input className="ur-finput" defaultValue="13285288888" />
          </div>

          <div className="ur-frow">
            <span className="ur-flabel">微信</span>
            <input className="ur-finput" defaultValue="" />
          </div>

          <div className="ur-frow">
            <span className="ur-flabel">QQ</span>
            <input className="ur-finput" defaultValue="" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 弹窗主体                                                            */
/* ------------------------------------------------------------------ */

export default function UpdateReportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeKey, setActiveKey] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [activeItem, setActiveItem] = useState<UpdateItem | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { copied, copy } = useCopy();

  const shown = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return items.filter((it) => {
      if (activeKey !== "all" && it.category !== activeKey) return false;
      if (q && !(it.title.toLowerCase().includes(q) || it.category.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [activeKey, keyword]);

  const total = catCount[activeKey] ?? shown.length;

  // 打开时重置
  useEffect(() => {
    if (open) {
      setActiveItem(null);
      setKeyword("");
      setFeedbackOpen(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="ur-mask" onClick={onClose}>
      <div className={`ur-panel ${activeItem ? "ur-wide" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="ur-head">
          <span className="ur-title">系统更新消息</span>
          <button type="button" className="ur-close" onClick={onClose}>关闭</button>
        </div>

        <div className="ur-search">
          <input
            className="ur-search-input"
            placeholder="输入关键词搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <svg className="ur-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        </div>

        <div className="ur-tabs">
          {catTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`ur-tab ${activeKey === t.key ? "active" : ""}`}
              onClick={() => {
                setActiveKey(t.key);
                setKeyword("");
                setActiveItem(null);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="ur-body">
          <div className="ur-list">
            {shown.length === 0 ? (
              <div className="ur-list-hint">未找到匹配的更新内容</div>
            ) : (
              shown.map((it) => (
                <button key={it.id} type="button" className={`ur-item ${activeItem?.id === it.id ? "active" : ""}`} onClick={() => setActiveItem(it)}>
                  <div className="ur-item-top">
                    <span className="ur-cat">{it.category}</span>
                    <span className={`ur-text ${it.red ? "red" : ""}`}>{it.title}</span>
                    {it.hot && <span className="ur-hot">●</span>}
                  </div>
                  <div className="ur-item-time">{it.time}</div>
                </button>
              ))
            )}
            <div className="ur-footer">
              <span className="ur-count">共 {total} 条</span>
              <span className="ur-pager">
                <button type="button" className="ur-page" disabled>‹</button>
                <span className="ur-page cur">1</span>
                <button type="button" className="ur-page" disabled>›</button>
              </span>
            </div>
          </div>

          {activeItem && (
            <div className="ur-detail">
              <div className="ur-detail-title">{activeItem.title}</div>
              <div className="ur-detail-meta">{activeItem.category} · {activeItem.time}</div>
              <div className="ur-detail-divider"></div>
              <div className="ur-detail-content">
                {(activeItem.content ?? [activeItem.title]).map((p, idx) => (
                  <p className="ur-detail-p" key={idx}>{p}</p>
                ))}
              </div>
              <button type="button" className="ur-need-btn" onClick={() => setFeedbackOpen(true)}>＋ 提需求建议</button>
              <div className="ur-detail-copy">
                <button type="button" className="ur-copy-btn" onClick={() => copy(`${activeItem.title} ${activeItem.time}`)}>
                  {copied ? "已复制" : "复制内容"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <FeedbackDrawer open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </div>
  );
}
