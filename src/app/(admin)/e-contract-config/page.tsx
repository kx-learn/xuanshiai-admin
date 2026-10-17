"use client";
import { useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { useConfigDomain } from "@/lib/platform-config";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "财务管理", href: "/finance-config" },
  { label: "电子合同", href: "/e-contract-config" },
  { label: "合同配置" },
];

type EContractConfigForm = {
  enabled: boolean;
  contract_quota: number;
  company_name: string;
  credit_code: string;
  legal_rep: string;
  items: Array<{ id: number; key: string; name: string; value: string; description?: string }>;
};

const DEFAULTS: EContractConfigForm = {
  enabled: false,
  contract_quota: 0,
  company_name: "",
  credit_code: "",
  legal_rep: "",
  items: [],
};

export default function EContractConfigPage() {
  const { snapshot, save, loading } = useConfigDomain<EContractConfigForm>(
    "econtract_config",
    DEFAULTS,
  );
  const cfg: EContractConfigForm = snapshot?.config
    ? { ...DEFAULTS, ...snapshot.config }
    : DEFAULTS;
  const [form, setForm] = useState<EContractConfigForm>(DEFAULTS);
  const [bannerVisible, setBannerVisible] = useState(true);
  // 「默认合同类型」的候选 = 已创建模板里出现过的合同类型（须知第 3 条：模板建好后配置到本页）
  const [templateTypes, setTemplateTypes] = useState<string[]>([]);

  useEffect(() => {
    adminEndpoints
      .listContent("econtract_template", { page: 1, page_size: 100 })
      .then((data) => {
        const rows = (data.items ?? []) as Array<{ extra?: { contract_type?: unknown } }>;
        const types = rows
          .map((row) => row.extra?.contract_type)
          .filter((t): t is string => typeof t === "string" && t.trim() !== "");
        setTemplateTypes(Array.from(new Set(types)));
      })
      .catch(() => setTemplateTypes([]));
  }, []);

  const setItemValue = (key: string, value: string) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.key === key ? { ...item, value } : item)),
    }));

  // 依赖必须是整份快照：只盯标量字段时，配置加载完成前后这些值都没变，
  // items（4 个键值配置项）就永远不会同步进表单，页面上一项也不显示。
  useEffect(() => {
    setForm(cfg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);

  const handleSave = async () => {
    await save({ ...form, contract_quota: cfg.contract_quota }, "更新电子合同配置");
  };
  const openGuide = (demo: boolean) => {
    window.open(demo ? "https://qian.tencent.com/developers" : "https://qian.tencent.com/document", "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      {bannerVisible && !cfg.enabled && <div className="etc-alert">
        <button type="button" className="etc-alert-x" aria-label="关闭提示" onClick={() => setBannerVisible(false)}>✕</button>
        <span className="etc-alert-text">电子签功能已关闭,请先打开电子签配置</span>
      </div>}

      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>本系统接入了腾讯电子签合同系统，您可以在本系统内灵活方便的使用腾讯电子签系统，快速与客户完成线上合同的发起、签署、和管理。电子签功能与服务由腾讯提供，腾讯电子签官网：https://qian.tencent.com/</p>
            <p>1、您可以根据您的运营需求自行设置是否启用腾讯电子签系统</p>
            <p>2、在下面正确填写企业名称、信用代码、法人代表，先点击"确定提交"，然后点击"授权电子签"，按照指引完成授权开通流程</p>
            <p>3、在模板管理中创建您的合同模板，您至少需要创建两份合同模板，创建成功后配置到本页面</p>
            <p>4、使用腾讯电子签您需在本系统内按合同份数进行充值，若合同剩余份数为0则无法正常使用</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="ecc-head">
          <div className="crh-title">合同配置</div>
          <div className="ecc-links">
            <button className="ecc-link" onClick={() => openGuide(false)}>配置使用教程</button>
            <button className="ecc-link" onClick={() => openGuide(true)}>客户签署流程演示</button>
          </div>
          <button className="finord-btn finord-btn-primary ecc-auth" onClick={() => showConfigToast("请先保存企业信息，再按腾讯电子签指引完成授权", "ok")}>授权电子签</button>
        </div>

        <div className="ecc-form">
          <div className="ecc-row">
            <span className="ecc-label">腾讯电子签系统</span>
            <label className="ecc-radio">
              <input
                type="radio"
                name="ecc-enable"
                checked={form.enabled}
                onChange={() => setForm({ ...form, enabled: true })}
              />
              <span>开启</span>
            </label>
            <label className="ecc-radio">
              <input
                type="radio"
                name="ecc-enable"
                checked={!form.enabled}
                onChange={() => setForm({ ...form, enabled: false })}
              />
              <span>关闭</span>
            </label>
          </div>

          <div className="ecc-row">
            <span className="ecc-label">企业名称</span>
            <input
              className="ecc-input"
              value={form.company_name}
              onChange={(e) => setForm({ ...form, company_name: e.target.value })}
            />
          </div>

          <div className="ecc-row">
            <span className="ecc-label">统一社会信用代码</span>
            <input
              className="ecc-input"
              value={form.credit_code}
              onChange={(e) => setForm({ ...form, credit_code: e.target.value })}
            />
          </div>

          <div className="ecc-row">
            <span className="ecc-label">法人代表</span>
            <input
              className="ecc-input"
              value={form.legal_rep}
              onChange={(e) => setForm({ ...form, legal_rep: e.target.value })}
            />
          </div>

          <div className="ecc-row">
            <span className="ecc-label">合同余量</span>
            <input
              className="ecc-input"
              type="number"
              value={form.contract_quota}
              readOnly
            />
            <span className="ecc-suffix">份</span>
          </div>

          {form.items.length > 0 && <div className="ecc-settings">
            {form.items.map((item) => {
              if (item.key !== "default_contract_type") {
                return <div className="ecc-row" key={item.key}><span className="ecc-label">{item.name}</span><span className="ecc-input" aria-label={item.name}>{item.value}</span></div>;
              }
              // 候选包含当前值，避免已保存但模板被删时下拉显示为空
              const options = Array.from(new Set([...templateTypes, item.value].filter(Boolean)));
              return (
                <div className="ecc-row" key={item.key}>
                  <span className="ecc-label">{item.name}</span>
                  <select className="ecc-input" aria-label={item.name} value={item.value} onChange={(e) => setItemValue(item.key, e.target.value)}>
                    {options.length === 0 && <option value="">请先创建合同模板</option>}
                    {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              );
            })}
          </div>}

          <button className="ecc-submit" onClick={handleSave} disabled={loading}>
            {loading ? "保存中..." : "确定提交"}
          </button>
        </div>
      </div>
    </div>
  );
}
