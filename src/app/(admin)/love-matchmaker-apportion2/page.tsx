"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import {
  adminEndpoints,
  type ApportionAbandonFields,
  type ApportionAssignFields,
  type ApportionConfigPayload,
  type ApportionScope,
} from "@/lib/admin-endpoints";
import { resolveMediaUrl } from "@/lib/admin-api";

const SCOPE_LABEL: Record<ApportionScope, string> = {
  member_crm: "会员CRM",
  customer_lead: "客源线索",
};

const STRATEGY_OPTIONS: { value: ApportionAssignFields["strategy"]; label: string }[] = [
  { value: "designated", label: "指定红娘" },
  { value: "round_robin_random", label: "轮询随机" },
  { value: "by_region", label: "按地区分配" },
  { value: "by_promoter", label: "按推广红娘分配" },
  { value: "none", label: "不自动分配" },
];

const ABANDON_DAYS_OPTIONS = [0, 3, 7, 15, 30, 45, 60, 90];

interface MatchmakerOption {
  user_id: number;
  nickname: string;
  avatar: string | null;
  success_count: number;
  rating_score: number;
  is_available: boolean;
}

type ConfigMap = Partial<Record<ApportionScope, { assign?: ApportionConfigPayload; abandon?: ApportionConfigPayload }>>;

const ASSIGN_DEFAULTS: ApportionAssignFields = {
  strategy: "none",
  target_matchmaker_id: null,
  target_matchmaker_name: null,
  round_robin_pool_size: 5,
  region_strategy: null,
  promoter_follow_enabled: false,
  remark: null,
  updated_at: "",
};
const ABANDON_DEFAULTS: ApportionAbandonFields = {
  auto_abandon_days: 7,
  daily_pickup_limit: 50,
  show_admin_abandoned_in_pool: true,
  show_store_abandoned_in_pool: false,
  remark: null,
  updated_at: "",
};

export default function LoveMatchmakerApportion2Page() {
  const [activeScope, setActiveScope] = useState<ApportionScope>("member_crm");
  const [configMap, setConfigMap] = useState<ConfigMap>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<Record<string, string>>({});
  const [infoMsg, setInfoMsg] = useState<Record<string, string>>({});

  const [assignDraft, setAssignDraft] = useState<ApportionAssignFields>(ASSIGN_DEFAULTS);
  const [abandonDraft, setAbandonDraft] = useState<ApportionAbandonFields>(ABANDON_DEFAULTS);
  const [targetIdInput, setTargetIdInput] = useState<string>("");

  // 红娘候选人（指定红娘策略使用）
  const [matchmakerOptions, setMatchmakerOptions] = useState<MatchmakerOption[]>([]);
  const [matchmakerLoading, setMatchmakerLoading] = useState(false);
  const [matchmakerKeyword, setMatchmakerKeyword] = useState("");

  // 拉取该 scope 下两个配置
  const loadConfigs = useCallback(async (scope: ApportionScope) => {
    setLoading((prev) => ({ ...prev, [scope]: true }));
    setErrorMsg((prev) => ({ ...prev, [scope]: "" }));
    try {
      const [assign, abandon] = await Promise.all([
        adminEndpoints.apportionConfig(scope, "assign"),
        adminEndpoints.apportionConfig(scope, "abandon"),
      ]);
      setConfigMap((prev) => ({ ...prev, [scope]: { assign, abandon } }));
    } catch (error) {
      setErrorMsg((prev) => ({
        ...prev,
        [scope]: error instanceof Error ? error.message : "加载失败",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [scope]: false }));
    }
  }, []);

  useEffect(() => {
    void loadConfigs(activeScope);
  }, [activeScope, loadConfigs]);

  // 进入页面时一次性拉取可用红娘列表（指定红娘策略使用）
  const loadMatchmakers = useCallback(async (keyword: string) => {
    setMatchmakerLoading(true);
    try {
      const payload = (await adminEndpoints.matchmakers({
        page: 1,
        page_size: 50,
        available: 1,
        keyword: keyword || undefined,
      })) as unknown as { items: MatchmakerOption[] };
      const items = payload.items ?? [];
      setMatchmakerOptions(items);
    } catch (error) {
      setErrorMsg((prev) => ({
        ...prev,
        __matchmakers: error instanceof Error ? error.message : "加载红娘列表失败",
      }));
      setMatchmakerOptions([]);
    } finally {
      setMatchmakerLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMatchmakers("");
  }, [loadMatchmakers]);

  // 当 scope 切换或后端数据回来时同步表单
  useEffect(() => {
    const entry = configMap[activeScope];
    if (entry?.assign) {
      setAssignDraft({ ...ASSIGN_DEFAULTS, ...entry.assign.assign });
      setTargetIdInput(entry.assign.assign?.target_matchmaker_id ? String(entry.assign.assign.target_matchmaker_id) : "");
    } else {
      setAssignDraft(ASSIGN_DEFAULTS);
      setTargetIdInput("");
    }
    if (entry?.abandon) {
      setAbandonDraft({ ...ABANDON_DEFAULTS, ...entry.abandon.abandon });
    } else {
      setAbandonDraft(ABANDON_DEFAULTS);
    }
  }, [activeScope, configMap]);

  const isCustomerLead = activeScope === "customer_lead";
  const strategyOptions = useMemo(() => {
    return STRATEGY_OPTIONS.filter((option) => !(isCustomerLead && option.value === "by_region"));
  }, [isCustomerLead]);

  // ─── 操作：保存分配配置 ─────────────────────────────────────
  const handleSaveAssign = useCallback(async () => {
    const key = "assign";
    setSaving((prev) => ({ ...prev, [key]: true }));
    setErrorMsg((prev) => ({ ...prev, [key]: "" }));
    setInfoMsg((prev) => ({ ...prev, [key]: "" }));
    const body: Record<string, unknown> = {
      strategy: assignDraft.strategy,
      round_robin_pool_size: assignDraft.round_robin_pool_size ?? null,
      region_strategy: assignDraft.region_strategy ?? null,
      promoter_follow_enabled: assignDraft.promoter_follow_enabled ?? false,
      remark: assignDraft.remark ?? null,
    };
    if (assignDraft.strategy === "designated") {
      const parsed = Number.parseInt(targetIdInput, 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        setSaving((prev) => ({ ...prev, [key]: false }));
        setErrorMsg((prev) => ({ ...prev, [key]: "选择「指定红娘」时必须填写合法的 target_matchmaker_id" }));
        return;
      }
      body.target_matchmaker_id = parsed;
      body.target_matchmaker_name = assignDraft.target_matchmaker_name || null;
    } else {
      body.target_matchmaker_id = null;
      body.target_matchmaker_name = null;
    }
    try {
      await adminEndpoints.upsertApportionAssign(activeScope, body);
      setInfoMsg((prev) => ({ ...prev, [key]: "分配配置已保存" }));
      await loadConfigs(activeScope);
    } catch (error) {
      setErrorMsg((prev) => ({
        ...prev,
        [key]: error instanceof Error ? error.message : "保存失败",
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  }, [activeScope, assignDraft, loadConfigs, targetIdInput]);

  // ─── 操作：保存弃海配置 ─────────────────────────────────────
  const handleSaveAbandon = useCallback(async () => {
    const key = "abandon";
    setSaving((prev) => ({ ...prev, [key]: true }));
    setErrorMsg((prev) => ({ ...prev, [key]: "" }));
    setInfoMsg((prev) => ({ ...prev, [key]: "" }));
    const body: Record<string, unknown> = {
      auto_abandon_days: abandonDraft.auto_abandon_days,
      daily_pickup_limit: abandonDraft.daily_pickup_limit,
      show_admin_abandoned_in_pool: abandonDraft.show_admin_abandoned_in_pool,
      show_store_abandoned_in_pool: abandonDraft.show_store_abandoned_in_pool,
      remark: abandonDraft.remark ?? null,
    };
    try {
      await adminEndpoints.upsertApportionAbandon(activeScope, body);
      setInfoMsg((prev) => ({ ...prev, [key]: "弃海配置已保存" }));
      await loadConfigs(activeScope);
    } catch (error) {
      setErrorMsg((prev) => ({
        ...prev,
        [key]: error instanceof Error ? error.message : "保存失败",
      }));
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  }, [abandonDraft, activeScope, loadConfigs]);

  const scopeLoading = loading[activeScope];
  const assignError = errorMsg["assign"];
  const abandonError = errorMsg["abandon"];
  const assignInfo = infoMsg["assign"];
  const abandonInfo = infoMsg["abandon"];

  return (
    <div>
      <AdminBreadcrumb items={[{ label: "首页", href: "/home" }, { label: "总店红娘" }, { label: "分派配置" }]} />
      <h1 className="mb-3 text-xl font-medium text-[#333]">分派配置</h1>

      <div className="mb-4 flex border-b border-[#f0f0f0]">
        {(Object.keys(SCOPE_LABEL) as ApportionScope[]).map((scope) => (
          <button
            key={scope}
            type="button"
            onClick={() => setActiveScope(scope)}
            className={`px-4 py-3 text-sm ${activeScope === scope ? "border-b-2 border-[#3658f7] text-[#3658f7]" : "text-[#666]"}`}
          >
            {SCOPE_LABEL[scope]}
          </button>
        ))}
      </div>

      {scopeLoading && (
        <div className="admin-card mb-4 p-8 text-center text-[#999]">正在加载 {SCOPE_LABEL[activeScope]} 配置...</div>
      )}

      {/* ─── 分配配置块 ──────────────────────────────────────── */}
      <section className="admin-card mb-4">
        <header className="border-b border-[#f0f0f0] px-5 py-3">
          <h2 className="text-base font-medium text-[#333]">分配配置</h2>
        </header>
        <div className="admin-card-body space-y-6">
          {assignError && <div className="rounded border border-[#ffccc7] bg-[#fff2f0] px-3 py-2 text-xs text-[#ff4d4f]">{assignError}</div>}
          {assignInfo && <div className="rounded border border-[#b7eb8f] bg-[#f6ffed] px-3 py-2 text-xs text-[#52c41a]">{assignInfo}</div>}

          <div className="flex flex-col sm:flex-row sm:gap-6">
            <label className="shrink-0 pt-1.5 text-sm text-[#333] sm:w-72 sm:text-right">分配策略</label>
            <div className="mt-1 flex-1 space-y-2 sm:mt-0">
              {strategyOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-2 rounded border px-3 py-2 text-sm transition-colors ${
                    assignDraft.strategy === option.value
                      ? "border-[#3658f7] bg-[#edf2ff]"
                      : "border-[#e7eaf0] hover:border-[#b9c8fb]"
                  }`}
                >
                  <input
                    type="radio"
                    name="assign-strategy"
                    checked={assignDraft.strategy === option.value}
                    onChange={() => setAssignDraft((prev) => ({ ...prev, strategy: option.value }))}
                    className="mt-1 accent-[#3658f7]"
                  />
                  <span className="font-medium text-[#333]">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {assignDraft.strategy === "designated" && (
            <div className="flex flex-col sm:flex-row sm:gap-6">
              <label className="shrink-0 pt-1.5 text-sm text-[#333] sm:w-72 sm:text-right">指定红娘 *</label>
              <div className="mt-1 flex-1 sm:mt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={matchmakerKeyword}
                    onChange={(event) => setMatchmakerKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void loadMatchmakers(matchmakerKeyword.trim());
                    }}
                    placeholder="按昵称 / ID 搜索"
                    className="h-8 w-48 rounded-md border border-[#d9d9d9] px-3 text-sm focus:border-[#3658f7] focus:shadow-[0_0_0_2px_rgba(54,88,247,0.2)] focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="default"
                    loading={matchmakerLoading}
                    onClick={() => void loadMatchmakers(matchmakerKeyword.trim())}
                  >
                    搜索
                  </Button>
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => { setMatchmakerKeyword(""); void loadMatchmakers(""); }}
                  >
                    重置
                  </Button>
                  <span className="text-xs text-[#999]">{matchmakerLoading ? "加载中..." : `共 ${matchmakerOptions.length} 位可分配红娘（仅展示在岗）`}</span>
                </div>
                <div className="mt-2 max-h-72 overflow-y-auto rounded-md border border-[#e7eaf0] divide-y divide-[#f0f2f5]">
                  {matchmakerOptions.length === 0 && !matchmakerLoading && (
                    <div className="p-4 text-center text-sm text-[#999]">{matchmakerKeyword ? "未找到匹配的红娘" : "暂无可分配红娘"}</div>
                  )}
                  {matchmakerOptions.map((m) => {
                    const checked = targetIdInput === String(m.user_id);
                    const avatarUrl = resolveMediaUrl(m.avatar);
                    return (
                      <label
                        key={m.user_id}
                        className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-[#f7f9ff] ${checked ? "bg-[#edf2ff]" : ""}`}
                      >
                        <input
                          type="radio"
                          name="designated-matchmaker"
                          checked={checked}
                          onChange={() => {
                            setTargetIdInput(String(m.user_id));
                            setAssignDraft((prev) => ({
                              ...prev,
                              target_matchmaker_id: m.user_id,
                              target_matchmaker_name: m.nickname,
                            }));
                          }}
                          className="accent-[#3658f7]"
                        />
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={m.nickname} className="h-8 w-8 rounded-full object-cover bg-[#f0f2f5]" />
                        ) : (
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#edf2ff] text-xs text-[#3658f7]">
                            {(m.nickname || `U${m.user_id}`).slice(0, 1)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium text-[#333]">
                            {m.nickname || `红娘#${m.user_id}`}
                            <span className="ml-2 text-xs text-[#999]">ID {m.user_id}</span>
                            {!m.is_available && <span className="ml-2 rounded bg-[#fff2f0] px-1.5 py-0.5 text-[10px] text-[#ff4d4f]">已停用</span>}
                          </div>
                          <div className="text-xs text-[#999]">
                            案例 {m.success_count} · 评分 {m.rating_score?.toFixed?.(2) ?? m.rating_score}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
                {targetIdInput && (
                  <p className="mt-2 text-xs text-[#999]">
                    已选：{assignDraft.target_matchmaker_name ?? "(空)"} (ID={targetIdInput}){" "}
                    <button
                      type="button"
                      className="ml-2 text-[#3658f7] hover:underline"
                      onClick={() => {
                        setTargetIdInput("");
                        setAssignDraft((prev) => ({ ...prev, target_matchmaker_id: null, target_matchmaker_name: null }));
                      }}
                    >
                      清除选择
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          {assignDraft.strategy === "round_robin_random" && (
            <div className="flex flex-col sm:flex-row sm:gap-6">
              <label className="shrink-0 pt-1.5 text-sm text-[#333] sm:w-72 sm:text-right">轮询池容量</label>
              <div className="mt-1 flex-1 sm:mt-0">
                <input
                  type="number"
                  value={assignDraft.round_robin_pool_size ?? 5}
                  min={1}
                  max={1000}
                  onChange={(event) =>
                    setAssignDraft((prev) => ({
                      ...prev,
                      round_robin_pool_size: Math.max(1, Number.parseInt(event.target.value, 10) || 0),
                    }))
                  }
                  className="h-8 w-32 rounded-md border border-[#d9d9d9] px-3 text-sm focus:border-[#3658f7] focus:shadow-[0_0_0_2px_rgba(54,88,247,0.2)] focus:outline-none"
                />
              </div>
            </div>
          )}

          {assignDraft.strategy === "by_region" && !isCustomerLead && (
            <div className="flex flex-col sm:flex-row sm:gap-6">
              <label className="shrink-0 pt-1.5 text-sm text-[#333] sm:w-72 sm:text-right">地区分派规则</label>
              <div className="mt-1 flex-1 sm:mt-0">
                <select
                  value={assignDraft.region_strategy ?? ""}
                  onChange={(event) =>
                    setAssignDraft((prev) => ({
                      ...prev,
                      region_strategy: event.target.value || null,
                    }))
                  }
                  className="h-8 w-56 rounded-md border border-[#d9d9d9] bg-white px-3 text-sm focus:border-[#3658f7] focus:shadow-[0_0_0_2px_rgba(54,88,247,0.2)] focus:outline-none"
                >
                  <option value="">继承默认（按省份匹配分店）</option>
                  <option value="province_store">按省份匹配分店</option>
                  <option value="city_store">按城市匹配分店</option>
                  <option value="nearest_store">就近分店</option>
                </select>
              </div>
            </div>
          )}

          {assignDraft.strategy === "by_promoter" && (
            <div className="flex flex-col sm:flex-row sm:gap-6">
              <label className="shrink-0 pt-1.5 text-sm text-[#333] sm:w-72 sm:text-right">是否跟随推广红娘</label>
              <div className="mt-1 flex-1 sm:mt-0">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(assignDraft.promoter_follow_enabled)}
                    onChange={(event) =>
                      setAssignDraft((prev) => ({ ...prev, promoter_follow_enabled: event.target.checked }))
                    }
                    className="size-4 accent-[#3658f7]"
                  />
                  当该线索/会员关联了推广红娘时，自动把分派结果同步给推广红娘
                </label>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:gap-6">
            <label className="shrink-0 pt-1.5 text-sm text-[#333] sm:w-72 sm:text-right">备注</label>
            <div className="mt-1 flex-1 sm:mt-0">
              <textarea
                value={assignDraft.remark ?? ""}
                onChange={(event) => setAssignDraft((prev) => ({ ...prev, remark: event.target.value }))}
                rows={2}
                placeholder="例如：618 大促期间统一由王老师接管"
                className="w-full max-w-xl rounded-md border border-[#d9d9d9] px-3 py-2 text-sm focus:border-[#3658f7] focus:shadow-[0_0_0_2px_rgba(54,88,247,0.2)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex sm:gap-6">
            <span className="hidden shrink-0 sm:block sm:w-72" />
            <Button variant="primary" loading={saving["assign"]} onClick={handleSaveAssign}>
              保存分配配置
            </Button>
          </div>

        </div>
      </section>

      {/* ─── 弃海配置块 ──────────────────────────────────────── */}
      <section className="admin-card mb-4">
        <header className="border-b border-[#f0f0f0] px-5 py-3">
          <h2 className="text-base font-medium text-[#333]">弃海配置</h2>
        </header>
        <div className="admin-card-body space-y-6">
          {abandonError && <div className="rounded border border-[#ffccc7] bg-[#fff2f0] px-3 py-2 text-xs text-[#ff4d4f]">{abandonError}</div>}
          {abandonInfo && <div className="rounded border border-[#b7eb8f] bg-[#f6ffed] px-3 py-2 text-xs text-[#52c41a]">{abandonInfo}</div>}

          <div className="flex flex-col sm:flex-row sm:gap-6">
            <label className="shrink-0 pt-1.5 text-sm text-[#333] sm:w-72 sm:text-right">自动弃海天数</label>
            <div className="mt-1 flex flex-1 flex-wrap items-center gap-2 sm:mt-0">
              {ABANDON_DAYS_OPTIONS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setAbandonDraft((prev) => ({ ...prev, auto_abandon_days: day }))}
                  className={`h-8 rounded-md border px-3 text-sm transition-colors ${
                    abandonDraft.auto_abandon_days === day
                      ? "border-[#3658f7] bg-[#edf2ff] text-[#3658f7]"
                      : "border-[#d9d9d9] hover:border-[#3658f7] hover:text-[#3658f7]"
                  }`}
                >
                  {day === 0 ? "立即弃海" : `${day} 天`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:gap-6">
            <label className="shrink-0 pt-1.5 text-sm text-[#333] sm:w-72 sm:text-right">每日捞回上限</label>
            <div className="mt-1 flex-1 sm:mt-0">
              <input
                type="number"
                min={0}
                max={100000}
                value={abandonDraft.daily_pickup_limit}
                onChange={(event) =>
                  setAbandonDraft((prev) => ({
                    ...prev,
                    daily_pickup_limit: Math.min(100000, Math.max(0, Number.parseInt(event.target.value, 10) || 0)),
                  }))
                }
                className="h-8 w-32 rounded-md border border-[#d9d9d9] px-3 text-sm focus:border-[#3658f7] focus:shadow-[0_0_0_2px_rgba(54,88,247,0.2)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:gap-6">
            <label className="shrink-0 pt-1.5 text-sm text-[#333] sm:w-72 sm:text-right">弃海池可见性</label>
            <div className="mt-1 flex-1 space-y-2 sm:mt-0">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={abandonDraft.show_admin_abandoned_in_pool}
                  onChange={(event) =>
                    setAbandonDraft((prev) => ({ ...prev, show_admin_abandoned_in_pool: event.target.checked }))
                  }
                  className="size-4 accent-[#3658f7]"
                />
                总店管理员可在公共弃海池查看
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={abandonDraft.show_store_abandoned_in_pool}
                  onChange={(event) =>
                    setAbandonDraft((prev) => ({ ...prev, show_store_abandoned_in_pool: event.target.checked }))
                  }
                  className="size-4 accent-[#3658f7]"
                />
                分店管理员可在公共弃海池查看
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:gap-6">
            <label className="shrink-0 pt-1.5 text-sm text-[#333] sm:w-72 sm:text-right">备注</label>
            <div className="mt-1 flex-1 sm:mt-0">
              <textarea
                value={abandonDraft.remark ?? ""}
                onChange={(event) => setAbandonDraft((prev) => ({ ...prev, remark: event.target.value }))}
                rows={2}
                placeholder="例如：618 大促期间统一由王老师接管"
                className="w-full max-w-xl rounded-md border border-[#d9d9d9] px-3 py-2 text-sm focus:border-[#3658f7] focus:shadow-[0_0_0_2px_rgba(54,88,247,0.2)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex sm:gap-6">
            <span className="hidden shrink-0 sm:block sm:w-72" />
            <Button variant="primary" loading={saving["abandon"]} onClick={handleSaveAbandon}>
              保存弃海配置
            </Button>
          </div>

        </div>
      </section>
    </div>
  );
}