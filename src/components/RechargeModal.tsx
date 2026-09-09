"use client";

import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/* 数据定义                                                            */
/* ------------------------------------------------------------------ */

const balances = [
  { label: "短信当前余量", value: 9410, unit: "条" },
  { label: "人脸核验当前余量", value: 786, unit: "条" },
  { label: "电子合同当前余量", value: 150, unit: "条" },
  { label: "婚姻状况权威数据查询余量", value: 1, unit: "次" },
];

interface Plan {
  id: string;
  name: string;
  price: number;
}

interface RechargeGroup {
  key: string;
  title: string;
  note: string;
  plans: Plan[];
}

const groups: RechargeGroup[] = [
  {
    key: "sms",
    title: "短信余量充值",
    note: "费用标准与「腾讯云·国内短信资源包」一致",
    plans: [
      { id: "sms1000", name: "短信1000条", price: 51 },
      { id: "sms5000", name: "短信5000条", price: 250 },
      { id: "sms10000", name: "短信10000条", price: 470 },
    ],
  },
  {
    key: "verify",
    title: "人脸核验余量充值",
    note: "费用标准与「腾讯云·人脸核身资源包」增强版人脸核身·权威库(1:1)一致",
    plans: [
      { id: "vr100", name: "实名认证100条", price: 120 },
      { id: "vr300", name: "实名认证300条", price: 360 },
      { id: "vr1000", name: "实名认证1000条", price: 1150 },
    ],
  },
  {
    key: "contract",
    title: "电子合同余量充值",
    note: "费用标准与「腾讯电子签」一致",
    plans: [
      { id: "ct3", name: "电子签合同3份体验", price: 10 },
      { id: "ct100", name: "电子签合同100份", price: 300 },
      { id: "ct300", name: "电子签合同300份", price: 840 },
    ],
  },
  {
    key: "marriage",
    title: "婚姻状况权威数据查询余量充值",
    note: "",
    plans: [
      { id: "ms5", name: "婚况核验5次体验", price: 10 },
      { id: "ms100", name: "婚况核验100次", price: 99 },
      { id: "ms500", name: "婚况核验500次", price: 480 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* 在线支付二维码弹窗                                                  */
/* ------------------------------------------------------------------ */

function PayModal({ plan, onClose }: { plan: Plan | null; onClose: () => void }) {
  if (!plan) return null;
  return (
    <div className="pay-mask" onClick={onClose}>
      <div className="pay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="pay-head">
          <span className="pay-title">在线支付</span>
          <button type="button" className="pay-x" onClick={onClose} aria-label="关闭">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="pay-body">
          <div className="pay-qr">
            <svg viewBox="0 0 33 33" className="pay-qr-svg">
              <rect width="33" height="33" fill="#fff" />
              <g fill="#111">
                {/* 定位角 */}
                <path d="M2 2h7v7H2zM3 3v5h5V3zM4 4v3h3V4z" />
                <path d="M24 2h7v7h-7zM25 3v5h5V3zM26 4v3h3V4z" />
                <path d="M2 24h7v7H2zM3 25v5h5V25zM4 26v3h3V26z" />
                {/* 随机数据点 */}
                <path d="M11 2h2v2h-2zM14 4h2v3h-2zM11 8h3v2h-3zM17 2h3v2h-3zM21 5h2v2h-2z" />
                <path d="M2 11h2v2H2zM5 11h3v2H5zM9 11h2v2H9zM12 12h2v2h-2zM17 11h2v2h-2zM20 12h3v2h-3zM24 11h2v2h-2zM28 11h2v2h-2z" />
                <path d="M2 15h2v2H2zM5 15h2v2H5zM8 16h3v1H8zM14 15h2v2h-2zM18 16h2v1h-2zM22 15h2v2h-2zM26 16h2v1h-2zM30 15h1v2h-1z" />
                <path d="M2 19h2v2H2zM6 19h2v2H6zM10 20h2v1h-2zM15 19h2v2h-2zM19 20h2v1h-2zM23 19h2v2h-2zM27 20h2v1h-2z" />
                <path d="M2 23h2v2H2zM11 23h2v2h-2zM15 24h2v1h-2zM19 23h2v2h-2zM23 24h2v1h-2zM27 23h2v2h-2zM31 23h1v2h-1z" />
                <path d="M11 26h2v2h-2zM15 27h2v1h-2zM19 26h2v2h-2zM23 27h2v1h-2z" />
                <path d="M11 30h2v2h-2zM15 31h2v1h-2zM19 30h2v2h-2zM25 31h2v1h-2z" />
              </g>
            </svg>
          </div>
          <p className="pay-tip">请使用“手机支付宝”扫码并支付</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 充值弹窗主体                                                        */
/* ------------------------------------------------------------------ */

export default function RechargeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [payPlan, setPayPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (open) setPayPlan(null);
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="chg-mask" onClick={onClose}>
        <div className="chg-panel" onClick={(e) => e.stopPropagation()}>
          <div className="chg-head">
            <button type="button" className="chg-x" onClick={onClose} aria-label="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            <span className="chg-title">充值</span>
          </div>

          <div className="chg-scroll">
            <div className="chg-notice">
              <span className="chg-notice-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8v.01M12 11v5" /></svg>
                须知
              </span>
              <p className="chg-notice-text">为了避免由于短信或者人脸核验的余量不足影响到平台运营，请及时安排充值，充值费用由系统服务商支付到腾讯云。</p>
            </div>

            <div className="chg-balances">
              {balances.map((b) => (
                <div className="chg-balance" key={b.label}>
                  <div className="chg-balance-label">{b.label}</div>
                  <div className="chg-balance-value">{b.value.toLocaleString()}<span className="chg-balance-unit">{b.unit}</span></div>
                </div>
              ))}
            </div>

            {groups.map((g) => (
              <div className="chg-group" key={g.key}>
                <div className="chg-group-head">
                  <span className="chg-group-title">{g.title}</span>
                  {g.note && (
                    <span className="chg-group-note">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v.01M12 12v.01M12 16v.01" /></svg>
                      {g.note}
                    </span>
                  )}
                </div>
                <div className="chg-plans">
                  {g.plans.map((p) => (
                    <div className="chg-plan" key={p.id}>
                      <span className="chg-plan-name">{p.name}</span>
                      <span className="chg-plan-price">¥{p.price}</span>
                      <button type="button" className="chg-pay-btn" onClick={() => setPayPlan(p)}>充值</button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PayModal plan={payPlan} onClose={() => setPayPlan(null)} />
    </>
  );
}
