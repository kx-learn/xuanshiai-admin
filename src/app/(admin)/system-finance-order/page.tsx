"use client";
import { useEffect, useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { FinanceOrderAdminItem, FinanceOrderAdminPage } from "@/lib/admin-endpoints";

type OrderRecord = FinanceOrderAdminItem;
type OrderPage = FinanceOrderAdminPage;

const TAB_GROUPS: string[][] = [
  ["全部", "积分充值", "余额充值", "男会员审核", "女会员审核", "VIP会员", "会员置顶", "单次牵线", "牵线套餐", "资料推广", "送礼物", "会员爆灯", "活动报名", "短视频打赏"],
  ["短视频红包", "社群缴费", "推广红娘入伙费", "合伙红娘入伙费", "商品销售", "互选活动报名", "婚况查询费", "实名认证费", "线上收款"],
];

function formatStat(amount: number): string {
  return `${amount.toFixed(2)}元`;
}

export default function SystemFinanceOrderPage() {
  const [activeTab, setActiveTab] = useState("全部");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [status, setStatus] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const query: { [k: string]: string | number | undefined } = { page, page_size: pageSize };
      if (status) query.status = status;
      if (startDate) query.start_time = startDate;
      if (endDate) query.end_time = endDate;
      if (keyword) query.order_no = keyword;
      if (activeTab !== "全部") query.product_name = activeTab;
      const result = await adminEndpoints.financeOrders(query);
      setItems(result?.items ?? []);
      setTotal(result?.total ?? 0);
      setSelected([]);
    } catch (e) {
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [activeTab, endDate, keyword, page, pageSize, startDate, status]);
  const filtered = items;
  const pageRecords = items;
  const allSelected = pageRecords.length > 0 && selected.length === pageRecords.length;

  // 统计卡（按当前过滤集聚合）
  const stats = useMemo(() => {
    const sum = (arr: OrderRecord[]) => arr.reduce((acc, r) => acc + Number(r.amount || 0), 0);
    const income = filtered.filter((r) => r.status === 1);
    const today = new Date().toISOString().slice(0, 10);
    const sameDay = (ts: string | null) => ts && ts.slice(0, 10) === today;
    const totalAmount = sum(filtered);
    return [
      { value: formatStat(totalAmount), label: "总收入" },
      { value: formatStat(sum(filtered.filter((r) => sameDay(r.pay_time)))), label: `今天(${today})` },
      { value: "0元", label: "昨天" },
      { value: formatStat(sum(income)), label: "本周" },
      { value: "0元", label: "上周" },
      { value: "0元", label: "本月" },
      { value: "0元", label: "上月" },
      { value: formatStat(totalAmount), label: "今年" },
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
            <option>全部支付事项</option>
            <option>活动报名</option>
            <option>线上VIP</option>
            <option>线下VIP</option>
            <option>充值</option>
          </select>
          <select className="finord-select" disabled>
            <option>全部支付方式</option>
            <option>微信支付</option>
            <option>支付宝支付</option>
            <option>余额支付</option>
            <option>后台支付</option>
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
            <select className="finord-search-label" aria-label="搜索类型" defaultValue="order">
              <option value="order">按订单号搜</option>
              <option value="payer">按付款人搜</option>
              <option value="activity">按活动搜</option>
            </select>
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
                <th><input type="checkbox" aria-label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : pageRecords.map((r) => r.id))} /></th>
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
                  <td colSpan={11} className="finord-td-empty">加载中…</td>
                </tr>
              ) : pageRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="finord-td-empty">暂无数据</td>
                </tr>
              ) : (
                pageRecords.map((rec, idx) => (
                  <tr key={rec.id} className={page === 1 && idx === 0 ? "finord-row-active" : ""}>
                    <td><input type="checkbox" aria-label={`选择订单 ${rec.id}`} checked={selected.includes(rec.id)} onChange={() => setSelected((current) => current.includes(rec.id) ? current.filter((id) => id !== rec.id) : [...current, rec.id])} /></td>
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

        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} onPageSizeChange={(size) => { setPageSize(size); setPage(1); }} />
      </div>
    </div>
  );
}
