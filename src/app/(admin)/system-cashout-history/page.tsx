"use client";
import { useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { WithdrawalAdminItem } from "@/lib/admin-endpoints";

const STATUS_TABS = [
  { value: "", label: "全部" },
  { value: "PENDING_REVIEW", label: "待处理" },
  { value: "APPROVED", label: "已批准" },
  { value: "SUCCEEDED", label: "已提现" },
  { value: "PROCESSING", label: "提现中" },
  { value: "REJECTED", label: "拒绝提现" },
  { value: "FAILED", label: "失败" },
];

function statusLabel(s: string): string {
  const found = STATUS_TABS.find((t) => t.value === s);
  return found ? found.label : s;
}

function timeText(s: string): string {
  return s ? s.replace("T", " ").slice(0, 19) : "-";
}

export default function SystemCashoutHistoryPage() {
  const [statusTab, setStatusTab] = useState("");
  const [items, setItems] = useState<WithdrawalAdminItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const query: Record<string, string | number | undefined> = { page: 1, page_size: 100 };
      if (statusTab) query.status = statusTab;
      if (startDate) query.start_time = startDate;
      if (endDate) query.end_time = endDate;
      const result = await adminEndpoints.financeWithdrawals(query);
      setItems(result?.items ?? []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusTab]);

  const filtered = useMemo(() => {
    if (!keyword) return items;
    const k = keyword.trim();
    return items.filter(
      (r) =>
        String(r.account_id).includes(k) ||
        (r.payee_masked ?? "").includes(k) ||
        (r.failure_reason ?? "").includes(k),
    );
  }, [items, keyword]);

  const stats = useMemo(() => {
    const sum = (arr: WithdrawalAdminItem[]) =>
      arr.reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const succeeded = items.filter((r) => r.status === "SUCCEEDED");
    const pending = items.filter((r) => ["PENDING_REVIEW", "APPROVED", "PROCESSING"].includes(r.status));
    return {
      notApplied: sum(items.filter((r) => r.status === "PENDING_REVIEW")) + 0,
      succeeded: sum(succeeded),
      pending: sum(pending),
    };
  }, [items]);

  const review = async (id: number, status: "APPROVED" | "REJECTED" | "SUCCEEDED") => {
    try {
      await adminEndpoints.reviewWithdrawal(id, { status });
      await load();
    } catch (e) {
      // 静默失败，依赖下一次 load
    }
  };

  const breadcrumb = getBreadcrumb("财务管理", "余额提现");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="cs-info">
        <div className="cs-info-body">
          <span className="cs-info-ic">
            <span>ℹ</span>
          </span>
          <div className="cs-info-text">
            <p>平台中的用户可以将账号中的"余额"，以两种方式与平台进行现金结算（提现）：</p>
            <p>1、用户可自主操作自动提现到其微信零钱中，无需您的审核，秒到账。</p>
            <p>2、用户输入金额向平台提出结算提现申请，工作人员核实后人工转账或拒绝退回余额。</p>
          </div>
        </div>
      </div>

      <div className="cs-stats">
        <div className="cs-stat">
          <div className="cs-stat-icon green">¥</div>
          <div className="cs-stat-meta">
            <div className="cs-stat-label">待处理提现金额</div>
            <div className="cs-stat-value">{stats.notApplied.toFixed(2)}元</div>
          </div>
        </div>
        <div className="cs-stat">
          <div className="cs-stat-icon red">☺</div>
          <div className="cs-stat-meta">
            <div className="cs-stat-label">已提现总额</div>
            <div className="cs-stat-value">{stats.succeeded.toFixed(2)}元</div>
          </div>
        </div>
        <div className="cs-stat">
          <div className="cs-stat-icon blue">✓</div>
          <div className="cs-stat-meta">
            <div className="cs-stat-label">处理中总额</div>
            <div className="cs-stat-value">{stats.pending.toFixed(2)}元</div>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="crh-head">
          <div className="crh-title">余额提现</div>
        </div>

        <div className="cs-filters">
          <div className="cs-radios">
            {STATUS_TABS.map((t) => (
              <label
                key={t.value || "all"}
                className={`cs-radio ${statusTab === t.value ? "active" : ""}`}
              >
                <input
                  type="radio"
                  name="cs-status"
                  checked={statusTab === t.value}
                  onChange={() => setStatusTab(t.value)}
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
          <select className="finord-select" disabled>
            <option>全部支付类型</option>
            <option>自动提现</option>
            <option>人工转账</option>
          </select>
          <input
            className="finord-search-input crh-search-input"
            placeholder="请输入账号/收款人"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="finord-btn finord-btn-primary" onClick={load}>
            搜索
          </button>
          <button
            className="finord-btn finord-btn-outline cs-clear"
            onClick={() => {
              setKeyword("");
              setStartDate("");
              setEndDate("");
            }}
          >
            🗑 清空筛选
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table">
            <thead>
              <tr>
                <th>提现账号</th>
                <th>联系方式</th>
                <th>申请提现金额</th>
                <th>手续费</th>
                <th>到账金额</th>
                <th>提现状态</th>
                <th>当前账号余额</th>
                <th>时间</th>
                <th>支付到</th>
                <th>支付方式</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={11} className="finord-td-empty">加载中…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="finord-td-empty">暂无数据</td>
                </tr>
              ) : (
                filtered.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <div className="cs-nick">用户#{rec.account_id}</div>
                      <div className="cs-uid">ID: {rec.account_id}</div>
                    </td>
                    <td className="cs-phone">-</td>
                    <td className="cs-amount">{rec.amount}元</td>
                    <td className="cs-fee">-</td>
                    <td
                      className={`cs-arrive ${
                        rec.status === "SUCCEEDED" ? "done" : ""
                      }`}
                    >
                      {rec.status === "SUCCEEDED" ? `${rec.amount}元` : "-"}
                    </td>
                    <td>
                      <span
                        className={`cs-status ${
                          rec.status === "SUCCEEDED" ? "done" : "pending"
                        }`}
                      >
                        {statusLabel(rec.status)}
                      </span>
                    </td>
                    <td className="cs-balance">-</td>
                    <td>
                      <div className="cs-time">申请时间:{timeText(rec.created_at)}</div>
                      <div className="cs-time">更新时间:{timeText(rec.updated_at)}</div>
                    </td>
                    <td>
                      <div className="cs-payto">{rec.payee_masked ?? "-"}</div>
                      <div className="cs-payname">-</div>
                    </td>
                    <td className="cs-paymethod">-</td>
                    <td>
                      {rec.status === "PENDING_REVIEW" ? (
                        <div className="cs-ops">
                          <span
                            className="finord-link"
                            onClick={() => review(rec.id, "SUCCEEDED")}
                          >
                            已完成转账
                          </span>
                          <span className="cs-op-sep">|</span>
                          <span
                            className="finord-link"
                            onClick={() => review(rec.id, "REJECTED")}
                          >
                            拒绝提现
                          </span>
                        </div>
                      ) : (
                        <span className="finord-td-dash">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="finord-pagination">
          <div className="finord-pages">
            <button className="finord-page nav" disabled>
              ‹
            </button>
            <button className="finord-page active">1</button>
            <button className="finord-page nav" disabled>
              ›
            </button>
          </div>
          <div className="finord-page-size">
            <span>20条/页</span>
            <span className="finord-page-size-arrow">▾</span>
          </div>
        </div>
      </div>
    </div>
  );
}