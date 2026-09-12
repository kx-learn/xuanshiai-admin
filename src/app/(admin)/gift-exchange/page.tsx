"use client";

import { useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "兑换管理");

type ExchangeStatus = "pending" | "success" | "failed";

type ExchangeItem = {
  id: number;
  domain: string;
  title: string;
  subtitle: string | null;
  status: number;
  extra: Record<string, unknown>;
  created_at: string | null;
};

type ExchangePage = { items: ExchangeItem[]; total: number; page: number; page_size: number };

function statusOf(item: ExchangeItem): ExchangeStatus {
  const extra = item.extra ?? {};
  const s = typeof extra.exchange_status === "string" ? (extra.exchange_status as string) : "";
  if (s === "success") return "success";
  if (s === "failed") return "failed";
  return "pending";
}

function statusText(s: ExchangeStatus): { label: string; cls: string } {
  if (s === "success") return { label: "兑换成功", cls: "ex-status-success" };
  if (s === "failed") return { label: "兑换失败", cls: "ex-status-failed" };
  return { label: "等待审核", cls: "ex-status-pending" };
}

function applicantName(extra: Record<string, unknown>): string {
  return typeof extra.applicant_name === "string" ? (extra.applicant_name as string) : "（未知）";
}

function applicantMobile(extra: Record<string, unknown>): string {
  return typeof extra.applicant_mobile === "string" ? (extra.applicant_mobile as string) : "-";
}

function applicantAddress(extra: Record<string, unknown>): string {
  return typeof extra.applicant_address === "string" ? (extra.applicant_address as string) : "-";
}

function points(extra: Record<string, unknown>): number {
  return typeof extra.points === "number" ? (extra.points as number) : 0;
}

export default function GiftExchangePage() {
  const [searchMode, setSearchMode] = useState<"gift" | "applicant">("gift");
  const [keyword, setKeyword] = useState("");
  const [rows, setRows] = useState<ExchangeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);

  const load = async (page = pageIdx, kw = keyword, mode = searchMode) => {
    try {
      const resp = await adminApi<ExchangePage>("admin/content/point_exchange", {
        method: "GET",
        query: { page, page_size: 20, keyword: kw || undefined, search_by: mode },
      });
      setRows(resp.items);
      setTotal(resp.total);
      setPageIdx(resp.page);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    }
  };

  useEffect(() => {
    void load(1, "", "gift");
  }, []);

  const setStatus = async (id: number, next: ExchangeStatus) => {
    const item = rows.find((r) => r.id === id);
    if (!item) return;
    const extra = { ...(item.extra ?? {}), exchange_status: next };
    try {
      await adminApi(`admin/content/point_exchange/${id}`, {
        method: "PATCH",
        body: { title: item.title, status: next === "success" ? 1 : (next === "failed" ? 2 : 3), extra },
      });
      showConfigToast("已更新", "ok");
      void load(pageIdx, keyword, searchMode);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "更新失败", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该兑换记录？")) return;
    try {
      await adminApi(`admin/content/point_exchange/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx, keyword, searchMode);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card ex-card">
        <div className="ex-head">
          <h2 className="ex-title">兑换管理</h2>
        </div>

        <div className="ex-filters">
          <div className="ex-searchbox">
            <select
              className="ex-search-select"
              value={searchMode}
              onChange={(e) => setSearchMode(e.target.value as "gift" | "applicant")}
            >
              <option value="gift">按礼品搜</option>
              <option value="applicant">按申请人搜</option>
            </select>
            <input
              className="ex-search-input"
              placeholder="请输入"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void load(1, keyword, searchMode); }}
            />
            <button
              type="button"
              className="finord-btn finord-btn-primary ex-search-btn"
              onClick={() => void load(1, keyword, searchMode)}
            >
              搜索
            </button>
          </div>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table ex-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>申请人</th>
                <th>兑换礼物</th>
                <th>积分</th>
                <th>申请兑换时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const extra = row.extra ?? {};
                const s = statusOf(row);
                const label = statusText(s);
                return (
                  <tr key={row.id}>
                    <td className="ex-id">{row.id}</td>
                    <td>
                      <div className="ex-applicant">
                        <div className="ex-userinfo">
                          <div className="ex-name">{applicantName(extra)}</div>
                          <div className="ex-meta">姓名：{applicantName(extra)}</div>
                          <div className="ex-meta">手机：{applicantMobile(extra)}</div>
                          <div className="ex-meta">地址：{applicantAddress(extra)}</div>
                        </div>
                      </div>
                    </td>
                    <td><a className="finord-link" href="#">{row.title || "（未命名）"}</a></td>
                    <td className="ex-points">{points(extra)}</td>
                    <td className="ex-time">{row.created_at ?? "-"}</td>
                    <td><span className={`ex-status ${label.cls}`}>{label.label}</span></td>
                    <td>
                      <div className="ex-ops">
                        {s !== "success" && (
                          <a className="finord-link ex-op" href="#" onClick={(e) => { e.preventDefault(); void setStatus(row.id, "success"); }}>兑换成功</a>
                        )}
                        {s !== "success" && <span className="ex-op-sep">/</span>}
                        {s !== "failed" && (
                          <a className="finord-link ex-op" href="#" onClick={(e) => { e.preventDefault(); void setStatus(row.id, "failed"); }}>兑换失败</a>
                        )}
                        {s !== "failed" && <span className="ex-op-sep">/</span>}
                        <a className="finord-link ex-op" href="#" onClick={(e) => { e.preventDefault(); void remove(row.id); }}>删除</a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂无兑换记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="ex-pager">
          <span className="finord-info">共 {total} 条</span>
          <span
            className="ex-pager-arrow"
            onClick={() => load(Math.max(1, pageIdx - 1), keyword, searchMode)}
            style={{ cursor: pageIdx > 1 ? "pointer" : "not-allowed", opacity: pageIdx > 1 ? 1 : 0.4 }}
          >‹</span>
          <span className="ex-pager-cur">{pageIdx} / {totalPages}</span>
          <span
            className="ex-pager-arrow"
            onClick={() => load(Math.min(totalPages, pageIdx + 1), keyword, searchMode)}
            style={{ cursor: pageIdx < totalPages ? "pointer" : "not-allowed", opacity: pageIdx < totalPages ? 1 : 0.4 }}
          >›</span>
        </div>
      </div>
    </div>
  );
}
