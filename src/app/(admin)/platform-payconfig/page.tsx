"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { useState } from "react";

/* 蓝色带点提示 */
function Tip({ children }: { children: React.ReactNode }) {
  return (
    <span className="pay-tip">
      <span className="pay-tip-dot">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8h.01M12 12v4" />
        </svg>
      </span>
      {children}
    </span>
  );
}

/* 图文解说按钮 */
function TutBtn() {
  return (
    <button type="button" className="pay-tut-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3v5h5L9 21M14 3l-5 5" />
      </svg>
      图文解说
    </button>
  );
}

/* 卡片内通用块 */
function Board({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-card pay-board">
      <div className="pay-board-head">
        <div className="pay-board-title">{title}</div>
        <TutBtn />
      </div>
      <div className="pay-board-body">{children}</div>
    </div>
  );
}

/* 行：label + 输入框 + 单位 + 提示 */
function Row({
  label,
  unit,
  num,
  value,
  onChange,
  children,
  labelWidth = 150,
  inputWidth = 96,
}: {
  label: string;
  unit?: string;
  num?: boolean;
  value?: string;
  onChange?: (v: string) => void;
  children?: React.ReactNode;
  labelWidth?: number;
  inputWidth?: number;
}) {
  return (
    <div className="pay-row">
      <span className="pay-row-label" style={{ width: labelWidth }}>{label}</span>
      <div className="pay-row-controls">
        {value !== undefined ? (
          <input
            className="pay-num"
            style={{ width: inputWidth }}
            type={num ? "number" : "text"}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
          />
        ) : null}
        {children}
        {unit ? <span className="pay-unit">{unit}</span> : null}
      </div>
    </div>
  );
}

export default function PlatformPayconfigPage() {
  const [men, setMen] = useState("0");
  const [women, setWomen] = useState("0");
  const [force, setForce] = useState<"no" | "yes">("no");
  const [realName, setRealName] = useState("0");
  const [marry, setMarry] = useState("0");
  const [matchDays, setMatchDays] = useState("365");
  const [singleFee, setSingleFee] = useState("199");
  const [allowSingle, setAllowSingle] = useState<"allow" | "not">("allow");
  const [freeMatch, setFreeMatch] = useState("0");

  const [packages, setPackages] = useState([
    { name: "牵线套餐1", count: "1", fee: "199", on: true },
    { name: "牵线套餐2", count: "3", fee: "199", on: false },
    { name: "牵线套餐3", count: "5", fee: "299", on: false },
    { name: "牵线套餐4", count: "10", fee: "399", on: false },
    { name: "牵线套餐5", count: "10", fee: "1100", on: false },
    { name: "牵线套餐6", count: "12", fee: "1200", on: false },
    { name: "牵线套餐7", count: "14", fee: "1350", on: false },
    { name: "牵线套餐8", count: "16", fee: "1500", on: false },
    { name: "牵线套餐9", count: "18", fee: "1600", on: false },
    { name: "牵线套餐10", count: "20", fee: "1700", on: false },
  ]);

  const [vipTypes, setVipTypes] = useState([
    { name: "新人专享", days: "90", fee: "299", times: "3" },
    { name: "心动专享", days: "150", fee: "520", times: "5" },
    { name: "挚爱专享", days: "365", fee: "999", times: "20" },
  ]);
  const [vipPage, setVipPage] = useState<"open" | "close">("open");

  const [topPackages, setTopPackages] = useState([
    { days: "7", fee: "15" },
    { days: "30", fee: "50" },
    { days: "90", fee: "99" },
    { days: "180", fee: "150" },
    { days: "270", fee: "199" },
    { days: "365", fee: "269" },
  ]);

  const [promoteFee, setPromoteFee] = useState("99");
  const [partnerFees, setPartnerFees] = useState(["999", "1999", "3999"]);
  const [blowFee, setBlowFee] = useState("9.9");
  const [showFee, setShowFee] = useState("39");

  const updatePackage = (i: number, field: keyof (typeof packages)[number], v: string | boolean) =>
    setPackages((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: v } : p)));
  const updateVip = (i: number, field: keyof (typeof vipTypes)[number], v: string) =>
    setVipTypes((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: v } : p)));
  const updateTop = (i: number, field: keyof (typeof topPackages)[number], v: string) =>
    setTopPackages((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: v } : p)));
  const updatePartner = (i: number, v: string) =>
    setPartnerFees((prev) => prev.map((p, idx) => (idx === i ? v : p)));

  const Radio = ({
    checked,
    label,
    onPick,
  }: {
    checked: boolean;
    label: string;
    onPick: () => void;
  }) => (
    <label className="pcfg-radio" onClick={onPick}>
      <input type="radio" checked={checked} readOnly />
      <span className="pcfg-radio-dot"></span>
      <span className="pcfg-radio-label">{label}</span>
    </label>
  );

  return (
    <div>
      <AdminBreadcrumb items={getBreadcrumb("平台配置", "收费配置")} />

      <div className="pay-wrap">
        <div className="nv-notice">
          <span className="nv-notice-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </span>
          <div className="nv-notice-body">
            <div className="nv-notice-title">须知</div>
            <div className="nv-notice-line">
              下面所设置的收费项目均是指客户在您平台上进行的在线支付，所收费用均是直接进入到您的微信商户号中，您可以通过小程序"微信支付商家助手"实时掌握收入情况，也可以在本系统的"财务管理-收入明细"中查看收入情况。
            </div>
          </div>
        </div>

        {/* 资料审核费 */}
        <Board title="资料审核费">
          <div className="pay-row">
            <span className="pay-row-label" style={{ width: 150 }}>男士</span>
            <div className="pay-row-controls">
              <input className="pay-num" style={{ width: 96 }} type="number" value={men} onChange={(e) => setMen(e.target.value)} />
              <span className="pay-unit">元</span>
            </div>
          </div>
          <div className="pay-row">
            <span className="pay-row-label" style={{ width: 150 }}>女士</span>
            <div className="pay-row-controls">
              <input className="pay-num" style={{ width: 96 }} type="number" value={women} onChange={(e) => setWomen(e.target.value)} />
              <span className="pay-unit">元</span>
            </div>
            <Tip>0表示免审核费；无论是否支付，资料均会提交成功</Tip>
          </div>
          <div className="pay-row">
            <span className="pay-row-label" style={{ width: 150 }}>是否强制收取</span>
            <div className="pay-row-controls pay-radio-row">
              <Radio checked={force === "no"} label="不强制" onPick={() => setForce("no")} />
              <Radio checked={force === "yes"} label="强制" onPick={() => setForce("yes")} />
            </div>
          </div>
          <div className="pay-bluebox">
            <span className="pay-dot">!</span>
            开启强制支付后，不支付费用则不让其进入到会员中心，即使会员没有支付审核费，其资料也已被系统保存，不用担心资料流失；若管理员或红娘对其资料审核通过，即使会员没有支付审核费，系统会自动"放行"，不会再强制进入到审核费支付页面
          </div>
        </Board>

        {/* 实名认证费 */}
        <Board title="实名认证费">
          <Row label="实名认证费" unit="元/次" num value={realName} onChange={setRealName} labelWidth={150} inputWidth={96}>
            <Tip>指客户在您平台实名认证的时候需要向您支付的费用；不建议设置收费，0元表示免费</Tip>
          </Row>
        </Board>

        {/* 婚姻状况查询 */}
        <Board title="婚姻状况查询">
          <Row label="婚姻状况查询" unit="元/次" num value={marry} onChange={setMarry} labelWidth={150} inputWidth={96}>
            <Tip>指客户在您平台授权查询婚姻状态时需要向您支付的费用；可设置2-5元小额收费，0元表示免费</Tip>
          </Row>
        </Board>

        {/* 牵线有效期 */}
        <Board title="牵线有效期">
          <Row label="牵线默认有效期" unit="天" num value={matchDays} onChange={setMatchDays} labelWidth={150} inputWidth={96}>
            <Tip>牵线服务次数在此天数后自动清零，全部牵线默认均按此有效期执行</Tip>
          </Row>
        </Board>

        {/* 单次线上牵线费 */}
        <Board title="单次线上牵线费">
          <Row label="单次线上牵线收费" unit="元/次" num value={singleFee} onChange={setSingleFee} labelWidth={150} inputWidth={96}>
            <Tip>建议：99元或199元</Tip>
          </Row>
          <div className="pay-row">
            <span className="pay-row-label" style={{ width: 150 }}>是否允许按照单次购买牵线</span>
            <div className="pay-row-controls pay-radio-row">
              <Radio checked={allowSingle === "allow"} label="允许" onPick={() => setAllowSingle("allow")} />
              <Radio checked={allowSingle === "not"} label="不允许" onPick={() => setAllowSingle("not")} />
            </div>
            <Tip>若设置为不允许购买单次牵线服务，则用户必须通过购买VIP会员或者牵线套餐，在牵线支付的引导页面中不会显示出购买单次牵线</Tip>
          </div>
          <Row label="实名认证成功后赠送牵线" unit="次" num value={freeMatch} onChange={setFreeMatch} labelWidth={150} inputWidth={96}>
            <Tip>0表示不赠送</Tip>
          </Row>
        </Board>

        {/* 线上牵线套餐 */}
        <Board title="线上牵线套餐">
          <div className="pay-bluebox pay-bluebox-flat">
            <span className="pay-dot">!</span>
            套餐中的"牵线"是指会员线上发起牵线的次数，牵线成功则消耗1次，牵线失败则自动退回
          </div>
          <div className="pay-table">
            {packages.map((p, i) => (
              <div className="pay-tr" key={i}>
                <span className="pay-td pay-td-label">牵线套餐{i + 1}:</span>
                <span className="pay-td">名称</span>
                <input className="pay-inline" style={{ width: 150 }} value={p.name} onChange={(e) => updatePackage(i, "name", e.target.value)} />
                <span className="pay-td">牵线</span>
                <input className="pay-inline pay-center" style={{ width: 70 }} type="number" value={p.count} onChange={(e) => updatePackage(i, "count", e.target.value)} />
                <span className="pay-td">次</span>
                <span className="pay-td">收费</span>
                <input className="pay-inline" style={{ width: 96 }} value={p.fee} onChange={(e) => updatePackage(i, "fee", e.target.value)} />
                <span className="pay-td">元</span>
                <button
                  type="button"
                  className={`mp-switch ${p.on ? "on" : ""}`}
                  onClick={() => updatePackage(i, "on", !p.on)}
                >
                  {p.on ? <span className="mp-switch-label">开</span> : null}
                  <span className="mp-switch-knob"></span>
                </button>
              </div>
            ))}
          </div>
        </Board>

        {/* 线上VIP会员 */}
        <Board title="线上VIP会员">
          <div className="pay-vip">
            {vipTypes.map((t, i) => (
              <div className="pay-tr" key={i}>
                <span className="pay-td pay-td-label">类型{i + 1}:</span>
                <span className="pay-td">名称</span>
                <input className="pay-inline" style={{ width: 180 }} value={t.name} onChange={(e) => updateVip(i, "name", e.target.value)} />
                <span className="pay-td">有效期</span>
                <input className="pay-inline pay-center" style={{ width: 70 }} type="number" value={t.days} onChange={(e) => updateVip(i, "days", e.target.value)} />
                <span className="pay-td">天</span>
                <span className="pay-td">收费</span>
                <input className="pay-inline" style={{ width: 96 }} value={t.fee} onChange={(e) => updateVip(i, "fee", e.target.value)} />
                <span className="pay-td">元</span>
                <span className="pay-td">送</span>
                <input className="pay-inline pay-center" style={{ width: 60 }} type="number" value={t.times} onChange={(e) => updateVip(i, "times", e.target.value)} />
                <span className="pay-td">次牵线</span>
                <button type="button" className="pay-link">权益描述</button>
              </div>
            ))}
          </div>
          <div className="pay-row">
            <span className="pay-row-label" style={{ width: 150 }}></span>
            <div className="pay-row-controls pay-radio-row">
              <Radio checked={vipPage === "open"} label="开启线上VIP开通页" onPick={() => setVipPage("open")} />
              <Radio checked={vipPage === "close"} label="关闭线上VIP开通页" onPick={() => setVipPage("close")} />
            </div>
          </div>
          <div className="pay-bluebox">
            <span className="pay-dot">!</span>
            关闭状态下，用户将无法在线开通线上VIP会员，也看不到默认的VIP宣传页面，点击任何"开通VIP"将进入到您指定的页面，如：/subpages/freepay/freepay?id=8&categ...
          </div>
        </Board>

        {/* 资料置顶 */}
        <Board title="资料置顶">
          <div className="pay-vip">
            {topPackages.map((p, i) => (
              <div className="pay-tr" key={i}>
                <span className="pay-td pay-td-label">套餐{i + 1}:</span>
                <span className="pay-td">置顶</span>
                <input className="pay-inline pay-center" style={{ width: 70 }} type="number" value={p.days} onChange={(e) => updateTop(i, "days", e.target.value)} />
                <span className="pay-td">天</span>
                <span className="pay-td">收费</span>
                <input className="pay-inline" style={{ width: 96 }} value={p.fee} onChange={(e) => updateTop(i, "fee", e.target.value)} />
                <span className="pay-td">元</span>
              </div>
            ))}
          </div>
        </Board>

        {/* 推广红娘/合伙红娘入伙费 */}
        <Board title="推广红娘/合伙红娘入伙费">
          <Row label="推广红娘招募收费" unit="元" num value={promoteFee} onChange={setPromoteFee} labelWidth={150} inputWidth={96}>
            <Tip>0元为免费自助开通，大于0则为付费自助开通</Tip>
          </Row>
          <div className="pay-row">
            <span className="pay-row-label" style={{ width: 150 }}>合伙红娘招募收费</span>
            <div className="pay-row-controls pay-col">
              {partnerFees.map((fee, i) => (
                <div className="pay-row" key={i} style={{ marginBottom: i === partnerFees.length - 1 ? 0 : 10 }}>
                  <span className="pay-row-label" style={{ width: 70, textAlign: "right", color: "#9aa1b5" }}>级别{i + 1}:</span>
                  <input className="pay-num" style={{ width: 96 }} value={fee} onChange={(e) => updatePartner(i, e.target.value)} />
                  <span className="pay-unit">元</span>
                </div>
              ))}
            </div>
          </div>
          <div className="pay-bluebox">
            <span className="pay-dot">!</span>
            0元为联系平台人工开通，大于0则为付费自助开通
          </div>
        </Board>

        {/* 会员爆灯 */}
        <Board title="会员爆灯">
          <Row label="会员爆灯收费" unit="元/次" num value={blowFee} onChange={setBlowFee} labelWidth={150} inputWidth={96} />
        </Board>

        {/* 资料推广 */}
        <Board title="资料推广">
          <Row label="资料推广展示收费" unit="元/次" num value={showFee} onChange={setShowFee} labelWidth={150} inputWidth={96} />
        </Board>

        <div className="pay-submit">
          <button type="button" className="pay-submit-btn">确定提交</button>
        </div>
      </div>
    </div>
  );
}
