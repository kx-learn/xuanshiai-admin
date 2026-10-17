"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import DateRangePicker from "@/components/DateRangePicker";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { CreditRecordItem } from "@/lib/admin-endpoints";
import {
  CREDIT_ACTION_SOURCE,
  CREDIT_ACTION_SOURCE_VALUE,
  CREDIT_CATEGORY,
  CREDIT_CATEGORY_VALUE,
  CREDIT_MEMBER_SCOPE,
  CREDIT_MEMBER_SCOPE_VALUE,
} from "@/lib/filter-options";

type Row = CreditRecordItem;

const TARGET_OPTIONS: { value: "all" | "member" | "verified" | "matchmaker_team"; label: string }[] = [
  { value: "all", label: "所有注册用户" },
  { value: "member", label: "指定会员" },
  { value: "verified", label: "已认证会员" },
  { value: "matchmaker_team", label: "红娘团队" },
];

function formatItem(item: Row): { item: string; category: string } {
  const isGrant = item.source_type === "admin_grant";
  const amount = Number(item.amount || 0);
  if (isGrant) {
    return { item: "后台发放积分", category: "积分充值" };
  }
  if (item.source_type === "commission" || item.source_type === "commission_refund") {
    return { item: item.direction === "CREDIT" ? "分成入账" : "分成冲正", category: "收礼物奖励" };
  }
  if (item.source_type === "withdrawal" || item.source_type === "withdrawal_reversal") {
    return { item: item.direction === "DEBIT" ? "提现扣款" : "提现退回", category: "礼品兑换" };
  }
  return { item: `${item.source_type} ${item.direction}`, category: amount >= 0 ? "积分充值" : "礼品兑换" };
}

/** 分类编码 → 中文文案；后端未归类（null）时回落到按流水方向推断 */
function categoryLabel(code?: string | null): string | null {
  if (!code) return null;
  return CREDIT_CATEGORY.find((label) => CREDIT_CATEGORY_VALUE[label] === code) ?? null;
}

export default function SystemCreditHistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [showPanel, setShowPanel] = useState(false);
  const [target, setTarget] = useState<typeof TARGET_OPTIONS[number]["value"]>("all");
  const [value, setValue] = useState<string>("");
  const [reason, setReason] = useState("");
  const [granting, setGranting] = useState(false);
  const [grantMessage, setGrantMessage] = useState<string | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [memberScope, setMemberScope] = useState("");
  const [actionSource, setActionSource] = useState("");
  const [category, setCategory] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      // 积分明细走专用接口 /admin/finance/credit-records（原来接的 ledger 是账务流水，
      // 不支持会员范围/操作来源/分类这些筛选，参数名也不同：start_time → start_date）。
      const query: Record<string, string | number | undefined> = {
        page,
        page_size: pageSize,
      };
      if (memberScope) query.member_scope = CREDIT_MEMBER_SCOPE_VALUE[memberScope];
      if (actionSource) query.action_source = CREDIT_ACTION_SOURCE_VALUE[actionSource];
      if (category) query.category = CREDIT_CATEGORY_VALUE[category];
      if (startDate) query.start_date = startDate;
      if (endDate) query.end_date = endDate;
      if (keyword.trim()) query.keyword = keyword.trim();
      let items: Row[];
      let count: number;
      try {
        const result = await adminEndpoints.creditRecords(query);
        items = result?.items ?? [];
        count = result?.total ?? 0;
      } catch {
        // 降级：/admin/finance/credit-records 是新增接口，线上环境可能尚未部署（实测 404）。
        // 此时回退到账务流水 /admin/finance/ledger，参数名不同：start/end_date → start/end_time。
        const legacy: Record<string, string | number | undefined> = { page, page_size: pageSize, account_type: "user" };
        if (startDate) legacy.start_time = startDate;
        if (endDate) legacy.end_time = endDate;
        if (keyword.trim()) legacy.account_id = Number(keyword.trim()) || 0;
        const result = await adminEndpoints.financeLedger(legacy);
        items = (result?.items ?? []) as unknown as Row[];
        count = result?.total ?? 0;
      }
      setRows(items);
      setTotal(count);
      setSelected([]);
    } catch (e) {
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);
  const allSelected = rows.length > 0 && selected.length === rows.length;

  const submit = async () => {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
      setGrantMessage("发放数值必须为正整数");
      return;
    }
    if (!reason.trim()) {
      setGrantMessage("请填写发放理由");
      return;
    }
    setGranting(true);
    setGrantMessage(null);
    try {
      const result = await adminEndpoints.creditGrant({
        target_type: target,
        amount,
        reason: reason.trim(),
      });
      setGrantMessage(`成功向 ${result.granted_count} 个账户发放 ${result.total_amount} 积分`);
      setShowPanel(false);
      setValue("");
      setReason("");
      await load();
    } catch (e) {
      setGrantMessage(e instanceof Error ? e.message : "发放失败");
    } finally {
      setGranting(false);
    }
  };

  const breadcrumb = getBreadcrumb("财务管理", "积分明细");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {grantMessage && (
        <div className="finord-info">
          <span>{grantMessage}</span>
        </div>
      )}

      <div className="finord-card">
        <div className="crh-head">
          <div className="crh-title">积分明细</div>
          <button className="finord-btn finord-btn-primary" onClick={() => setShowPanel(true)}>
            发放积分
          </button>
        </div>

        <div className="finord-filters">
          <select className="finord-select" value={memberScope} onChange={(e) => setMemberScope(e.target.value)}>
            <option value="">会员范围：不限</option>
            {CREDIT_MEMBER_SCOPE.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select className="finord-select" value={actionSource} onChange={(e) => setActionSource(e.target.value)}>
            <option value="">操作来源：不限</option>
            {CREDIT_ACTION_SOURCE.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select className="finord-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">全部支付分类</option>
            {CREDIT_CATEGORY.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <DateRangePicker startValue={startDate} endValue={endDate} onStartChange={setStartDate} onEndChange={setEndDate} className="w-[260px]" />
          <input
            className="finord-search-input crh-search-input"
            placeholder="请输入会员昵称/ID"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="finord-btn finord-btn-primary" onClick={load}>
            搜索
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))} /></th>
                <th className="crh-col-id">ID</th>
                <th>支付会员</th>
                <th>支付事项</th>
                <th>支付分类</th>
                <th className="crh-col-amount">支付金额</th>
                <th>支付时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="finord-td-empty">加载中…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="finord-td-empty">暂无数据</td>
                </tr>
              ) : (
                rows.map((rec) => {
                  const amount = Number(rec.amount || 0);
                  const signed = rec.direction === "DEBIT" ? -amount : amount;
                  const meta = formatItem(rec);
                  return (
                    <tr key={rec.id}>
                      <td><input type="checkbox" aria-label={`选择流水 ${rec.id}`} checked={selected.includes(rec.id)} onChange={() => setSelected((current) => current.includes(rec.id) ? current.filter((id) => id !== rec.id) : [...current, rec.id])} /></td>
                      <td className="crh-col-id">{rec.id}</td>
                      <td>{rec.nickname?.trim() ? rec.nickname : `用户#${rec.user_id}`}</td>
                      <td>{meta.item}</td>
                      <td className="crh-col-category">{categoryLabel(rec.category) ?? meta.category}</td>
                      <td className={`crh-col-amount ${signed >= 0 ? "income" : "expense"}`}>
                        {signed >= 0 ? "+" : "-"}
                        {Math.abs(signed)}金币
                      </td>
                      <td className="crh-col-time">{rec.created_at}</td>
                      <td className="finord-td-dash">-</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      </div>

      {showPanel && (
        <>
          <div className="ptp-mask" onClick={() => !granting && setShowPanel(false)} />
          <div className="ptp-panel">
            <div className="ptp-header">
              <div className="ptp-header-left">
                <button
                  className="ptp-close"
                  onClick={() => !granting && setShowPanel(false)}
                  disabled={granting}
                >
                  <X size={18} />
                </button>
                <span className="ptp-title">发放积分</span>
              </div>
              <div className="ptp-header-right">
                <button
                  className="finord-btn ptp-btn-muted"
                  onClick={() => setShowPanel(false)}
                  disabled={granting}
                >
                  取消
                </button>
                <button
                  className="finord-btn finord-btn-primary"
                  onClick={submit}
                  disabled={granting}
                >
                  {granting ? "发放中…" : "确定发放"}
                </button>
              </div>
            </div>
            <div className="ptp-body">
              <div className="ptp-row">
                <label className="ptp-label">发放对象</label>
                <select
                  className="ptp-select"
                  value={target}
                  onChange={(e) => setTarget(e.target.value as typeof target)}
                >
                  {TARGET_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="ptp-row">
                <label className="ptp-label">
                  <span className="ptp-required">*</span>发放数值
                </label>
                <div className="ptp-value">
                  <input
                    className="ptp-input"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="请输入积分数量"
                  />
                  <span className="ptp-unit">积分</span>
                </div>
              </div>
              <div className="ptp-row">
                <label className="ptp-label">
                  <span className="ptp-required">*</span>发放理由
                </label>
                <input
                  className="ptp-input"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="不要超过20个字"
                  maxLength={20}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
