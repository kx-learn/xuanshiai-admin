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

type MatchType = "contain" | "equal";
type ReplyType = "text" | "link";

interface ReplyRow {
  id: number;
  content: string;
  /** 关键词回复专用字段 */
  keyword?: string;
  match?: MatchType;
  reply_type?: ReplyType;
}

interface ReplyState {
  mode: "all" | "random";
  items: ReplyRow[];
}

interface RuleDraft {
  keyword: string;
  match: MatchType;
  reply_type: ReplyType;
  content: string;
}

/** id 为 null 表示尚未保存的新增行 */
interface EditingState {
  id: number | null;
  draft: RuleDraft;
}

const MATCH_LABEL: Record<MatchType, string> = { contain: "包含", equal: "等于" };
const TYPE_LABEL: Record<ReplyType, string> = { text: "文字", link: "链接" };
const STAT_UNAVAILABLE_REASON = "后端暂未提供关键词触发记录，无法统计";

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
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [matchFilter, setMatchFilter] = useState<"" | MatchType>("");
  const [typeFilter, setTypeFilter] = useState<"" | ReplyType>("");
  const [editing, setEditing] = useState<EditingState | null>(null);

  const apply = useCallback((config: Dict | null) => {
    if (!config) return;
    const readGroup = (key: TabKey): ReplyState => {
      const g = asObject(config[key]);
      const items = Array.isArray(g.items) ? g.items : [];
      return {
        mode: asStr(g.mode, "all") === "random" ? "random" : "all",
        items: items.map((r, i) => {
          const o = asObject(r as Dict);
          const row: ReplyRow = {
            id: Number(o.id ?? i + 1),
            content: asStr(o.content, ""),
            keyword: asStr(o.keyword, ""),
            match: o.match === "equal" ? "equal" : "contain",
            reply_type: o.reply_type === "link" ? "link" : "text",
          };
          return row;
        }),
      };
    };
    setState({ follow: readGroup("follow"), keyword: readGroup("keyword"), message: readGroup("message") });
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  /** 提交并以服务端返回的快照刷新视图；失败时回滚到提交前的快照 */
  const persist = async (next: Record<TabKey, ReplyState>, summary: string) => {
    const before = domain.snapshot?.config ?? null;
    setState(next);
    const ok = await domain.save(next as unknown as Partial<Dict>, summary);
    if (!ok) apply(before);
    return ok;
  };

  const current = state[activeTab];
  const shownItems = current.items.filter((r) => {
    if (activeTab !== "keyword") return true;
    if (matchFilter && (r.match ?? "contain") !== matchFilter) return false;
    if (typeFilter && (r.reply_type ?? "text") !== typeFilter) return false;
    if (appliedKeyword && !(r.keyword ?? "").includes(appliedKeyword)) return false;
    return true;
  });

  const startAdd = () => {
    setEditing({ id: null, draft: { keyword: "", match: "contain", reply_type: "text", content: "" } });
  };

  const startEdit = (r: ReplyRow) => {
    setEditing({
      id: r.id,
      draft: {
        keyword: r.keyword ?? "",
        match: r.match ?? "contain",
        reply_type: r.reply_type ?? "text",
        content: r.content,
      },
    });
  };

  const removeReply = async (id: number) => {
    await persist({ ...state, [activeTab]: { ...current, items: current.items.filter((r) => r.id !== id) } }, "删除自动回复");
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { draft } = editing;
    const content = draft.content.trim();
    if (activeTab === "keyword" && !draft.keyword.trim()) {
      showConfigToast("请输入关键词", "error");
      return;
    }
    if (!content) {
      showConfigToast("请输入回复内容", "error");
      return;
    }
    const row: ReplyRow = {
      id: editing.id ?? Date.now(),
      content,
      ...(activeTab === "keyword" ? { keyword: draft.keyword.trim(), match: draft.match, reply_type: draft.reply_type } : {}),
    };
    const items = editing.id === null
      ? [...current.items, row]
      : current.items.map((r) => (r.id === editing.id ? row : r));
    const unchanged = JSON.stringify(items) === JSON.stringify(current.items);
    if (unchanged) {
      setEditing(null);
      showConfigToast("没有需要保存的修改");
      return;
    }
    const ok = await persist(
      { ...state, [activeTab]: { ...current, items } },
      editing.id === null ? ADD_LABEL[activeTab] : "修改自动回复",
    );
    if (ok) {
      setEditing(null);
      showConfigToast("已保存");
    } else {
      showConfigToast("保存失败，请刷新后重试", "error");
    }
  };

  const renderEditor = () => {
    if (!editing) return null;
    const { draft } = editing;
    const patchDraft = (patch: Partial<RuleDraft>) => setEditing({ ...editing, draft: { ...draft, ...patch } });
    return (
      <div className="ar-row">
        <div className="ar-edit-box" style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          {activeTab === "keyword" && (
            <>
              <input
                className="ar-edit-input"
                style={{ maxWidth: 200 }}
                value={draft.keyword}
                placeholder="关键词"
                aria-label="关键词"
                autoFocus
                onChange={(e) => patchDraft({ keyword: e.target.value })}
              />
              <select
                className="ar-search-select"
                value={draft.match}
                aria-label="匹配方式"
                onChange={(e) => patchDraft({ match: e.target.value as MatchType })}
              >
                <option value="contain">包含</option>
                <option value="equal">等于</option>
              </select>
              <select
                className="ar-search-select"
                value={draft.reply_type}
                aria-label="回复类型"
                onChange={(e) => patchDraft({ reply_type: e.target.value as ReplyType })}
              >
                <option value="text">文字</option>
                <option value="link">链接</option>
              </select>
            </>
          )}
          <input
            className="ar-edit-input"
            style={{ flex: 1, minWidth: 200 }}
            value={draft.content}
            placeholder="回复内容"
            aria-label="回复内容"
            autoFocus={activeTab !== "keyword"}
            onChange={(e) => patchDraft({ content: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") void saveEdit();
              if (e.key === "Escape") setEditing(null);
            }}
          />
          <div className="ar-edit-actions">
            <button type="button" className="ar-edit-save" onClick={() => void saveEdit()}>保存</button>
            <button type="button" className="ar-edit-cancel" onClick={() => setEditing(null)}>取消</button>
          </div>
        </div>
      </div>
    );
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
            <button type="button" className="ar-add-btn" onClick={startAdd}>
              <span className="ar-add-plus">+</span> {ADD_LABEL.keyword}
            </button>
            <button
              type="button"
              className="ar-add-btn ar-add-stat"
              disabled
              title={STAT_UNAVAILABLE_REASON}
              style={{ opacity: 0.5, cursor: "not-allowed" }}
            >
              <span className="ar-add-bolt">⚡</span> 触发关键词统计
            </button>
          </div>
        ) : (
          <button type="button" className="ar-add-btn ar-add-wide" onClick={startAdd}>
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
                  <select
                    className="ar-search-select"
                    value={matchFilter}
                    onChange={(e) => setMatchFilter(e.target.value as "" | MatchType)}
                    aria-label="匹配方式"
                  >
                    <option value="">全部匹配</option>
                    <option value="contain">包含</option>
                    <option value="equal">等于</option>
                  </select>
                  <select
                    className="ar-search-select"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as "" | ReplyType)}
                    aria-label="回复类型"
                  >
                    <option value="">全部类型</option>
                    <option value="text">文字</option>
                    <option value="link">链接</option>
                  </select>
                  <input
                    className="ar-search-input"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="输入关键词"
                    onKeyDown={(e) => { if (e.key === "Enter") setAppliedKeyword(keyword.trim()); }}
                  />
                  <button type="button" className="ar-search-btn" title="搜索" onClick={() => setAppliedKeyword(keyword.trim())}>🔍</button>
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
            {editing && editing.id === null && renderEditor()}
            {shownItems.length === 0 && !(editing && editing.id === null) ? (
              <div className="ar-empty">暂无回复内容</div>
            ) : (
              shownItems.map((r) =>
                editing && editing.id === r.id ? (
                  <div key={r.id}>{renderEditor()}</div>
                ) : (
                  <div key={r.id} className="ar-row">
                    <span className="ar-row-content">
                      {activeTab === "keyword" && (
                        <>
                          <span>{r.keyword || "-"}</span>
                          <span>{`（${MATCH_LABEL[r.match ?? "contain"]} / ${TYPE_LABEL[r.reply_type ?? "text"]}）`}</span>
                          <span> ：</span>
                        </>
                      )}
                      {r.content}
                    </span>
                    <div className="ar-row-actions">
                      <button type="button" className="ar-icon-btn" title="编辑" onClick={() => startEdit(r)}>✎</button>
                      <button type="button" className="ar-icon-btn ar-icon-del" title="删除" onClick={() => removeReply(r.id)}>🗑</button>
                    </div>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
