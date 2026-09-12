"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { LedgerEntryItem } from "@/lib/admin-endpoints";

const PAGE_SIZE = 20;

type Row = LedgerEntryItem;

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

export default function SystemCreditHistoryPage() {
  const [page, setPage] = useState(1);
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

  const load = async () => {
    setLoading(true);
    try {
      const query: Record<string, string | number | undefined> = {
        page,
        page_size: PAGE_SIZE,
        account_type: "user",
      };
      if (startDate) query.start_time = startDate;
      if (endDate) query.end_time = endDate;
      if (keyword) query.account_id = Number(keyword) || 0;
      const result = await adminEndpoints.financeLedger(query);
      setRows(result?.items ?? []);
      setTotal(result?.total ?? 0);
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
  }, [page]);

  const totalPage = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
          <select className="finord-select" disabled>
            <option>全部支付分类</option>
            <option>积分充值</option>
            <option>礼品兑换</option>
            <option>收礼物奖励</option>
            <option>送礼物</option>
          </select>
          <div className="finord-daterange">
            <input
              className="finord-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="finord-date-sep">→</span>
            <input
              className="finord-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
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
                  <td colSpan={7} className="finord-td-empty">加载中…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="finord-td-empty">暂无数据</td>
                </tr>
              ) : (
                rows.map((rec) => {
                  const amount = Number(rec.amount || 0);
                  const signed = rec.direction === "DEBIT" ? -amount : amount;
                  const meta = formatItem(rec);
                  return (
                    <tr key={rec.id}>
                      <td className="crh-col-id">{rec.id}</td>
                      <td>用户#{rec.account_id}</td>
                      <td>{meta.item}</td>
                      <td className="crh-col-category">{meta.category}</td>
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

        <div className="finord-pagination">
          <div className="finord-pages">
            <button
              className="finord-page nav"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            <button className={`finord-page ${page === 1 ? "active" : ""}`} onClick={() => setPage(1)}>
              1
            </button>
            <button
              className="finord-page nav"
              onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
              disabled={page === totalPage}
            >
              ›
            </button>
          </div>
          <div className="finord-page-size">
            <span>{PAGE_SIZE}条/页</span>
            <span className="finord-page-size-arrow">▾</span>
          </div>
        </div>
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