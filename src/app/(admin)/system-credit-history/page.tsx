"use client";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

type Record = {
  id: number;
  user: string;
  item: string;
  category: string;
  amount: number; // 正=收入, 负=支出
  time: string;
};

const PAGE_SIZE = 20;
const TOTAL = 13;

const seedRecords: Record[] = [
  { id: 13, user: "秋刀鱼", item: "充值：2200金币", category: "积分充值", amount: 2200, time: "2026-07-02 17:35:07" },
  { id: 12, user: "毛毛", item: "兑换指甲刀", category: "礼品兑换", amount: -100, time: "2026-07-01 10:45:24" },
  { id: 11, user: "σπη'η", item: "乌龙茶60元，赠送了1个爱心气球", category: "收礼物奖励", amount: 100, time: "2026-06-30 20:38:35" },
  { id: 10, user: "σπη'η", item: "越可名，赠送了1颗棒棒糖", category: "收礼物奖励", amount: 100, time: "2026-06-30 19:14:08" },
  { id: 9, user: "σπη'η", item: "兑换指甲刀", category: "礼品兑换", amount: -100, time: "2026-06-30 17:59:59" },
  { id: 8, user: "σπη'η", item: "Sofia，赠送了1颗棒棒糖", category: "收礼物奖励", amount: 100, time: "2026-06-30 14:44:33" },
  { id: 7, user: "毛毛", item: "六月，赠送了1个爱心气球", category: "收礼物奖励", amount: 100, time: "2026-06-30 13:57:51" },
  { id: 6, user: "σπη'η", item: "是静香本人没错，赠送了1个爱心气球", category: "收礼物奖励", amount: 100, time: "2026-06-30 11:54:35" },
  { id: 5, user: "出现1", item: "σπη'η，赠送了1颗水晶球", category: "收礼物奖励", amount: 450, time: "2026-06-28 16:23:12" },
  { id: 4, user: "出现1", item: "σπη'η，赠送了1颗水晶球", category: "收礼物奖励", amount: 450, time: "2026-06-28 15:43:05" },
  { id: 3, user: "0哔吧啦", item: "出现，赠送了1颗水晶球", category: "收礼物奖励", amount: 450, time: "2026-06-28 15:31:37" },
  { id: 2, user: "别吻我桔子", item: "Suntop，赠送了1个爱心气球", category: "收礼物奖励", amount: 100, time: "2026-05-31 14:05:03" },
  { id: 1, user: "163K-技术", item: "充值：10金币", category: "积分充值", amount: 10, time: "2026-04-21 16:31:14" },
];

const TARGET_OPTIONS = ["所有注册用户", "指定会员", "已认证会员", "红娘团队"];

export default function SystemCreditHistoryPage() {
  const [page, setPage] = useState(1);
  const [showPanel, setShowPanel] = useState(false);
  const [target, setTarget] = useState("所有注册用户");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const breadcrumb = getBreadcrumb("财务管理", "积分明细");
  const recordsAll = useMemo(() => {
    // 补齐到 TOTAL 条，保持 ID 递减
    const list = [...seedRecords];
    for (let i = TOTAL; i < 211; i++) {
      const id = i + 1;
      const users = ["秋刀鱼", "毛毛", "出现1", "0哔吧啦", "别吻我桔子", "163K-技术"];
      const gift = ["爱心气球", "棒棒糖", "水晶球"];
      list.push({
        id,
        user: users[i % users.length],
        item: i % 4 === 0 ? `充值：${100 + i * 3}金币` : i % 4 === 1 ? "兑换指" : `${users[(i + 1) % users.length]}，赠送了1颗${gift[i % gift.length]}`,
        category: i % 4 === 0 ? "积分充值" : i % 4 === 1 ? "礼品兑换" : "收礼物奖励",
        amount: i % 4 === 0 ? 100 + i * 3 : -(100 + (i % 3) * 350),
        time: `2026-0${6 - Math.floor(i / 40)}-${String(1 + (i % 28)).padStart(2, "0")} ${String(9 + (i % 12)).padStart(2, "0")}:${String((i * 11) % 60).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
      });
    }
    return list;
  }, []);
  const totalPage = Math.ceil(recordsAll.length / PAGE_SIZE);
  const pageRecords = recordsAll.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openPanel = () => setShowPanel(true);
  const submit = () => setShowPanel(false);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card">
        {/* 标题 + 发放积分 */}
        <div className="crh-head">
          <div className="crh-title">积分明细</div>
          <button className="finord-btn finord-btn-primary" onClick={openPanel}>发放积分</button>
        </div>

        {/* 筛选条 */}
        <div className="finord-filters">
          <select className="finord-select">
            <option>全部支付分类</option>
            <option>积分充值</option>
            <option>礼品兑换</option>
            <option>收礼物奖励</option>
            <option>送礼物</option>
          </select>
          <div className="finord-daterange">
            <input className="finord-date" type="date" />
            <span className="finord-date-sep">→</span>
            <input className="finord-date" type="date" />
          </div>
          <input className="finord-search-input crh-search-input" placeholder="请输入会员昵称" />
          <button className="finord-btn finord-btn-primary">搜索</button>
        </div>

        {/* 表格 */}
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
              {pageRecords.map((rec) => (
                <tr key={rec.id}>
                  <td className="crh-col-id">{rec.id}</td>
                  <td>{rec.user}</td>
                  <td>{rec.item}</td>
                  <td className="crh-col-category">{rec.category}</td>
                  <td className={`crh-col-amount ${rec.amount >= 0 ? "income" : "expense"}`}>
                    {rec.amount >= 0 ? "+" : "-"}{Math.abs(rec.amount)}金币
                  </td>
                  <td className="crh-col-time">{rec.time}</td>
                  <td className="finord-td-dash">-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="finord-pagination">
          <div className="finord-pages">
            <button className="finord-page nav" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            <button className={`finord-page ${page === 1 ? "active" : ""}`} onClick={() => setPage(1)}>1</button>
            <button className="finord-page nav" onClick={() => setPage((p) => Math.min(totalPage, p + 1))} disabled={page === totalPage}>›</button>
          </div>
          <div className="finord-page-size">
            <span>{PAGE_SIZE}条/页</span>
            <span className="finord-page-size-arrow">▾</span>
          </div>
        </div>
      </div>

      {/* 发放积分弹窗 */}
      {showPanel && (
        <>
          <div className="ptp-mask" onClick={() => setShowPanel(false)} />
          <div className="ptp-panel">
            <div className="ptp-header">
              <div className="ptp-header-left">
                <button className="ptp-close" onClick={() => setShowPanel(false)}>
                  <X size={18} />
                </button>
                <span className="ptp-title">发放积分</span>
              </div>
              <div className="ptp-header-right">
                <button className="finord-btn ptp-btn-muted" onClick={() => setShowPanel(false)}>取消</button>
                <button className="finord-btn finord-btn-primary" onClick={submit}>确定发放</button>
              </div>
            </div>
            <div className="ptp-body">
              <div className="ptp-row">
                <label className="ptp-label">发放对象</label>
                <select className="ptp-select" value={target} onChange={(e) => setTarget(e.target.value)}>
                  {TARGET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="ptp-row">
                <label className="ptp-label"><span className="ptp-required">*</span>发放数值</label>
                <div className="ptp-value">
                  <input className="ptp-input" type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="请输入积分数量" />
                  <span className="ptp-unit">积分</span>
                </div>
              </div>
              <div className="ptp-row">
                <label className="ptp-label"><span className="ptp-required">*</span>发放理由</label>
                <input className="ptp-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="不要超过20个字" maxLength={20} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
