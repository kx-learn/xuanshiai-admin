"use client";
import { useMemo, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

type Record = {
  id: number;
  orderNo: string;
  payTime: string;
  user: string;
  userId: number;
  item: string;
  amount: number;
};

const TAB_GROUPS = [
  ["全部", "积分充值", "余额充值", "男会员审核", "女会员审核", "VIP会员", "会员置顶", "单次牵线", "牵线套餐", "资料推广", "送礼物", "会员爆灯", "活动报名", "短视频打赏"],
  ["短视频红包", "社群缴费", "推广红娘入伙费", "合伙红娘入伙费", "商品销售", "互选活动报名", "婚况查询费", "实名认证费", "线上收款"],
];

const STATS = [
  { value: "4126.8元", label: "总收入" },
  { value: "0元", label: "今天(2026.09.09)" },
  { value: "0元", label: "昨天" },
  { value: "0元", label: "本周" },
  { value: "0元", label: "上周" },
  { value: "0元", label: "本月" },
  { value: "0元", label: "上月" },
  { value: "4126.8元", label: "今年" },
  { value: "0元", label: "去年" },
];

const PAGE_SIZE = 20;
const TOTAL = 211;

// 前 20 条为截图可见真实数据
const seedRecords: Record[] = [
  { id: 1, orderNo: "FO87752484855981917", payTime: "2026-09-01 17:16:21", user: "是静香本人没错", userId: 790, item: "推广红娘入伙费", amount: 99 },
  { id: 2, orderNo: "FO4518135843081007", payTime: "2026-09-01 16:34:40", user: "Lemon", userId: 790, item: "VIP会员", amount: 299 },
  { id: 3, orderNo: "FO0017497621595098", payTime: "2026-08-27 14:20:14", user: "芸希老师", userId: 35, item: "推广红娘入伙费", amount: 99 },
  { id: 4, orderNo: "FO2386763266439739", payTime: "2026-08-23 21:46:35", user: "Lemon", userId: 790, item: "推广红娘入伙费", amount: 99 },
  { id: 5, orderNo: "FO4004286628535532", payTime: "2026-08-23 21:45:23", user: "Lemon", userId: 790, item: "推广红娘入伙费", amount: 99 },
  { id: 6, orderNo: "FO5618322266644134", payTime: "2026-08-23 21:45:21", user: "Lemon", userId: 790, item: "推广红娘入伙费", amount: 99 },
  { id: 7, orderNo: "FO1944581003742906", payTime: "2026-08-23 21:45:08", user: "Lemon", userId: 790, item: "推广红娘入伙费", amount: 99 },
  { id: 8, orderNo: "FO7754476289368554", payTime: "2026-08-23 21:45:02", user: "Lemon", userId: 790, item: "推广红娘入伙费", amount: 99 },
  { id: 9, orderNo: "FO9895024381329199", payTime: "2026-08-23 21:44:50", user: "Lemon", userId: 790, item: "推广红娘入伙费", amount: 99 },
  { id: 10, orderNo: "FO7745864595659504", payTime: "2026-08-23 21:44:37", user: "Lemon", userId: 790, item: "推广红娘入伙费", amount: 99 },
  { id: 11, orderNo: "FO3358650784746881", payTime: "2026-08-20 22:23:05", user: "陌", userId: 788, item: "推广红娘入伙费", amount: 99 },
  { id: 12, orderNo: "FO4562803010631967", payTime: "2026-08-20 19:19:41", user: "出现1", userId: 54, item: "推广红娘入伙费", amount: 99 },
  { id: 13, orderNo: "FO9954902959045148", payTime: "2026-07-23 18:29:36", user: "出现1", userId: 54, item: "VIP会员", amount: 299 },
  { id: 14, orderNo: "FO2260083421339363", payTime: "2026-07-23 17:10:52", user: "O_o♡", userId: 760, item: "推广红娘入伙费", amount: 99 },
  { id: 15, orderNo: "FO0269443167478190", payTime: "2026-07-23 17:07:47", user: "O_o♡", userId: 760, item: "推广红娘入伙费", amount: 99 },
  { id: 16, orderNo: "FO3326730382070538", payTime: "2026-07-23 17:06:14", user: "O_o♡", userId: 760, item: "推广红娘入伙费", amount: 99 },
  { id: 17, orderNo: "FO1358863153813013", payTime: "2026-07-23 17:04:55", user: "O_o♡", userId: 760, item: "推广红娘入伙费", amount: 99 },
  { id: 18, orderNo: "FO419062588921639", payTime: "2026-07-21 16:25:19", user: "途遇觅老师", userId: 767, item: "送礼物", amount: 90 },
  { id: 19, orderNo: "FO8141467692522073", payTime: "2026-07-19 19:37:54", user: "O_o♡", userId: 760, item: "推广红娘入伙费", amount: 99 },
  { id: 20, orderNo: "FO560640867122075", payTime: "2026-07-19 19:37:52", user: "O_o♡", userId: 760, item: "推广红娘入伙费", amount: 99 },
];

const poolNames: Array<[string, number]> = [
  ["Lemon", 790],
  ["O_o♡", 760],
  ["出现1", 54],
  ["芸希老师", 35],
  ["陌", 788],
  ["途遇觅老师", 767],
  ["是静香本人没错", 790],
];

function buildRecords(): Record[] {
  const list = [...seedRecords];
  for (let i = 20; i < TOTAL; i++) {
    const [user, userId] = poolNames[i % poolNames.length];
    list.push({
      id: i + 1,
      orderNo: `FO${String(1000000000000 + i * 3917).slice(0, 14)}${i}`,
      payTime: `2026-07-${String(18 - Math.floor(i / 3) % 18).padStart(2, "0")} ${String(19 - (i % 12)).padStart(2, "0")}:${String(30 + (i % 29)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
      user,
      userId,
      item: i % 5 === 0 ? "VIP会员" : i % 7 === 0 ? "送礼物" : "推广红娘入伙费",
      amount: i % 5 === 0 ? 299 : i % 7 === 0 ? 90 : 99,
    });
  }
  return list;
}

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

export default function SystemFinanceOrderPage() {
  const [activeTab, setActiveTab] = useState("全部");
  const [page, setPage] = useState(1);
  const records = useMemo(buildRecords, []);
  const totalPage = Math.ceil(TOTAL / PAGE_SIZE);
  const pageRecords = records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const breadcrumb = getBreadcrumb("财务管理", "收入明细");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card">
        {/* 分类 tab */}
        <div className="finord-tabs">
          {TAB_GROUPS.map((group, gi) => (
            <div className={`finord-tab-row ${gi > 0 ? "finord-tab-row-gap" : ""}`} key={gi}>
              {group.map((tab) => (
                <button
                  key={tab}
                  className={`finord-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* 统计卡 */}
        <div className="finord-stats">
          {STATS.map((stat, i) => (
            <div className={`finord-stat ${i === 0 ? "active" : ""}`} key={stat.label}>
              <div className="finord-stat-value">{stat.value}</div>
              <div className="finord-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="finord-section-title">收入明细</div>

        {/* 筛选条 */}
        <div className="finord-filters">
          <select className="finord-select">
            <option>全部支付状态</option>
            <option>未支付</option>
            <option>已支付</option>
          </select>
          <select className="finord-select">
            <option>全部支付方式</option>
            <option>微信</option>
            <option>支付宝</option>
            <option>余额</option>
          </select>
          <select className="finord-select">
            <option>按下单时间</option>
            <option>按支付时间</option>
          </select>
          <div className="finord-daterange">
            <input className="finord-date" type="date" defaultValue="2026-09-01" />
            <span className="finord-date-sep">→</span>
            <input className="finord-date" type="date" />
          </div>
          <div className="finord-searchbox">
            <span className="finord-search-label">按订单号搜</span>
            <input className="finord-search-input" placeholder="请输入" />
          </div>
          <button className="finord-btn finord-btn-primary">搜索</button>
          <button className="finord-btn finord-btn-outline finord-btn-export">导出EXCEL</button>
        </div>

        {/* 表格 */}
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
              {pageRecords.map((rec, idx) => {
                const isFirst = page === 1 && idx === 0;
                return (
                  <tr key={rec.id} className={isFirst ? "finord-row-active" : ""}>
                    <td className="finord-td-order">{rec.orderNo}</td>
                    <td>{rec.payTime}</td>
                    <td className="finord-td-empty"></td>
                    <td>
                      <div className="finord-user">{rec.user}</div>
                      <div className="finord-id">(ID:{rec.userId})</div>
                    </td>
                    <td>{rec.item}</td>
                    <td className="finord-td-dash">-</td>
                    <td className="finord-td-amount">{rec.amount}元</td>
                    <td><span className="finord-status">未支付</span></td>
                    <td className="finord-td-dash">-</td>
                    <td><span className="finord-link">改为已支付</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="finord-pagination">
          <div className="finord-pages">
            <button className="finord-page nav" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
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
              )
            )}
            <button className="finord-page nav" onClick={() => setPage((p) => Math.min(totalPage, p + 1))} disabled={page === totalPage}>›</button>
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
