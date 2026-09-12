"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import UserCandidatePicker from "@/components/UserCandidatePicker";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { PartnerCommissionEntryItem, PartnerCommissionOptions, PartnerUserCandidate } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("合伙红娘", "分成明细");

const columns = ["ID", "时间", "合伙人", "团队推广红娘", "分成类型", "分成事件", "分成金额"];

const fmt = (value: string | null) => (value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-");

export default function LovePartnerBonusDetailsPage() {
  const [rows, setRows] = useState<PartnerCommissionEntryItem[]>([]);
  const [options, setOptions] = useState<PartnerCommissionOptions>({ partners: [], events: [] });
  const [ruleId, setRuleId] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [applied, setApplied] = useState({ ruleId: "", partnerName: "", fromDate: "", toDate: "" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const partnerId = useMemo(() => {
    const keyword = applied.partnerName.trim();
    if (!keyword) return undefined;
    return options.partners.find((item) => item.name === keyword)?.id;
  }, [applied.partnerName, options.partners]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.partnerCommissionEntries({
        page,
        page_size: pageSize,
        rule_id: applied.ruleId ? Number(applied.ruleId) : undefined,
        partner_id: partnerId,
        start_date: applied.fromDate || undefined,
        end_date: applied.toDate || undefined,
      });
      setRows(result.items);
      setTotal(result.total);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, applied, partnerId]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    adminEndpoints.partnerCommissionOptions().then(setOptions).catch(() => setOptions({ partners: [], events: [] }));
  }, []);

  const search = () => {
    setPage(1);
    setApplied({ ruleId, partnerName: partnerName.trim(), fromDate, toDate });
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card lpbd-card">
        <div className="lpbd-head">
          <h2 className="lpbd-title">合伙人（红娘）分成明细</h2>
          <button className="finord-btn finord-btn-primary lpbd-add-btn" onClick={() => setAddOpen(true)}>＋ 录入一笔分成</button>
        </div>

        <div className="lpbd-filters">
          <select className="lpbd-select" value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
            <option value="">请选择事件</option>
            {options.events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
          <div className="lpbd-daterange">
            <span className="lpbd-text-muted">开始日期</span>
            <input className="lpbd-date" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <span className="lpbd-text-muted">→</span>
            <span className="lpbd-text-muted">结束日期</span>
            <input className="lpbd-date" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <input
            className="lpbd-input"
            placeholder="请输入合伙人昵称"
            value={partnerName}
            list="lpbd-partner-filter"
            onChange={(e) => setPartnerName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") search(); }}
          />
          <datalist id="lpbd-partner-filter">
            {options.partners.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>
          <button className="finord-btn finord-btn-primary lpbd-search-btn" onClick={search}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table lpbd-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td className="lpbd-time">{fmt(d.created_at)}</td>
                  <td>{d.partner_name ?? `合伙人${d.partner_id}`}</td>
                  <td>{d.promoter_name ?? "-"}</td>
                  <td><span className="lpbd-type">{d.event_type ?? "-"}</span></td>
                  <td className="lpbd-event">{d.event_name ?? d.remark ?? "-"}</td>
                  <td><span className="lpbd-amount">{d.amount}元</span></td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", color: "#999" }}>
                    {loading ? "加载中…" : "暂无数据"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lpbd-pager">
          <span
            className="lpbd-pager-arrow"
            style={{ cursor: page > 1 ? "pointer" : "default" }}
            onClick={() => { if (page > 1) setPage(page - 1); }}
          >
            ‹
          </span>
          <span className="lpbd-pager-cur">{page}</span>
          <span
            className="lpbd-pager-arrow"
            style={{ cursor: page < totalPages ? "pointer" : "default" }}
            onClick={() => { if (page < totalPages) setPage(page + 1); }}
          >
            ›
          </span>
        </div>
        {message && <p style={{ color: "#ff4d4f", marginTop: 12 }}>{message}</p>}
      </div>

      {addOpen && (
        <AddBonusDrawer
          options={options}
          onClose={() => setAddOpen(false)}
          onSaved={() => { setAddOpen(false); void load(); }}
        />
      )}
    </div>
  );
}

function AddBonusDrawer({ options, onClose, onSaved }: {
  options: PartnerCommissionOptions;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [partnerName, setPartnerName] = useState("");
  const [consumerName, setConsumerName] = useState("");
  const [ruleId, setRuleId] = useState("");
  const [consumeEvent, setConsumeEvent] = useState("");
  const [amount, setAmount] = useState("");
  const [code, setCode] = useState("");
  const [consumerId, setConsumerId] = useState<number | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const partnerId = useMemo(
    () => options.partners.find((item) => item.name === partnerName.trim())?.id,
    [partnerName, options.partners],
  );
  const onConsumerChange = (value: string, pickedId: number | null) => {
    setConsumerName(value);
    setConsumerId(pickedId ?? undefined);
  };

  const submit = async () => {
    if (!partnerId) { setMessage("请从候选中选择合伙人红娘"); return; }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) { setMessage("请输入大于 0 的分成金额"); return; }
    setSaving(true);
    setMessage("");
    try {
      await adminEndpoints.createPartnerCommissionEntry({
        partner_user_id: partnerId,
        consumer_user_id: consumerId,
        rule_id: ruleId ? Number(ruleId) : undefined,
        amount: value.toFixed(2),
        remark: consumeEvent ? `消费事件：${consumeEvent}` : undefined,
      });
      showConfigToast("分成已录入，并已计入合伙人余额");
      onSaved();
    } catch (error) {
      const text = error instanceof Error ? error.message : "提交失败";
      setMessage(text);
      showConfigToast(text, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel lpbd-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">录入一笔分成</span>
          </div>
          <div className="lpbd-head-actions">
            <button className="finord-btn finord-btn-primary" disabled={saving} onClick={() => void submit()}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="lpbd-info-block">① 添加记录后会自动生成分成明细、余额明细，分成金额会计入到红娘账号余额中</div>

          {/* 合伙人红娘 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊合伙人红娘</span>
            <input
              className="lpbd-input-wide"
              placeholder="请输入合伙人红娘名称"
              value={partnerName}
              list="lpbd-partner-options"
              onChange={(e) => setPartnerName(e.target.value)}
            />
            <datalist id="lpbd-partner-options">
              {options.partners.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.team_name ?? ""}
                </option>
              ))}
            </datalist>
          </div>

          {/* 购买账号 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊购买账号</span>
            <UserCandidatePicker
              value={consumerName}
              onChange={onConsumerChange}
              search={(kw) => adminEndpoints.partnerUserCandidates(kw)}
              className="lpbd-input-wide"
              placeholder="输入昵称 / 手机号 / 用户ID / 姓名搜索购买账号"
            />
          </div>

          {/* 分成事件 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊分成事件</span>
            <select className="lpbd-select-wide" value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
              <option value="">请选择分成事件</option>
              {options.events.map((event) => (
                <option key={event.id} value={event.id}>{event.name}</option>
              ))}
            </select>
          </div>

          {/* 消费事件 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊消费事件</span>
            <select className="lpbd-select-wide" value={consumeEvent} onChange={(e) => setConsumeEvent(e.target.value)}>
              <option value="">请选择消费事件</option>
              {options.events.map((event) => (
                <option key={event.id} value={event.name}>{event.name}</option>
              ))}
            </select>
          </div>

          {/* 分成金额 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊分成金额</span>
            <div className="lpbd-amount-row">
              <input className="lpbd-num" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <span className="lpbd-unit">元</span>
              <button
                type="button"
                className="finord-btn finord-btn-primary lpbd-get-code-btn"
                onClick={() => setMessage("后台人工录入不校验短信验证码，提交后直接生成分成明细与余额明细")}
              >
                获取验证码
              </button>
            </div>
          </div>

          {/* 短信验证码 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊短信验证码</span>
            <div className="lpbd-content">
              <input
                className="lpbd-input-wide"
                placeholder="请输入短信验证码"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="lpbd-info">① 短信将发送至admin绑定的手机号；后台人工录入流程不校验该验证码</div>
            </div>
          </div>

          {message && <p style={{ color: "#faad14" }}>{message}</p>}

          <div className="lpbd-submit-row">
            <button className="finord-btn finord-btn-primary lpbd-submit" disabled={saving} onClick={() => void submit()}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
