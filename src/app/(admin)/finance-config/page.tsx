"use client";
import { useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Info } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { useConfigDomain, mergeWithDefaults, showConfigToast } from "@/lib/platform-config";

type MethodKey = "auto_wechat" | "manual_wechat" | "manual_bank" | "manual_alipay";

type FinanceCfg = {
  point_name: string;
  point_ratio: number;
  balance_name: string;
  withdrawal: {
    enabled: boolean;
    min_amount: string;
    fee_mode: "none" | "deduct";
    fee_rate: number;
    fee_threshold: string;
  };
  withdraw_methods: Record<MethodKey, { enabled: boolean; min_amount: string; max_amount: string }>;
  recharge_packages: { name: string; amount: string; points: number }[];
};

const DEFAULTS: FinanceCfg = {
  point_name: "金币",
  point_ratio: 10,
  balance_name: "余额",
  withdrawal: { enabled: false, min_amount: "0.00", fee_mode: "none", fee_rate: 1, fee_threshold: "100" },
  withdraw_methods: {
    auto_wechat: { enabled: false, min_amount: "1", max_amount: "500" },
    manual_wechat: { enabled: true, min_amount: "1", max_amount: "1000" },
    manual_bank: { enabled: true, min_amount: "1", max_amount: "1000" },
    manual_alipay: { enabled: true, min_amount: "1", max_amount: "1000" },
  },
  recharge_packages: [
    { name: "积分充值套餐1", amount: "1", points: 10 },
    { name: "积分充值套餐2", amount: "200", points: 2200 },
    { name: "积分充值套餐3", amount: "300", points: 4000 },
    { name: "积分充值套餐4", amount: "400", points: 6000 },
    { name: "积分充值套餐5", amount: "500", points: 7500 },
    { name: "积分充值套餐6", amount: "600", points: 9000 },
  ],
};

const METHOD_LABEL: Record<MethodKey, string> = {
  auto_wechat: "自动提现到微信零钱",
  manual_wechat: "人工转账提现到微信",
  manual_bank: "人工转账提现到银行卡",
  manual_alipay: "人工转账提现到支付宝",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="fin-row">
      <span className="fin-label">{label}</span>
      <div className="fin-content">{children}</div>
    </div>
  );
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <label className={`mp-switch ${on ? "on" : ""}`} onClick={onToggle}>
      {on && <span className="mp-switch-label">开启</span>}
      <span className="mp-switch-knob"></span>
    </label>
  );
}

export default function FinanceConfigPage() {
  const domain = useConfigDomain<FinanceCfg>("finance", DEFAULTS);
  const merged = mergeWithDefaults(DEFAULTS, domain.snapshot?.config ?? {}) as FinanceCfg;
  const [draft, setDraft] = useState<FinanceCfg>(merged);

  useEffect(() => {
    setDraft(merged);
  }, [domain.snapshot?.version]); // eslint-disable-line react-hooks/exhaustive-deps

  const breadcrumb = getBreadcrumb("财务管理", "系统配置");

  const updateField = <K extends keyof FinanceCfg>(key: K, value: FinanceCfg[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const updateWithdrawal = (patch: Partial<FinanceCfg["withdrawal"]>) =>
    setDraft((d) => ({ ...d, withdrawal: { ...d.withdrawal, ...patch } }));

  const updateMethod = (
    key: MethodKey,
    patch: Partial<FinanceCfg["withdraw_methods"][MethodKey]>,
  ) =>
    setDraft((d) => ({
      ...d,
      withdraw_methods: { ...d.withdraw_methods, [key]: { ...d.withdraw_methods[key], ...patch } },
    }));

  const updatePackage = (
    idx: number,
    patch: Partial<FinanceCfg["recharge_packages"][number]>,
  ) =>
    setDraft((d) => ({
      ...d,
      recharge_packages: d.recharge_packages.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    }));

  const submit = async () => {
    const ok = await domain.save(draft, "财务配置保存");
    showConfigToast(ok ? "财务配置已保存" : "无需保存（未修改）", ok ? "ok" : "error");
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="fin-card">
        <div className="fin-title">支付配置</div>

        <div className="fin-form">
          <Field label="积分名称">
            <input
              className="fin-input"
              value={draft.point_name}
              onChange={(e) => updateField("point_name", e.target.value)}
            />
          </Field>

          <Field label="积分比例">
            <div className="fin-inline">
              <span className="fin-muted">1元 =</span>
              <input
                className="fin-mini"
                type="number"
                value={draft.point_ratio}
                onChange={(e) => updateField("point_ratio", Number(e.target.value) || 1)}
              />
              <span className="fin-muted">积分</span>
            </div>
          </Field>

          <Field label="余额名称">
            <input
              className="fin-input"
              value={draft.balance_name}
              onChange={(e) => updateField("balance_name", e.target.value)}
            />
          </Field>

          <Field label="余额提现">
            <Switch
              on={draft.withdrawal.enabled}
              onToggle={() =>
                updateWithdrawal({ enabled: !draft.withdrawal.enabled })
              }
            />
          </Field>

          <Field label="提现手续费">
            <div className="fin-fee-options">
              <label className="fin-radio">
                <input
                  type="radio"
                  name="feeMode"
                  checked={draft.withdrawal.fee_mode === "none"}
                  onChange={() =>
                    updateWithdrawal({ fee_mode: "none" })
                  }
                />
                <span>不扣手续费</span>
              </label>
              <label className="fin-radio fin-radio-inline">
                <input
                  type="radio"
                  name="feeMode"
                  checked={draft.withdrawal.fee_mode === "deduct"}
                  onChange={() =>
                    updateWithdrawal({ fee_mode: "deduct" })
                  }
                />
                <span>提现金额 &gt;=</span>
                <input
                  className="fin-mini"
                  value={draft.withdrawal.fee_threshold}
                  disabled={draft.withdrawal.fee_mode !== "deduct"}
                  onChange={(e) => updateWithdrawal({ fee_threshold: e.target.value })}
                />
                <span>元，扣手续费</span>
              </label>
            </div>
          </Field>

          <Field label="手续费费率">
            <div className="fin-inline">
              <input
                className="fin-mini"
                type="number"
                value={draft.withdrawal.fee_rate}
                onChange={(e) => updateWithdrawal({ fee_rate: Number(e.target.value) || 0 })}
              />
              <span className="fin-muted">%</span>
            </div>
          </Field>

          <div className="fin-info">
            <Info className="sign-info-i" />
            <span>按提现金额计算，四舍五入，计算到分，手续费不满1元时直接按1元扣</span>
          </div>

          <div className="fin-sec-title">提现方式</div>

          {(Object.keys(METHOD_LABEL) as MethodKey[]).map((key) => (
            <div className="fin-row fin-row-nowrap" key={key}>
              <span className="fin-label">{METHOD_LABEL[key]}</span>
              <Switch
                on={draft.withdraw_methods[key].enabled}
                onToggle={() => updateMethod(key, { enabled: !draft.withdraw_methods[key].enabled })}
              />
              <div className="fin-amounts">
                <span className="fin-muted">单笔最小金额</span>
                <input
                  className="fin-mini"
                  value={draft.withdraw_methods[key].min_amount}
                  disabled={!draft.withdraw_methods[key].enabled}
                  onChange={(e) => updateMethod(key, { min_amount: e.target.value })}
                />
                <span className="fin-muted">单笔最大金额</span>
                <input
                  className="fin-mini"
                  value={draft.withdraw_methods[key].max_amount}
                  disabled={!draft.withdraw_methods[key].enabled}
                  onChange={(e) => updateMethod(key, { max_amount: e.target.value })}
                />
                <span className="fin-badge">
                  {key === "auto_wechat"
                    ? "请不要超过商户平台单次最高提现金额限制"
                    : "最小为1元，0为不限制"}
                </span>
              </div>
            </div>
          ))}

          <div className="fin-info">
            <Info className="sign-info-i" />
            <span>
              用户可自助将其账号中的余额立即提现至其微信零钱中，钱款将自动从微信商户的运营账户中支付。开启本功能前，请确保您已经在微信商户平台开通并配置了「商家转账」功能。运营账户中需有足够的余额用于支付提现；如尚未开通「商家转账」，切勿开启自动提现！
            </span>
          </div>

          <div className="fin-sec-title">充值套餐</div>

          {draft.recharge_packages.map((pkg, idx) => (
            <div className="fin-row fin-row-nowrap" key={`${pkg.name}-${idx}`}>
              <span className="fin-label">{pkg.name}</span>
              <div className="fin-amounts">
                <input
                  className="fin-mini"
                  value={pkg.amount}
                  onChange={(e) => updatePackage(idx, { amount: e.target.value })}
                />
                <span className="fin-muted">元</span>
                <span className="fin-muted fin-gap">充值</span>
                <input
                  className="fin-mini"
                  type="number"
                  value={pkg.points}
                  onChange={(e) => updatePackage(idx, { points: Number(e.target.value) || 0 })}
                />
                <span className="fin-muted">积分</span>
              </div>
            </div>
          ))}

          <div className="fin-actions">
            <button className="fin-submit" onClick={submit} disabled={domain.saving}>
              {domain.saving ? "保存中…" : "确定提交"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 防止 adminEndpoints 未使用告警（保留导入供后续扩展）
void adminEndpoints;