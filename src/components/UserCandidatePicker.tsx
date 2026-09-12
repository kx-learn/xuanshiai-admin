"use client";

import { useEffect, useRef, useState } from "react";
import { resolveMediaUrl } from "@/lib/admin-api";

/** 后台「搜索已注册用户并绑定」统一用到的候选结构（各角色接口返回同构）。 */
export interface UserCandidate {
  id: number;
  nickname?: string | null;
  real_name?: string | null;
  phone?: string | null;
  avatar?: string | null;
  wechat_bound?: boolean;
  is_service_matchmaker?: boolean;
  is_promoter?: boolean;
  has_team?: boolean;
  unavailable?: boolean;
  unavailable_reason?: string | null;
}

interface UserCandidatePickerProps {
  /** 输入框当前文本 */
  value: string;
  /** 文本变化（同时回传当前选中的用户 ID，未选中为 null） */
  onChange: (value: string, selectedUserId: number | null) => void;
  /** 选中某个候选用户 */
  onSelect?: (candidate: UserCandidate) => void;
  /** 调用后台搜索接口 */
  search: (keyword: string) => Promise<UserCandidate[]>;
  placeholder?: string;
  disabled?: boolean;
  /** 触发搜索的最小字符数，默认 1 */
  minChars?: number;
  /** 输入框附加样式类 */
  className?: string;
}

const EMPTY: UserCandidate[] = [];

/**
 * 后台账号搜索选择器。
 *
 * 之前各页面各自实现，存在几个共性问题：输入 1 个字不触发、无防抖导致抖动、
 * 接口报错时静默失败（看起来像"搜索框没用"）、不可绑定的用户也会被选中。
 * 这里统一：输入即搜（≥1 字）+ 300ms 防抖 + 加载/空/失败三种明确状态
 * + 不可选用户置灰并给出原因。
 */
export default function UserCandidatePicker({
  value,
  onChange,
  onSelect,
  search,
  placeholder = "输入昵称 / 手机号 / 用户ID / 姓名搜索",
  disabled = false,
  minChars = 1,
  className = "bm-input-wide",
}: UserCandidatePickerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<UserCandidate[]>(EMPTY);
  const [failed, setFailed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqRef = useRef(0);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // 调用方通常直接传内联箭头函数，若把它放进 effect 依赖会每次渲染都重跑搜索，
  // 因此这里用 ref 持有最新回调，effect 只依赖关键词本身。
  const searchRef = useRef(search);
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const keyword = value.trim();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    reqRef.current += 1; // 让在途响应作废

    if (disabled || keyword.length < minChars) {
      setOpen(false);
      setItems(EMPTY);
      setLoading(false);
      setFailed(false);
      return;
    }

    setLoading(true);
    setFailed(false);
    timerRef.current = setTimeout(() => {
      const seq = reqRef.current;
      searchRef
        .current(keyword)
        .then((list) => {
          if (seq !== reqRef.current) return; // 丢弃过期响应
          setItems(list ?? EMPTY);
          setOpen(true);
        })
        .catch(() => {
          if (seq !== reqRef.current) return;
          setItems(EMPTY);
          setFailed(true);
          setOpen(true);
        })
        .finally(() => {
          if (seq === reqRef.current) setLoading(false);
        });
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [keyword, disabled, minChars]);

  // 点击外部关闭下拉
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const handleInput = (text: string) => {
    onChange(text, null);
  };

  const handlePick = (item: UserCandidate) => {
    if (item.unavailable) return;
    setOpen(false);
    onChange(item.nickname ?? item.phone ?? String(item.id), item.id);
    onSelect?.(item);
  };

  const showEmpty = !loading && !failed && items.length === 0;

  return (
    <div className="bm-search-wrap" ref={wrapRef}>
      <input
        className={className}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        autoComplete="off"
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => {
          if (items.length > 0 || failed) setOpen(true);
        }}
      />
      {open && !disabled && (
        <div className="bm-candidate-list">
          {loading && <div className="bm-candidate-empty">搜索中…</div>}
          {!loading && failed && <div className="bm-candidate-empty">搜索失败，请重试</div>}
          {showEmpty && (
            <div className="bm-candidate-empty">
              未找到匹配的用户，可尝试用户ID / 手机号 / 昵称 / 姓名
            </div>
          )}
          {!loading &&
            !failed &&
            items.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`bm-candidate${c.unavailable ? " is-disabled" : ""}`}
                disabled={c.unavailable}
                onClick={() => handlePick(c)}
              >
                {c.avatar ? (
                  <img className="bm-candidate-avatar" src={resolveMediaUrl(c.avatar) ?? ""} alt="" />
                ) : (
                  <span className="bm-candidate-avatar bm-candidate-ph" />
                )}
                <span className="bm-candidate-name">{c.nickname ?? "-"}</span>
                <span className="bm-candidate-id">ID {c.id}</span>
                <span className="bm-candidate-phone">{c.phone ?? "-"}</span>
                {c.unavailable && c.unavailable_reason && (
                  <span className="bm-candidate-tag">{c.unavailable_reason}</span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
