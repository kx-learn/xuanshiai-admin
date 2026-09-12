"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type RedPacketItem, type RedPacketClaimItem } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("短视频", "红包记录");

const STATUS_TABS: { label: string; value: string | undefined }[] = [
  { label: "全部", value: undefined },
  { label: "未领完", value: "unfinished" },
  { label: "已领完", value: "finished" },
];

const PAY_STATUS: Record<string, string> = { paid: "已支付", unpaid: "未支付" };

const fmt = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 19) : "-");

export default function ShortVideoRedPacketPage() {
  const [rows, setRows] = useState<RedPacketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState("");
  const [detailOf, setDetailOf] = useState<RedPacketItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminEndpoints.redPacketList({ page: 1, page_size: 50, claim_status: tab, keyword: keyword || undefined });
      setRows(res.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [tab, keyword]);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card rpk-card">
        <div className="rpk-title">红包记录</div>

        <div className="rpk-filters">
          <div className="rpk-tabs">
            {STATUS_TABS.map((t) => (
              <button key={t.label} className={`rpk-tab ${tab === t.value ? "active" : ""}`} onClick={() => setTab(t.value)}>{t.label}</button>
            ))}
          </div>
          <select className="rpk-select"><option>按昵称搜</option></select>
          <input className="rpk-input" placeholder="请输入" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <button className="finord-btn finord-btn-primary rpk-search-btn" onClick={() => load()}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table rpk-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>发红包时间</th>
                <th>发红包的人</th>
                <th>发给的视频</th>
                <th>支付状态</th>
                <th>红包金额</th>
                <th>份数</th>
                <th>是否均分</th>
                <th>领取状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="rpk-id">{r.id}</td>
                  <td className="rpk-time">{fmt(r.created_at)}</td>
                  <td className="rpk-sender">{r.sender_label}</td>
                  <td className="rpk-video">{r.video_description || "-"}</td>
                  <td><span className={`rpk-status ${r.pay_status === "paid" ? "rpk-status-paid" : ""}`}>{PAY_STATUS[r.pay_status] || r.pay_status}</span></td>
                  <td><span className="rpk-amount">{r.amount}元</span></td>
                  <td className="rpk-num">{r.total_parts}</td>
                  <td>{r.is_equal ? "是" : "否"}</td>
                  <td>
                    <div className="rpk-claim">
                      <span className={`rpk-status ${r.claim_status === "finished" ? "rpk-status-paid" : "rpk-status-pending"}`}>{r.claim_status === "finished" ? "已领完" : "未领完"}</span>
                      <div className="rpk-claim-meta">还剩{r.remain_parts}份 {r.remain_amount}元</div>
                    </div>
                  </td>
                  <td>
                    <a className="finord-link" onClick={() => setDetailOf(r)}>领取明细</a>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: "center", padding: "32px 0", color: "#98a2b3" }}>暂无数据</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rpk-pager">
          <span className="rpk-pager-arrow">‹</span>
          <span className="rpk-pager-cur">1</span>
          <span className="rpk-pager-arrow">›</span>
        </div>
      </div>

      {detailOf && <ClaimDetailDrawer packet={detailOf} onClose={() => setDetailOf(null)} />}
    </div>
  );
}

function ClaimDetailDrawer({ packet, onClose }: { packet: RedPacketItem; onClose: () => void }) {
  const [claims, setClaims] = useState<RedPacketClaimItem[]>([]);

  useEffect(() => {
    adminEndpoints.redPacketClaims(packet.id).then(setClaims).catch(() => undefined);
  }, [packet.id]);

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel rpk-detail-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">领取明细</span>
          </div>
        </div>
        <div className="tlc-panel-body rpk-detail-body">
          <table className="rpk-detail-table">
            <thead>
              <tr>
                <th>领取人</th>
                <th>领取时间</th>
                <th>领取金额</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id}>
                  <td className="rpk-detail-user">{c.nickname || c.user_id}</td>
                  <td className="rpk-detail-time">{fmt(c.created_at)}</td>
                  <td><span className="rpk-detail-amount">{c.amount}元</span></td>
                </tr>
              ))}
              {claims.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: "center", padding: "24px 0", color: "#98a2b3" }}>暂无领取记录</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
