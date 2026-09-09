"use client";
import { useCallback, useEffect, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type CommissionLevel, type CommissionLevelMode, type CommissionLevelUpdatePayload } from "@/lib/admin-endpoints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

interface LevelDraft {
  name: string;
  mode: CommissionLevelMode;
  rate_percent: string;
  fixed_amount: string;
  platform_extra_amount: string;
  promotion_condition: string;
  sort: string;
  status: 1 | 2;
}

function emptyDraft(): LevelDraft {
  return {
    name: "",
    mode: "rate",
    rate_percent: "0",
    fixed_amount: "",
    platform_extra_amount: "0",
    promotion_condition: "",
    sort: "0",
    status: 1,
  };
}

function fromLevel(level: CommissionLevel): LevelDraft {
  return {
    name: level.name,
    mode: level.mode,
    rate_percent: level.rate_percent,
    fixed_amount: level.fixed_amount ?? "",
    platform_extra_amount: level.platform_extra_amount,
    promotion_condition: level.promotion_condition ?? "",
    sort: String(level.sort),
    status: level.status,
  };
}

function formatReward(extra: string): string {
  const value = Number(extra);
  if (!Number.isFinite(value) || value <= 0) return "—";
  return `${value.toFixed(2)}元`;
}

export default function LoveMatchmakerDistributionPage() {
  const [levels, setLevels] = useState<CommissionLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [editing, setEditing] = useState<CommissionLevel | null>(null);
  const [draft, setDraft] = useState<LevelDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);

  const loadLevels = useCallback(async () => {
    setLoading(true);
    setGlobalError(null);
    try {
      const list = await adminEndpoints.commissionLevels();
      setLevels(list);
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : "加载分成配置失败");
      setLevels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLevels();
  }, [loadLevels]);

  const openEditor = useCallback((level: CommissionLevel) => {
    setEditing(level);
    setDraft(fromLevel(level));
    setEditorError(null);
  }, []);

  const closeEditor = useCallback(() => {
    if (saving) return;
    setEditing(null);
    setEditorError(null);
  }, [saving]);

  const handleSave = useCallback(async () => {
    if (!editing) return;
    setSaving(true);
    setEditorError(null);
    try {
      const payload: CommissionLevelUpdatePayload = {
        name: draft.name.trim(),
        mode: draft.mode,
        promotion_condition: draft.promotion_condition.trim() || null,
        sort: Number(draft.sort) || 0,
        status: draft.status,
      };
      if (draft.mode === "rate") {
        payload.rate_percent = draft.rate_percent || "0";
        payload.fixed_amount = null;
      } else {
        const fixed = Number(draft.fixed_amount);
        if (!Number.isFinite(fixed) || fixed < 0) {
          throw new Error("mode=fixed 时必须填写正确的 fixed_amount");
        }
        payload.fixed_amount = fixed.toFixed(2);
        payload.rate_percent = "0";
      }
      const extra = Number(draft.platform_extra_amount);
      if (!Number.isFinite(extra) || extra < 0) {
        throw new Error("平台额外奖励必须为非负数");
      }
      payload.platform_extra_amount = extra.toFixed(2);

      const updated = await adminEndpoints.updateCommissionLevel(editing.id, payload);
      setLevels((prev) => prev.map((row) => (row.id === updated.id ? updated : row)));
      setEditing(null);
    } catch (error) {
      setEditorError(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }, [draft, editing]);

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-white px-4 py-3 shadow-sm">
        <div className="text-sm font-medium text-[#333]">{getBreadcrumb("总店红娘", "分成配置").join(" / ")}</div>
      </div>

      <div className="rounded-md bg-white shadow-sm">
        <div className="border-b border-[#f0f2f5] px-4 py-3">
          <h2 className="text-sm font-medium text-[#333]">服务红娘分成配置</h2>
          <p className="mt-1 text-xs text-[#999]">
            红娘按所在分成级别获得订单分成，并按达成条件获取额外奖励。当前适用红娘统计自
            <code className="mx-1 rounded bg-[#f3f6ff] px-1">matchmaker_profile</code>
            档案。
          </p>
        </div>

        {globalError && (
          <div className="m-4 rounded border border-[#ffccc7] bg-[#fff2f0] px-3 py-2 text-xs text-[#cf1322]">{globalError}</div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f9ff] text-xs text-[#555]">
              <tr>
                <th className="px-4 py-3 font-normal">ID</th>
                <th className="px-4 py-3 font-normal">分成级别</th>
                <th className="px-4 py-3 font-normal">级别名称</th>
                <th className="px-4 py-3 font-normal">分成模式</th>
                <th className="px-4 py-3 font-normal">自动升级条件</th>
                <th className="px-4 py-3 font-normal">平台额外奖励</th>
                <th className="px-4 py-3 font-normal">当前适用红娘</th>
                <th className="px-4 py-3 font-normal">状态</th>
                <th className="px-4 py-3 font-normal text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f5]">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-[#999]">加载中...</td>
                </tr>
              )}
              {!loading && levels.length === 0 && !globalError && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-[#999]">暂无分成级别，请确认后端已建表</td>
                </tr>
              )}
              {levels.map((level) => (
                <tr key={level.id} className="hover:bg-[#fafbff]">
                  <td className="px-4 py-3 text-[#555]">{level.id}</td>
                  <td className="px-4 py-3 text-[#333]">{level.code}</td>
                  <td className="px-4 py-3 text-[#333]">{level.name}</td>
                  <td className="px-4 py-3 text-[#555]">
                    {level.mode === "rate" ? "自定义固定金额" : "按订单固定金额"}
                  </td>
                  <td className="px-4 py-3 text-[#555]">{level.promotion_condition ?? "—"}</td>
                  <td className={`px-4 py-3 ${Number(level.platform_extra_amount) > 0 ? "text-[#cf1322]" : "text-[#555]"}`}>
                    {formatReward(level.platform_extra_amount)}
                  </td>
                  <td className="px-4 py-3 text-[#555]">
                    {level.applicable_matchmaker_count > 0 ? `${level.applicable_matchmaker_count} 人` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {level.status === 1 ? (
                      <span className="rounded bg-[#f6ffed] px-2 py-0.5 text-xs text-[#389e0d]">启用</span>
                    ) : (
                      <span className="rounded bg-[#f5f5f5] px-2 py-0.5 text-xs text-[#999]">停用</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEditor(level)}
                      className="text-xs text-[#3658f7] hover:underline"
                    >
                      编辑配置
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" onClick={closeEditor}>
          <div
            className="w-full max-w-[560px] rounded-lg bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-[#f0f2f5] px-5 py-3">
              <h3 className="text-base font-medium text-[#333]">编辑分成级别 — {editing.name}</h3>
              <p className="mt-1 text-xs text-[#999]">级别编码 {editing.code} 为种子数据锁定，不可修改。</p>
            </div>
            <div className="space-y-4 px-5 py-4">
              {editorError && (
                <div className="rounded border border-[#ffccc7] bg-[#fff2f0] px-3 py-2 text-xs text-[#cf1322]">{editorError}</div>
              )}

              <Field label="级别名称" required>
                <Input
                  value={draft.name}
                  onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="如：中级分成"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="分成模式" required>
                  <Select
                    value={draft.mode}
                    onChange={(value) => setDraft((prev) => ({
                      ...prev,
                      mode: value === "fixed" ? "fixed" : "rate",
                      fixed_amount: value === "fixed" ? prev.fixed_amount : "",
                    }))}
                    options={[
                      { value: "rate", label: "按订单比例 (%)" },
                      { value: "fixed", label: "按订单固定金额 (元)" },
                    ]}
                  />
                </Field>
                <Field label="启用状态">
                  <Select
                    value={String(draft.status)}
                    onChange={(value) => setDraft((prev) => ({ ...prev, status: value === "2" ? 2 : 1 }))}
                    options={[
                      { value: "1", label: "启用" },
                      { value: "2", label: "停用" },
                    ]}
                  />
                </Field>
              </div>

              {draft.mode === "rate" ? (
                <Field label="分成比例 (%)" required>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.01"
                    value={draft.rate_percent}
                    onChange={(event) => setDraft((prev) => ({ ...prev, rate_percent: event.target.value }))}
                  />
                </Field>
              ) : (
                <Field label="固定分成金额 (元)" required>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={draft.fixed_amount}
                    onChange={(event) => setDraft((prev) => ({ ...prev, fixed_amount: event.target.value }))}
                  />
                </Field>
              )}

              <Field label="平台额外奖励 (元)">
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={draft.platform_extra_amount}
                  onChange={(event) => setDraft((prev) => ({ ...prev, platform_extra_amount: event.target.value }))}
                />
                <p className="mt-1 text-xs text-[#999]">每达成一次分成订单，平台额外发放给红娘的奖励</p>
              </Field>

              <Field label="自动升级条件">
                <Input
                  value={draft.promotion_condition}
                  onChange={(event) => setDraft((prev) => ({ ...prev, promotion_condition: event.target.value }))}
                  placeholder="如：牵线成功累计>=10次"
                />
              </Field>

              <Field label="排序">
                <Input
                  type="number"
                  value={draft.sort}
                  onChange={(event) => setDraft((prev) => ({ ...prev, sort: event.target.value }))}
                />
                <p className="mt-1 text-xs text-[#999]">数值越小排序越靠前，默认 0</p>
              </Field>
            </div>
            <div className="flex justify-end gap-2 border-t border-[#f0f2f5] bg-[#fafbff] px-5 py-3">
              <Button variant="default" onClick={closeEditor} disabled={saving}>取消</Button>
              <Button variant="primary" onClick={handleSave} loading={saving}>保存配置</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-[#555]">
        {label}
        {required && <span className="ml-0.5 text-[#ff4d4f]">*</span>}
      </span>
      {children}
    </label>
  );
}