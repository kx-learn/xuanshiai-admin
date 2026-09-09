"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

/**
 * 公众号自动回复（纯前端演示，无后端接口）
 * 三个 tab：关注回复 / 关键词回复 / 消息回复
 */

type TabKey = "follow" | "keyword" | "message";

const TABS: { key: TabKey; label: string }[] = [
  { key: "follow", label: "关注回复" },
  { key: "keyword", label: "关键词回复" },
  { key: "message", label: "消息回复" },
];

const NOTICE: Record<TabKey, string> = {
  follow: "当用户关注公众号时，系统会自动回复以下信息，但根据腾讯官方要求，只能发送前2条",
  keyword: "当用户输入关键词以外的内容时，系统会自动回复以下信息，但根据腾讯官方要求，只能发送前2条",
  message: "当用户输入关键词以外的内容时，系统会自动回复以下信息，但根据腾讯官方要求，只能发送前2条",
};

const ADD_LABEL: Record<TabKey, string> = {
  follow: "添加关注回复",
  keyword: "添加关键词回复",
  message: "添加消息回复",
};

/** 灯泡提示图标 */
function NoticeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
      <line x1="9" y1="21" x2="15" y2="21" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 2 4.5 13.5h5L10 22l8.5-11.5h-5L13 2z" />
    </svg>
  );
}

interface ReplyRow {
  id: number;
  content: string;
}

/** radio：回复全部 / 随机回复 */
function ReplyRadio({ value, onChange }: { value: "all" | "random"; onChange: (v: "all" | "random") => void }) {
  return (
    <div className="ar-radio-group">
      <label className="ar-radio">
        <input type="radio" name="replyMode" checked={value === "all"} onChange={() => onChange("all")} />
        <span className="ar-radio-dot" />
        <span className="ar-radio-label">回复全部</span>
      </label>
      <label className="ar-radio">
        <input type="radio" name="replyMode" checked={value === "random"} onChange={() => onChange("random")} />
        <span className="ar-radio-dot" />
        <span className="ar-radio-label">随机回复</span>
      </label>
    </div>
  );
}

export default function WechatAutoreplyPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("follow");
  const [replyMode, setReplyMode] = useState<"all" | "random">("all");
  const [keyword, setKeyword] = useState("");
  const [followReplies, setFollowReplies] = useState<ReplyRow[]>([
    { id: 1, content: "Hi，欢迎来到宣智爱❤一个真实、有趣、优质的脱单社交平台。" },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const addReply = () => {
    const newReply: ReplyRow = { id: Date.now(), content: "请输入回复内容" };
    setFollowReplies((prev) => [...prev, newReply]);
  };

  const removeReply = (id: number) => {
    setFollowReplies((prev) => prev.filter((r) => r.id !== id));
  };

  const startEdit = (id: number, content: string) => {
    setEditingId(id);
    setDraft(content);
  };

  const saveEdit = (id: number) => {
    setFollowReplies((prev) => prev.map((r) => (r.id === id ? { ...r, content: draft } : r)));
    setEditingId(null);
    setDraft("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft("");
  };

  const currentReplies = activeTab === "follow" ? followReplies : [];

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
          { label: "自动回复" },
        ]}
      />

      <div className="ar-page">
        {/* tab */}
        <div className="ar-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`ar-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* 须知（关注/消息） */}
        {(activeTab === "follow" || activeTab === "message") && (
          <div className="ar-notice">
            <span className="ar-notice-icon"><NoticeIcon /></span>
            <span>{NOTICE[activeTab]}</span>
          </div>
        )}

        {/* 添加按钮 */}
        {activeTab === "keyword" ? (
          <div className="ar-add-row">
            <button type="button" className="ar-add-btn" onClick={addReply}>
              <span className="ar-add-plus">+</span> {ADD_LABEL.keyword}
            </button>
            <button type="button" className="ar-add-btn ar-add-stat" onClick={() => {}}>
              <span className="ar-add-bolt"><BoltIcon /></span> 触发关键词统计
            </button>
          </div>
        ) : (
          <button type="button" className="ar-add-btn ar-add-wide" onClick={addReply}>
            <span className="ar-add-plus">+</span> {ADD_LABEL[activeTab]}
          </button>
        )}

        {/* 回复内容 */}
        <div className="ar-card">
          <div className="ar-card-header">
            <span className="ar-card-title">回复内容</span>
            <div className="ar-card-tools">
              {activeTab === "keyword" ? (
                <div className="ar-search">
                  <input
                    className="ar-search-input"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="请输入关键词"
                  />
                  <button type="button" className="ar-search-btn" title="搜索"><SearchIcon /></button>
                </div>
              ) : (
                <ReplyRadio value={replyMode} onChange={setReplyMode} />
              )}
            </div>
          </div>

          <div className="ar-card-body">
            {currentReplies.length === 0 ? (
              <div className="ar-empty">暂无回复内容</div>
            ) : (
              currentReplies.map((r) => (
                <div key={r.id} className="ar-row">
                  {editingId === r.id ? (
                    <div className="ar-edit-box">
                      <input
                        className="ar-edit-input"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus
                      />
                      <div className="ar-edit-actions">
                        <button type="button" className="ar-edit-save" onClick={() => saveEdit(r.id)}>保存</button>
                        <button type="button" className="ar-edit-cancel" onClick={cancelEdit}>取消</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="ar-row-content">{r.content}</span>
                      <div className="ar-row-actions">
                        <button type="button" className="ar-icon-btn" title="编辑" onClick={() => startEdit(r.id, r.content)}><EditIcon /></button>
                        <button type="button" className="ar-icon-btn ar-icon-del" title="删除" onClick={() => removeReply(r.id)}><DeleteIcon /></button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
