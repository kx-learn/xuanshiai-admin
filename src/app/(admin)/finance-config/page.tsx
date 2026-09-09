"use client";
import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Info } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

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
    <label className={`mp-switch ${on ? "on" : ""}`}>
      {on && <span className="mp-switch-label">开启</span>}
      <span className="mp-switch-knob"></span>
    </label>
  );
}

const rechargePackages = [
  { name: "积分充值套餐1", amount: 1, points: 10 },
  { name: "积分充值套餐2", amount: 200, points: 2200 },
  { name: "积分充值套餐3", amount: 300, points: 4000 },
  { name: "积分充值套餐4", amount: 400, points: 6000 },
  { name: "积分充值套餐5", amount: 500, points: 7500 },
  { name: "积分充值套餐6", amount: 600, points: 9000 },
];

export default function FinanceConfigPage() {
  const [balanceWithdraw, setBalanceWithdraw] = useState(true);
  const [feeMode, setFeeMode] = useState<"deduct" | "none">("deduct");
  const [autoWechat, setAutoWechat] = useState(false);
  const [manualWechat, setManualWechat] = useState(true);
  const [manualBank, setManualBank] = useState(true);
  const [manualAlipay, setManualAlipay] = useState(true);

  const breadcrumb = getBreadcrumb("财务管理", "系统配置");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="fin-card">
        <div className="fin-title">支付配置</div>

        <div className="fin-form">
          <Field label="积分名称">
            <input className="fin-input" defaultValue="金币" />
          </Field>

          <Field label="积分比例">
            <div className="fin-inline">
              <span className="fin-muted">1元 =</span>
              <input className="fin-mini" defaultValue="10" />
              <span className="fin-muted">积分</span>
            </div>
          </Field>

          <Field label="余额名称">
            <input className="fin-input" defaultValue="余额" />
          </Field>

          <Field label="余额提现">
            <Switch on={balanceWithdraw} onToggle={() => setBalanceWithdraw((v) => !v)} />
          </Field>

          <Field label="提现手续费">
            <div className="fin-fee-options">
              <label className="fin-radio">
                <input type="radio" name="feeMode" checked={feeMode === "none"} onChange={() => setFeeMode("none")} />
                <span>不扣手续费</span>
              </label>
              <label className="fin-radio fin-radio-inline">
                <input type="radio" name="feeMode" checked={feeMode === "deduct"} onChange={() => setFeeMode("deduct")} />
                <span>提现金额 &gt;=</span>
                <input className="fin-mini" defaultValue="100" disabled={feeMode !== "deduct"} />
                <span>元，扣手续费</span>
              </label>
            </div>
          </Field>

          <Field label="手续费费率">
            <div className="fin-inline">
              <input className="fin-mini" defaultValue="1" />
              <span className="fin-muted">%</span>
            </div>
          </Field>

          <div className="fin-info">
            <Info className="sign-info-i" />
            <span>按提现金额计算，四舍五入，计算到分，手续费不满1元时直接按1元扣</span>
          </div>

          <div className="fin-sec-title">提现方式</div>

          <div className="fin-row fin-row-nowrap">
            <span className="fin-label">自动提现到微信零钱</span>
            <Switch on={autoWechat} onToggle={() => setAutoWechat((v) => !v)} />
            <div className="fin-amounts">
              <span className="fin-muted">单笔最小金额</span>
              <input className="fin-mini" defaultValue="1" disabled={!autoWechat} />
              <span className="fin-muted">单笔最大金额</span>
              <input className="fin-mini" defaultValue="500" disabled={!autoWechat} />
              <span className="fin-badge">请不要超过商户平台单次最高提现金额限制</span>
            </div>
          </div>

          <div className="fin-info">
            <Info className="sign-info-i" />
            <span>用户可自助将其账号中的余额立即提现至其微信零钱中，钱款将自动从微信商户的运营账户中支付。开启本功能前，请确保您已经在微信商户平台开通并配置了「商家转账」功能。运营账户中需有足够的余额用于支付提现；如尚未开通「商家转账」，切勿开启自动提现！微信商户平台会根据您的账号安全情况限制用户单次提现的上限（一般为200元）、单日提现的上限（一般为2000元）。此限制与本系统无关。</span>
          </div>

          <div className="fin-row fin-row-nowrap">
            <span className="fin-label">人工转账提现到微信</span>
            <Switch on={manualWechat} onToggle={() => setManualWechat((v) => !v)} />
            <div className="fin-amounts">
              <span className="fin-muted">单笔最小金额</span>
              <input className="fin-mini" defaultValue="1" disabled={!manualWechat} />
              <span className="fin-muted">单笔最大金额</span>
              <input className="fin-mini" defaultValue="1000" disabled={!manualWechat} />
              <span className="fin-badge">最小为1元，0为不限制</span>
            </div>
          </div>

          <div className="fin-row fin-row-nowrap">
            <span className="fin-label">人工转账提现到银行卡</span>
            <Switch on={manualBank} onToggle={() => setManualBank((v) => !v)} />
            <div className="fin-amounts">
              <span className="fin-muted">单笔最小金额</span>
              <input className="fin-mini" defaultValue="1" disabled={!manualBank} />
              <span className="fin-muted">单笔最大金额</span>
              <input className="fin-mini" defaultValue="1000" disabled={!manualBank} />
              <span className="fin-badge">最小为1元，0为不限制</span>
            </div>
          </div>

          <div className="fin-row fin-row-nowrap">
            <span className="fin-label">人工转账提现到支付宝</span>
            <Switch on={manualAlipay} onToggle={() => setManualAlipay((v) => !v)} />
            <div className="fin-amounts">
              <span className="fin-muted">单笔最小金额</span>
              <input className="fin-mini" defaultValue="1" disabled={!manualAlipay} />
              <span className="fin-muted">单笔最大金额</span>
              <input className="fin-mini" defaultValue="1000" disabled={!manualAlipay} />
              <span className="fin-badge">最小为1元，0为不限制</span>
            </div>
          </div>

          <div className="fin-sec-title">充值套餐</div>

          {rechargePackages.map((pkg) => (
            <div className="fin-row fin-row-nowrap" key={pkg.name}>
              <span className="fin-label">{pkg.name}</span>
              <div className="fin-amounts">
                <input className="fin-mini" defaultValue={pkg.amount} />
                <span className="fin-muted">元</span>
                <span className="fin-muted fin-gap">充值</span>
                <input className="fin-mini" defaultValue={pkg.points} />
                <span className="fin-muted">积分</span>
              </div>
            </div>
          ))}

          <div className="fin-actions">
            <button className="fin-submit">确定提交</button>
          </div>
        </div>
      </div>
    </div>
  );
}
