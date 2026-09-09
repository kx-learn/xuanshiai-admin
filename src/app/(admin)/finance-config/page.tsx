"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef } from "@/components/ListPage";
import {
  useConfigDomain,
  showConfigToast,
  useDebouncedFlush,
  asStr,
  asBool,
  asObject,
  type Dict,
} from "@/lib/platform-config";

/* 后端 finance 配置域默认结构（未涉及的键在合并时由服务端快照保留） */
const FINANCE_DEFAULTS: Dict = {
  payment_mode: "mock",
  payment_channels: [],
  withdrawal: { enabled: false, min_amount: "0.00" },
  refund: { manual_review: true },
  free_payment: { enabled: false },
  e_contract: { enabled: false },
  commission_rules: [],
};

type ValueRow = { id: number; key: string; name: string; description: string; kind: "switch" | "select" | "number"; options?: { label: string; value: string }[]; unit?: string } & Record<string, unknown>;

const ROWS: ValueRow[] = [
  {
    id: 1,
    key: "payment_mode",
    name: "支付模式",
    kind: "select",
    options: [
      { label: "mock（沙箱/测试）", value: "mock" },
      { label: "production（正式）", value: "production" },
    ],
    description: "支付渠道运行模式。mock=沙箱/测试环境，production=正式环境（商户密钥经密钥系统注入，不在配置域存明文）",
  },
  {
    id: 2,
    key: "withdrawal_enabled",
    name: "余额提现功能",
    kind: "switch",
    description: "是否允许用户将可提现余额申请提现（申请后由后台审核）",
  },
  {
    id: 3,
    key: "withdrawal_min_amount",
    name: "最低提现金额",
    kind: "number",
    unit: "元",
    description: "单笔提现申请的最低金额限制",
  },
  {
    id: 4,
    key: "refund_manual_review",
    name: "退款人工审核",
    kind: "switch",
    description: "已支付订单退款是否需要后台人工审核确认",
  },
  {
    id: 5,
    key: "free_payment_enabled",
    name: "自由收款",
    kind: "switch",
    description: "运营工具-自由收款功能是否开启",
  },
  {
    id: 6,
    key: "e_contract_enabled",
    name: "电子合同",
    kind: "switch",
    description: "电子合同功能是否启用（未启用时合同菜单仅作占位展示）",
  },
];

/* 把嵌套配置压成扁平可编辑值 */
function flattenFinance(c: Dict): Dict {
  const withdrawal = asObject(c.withdrawal);
  const refund = asObject(c.refund);
  const freePayment = asObject(c.free_payment);
  const eContract = asObject(c.e_contract);
  return {
    payment_mode: asStr(c.payment_mode, "mock"),
    withdrawal_enabled: asBool(withdrawal.enabled, false),
    withdrawal_min_amount: asStr(withdrawal.min_amount, "0.00"),
    refund_manual_review: asBool(refund.manual_review, true),
    free_payment_enabled: asBool(freePayment.enabled, false),
    e_contract_enabled: asBool(eContract.enabled, false),
  };
}

/* 把扁平值还原为嵌套 patch（未涉及的键不提交，服务端快照保留） */
function nestFinancePatch(v: Dict): Dict {
  return {
    payment_mode: v.payment_mode,
    withdrawal: { enabled: v.withdrawal_enabled, min_amount: v.withdrawal_min_amount },
    refund: { manual_review: v.refund_manual_review },
    free_payment: { enabled: v.free_payment_enabled },
    e_contract: { enabled: v.e_contract_enabled },
  };
}

/* 与平台配置/系统管理一致的开关 */
function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`pcfg-switch${on ? " on" : ""}`} style={{ width: 46 }} onClick={() => onChange(!on)}>
      <span className="pcfg-switch-text">{on ? "开" : "关"}</span>
      <span className="pcfg-switch-knob" />
    </button>
  );
}

export default function FinanceConfigPage() {
  const domain = useConfigDomain<Dict>("finance", FINANCE_DEFAULTS);
  const [values, setValues] = useState<Dict | null>(null);
  const [keyword, setKeyword] = useState("");
  const initialized = useRef(false);

  /* 首次加载完成后用服务端值初始化本地编辑态 */
  useEffect(() => {
    if (!initialized.current && domain.ready && domain.snapshot?.config) {
      initialized.current = true;
      setValues(flattenFinance(domain.snapshot.config));
    }
  }, [domain.ready, domain.snapshot?.config]);

  const active = values ?? flattenFinance(
    domain.snapshot?.config && typeof domain.snapshot.config === "object"
      ? domain.snapshot.config
      : FINANCE_DEFAULTS,
  );

  const flush = async () => {
    const ok = await domain.save(nestFinancePatch(active), "财务系统配置修改（支付模式/提现/退款/自由收款/电子合同）");
    if (ok) showConfigToast("已保存财务系统配置");
    return ok;
  };
  useDebouncedFlush([active], flush, 800);

  const setValue = (key: string, value: boolean | string) => {
    setValues((prev) => ({ ...(prev ?? active), [key]: value }));
  };

  const displayRows = useMemo(() => {
    const base = ROWS.map((row) => ({ ...row }));
    if (!keyword.trim()) return base;
    const kw = keyword.trim().toLowerCase();
    return base.filter((r) => r.name.toLowerCase().includes(kw) || r.description.toLowerCase().includes(kw));
  }, [keyword]);

  const columns: ColumnDef[] = [
    { title: "编号", key: "id", width: 70 },
    { title: "配置名称", key: "name" },
    {
      title: "配置值",
      key: "value",
      width: 220,
      render: (row) => {
        const meta = ROWS.find((r) => r.key === row.key);
        if (!meta) return null;
        const value = active[meta.key];
        if (meta.kind === "switch") {
          return <Switch on={Boolean(value)} onChange={(v) => setValue(meta.key, v)} />;
        }
        if (meta.kind === "select") {
          return (
            <select
              className="h-8 rounded-md border border-[#d9d9d9] bg-white px-3 text-sm"
              value={asStr(value, "mock")}
              onChange={(e) => setValue(meta.key, e.target.value)}
            >
              {meta.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          );
        }
        if (meta.kind === "number") {
          return (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                className="h-8 w-28 rounded-md border border-[#d9d9d9] px-3 text-sm"
                value={asStr(value, "0.00")}
                onChange={(e) => setValue(meta.key, e.target.value)}
              />
              {meta.unit && <span className="whitespace-nowrap text-sm text-[#999]">{meta.unit}</span>}
            </div>
          );
        }
        return <span className="text-sm">{String(value ?? "")}</span>;
      },
    },
    { title: "说明", key: "description" },
    {
      title: "更新时间",
      key: "updatedAt",
      width: 170,
      render: () => (
        <span>{domain.snapshot?.updated_at ? String(domain.snapshot.updated_at).slice(0, 19).replace("T", " ") : "-"}</span>
      ),
    },
    {
      title: "操作",
      key: "action",
      width: 90,
      render: () => (
        <button
          type="button"
          className="text-[#3658f7] hover:text-[#5281f3] text-sm cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
          disabled={domain.saving}
          onClick={() => { void flush(); }}
        >
          保存
        </button>
      ),
    },
  ];

  return (
    <ListPage
      breadcrumb={getBreadcrumb("财务管理", "系统配置")}
      pageTitle="系统配置"
      columns={columns}
      dataSource={displayRows}
      rowKey="id"
      loading={!domain.ready || domain.loading}
      pagination={{ current: 1, pageSize: 20, total: displayRows.length }}
      searchFields={[
        { label: "配置名称", key: "keyword", type: "input", placeholder: "请输入配置名称" },
      ]}
      keywordValue={keyword}
      onKeywordChange={setKeyword}
      onSearch={() => {}}
      onReset={() => setKeyword("")}
    />
  );
}
