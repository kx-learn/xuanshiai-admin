"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

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

interface ReplyRow {
  id: number;
  content: string;
}

interface ReplyState {
  mode: "all" | "random";
  items: ReplyRow[];
}

const DEFAULTS = {
  follow: { mode: "all", items: [] },
  keyword: { mode: "all", items: [] },
  message: { mode: "all", items: [] },
} as const;

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
  const domain = useConfigDomain<Dict>("wechat_mp_replies", DEFAULTS as unknown as Dict);
  const [activeTab, setActiveTab] = useState<TabKey>("follow");
  const [state, setState] = useState<Record<TabKey, ReplyState>>({
    follow: { mode: "all", items: [] },
    keyword: { mode: "all", items: [] },
    message: { mode: "all", items: [] },
  });
  const [keyword, setKeyword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const apply = useCallback((config: Dict | null) => {
    if (!config) return;
    const readGroup = (key: TabKey): ReplyState => {
      const g = asObject(config[key]);
      const items = Array.isArray(g.items) ? g.items : [];
      return {
        mode: asStr(g.mode, "all") === "random" ? "random" : "all",
        items: items.map((r, i) => {
          const o = asObject(r as Dict);
          return { id: Number(o.id ?? i + 1), content: asStr(o.content, "") };
        }),
      };
    };
    setState({ follow: readGroup("follow"), keyword: readGroup("keyword"), message: readGroup("message") });
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const persist = async (next: Record<TabKey, ReplyState>, summary: string) => {
    setState(next);
    await domain.save(next as unknown as Partial<Dict>, summary);
  };

  const current = state[activeTab];
  const shownItems = activeTab === "keyword" && keyword
    ? current.items.filter((r) => r.content.includes(keyword))
    : current.items;

  const addReply = async () => {
    const newRow: ReplyRow = { id: Date.now(), content: "请输入回复内容" };
    await persist({ ...state, [activeTab]: { ...current, items: [...current.items, newRow] } }, `${ADD_LABEL[activeTab]}`);
  };

  const removeReply = async (id: number) => {
    await persist({ ...state, [activeTab]: { ...current, items: current.items.filter((r) => r.id !== id) } }, "删除自动回复");
  };

  const saveEdit = async (id: number) => {
    await persist(
      { ...state, [activeTab]: { ...current, items: current.items.map((r) => (r.id === id ? { ...r, content: draft } : r)) } },
      "修改自动回复",
    );
    setEditingId(null);
    setDraft("");
    showConfigToast("已保存");
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
            <span className="ar-notice-icon">i</span>
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
              <span className="ar-add-bolt">⚡</span> 触发关键词统计
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
                  <button type="button" className="ar-search-btn" title="搜索">🔍</button>
                </div>
              ) : (
                <ReplyRadio
                  value={current.mode}
                  onChange={(mode) => persist({ ...state, [activeTab]: { ...current, mode } }, "修改自动回复方式")}
                />
              )}
            </div>
          </div>

          <div className="ar-card-body">
            {shownItems.length === 0 ? (
              <div className="ar-empty">暂无回复内容</div>
            ) : (
              shownItems.map((r) => (
                <div key={r.id} className="ar-row">
                  {editingId === r.id ? (
                    <div className="ar-edit-box">
                      <input
                        className="ar-edit-input"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(r.id);
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                      <div className="ar-edit-actions">
                        <button type="button" className="ar-edit-save" onClick={() => saveEdit(r.id)}>保存</button>
                        <button type="button" className="ar-edit-cancel" onClick={() => { setEditingId(null); setDraft(""); }}>取消</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span className="ar-row-content">{r.content}</span>
                      <div className="ar-row-actions">
                        <button type="button" className="ar-icon-btn" title="编辑" onClick={() => { setEditingId(r.id); setDraft(r.content); }}>✎</button>
                        <button type="button" className="ar-icon-btn ar-icon-del" title="删除" onClick={() => removeReply(r.id)}>🗑</button>
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
