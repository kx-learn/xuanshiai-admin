"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import {
  adminEndpoints,
  type CommissionEntryDetailItem,
  type CommissionEntryDetailOptions,
  type CommissionEntryEventOption,
  type CommissionEntryListQuery,
  type CommissionEntryMatchmakerOption,
} from "@/lib/admin-endpoints";
import { clearAdminToken } from "@/lib/admin-api";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "总店红娘", href: "/love-matchmaker-apportion2" },
  { label: "分成明细" },
];

const STORE_NAME = "总店";

function formatYuan(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";
  const num = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(num)) return "-";
  return `${num.toFixed(2)}元`;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-";
  // 服务端返回 ISO 字符串，截掉秒后的小数；若没有 T 视为已是业务格式 "YYYY-MM-DD HH:MM:SS"
  const iso = value.includes("T") ? value.replace("T", " ").replace(/\..*$/, "") : value;
  return iso;
}

function Avatar({ src, name }: { src: string | null | undefined; name: string }) {
  if (src) {
    return <img src={src} alt={name} className="size-6 rounded-full object-cover" />;
  }
  const fallback = name?.slice(0, 1) || "?";
  return (
    <span className="grid size-6 place-items-center rounded-full bg-[#e6f0ff] text-xs text-[#3658f7]">
      {fallback}
    </span>
  );
}

interface ListState {
  rows: CommissionEntryDetailItem[];
  total: number;
  page: number;
  pageSize: number;
}

const INITIAL_STATE: ListState = { rows: [], total: 0, page: 1, pageSize: 20 };

export default function LoveMatchmakerDistributionDetailsPage() {
  const [matchmakerOptions, setMatchmakerOptions] = useState<CommissionEntryMatchmakerOption[]>([]);
  const [eventOptions, setEventOptions] = useState<CommissionEntryEventOption[]>([]);
  const [selectedMatchmakerId, setSelectedMatchmakerId] = useState<string>("");
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [state, setState] = useState<ListState>(INITIAL_STATE);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  // 加载下拉（页面挂载时一次性拿到）
  useEffect(() => {
    let cancelled = false;
    setOptionsError(null);
    adminEndpoints
      .commissionEntryOptions()
      .then((options: CommissionEntryDetailOptions) => {
        if (cancelled) return;
        setMatchmakerOptions(options.matchmakers);
        setEventOptions(options.events);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof Error && /登录/.test(err.message)) {
          clearAdminToken();
          if (typeof window !== "undefined" && window.location.pathname !== "/login") window.location.replace("/login");
          return;
        }
        setOptionsError(err instanceof Error ? err.message : "下拉加载失败");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const buildQuery = useCallback(
    (override: Partial<ListState> = {}): CommissionEntryListQuery => {
      const page = override.page ?? state.page;
      const pageSize = override.pageSize ?? state.pageSize;
      const query: CommissionEntryListQuery = { page, page_size: pageSize };
      if (selectedMatchmakerId) query.matchmaker_id = Number(selectedMatchmakerId);
      if (selectedEventId) query.rule_id = Number(selectedEventId);
      if (startDate) query.start_date = startDate;
      if (endDate) query.end_date = endDate;
      return query;
    },
    [state.page, state.pageSize, selectedMatchmakerId, selectedEventId, startDate, endDate],
  );

  const fetchList = useCallback(
    async (override: Partial<ListState> = {}) => {
      const targetPage = override.page ?? state.page;
      const targetPageSize = override.pageSize ?? state.pageSize;
      setLoading(true);
      setError(null);
      try {
        const page = await adminEndpoints.commissionEntryList(
          buildQuery({ page: targetPage, pageSize: targetPageSize }),
        );
        setState({
          rows: page.items,
          total: page.total,
          page: page.page,
          pageSize: page.page_size,
        });
      } catch (err: unknown) {
        if (err instanceof Error && /登录/.test(err.message)) {
          clearAdminToken();
          if (typeof window !== "undefined" && window.location.pathname !== "/login") window.location.replace("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "列表加载失败");
      } finally {
        setLoading(false);
      }
    },
    [buildQuery, state.page, state.pageSize],
  );

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(state.total / state.pageSize)),
    [state.total, state.pageSize],
  );

  const handleSearch = () => {
    setState((prev) => ({ ...prev, page: 1 }));
    fetchList({ page: 1 });
  };

  const handleReset = () => {
    setSelectedMatchmakerId("");
    setSelectedEventId("");
    setStartDate("");
    setEndDate("");
    setState({ ...INITIAL_STATE });
    // 通过原 buildQuery 走筛选重置，再 fetch
    setTimeout(() => fetchList({ page: 1, pageSize: INITIAL_STATE.pageSize }), 0);
  };

  const gotoPage = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setState((prev) => ({ ...prev, page: next }));
    fetchList({ page: next });
  };

  const onPageSizeChange = (size: number) => {
    setState({ rows: [], total: 0, page: 1, pageSize: size });
    fetchList({ page: 1, pageSize: size });
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium text-[#333]">红娘线上分成明细</h2>
        <Button variant="primary" onClick={() => alert("录入一笔分成入口预留：后续对接人工录入流程")}>
          + 录入一笔分成
        </Button>
      </div>

      <div className="mb-4 rounded-md border border-[#f0f0f0] bg-white px-4 py-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm text-[#666]">选择门店</label>
            <select
              value={STORE_NAME}
              disabled
              className="h-8 rounded-md border border-[#d9d9d9] bg-[#fafafa] px-3 text-sm text-[#999]"
            >
              <option>{STORE_NAME}</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm text-[#666]">选择红娘</label>
            <select
              value={selectedMatchmakerId}
              onChange={(e) => setSelectedMatchmakerId(e.target.value)}
              className="h-8 rounded-md border border-[#d9d9d9] bg-white px-3 text-sm"
            >
              <option value="">全部</option>
              {matchmakerOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm text-[#666]">选择事件</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="h-8 rounded-md border border-[#d9d9d9] bg-white px-3 text-sm"
            >
              <option value="">全部</option>
              {eventOptions.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="whitespace-nowrap text-sm text-[#666]">开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 rounded-md border border-[#d9d9d9] px-2 text-sm"
            />
            <span className="text-[#999]">~</span>
            <label className="whitespace-nowrap text-sm text-[#666]">结束日期</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 rounded-md border border-[#d9d9d9] px-2 text-sm"
            />
          </div>
          <Button size="sm" variant="primary" onClick={handleSearch}>
            搜索
          </Button>
          <Button size="sm" variant="default" onClick={handleReset}>
            重置
          </Button>
          {optionsError && <span className="text-xs text-[#ff4d4f]">{optionsError}</span>}
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#f0f0f0]">
        {loading ? (
          <div className="p-8 text-center text-[#999]">加载中...</div>
        ) : error ? (
          <div className="p-8 text-center text-[#ff4d4f]">{error}</div>
        ) : state.rows.length === 0 ? (
          <div className="p-8 text-center text-[#999]">暂无数据</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                {["ID", "门店", "时间", "红娘", "消费会员", "分成/奖励事件", "消费金额", "分成金额"].map((title) => (
                  <th
                    key={title}
                    className="whitespace-nowrap border-b border-[#f0f0f0] bg-[#fafafa] p-3 text-left text-sm font-medium"
                  >
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row) => (
                <tr key={row.id} className="hover:bg-[#fafafa]">
                  <td className="border-b border-[#f0f0f0] p-3 text-center text-sm">{row.id}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">{row.store_name}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">{formatDateTime(row.created_at)}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar src={row.matchmaker_avatar} name={row.matchmaker_name} />
                      <span>{row.matchmaker_name}</span>
                    </div>
                  </td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar src={row.consumer_avatar} name={row.consumer_name} />
                      <span>{row.consumer_name}</span>
                      {row.consumer_phone && <span className="text-[#999]">| {row.consumer_phone}</span>}
                    </div>
                  </td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">{row.event_name}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-right text-sm">{formatYuan(row.consumer_amount)}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-right text-sm">{formatYuan(row.commission_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between px-4 py-4 text-sm text-[#999]">
          <span>共 {state.total} 条</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="上一页"
              disabled={state.page <= 1}
              onClick={() => gotoPage(state.page - 1)}
              className="grid size-7 place-items-center border disabled:text-[#d9d9d9]"
            >
              <span className="size-1.5 rotate-45 border-b border-l border-current" />
            </button>
            <span className="px-2">
              {state.page} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="下一页"
              disabled={state.page >= totalPages}
              onClick={() => gotoPage(state.page + 1)}
              className="grid size-7 place-items-center border disabled:text-[#d9d9d9]"
            >
              <span className="size-1.5 -rotate-45 border-r border-t border-current" />
            </button>
            <label className="relative ml-2">
              <select
                aria-label="每页条数"
                value={state.pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="h-7 appearance-none border bg-white py-0 pl-2 pr-7 text-xs"
              >
                <option value={20}>20 条/页</option>
                <option value={50}>50 条/页</option>
                <option value={100}>100 条/页</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-2 size-1.5 rotate-45 border-b border-r" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
