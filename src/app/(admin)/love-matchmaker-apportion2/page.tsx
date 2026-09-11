"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";
import type {
  ApportionConfig,
  ApportionScope,
  ApportionStrategy,
  MatchmakerStaffItem,
} from "@/lib/admin-endpoints";

const breadcrumb = getBreadcrumb("总店红娘", "分派配置");

const SCOPES = [
  { key: "member-crm", label: "会员CRM", scope: "member_crm" as ApportionScope },
  { key: "customer-lead", label: "客源线索", scope: "customer_lead" as ApportionScope },
];

const ASSIGN_OPTIONS = [
  { value: "designated", label: "统一分派给指定服务红娘" },
  { value: "round-robin", label: "循环随机分派给所有服务红娘(前台展示且非锁定状态)" },
  { value: "by-region", label: "按照会员现居地分派" },
  { value: "by-promoter", label: "按推广红娘进行分派" },
  { value: "by-partner", label: "按合伙红娘进行分派" },
  { value: "none", label: "不分派" },
];

// UI 选项值 -> 后端枚举
const STRATEGY_MAP: Record<string, ApportionStrategy | null> = {
  designated: "designated",
  "round-robin": "round_robin_random",
  "by-region": "by_region",
  "by-promoter": "by_promoter",
  "by-partner": "by_partner",
  none: "none",
};

const ABANDON_OPTIONS = [
  { value: "off", label: "不启用" },
  { value: "3", label: "超3天未跟进" },
  { value: "7", label: "超7天未跟进" },
  { value: "15", label: "超15天未跟进" },
  { value: "30", label: "超30天未跟进" },
  { value: "45", label: "超45天未跟进" },
  { value: "60", label: "超60天未跟进" },
  { value: "90", label: "超90天未跟进" },
];

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div className="appo-hint">
      <span className="appo-hint-icon">i</span>
      <span>{children}</span>
    </div>
  );
}

export default function Page() {
  const [activeScopeKey, setActiveScopeKey] = useState("member-crm");
  const activeScope = SCOPES.find((s) => s.key === activeScopeKey)?.scope ?? "member_crm";

  const [configs, setConfigs] = useState<ApportionConfig[]>([]);
  const [serviceMatchmakers, setServiceMatchmakers] = useState<MatchmakerStaffItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [assignStrategy, setAssignStrategy] = useState("designated");
  const [serviceMatchmaker, setServiceMatchmaker] = useState("");
  const [abandonMode, setAbandonMode] = useState("off");
  const [pickupLimit, setPickupLimit] = useState("0");
  const [showAdminAbandoned, setShowAdminAbandoned] = useState("show");
  const [showStoreAbandoned, setShowStoreAbandoned] = useState("show");
  const [saved, setSaved] = useState("");

  const [savingAssign, setSavingAssign] = useState(false);
  const [savingAbandon, setSavingAbandon] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfg, staff] = await Promise.all([
        adminEndpoints.apportionConfigs(),
        adminEndpoints.matchmakerStaffList({ page: 1, page_size: 200 }),
      ]);
      setConfigs(cfg ?? []);
      setServiceMatchmakers(staff.items ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  // 切换 Tab 时按 scope + config_type 取用已加载的配置
  useEffect(() => {
    const assign = configs.find((c) => c.scope === activeScope && c.config_type === "assign");
    const abandon = configs.find((c) => c.scope === activeScope && c.config_type === "abandon");
    if (assign) {
      const uiValue = (Object.keys(STRATEGY_MAP) as string[]).find(
        (k) => STRATEGY_MAP[k] === assign.strategy,
      );
      setAssignStrategy(uiValue ?? "none");
      setServiceMatchmaker(assign.target_matchmaker_id != null ? String(assign.target_matchmaker_id) : "");
    } else {
      setAssignStrategy("designated");
      setServiceMatchmaker("");
    }
    if (abandon) {
      const days = abandon.auto_abandon_days != null ? String(abandon.auto_abandon_days) : "off";
      setAbandonMode(days === "0" ? "off" : days);
      setPickupLimit(abandon.daily_pickup_limit != null ? String(abandon.daily_pickup_limit) : "0");
      setShowAdminAbandoned(abandon.show_admin_abandoned_in_pool ? "show" : "hide");
      setShowStoreAbandoned(abandon.show_store_abandoned_in_pool ? "show" : "hide");
    } else {
      setAbandonMode("off");
      setPickupLimit("0");
      setShowAdminAbandoned("show");
      setShowStoreAbandoned("show");
    }
    setSaved("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScopeKey, configs]);

  const submitAssign = async () => {
    const strategy = STRATEGY_MAP[assignStrategy];
    if (!strategy) return;
    if (
      activeScope === "customer_lead" &&
      (strategy === "by_region" || strategy === "by_promoter" || strategy === "by_partner")
    ) {
      showConfigToast("该策略仅会员CRM支持", "error");
      return;
    }
    setSavingAssign(true);
    try {
      const body: Record<string, unknown> = { strategy };
      if (strategy === "designated") {
        if (!serviceMatchmaker) {
          showConfigToast("请选择服务红娘", "error");
          setSavingAssign(false);
          return;
        }
        body.target_matchmaker_id = Number(serviceMatchmaker);
      }
      await adminEndpoints.upsertApportionAssign(activeScope, body);
      showConfigToast("已提交");
      setSaved("assign");
      void reload();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
      setSaved("assign-fail");
    } finally {
      setSavingAssign(false);
    }
  };

  const submitAbandon = async () => {
    setSavingAbandon(true);
    try {
      const body = {
        auto_abandon_days: Number(abandonMode),
        daily_pickup_limit: Number(pickupLimit) || 0,
        show_admin_abandoned_in_pool: showAdminAbandoned === "show",
        show_store_abandoned_in_pool: showStoreAbandoned === "show",
      };
      await adminEndpoints.upsertApportionAbandon(activeScope, body);
      showConfigToast("已提交");
      setSaved("abandon");
      void reload();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
      setSaved("abandon-fail");
    } finally {
      setSavingAbandon(false);
    }
  };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={breadcrumb} />

      {/* 须知 */}
      <div className="appo-notice">
        <div className="appo-notice-title">
          <span className="appo-notice-icon">i</span>
          <span>须知</span>
        </div>
        <p>每位会员或客源线索都需要分派一位跟进（销售/服务）红娘，您在这里可以配置系统默认的分派红娘规则</p>
        <p>红娘自己添加录入的会员或客源以及海引流注册的会员默认置在该红娘名下，不参与下述分派规则</p>
        <p>客源线索、注册会员可独立设置自动分派规则，您可以在会员管理、客源线索中对应每位会员和客源的跟进红娘进行变更</p>
      </div>

      {loading && <div className="appo-loading">加载中…</div>}
      {!loading && error && <div className="appo-error">{error}</div>}

      {/* Tab */}
      <div className="appo-tabs">
        {SCOPES.map((scope) => (
          <button
            key={scope.key}
            type="button"
            className={`appo-tab${activeScopeKey === scope.key ? " active" : ""}`}
            onClick={() => setActiveScopeKey(scope.key)}
          >
            {scope.label}
          </button>
        ))}
      </div>

      {/* 分派配置 */}
      <section className="appo-section">
        <h2 className="appo-section-title">分派配置</h2>

        <div className="appo-radios">
          {ASSIGN_OPTIONS.map((option) => {
            const disabled =
              activeScope === "customer_lead" &&
              (option.value === "by-region" || option.value === "by-promoter" || option.value === "by-partner");
            return (
              <label key={option.value} className={`appo-radio${disabled ? " disabled" : ""}`}>
                <input
                  type="radio"
                  name="assign-strategy"
                  checked={assignStrategy === option.value}
                  disabled={disabled}
                  onChange={() => setAssignStrategy(option.value)}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
        {activeScope === "customer_lead" && (
          <Hint>按现居地分派 / 按推广红娘分派 / 按合伙红娘分派 仅会员CRM支持</Hint>
        )}

        {assignStrategy === "designated" && (
          <div className="appo-select-wrap">
            <div className="appo-select">
              <select
                value={serviceMatchmaker}
                onChange={(e) => setServiceMatchmaker(e.target.value)}
              >
                <option value="">请选择服务红娘</option>
                {serviceMatchmakers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.display_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="appo-caret" size={14} />
            </div>
          </div>
        )}

        <button type="button" className="appo-submit" onClick={submitAssign} disabled={savingAssign}>
          {saved === "assign" ? "已提交" : saved === "assign-fail" ? "保存失败" : savingAssign ? "提交中…" : "确定提交"}
        </button>
      </section>

      {/* 弃海配置 */}
      <section className="appo-section">
        <h2 className="appo-section-title">弃海配置</h2>

        <div className="appo-row">
          <span className="appo-label">自动弃海功能</span>
          <div className="appo-control">
            <div className="appo-radios">
              {ABANDON_OPTIONS.map((option) => (
                <label key={option.value} className="appo-radio">
                  <input
                    type="radio"
                    name="abandon-mode"
                    checked={abandonMode === option.value}
                    onChange={() => setAbandonMode(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <Hint>分派、捞取、添加跟进记录 均会重新计算自动弃海开始时间</Hint>
          </div>
        </div>

        <div className="appo-row">
          <span className="appo-label">每日捞取上限</span>
          <div className="appo-control">
            <div className="appo-inline">
              <input
                type="number"
                min={0}
                className="appo-input"
                value={pickupLimit}
                onChange={(e) => setPickupLimit(e.target.value)}
              />
              <span className="appo-unit">条</span>
            </div>
            <Hint>设置红娘每日从弃海中可以捞取的客源数量，0表示不限</Hint>
          </div>
        </div>

        <div className="appo-row">
          <span className="appo-label">弃海客源显示</span>
          <div className="appo-control">
            <div className="appo-choice-line">
              <span className="appo-choice-text">后台管理员放弃的客源是否显示在其他分店的弃海客源中：</span>
              <label className="appo-radio">
                <input
                  type="radio"
                  name="show-admin"
                  checked={showAdminAbandoned === "show"}
                  onChange={() => setShowAdminAbandoned("show")}
                />
                <span>显示</span>
              </label>
              <label className="appo-radio">
                <input
                  type="radio"
                  name="show-admin"
                  checked={showAdminAbandoned === "hide"}
                  onChange={() => setShowAdminAbandoned("hide")}
                />
                <span>不显示</span>
              </label>
            </div>
            <div className="appo-choice-line">
              <span className="appo-choice-text">总店红娘所放弃的客源是否显示在其他分店的弃海客源中：</span>
              <label className="appo-radio">
                <input
                  type="radio"
                  name="show-store"
                  checked={showStoreAbandoned === "show"}
                  onChange={() => setShowStoreAbandoned("show")}
                />
                <span>显示</span>
              </label>
              <label className="appo-radio">
                <input
                  type="radio"
                  name="show-store"
                  checked={showStoreAbandoned === "hide"}
                  onChange={() => setShowStoreAbandoned("hide")}
                />
                <span>不显示</span>
              </label>
            </div>
          </div>
        </div>

        <button type="button" className="appo-submit" onClick={submitAbandon} disabled={savingAbandon}>
          {saved === "abandon" ? "已提交" : saved === "abandon-fail" ? "保存失败" : savingAbandon ? "提交中…" : "确定提交"}
        </button>
      </section>
    </div>
  );
}
