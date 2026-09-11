"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ChevronDown, Plus, X } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { resolveMediaUrl } from "@/lib/admin-api";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { CommissionEntryDetailItem, CommissionEntryDetailOptions } from "@/lib/admin-endpoints";

const breadcrumb = getBreadcrumb("总店红娘", "分成明细");

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "待结算",
  AVAILABLE: "可提现",
  FROZEN: "冻结",
  REVERSED: "冲正",
};

const EVENT_OPTIONS = ["请选择消费事件", "会员爆灯", "VIP会员", "活动报名", "推广展示"];

export default function Page() {
  const [rows, setRows] = useState<CommissionEntryDetailItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [matchmakerId, setMatchmakerId] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [options, setOptions] = useState<CommissionEntryDetailOptions>({ matchmakers: [], events: [] });
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminEndpoints.commissionEntryList({
        page,
        page_size: pageSize,
        matchmaker_id: matchmakerId ? Number(matchmakerId) : undefined,
        rule_id: ruleId ? Number(ruleId) : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setRows(res.items ?? []);
      setTotal(res.total ?? 0);
      setPage(res.page ?? page);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, matchmakerId, ruleId, startDate, endDate]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    adminEndpoints
      .commissionEntryOptions()
      .then(setOptions)
      .catch(() => setOptions({ matchmakers: [], events: [] }));
  }, []);

  const handleSearch = () => {
    setPage(1);
    void load();
  };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={breadcrumb} />

      {/* 须知 */}
      <div className="cdd-notice">
        <div className="cdd-notice-title">
          <span className="cdd-notice-icon">i</span>
          <span>须知</span>
        </div>
        <p>
          以下是在平台中进行线上支付后平台与服务红娘之间的分成明细，总店红娘的分成会实时计入到每个红娘的账号余额中，红娘可以实时申请提现，由平台审核后给与支付结算；分店名下红娘是统一按照分店与平台之间达成的分成标准计算分成，分店红娘所产生的分成统一计入到店长的账号余额中，门店可实时向平台申请结算提现。
        </p>
      </div>

      <section className="cdd-card">
        <div className="cdd-head">
          <h2 className="cdd-title">红娘线上分成明细</h2>
          <button type="button" className="cdd-btn primary" onClick={() => setOpen(true)}>
            <Plus size={14} />
            录入一笔分成
          </button>
        </div>

        {/* 筛选 */}
        <div className="cdd-filters">
          <div className="cdd-select">
            <select defaultValue="">
              <option value="">请选择门店</option>
              <option value="total">总店</option>
            </select>
            <ChevronDown className="cdd-caret" size={14} />
          </div>
          <div className="cdd-select">
            <select value={matchmakerId} onChange={(e) => setMatchmakerId(e.target.value)}>
              <option value="">请选择红娘</option>
              {options.matchmakers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <ChevronDown className="cdd-caret" size={14} />
          </div>
          <div className="cdd-select">
            <select value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
              <option value="">请选择消费事件</option>
              {options.events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name}
                </option>
              ))}
            </select>
            <ChevronDown className="cdd-caret" size={14} />
          </div>
          <div className="cdd-daterange">
            <div className="cdd-date">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <CalendarDays size={14} />
            </div>
            <span className="cdd-arrow">→</span>
            <div className="cdd-date">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              <CalendarDays size={14} />
            </div>
          </div>
          <button type="button" className="cdd-search" onClick={handleSearch}>
            搜索
          </button>
        </div>

        {/* 表格 */}
        <div className="cdd-table-wrap">
          <table className="cdd-table">
            <colgroup>
              <col style={{ width: 70 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 230 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 140 }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>门店</th>
                <th>时间</th>
                <th>红娘</th>
                <th>消费会员</th>
                <th>分成/奖励事件</th>
                <th>消费金额</th>
                <th>分成金额</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="cdd-td-text" colSpan={8}>加载中…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td className="cdd-td-text" colSpan={8}>{error}</td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td className="cdd-td-text" colSpan={8}>暂无数据</td>
                </tr>
              )}
              {!loading &&
                !error &&
                rows.map((row) => (
                  <tr key={row.id}>
                    <td className="cdd-td-id">{row.id}</td>
                    <td className="cdd-td-text">{row.store_name}</td>
                    <td className="cdd-td-time">{row.created_at}</td>
                    <td className="cdd-td-text">{row.matchmaker_name}</td>
                    <td>
                      <span className="cdd-buyer">
                        {row.consumer_avatar ? (
                          <img className="cdd-avatar" src={resolveMediaUrl(row.consumer_avatar)} alt="" />
                        ) : (
                          <span className="cdd-avatar cdd-g-a" />
                        )}
                        <span className="cdd-buyer-name">{row.consumer_name}</span>
                      </span>
                    </td>
                    <td className="cdd-td-text">{row.event_name}</td>
                    <td className="cdd-td-amount">¥{row.consumer_amount}</td>
                    <td className="cdd-td-commission">
                      ¥{row.commission_amount}
                      <span className="cdd-refunded">{STATUS_LABEL[row.status] ?? row.status}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <AdminPagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        )}
      </section>

      {/* 录入一笔分成 Drawer */}
      {open && (
        <div className="cdd-mask" onClick={() => setOpen(false)}>
          <div className="cdd-panel" onClick={(e) => e.stopPropagation()}>
            <header className="cdd-panel-head">
              <button type="button" className="cdd-panel-close-icon" onClick={() => setOpen(false)} aria-label="关闭">
                <X size={18} />
              </button>
              <h2 className="cdd-panel-title">录入一笔分成</h2>
            </header>

            <div className="cdd-panel-body">
              <div className="cdd-hint">
                <span className="cdd-hint-icon">i</span>
                <span>添加记录后会自动生成分成明细、余额明细，分成金额会计入到红娘账号余额中</span>
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>服务红娘
                </label>
                <input type="text" className="cdd-input" placeholder="请输入服务红娘账号昵称" />
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>购买账号
                </label>
                <input type="text" className="cdd-input" placeholder="请输入购买账号昵称" />
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>分成事件
                </label>
                <div className="cdd-select block">
                  <select defaultValue="">
                    <option value="">请选择消费事件</option>
                    {EVENT_OPTIONS.slice(1).map((event) => (
                      <option key={event} value={event}>
                        {event}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="cdd-caret" size={14} />
                </div>
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>消费事件
                </label>
                <div className="cdd-select block">
                  <select defaultValue="">
                    <option value="">请选择消费事件</option>
                    {EVENT_OPTIONS.slice(1).map((event) => (
                      <option key={event} value={event}>
                        {event}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="cdd-caret" size={14} />
                </div>
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>分成金额
                </label>
                <div className="cdd-inline">
                  <input type="text" className="cdd-input short" placeholder="" />
                  <span className="cdd-unit">元</span>
                </div>
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>短信验证码
                </label>
                <div className="cdd-field-body">
                  <div className="cdd-inline">
                    <input type="text" className="cdd-input" placeholder="请输入短信验证码" />
                    <button type="button" className="cdd-code-btn">
                      获取验证码
                    </button>
                  </div>
                  <div className="cdd-hint">
                    <span className="cdd-hint-icon">i</span>
                    <span>短信将发送到admin绑定的手机号</span>
                  </div>
                </div>
              </div>

              <button type="button" className="cdd-submit">
                确定提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
