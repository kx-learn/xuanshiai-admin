"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, Download, Plus, X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { resolveMediaUrl } from "@/lib/admin-api";
import { adminEndpoints } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";
import type {
  PromoterCommissionEntryItem,
  PromoterCommissionEntryOptions,
} from "@/lib/admin-endpoints";

const breadcrumb = getBreadcrumb("推广红娘", "分成明细");

const PAGE_SIZE = 20;

function paletteOf(id: number): string {
  return ["a", "b", "c", "d", "e", "f"][((id % 6) + 6) % 6];
}

export default function PoploveMatchmakerDistributionDetailsPage() {
  const [rows, setRows] = useState<PromoterCommissionEntryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [total, setTotal] = useState(0);

  const [ruleId, setRuleId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const [urlPromoterId, setUrlPromoterId] = useState("");
  const [options, setOptions] = useState<PromoterCommissionEntryOptions>({ promoters: [], events: [] });
  const [addOpen, setAddOpen] = useState(false);

  // 从列表页跳转带过来的 ?promoter_id= 作为筛选条件（用 window.location 避免 Suspense 边界要求）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pid = params.get("promoter_id");
    if (pid) setUrlPromoterId(pid);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminEndpoints.promoterCommissionEntries({
        page,
        page_size: pageSize,
        promoter_id: urlPromoterId ? Number(urlPromoterId) : undefined,
        rule_id: ruleId ? Number(ruleId) : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      });
      setRows(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, urlPromoterId, ruleId, startDate, endDate]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    adminEndpoints
      .promoterCommissionEntryOptions()
      .then(setOptions)
      .catch(() => setOptions({ promoters: [], events: [] }));
  }, []);

  const handleSearch = () => {
    setPage(1);
    setAppliedKeyword(keyword.trim());
    void load();
  };

  // 前端对“当前已加载页数据”做关键字过滤（后端接口不支持 keyword 参数）
  const visibleRows = appliedKeyword
    ? rows.filter((r) =>
        [r.promoter_name, r.consumer_name, r.event_name, String(r.id)]
          .join(" ")
          .includes(appliedKeyword),
      )
    : rows;

  const urlPromoterName =
    urlPromoterId && options.promoters.length > 0
      ? (options.promoters.find((p) => String(p.id) === urlPromoterId)?.name ?? `ID ${urlPromoterId}`)
      : urlPromoterId
        ? `ID ${urlPromoterId}`
        : "";

  const exportCsv = () => {
    try {
      const header = ["ID", "时间", "推广红娘", "消费会员", "分成/奖励事件", "分成金额"];
      const csvRows = visibleRows.map((r) => [r.id, r.created_at, r.promoter_name, r.consumer_name, r.event_name, r.amount]);
      const csv = [header, ...csvRows]
        .map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "推广红娘分成明细.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showConfigToast("导出失败", "error");
    }
  };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={breadcrumb} />

      <div className="pdd-card">
        <div className="pdd-head">
          <h2 className="pdd-title">推广红娘分成明细</h2>
          <div className="pdd-head-actions">
            <button type="button" className="pdd-btn primary" onClick={() => setAddOpen(true)}>
              <Plus size={14} />
              录入一笔分成
            </button>
            <button type="button" className="pdd-btn primary" onClick={exportCsv}>
              <Download size={14} />
              导出EXCEL
            </button>
          </div>
        </div>

        {urlPromoterName && (
          <div className="pdd-filter-note">
            当前筛选：{urlPromoterName} 的分成记录
            <button type="button" className="pdd-filter-clear" onClick={() => setUrlPromoterId("")}>
              清除
            </button>
          </div>
        )}

        <div className="pdd-filters">
          <div className="pdd-select">
            <select value={ruleId} onChange={(e) => setRuleId(e.target.value)}>
              <option value="">请选择事件</option>
              {options.events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.name}</option>
              ))}
            </select>
            <ChevronDown className="pdd-caret" size={14} />
          </div>
          <div className="pdd-daterange">
            <div className="pdd-date">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="开始日期" />
              <CalendarDays size={14} />
            </div>
            <span className="pdd-arrow">→</span>
            <div className="pdd-date">
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="结束日期" />
              <CalendarDays size={14} />
            </div>
          </div>
          <div className="pdd-select">
            <select defaultValue="">
              <option value="">按关键字搜</option>
            </select>
            <ChevronDown className="pdd-caret" size={14} />
          </div>
          <input
            className="pdd-filter-input"
            placeholder="请输入"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          />
          <button type="button" className="pdd-search" onClick={handleSearch}>
            搜索
          </button>
        </div>

        <div className="pdd-table-wrap">
          <table className="pdd-table">
            <colgroup>
              <col style={{ width: 80 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: "auto" }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 120 }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>时间</th>
                <th>推广红娘</th>
                <th>消费会员</th>
                <th>分成/奖励事件</th>
                <th>分成金额</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="pdd-td-id" colSpan={6}>加载中…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td className="pdd-td-id" colSpan={6}>{error}</td>
                </tr>
              )}
              {!loading && !error && visibleRows.length === 0 && (
                <tr>
                  <td className="pdd-td-id" colSpan={6}>暂无数据</td>
                </tr>
              )}
              {!loading &&
                !error &&
                visibleRows.map((row) => (
                  <tr key={row.id}>
                    <td className="pdd-td-id">{row.id}</td>
                    <td className="pdd-td-time">{row.created_at}</td>
                    <td>
                      <span className="pdd-promoter">
                        {row.promoter_avatar ? (
                          <img className={`pdd-avatar pdd-g-${paletteOf(row.promoter_id)}`} src={resolveMediaUrl(row.promoter_avatar)} alt="" />
                        ) : (
                          <span className={`pdd-avatar pdd-g-${paletteOf(row.promoter_id)}`} />
                        )}
                        {row.promoter_name}
                      </span>
                    </td>
                    <td className="pdd-td-text">{row.consumer_name}</td>
                    <td className="pdd-td-text">{row.event_name}</td>
                    <td className="pdd-td-amount">{row.amount}</td>
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
      </div>

      {addOpen && <AddCommissionDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddCommissionDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="pdd-mask" onClick={onClose} />
      <div className="pdd-panel">
        <div className="pdd-panel-head">
          <button className="pdd-panel-close-icon" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
          <h2 className="pdd-panel-title">录入一笔分成</h2>
        </div>

        <div className="pdd-panel-body">
          <div className="pdd-hint">
            <i className="pdd-hint-icon">i</i>
            添加记录后会自动生成分成明细、余额明细，分成金额会计入到红娘账号余额中
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>推广红娘
            </span>
            <div className="pdd-field-body">
              <input className="pdd-input" placeholder="请输入推广红娘账号昵称" />
            </div>
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>购买账号
            </span>
            <div className="pdd-field-body">
              <input className="pdd-input" placeholder="请输入购买账号昵称" />
            </div>
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>分成事件
            </span>
            <div className="pdd-field-body">
              <div className="pdd-select block">
                <select defaultValue="">
                  <option value="">请选择分成事件</option>
                </select>
                <ChevronDown className="pdd-caret" size={14} />
              </div>
            </div>
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>消费事件
            </span>
            <div className="pdd-field-body">
              <div className="pdd-select block">
                <select defaultValue="">
                  <option value="">请选择消费事件</option>
                </select>
                <ChevronDown className="pdd-caret" size={14} />
              </div>
            </div>
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>分成金额
            </span>
            <div className="pdd-field-body">
              <div className="pdd-inline">
                <input className="pdd-input short" placeholder="请输入金额" />
                <span className="pdd-unit">元</span>
              </div>
            </div>
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>短信验证码
            </span>
            <div className="pdd-field-body">
              <div className="pdd-inline">
                <input className="pdd-input" placeholder="请输入短信验证码" />
                <button type="button" className="pdd-code-btn">
                  获取验证码
                </button>
              </div>
              <div className="pdd-hint">
                <i className="pdd-hint-icon">i</i>
                短信将发送到admin绑定的手机号
              </div>
            </div>
          </div>

          <button
            type="button"
            className="pdd-submit"
            onClick={() => showConfigToast("该功能后端暂未开放，请联系开发", "error")}
          >
            确定提交
          </button>
        </div>
      </div>
    </>
  );
}
