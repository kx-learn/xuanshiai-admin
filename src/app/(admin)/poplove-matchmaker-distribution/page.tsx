"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import {
  adminEndpoints,
  type PromoterLevelItem,
  type PromoterConsumeCommissionMode,
} from "@/lib/admin-endpoints";
import { clearAdminToken } from "@/lib/admin-api";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "推广红娘", href: "/poplove-matchmaker-list" },
  { label: "分成配置" },
];

const input =
  "h-10 w-full rounded border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#3658f7]";

export default function PoploveMatchmakerDistributionPage() {
  const [rows, setRows] = useState<PromoterLevelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<PromoterLevelItem | null>(null);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await adminEndpoints.promoterLevelList();
      setRows(page.items);
    } catch (err: unknown) {
      if (err instanceof Error && /登录/.test(err.message)) {
        clearAdminToken();
        if (typeof window !== "undefined" && window.location.pathname !== "/login") window.location.replace("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />
      <h1 className="mb-4 text-xl font-medium text-[#333]">推广红娘分成配置</h1>

      <div className="overflow-x-auto rounded-md border border-[#f0f0f0]">
        {loading ? (
          <div className="p-8 text-center text-[#999]">加载中...</div>
        ) : error ? (
          <div className="p-8 text-center text-[#ff4d4f]">{error}</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-[#999]">暂无数据</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                {["ID", "分成级别", "级别名称", "分成模式", "红娘数量", "自动升级条件", "操作"].map((title) => (
                  <th
                    key={title}
                    className="whitespace-nowrap border-b border-[#f0f0f0] bg-[#fafafa] p-3 text-left text-sm font-medium"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#fafafa]">
                  <td className="border-b border-[#f0f0f0] p-3 text-center text-sm">{row.id}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">级别{row.level_id}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">{row.level_name}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">{row.auto_split_mode_label}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-center text-sm">{row.matchmaker_count}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">{row.promote_threshold_text}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">
                    <button
                      type="button"
                      className="text-[#3658f7] hover:underline"
                      onClick={() => setEditing(row)}
                    >
                      编辑配置
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {notice && (
        <div role="status" className="fixed right-6 top-5 z-[60] border border-[#b7eb8f] bg-[#f6ffed] px-4 py-2 text-sm text-[#52a26b] shadow">
          {notice}
        </div>
      )}

      {editing && (
        <EditPanel
          row={editing}
          close={() => setEditing(null)}
          done={(message) => { setEditing(null); flash(message); void fetchList(); }}
          error={flash}
        />
      )}
    </div>
  );
}

function EditPanel({
  row,
  close,
  done,
  error,
}: {
  row: PromoterLevelItem;
  close: () => void;
  done: (message: string) => void;
  error: (message: string) => void;
}) {
  const [promoteThreshold, setPromoteThreshold] = useState<string>(row.promote_threshold != null ? String(row.promote_threshold) : "");
  const [registerRewardMale, setRegisterRewardMale] = useState<string>(row.register_reward_male);
  const [registerRewardFemale, setRegisterRewardFemale] = useState<string>(row.register_reward_female);
  const [consumeMode, setConsumeMode] = useState<PromoterConsumeCommissionMode>(row.consume_commission_mode);
  const [consumeRate, setConsumeRate] = useState<string>(row.consume_commission_rate ?? "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (consumeMode === "auto_rate" && !consumeRate.trim()) {
      error("会员消费分成为按比例时必须填写比例");
      return;
    }
    setSaving(true);
    try {
      const payload: Parameters<typeof adminEndpoints.updatePromoterLevel>[1] = {
        promote_threshold: promoteThreshold.trim() === "" ? null : Number(promoteThreshold),
        register_reward_male: registerRewardMale.trim() || "0",
        register_reward_female: registerRewardFemale.trim() || "0",
        consume_commission_mode: consumeMode,
        consume_commission_rate: consumeMode === "auto_rate" ? consumeRate.trim() : null,
      };
      await adminEndpoints.updatePromoterLevel(row.level_id, payload);
      done("配置已更新");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onMouseDown={close}>
      <div className="w-full max-w-xl rounded bg-white shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-medium">编辑配置</h2>
          <button type="button" aria-label="关闭" className="text-xl text-[#999]" onClick={close}>×</button>
        </div>
        <div className="space-y-5 p-6">
          <div>
            <div className="mb-1 text-sm text-[#666]">
              分成级别名称 <b className="text-[#ff4d4f]">*</b>
            </div>
            <input value={row.level_name} disabled className={`${input} bg-[#fafafa] text-[#999]`} />
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">自动升级条件</div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#444]">累计发展有效相亲会员数&gt;=</span>
              <input
                value={promoteThreshold}
                onChange={(e) => setPromoteThreshold(e.target.value.replace(/[^\d]/g, ""))}
                placeholder="如 51"
                className={`${input} w-32 text-center`}
                inputMode="numeric"
              />
              <span className="text-sm text-[#444]">人</span>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">会员注册奖励</div>
            <div className="grid grid-cols-[auto_1fr_auto_auto_1fr_auto] items-center gap-3">
              <span className="text-sm text-[#444]">男会员</span>
              <input
                value={registerRewardMale}
                onChange={(e) => setRegisterRewardMale(e.target.value)}
                placeholder="0.00"
                className={`${input} text-center`}
              />
              <span className="text-sm text-[#666]">元/人</span>
              <span className="text-sm text-[#444]">女会员</span>
              <input
                value={registerRewardFemale}
                onChange={(e) => setRegisterRewardFemale(e.target.value)}
                placeholder="0.00"
                className={`${input} text-center`}
              />
              <span className="text-sm text-[#666]">元/人</span>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">会员消费分成</div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={consumeMode === "none"}
                  onChange={() => setConsumeMode("none")}
                />
                不分成
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={consumeMode === "auto_rate"}
                  onChange={() => setConsumeMode("auto_rate")}
                />
                给予分成
              </label>
              {consumeMode === "auto_rate" && (
                <div className="flex items-center gap-2">
                  <input
                    value={consumeRate}
                    onChange={(e) => setConsumeRate(e.target.value)}
                    placeholder="比例(%)"
                    className={`${input} w-32 text-center`}
                  />
                  <span className="text-sm text-[#666]">%</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button type="button" className="rounded border px-5 py-1.5 text-sm" onClick={close}>关闭</button>
          <button
            type="button"
            disabled={saving}
            className="rounded bg-[#3658f7] px-5 py-1.5 text-sm text-white disabled:opacity-60"
            onClick={() => void submit()}
          >
            {saving ? "保存中..." : "确定提交"}
          </button>
        </div>
      </div>
    </div>
  );
}
