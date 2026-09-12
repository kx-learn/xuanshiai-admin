"use client";
import { useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { FinanceOrderAdminItem, FinanceOrderAdminPage } from "@/lib/admin-endpoints";

type OrderRecord = FinanceOrderAdminItem;
type OrderPage = FinanceOrderAdminPage;

const TAB_GROUPS: string[][] = [
  ["全部", "积分充值", "余额充值", "男会员审核", "女会员审核", "VIP会员", "会员置顶", "单次牵线", "牵线套餐", "资料推广", "送礼物", "会员爆灯", "活动报名", "短视频打赏"],
  ["短视频红包", "社群缴费", "推广红娘入伙费", "合伙红娘入伙费", "商品销售", "互选活动报名", "婚况查询费", "实名认证费", "线上收款"],
];

const PAGE_SIZE = 20;

function paginationWindow(current: number, total: number): (number | "gap")[] {
  const pages: (number | "gap")[] = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);
  const s = Math.max(1, Math.min(start, total - 4));
  for (let i = s; i <= end; i++) pages.push(i);
  if (s > 1) pages.unshift(1);
  if (s > 2) pages.splice(1, 0, "gap");
  if (end < total) {
    if (end < total - 1) pages.splice(pages.length, 0, "gap");
    pages.push(total);
  }
  return pages;
}

function formatStat(amount: number): string {
  return `${amount.toFixed(2)}元`;
}

export default function SystemFinanceOrderPage() {
  const [activeTab, setActiveTab] = useState("全部");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [allItems, setAllItems] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // 后端不支持 product_type/name 过滤；前端本地按 tab 过滤。先拉前 200 条。
      const query: { [k: string]: string | number | undefined } = { page: 1, page_size: 200 };
      if (status) query.status = status;
      if (startDate) query.start_time = startDate;
      if (endDate) query.end_time = endDate;
      if (keyword) query.order_no = keyword;
      const result = await adminEndpoints.financeOrders(query);
      setAllItems(result?.items ?? []);
      setPage(1);
    } catch (e) {
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "全部") return allItems;
    return allItems.filter((r) => (r.product_name ?? "").includes(activeTab));
  }, [allItems, activeTab]);

  const totalPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRecords = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 统计卡（按当前过滤集聚合）
  const stats = useMemo(() => {
    const sum = (arr: OrderRecord[]) => arr.reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const income = filtered.filter((r) => r.status === 1);
    const today = new Date().toISOString().slice(0, 10);
    const sameDay = (ts: string | null) => ts && ts.slice(0, 10) === today;
    const total = sum(filtered);
    return [
      { value: formatStat(total), label: "总收入" },
      { value: formatStat(sum(filtered.filter((r) => sameDay(r.pay_time)))), label: `今天(${today})` },
      { value: "0元", label: "昨天" },
      { value: formatStat(sum(income)), label: "本周" },
      { value: "0元", label: "上周" },
      { value: "0元", label: "本月" },
      { value: "0元", label: "上月" },
      { value: formatStat(total), label: "今年" },
      { value: "0元", label: "去年" },
    ];
  }, [filtered]);

  const breadcrumb = getBreadcrumb("财务管理", "收入明细");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card">
        <div className="finord-tabs">
          {TAB_GROUPS.map((group, gi) => (
            <div className={`finord-tab-row ${gi > 0 ? "finord-tab-row-gap" : ""}`} key={gi}>
              {group.map((tab) => (
                <button
                  key={tab}
                  className={`finord-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="finord-stats">
          {stats.map((stat, i) => (
            <div className={`finord-stat ${i === 0 ? "active" : ""}`} key={stat.label}>
              <div className="finord-stat-value">{stat.value}</div>
              <div className="finord-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="finord-section-title">收入明细</div>

        <div className="finord-filters">
          <select className="finord-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">全部支付状态</option>
            <option value="0">未支付</option>
            <option value="1">已支付</option>
          </select>
          <select className="finord-select" disabled>
            <option>全部支付方式</option>
            <option>微信</option>
            <option>支付宝</option>
            <option>余额</option>
          </select>
          <select className="finord-select" disabled>
            <option>按下单时间</option>
            <option>按支付时间</option>
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
          <div className="finord-searchbox">
            <span className="finord-search-label">按订单号搜</span>
            <input
              className="finord-search-input"
              placeholder="请输入"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button className="finord-btn finord-btn-primary" onClick={load}>
            搜索
          </button>
          <button className="finord-btn finord-btn-outline finord-btn-export" disabled>
            导出EXCEL
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table">
            <thead>
              <tr>
                <th>平台订单号</th>
                <th>支付时间</th>
                <th>下单时间</th>
                <th>付款会员</th>
                <th>支付事项</th>
                <th>支付方式</th>
                <th>支付金额</th>
                <th>状态</th>
                <th>已支付回执</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="finord-td-empty">加载中…</td>
                </tr>
              ) : pageRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="finord-td-empty">暂无数据</td>
                </tr>
              ) : (
                pageRecords.map((rec, idx) => (
                  <tr key={rec.id} className={page === 1 && idx === 0 ? "finord-row-active" : ""}>
                    <td className="finord-td-order">{rec.order_no}</td>
                    <td>{rec.pay_time ?? "-"}</td>
                    <td>{rec.created_at ?? "-"}</td>
                    <td>
                      <div className="finord-user">用户#{rec.user_id}</div>
                      <div className="finord-id">(ID:{rec.user_id})</div>
                    </td>
                    <td>{rec.product_name}</td>
                    <td className="finord-td-dash">-</td>
                    <td className="finord-td-amount">{rec.amount}元</td>
                    <td>
                      <span className="finord-status">
                        {rec.status === 1 ? "已支付" : rec.status === 0 ? "未支付" : rec.status === 3 ? "已关闭" : "已退款"}
                      </span>
                    </td>
                    <td className="finord-td-dash">-</td>
                    <td>
                      {rec.status === 0 ? (
                        <span className="finord-link">改为已支付</span>
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
            <button
              className="finord-page nav"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {paginationWindow(page, totalPage).map((p, i) =>
              p === "gap" ? (
                <span className="finord-page-gap" key={`gap-${i}`}>…</span>
              ) : (
                <button
                  key={p}
                  className={`finord-page ${p === page ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ),
            )}
            <button
              className="finord-page nav"
              onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
              disabled={page === totalPage}
            >
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