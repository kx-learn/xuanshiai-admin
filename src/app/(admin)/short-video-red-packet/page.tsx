"use client";

import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "红包记录");

const STATUS_TABS = ["全部", "未领完", "已领完"];

interface RpRow {
  id: number;
  time: string;
  sender: string;
  video: string;
  status: string;
  amount: string;
  totalParts: number;
  isEqual: boolean;
  remainParts: number;
  remainAmount: string;
}

const rows: RpRow[] = [
  { id: 5, time: "2026-06-13 14:17:19", sender: "后台发放", video: "南京90年男生，985硕士，产品经理，飞盘全国冠军，喜欢游泳唱歌打羽毛球，长相清爽，你想认识他吗？", status: "已支付", amount: "1.00元", totalParts: 15, isEqual: false, remainParts: 14, remainAmount: "0.98元" },
  { id: 4, time: "2026-06-13 14:17:11", sender: "后台发放", video: "5.24脱单活动《寻找灵魂伴侣》圆满收官，现场精彩回顾", status: "已支付", amount: "1.00元", totalParts: 20, isEqual: false, remainParts: 19, remainAmount: "0.99元" },
  { id: 3, time: "2026-06-13 14:17:05", sender: "后台发放", video: "相亲一定要先见见面再聊天！！文字都是冷冰冰的，真实的见面才能拉近两颗心的距离 ❤", status: "已支付", amount: "1.00元", totalParts: 20, isEqual: false, remainParts: 17, remainAmount: "0.97元" },
  { id: 2, time: "2026-06-13 14:16:57", sender: "后台发放", video: "为了结婚而结婚的男人，他的婚恋观你认同吗？", status: "已支付", amount: "1.00元", totalParts: 10, isEqual: false, remainParts: 9, remainAmount: "0.96元" },
  { id: 1, time: "2026-06-13 14:16:45", sender: "后台发放", video: "来听听我们的价值观和服务亮点", status: "已支付", amount: "1.00元", totalParts: 10, isEqual: false, remainParts: 8, remainAmount: "0.92元" },
];

export default function ShortVideoRedPacketPage() {
  const [tab, setTab] = useState("全部");
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card rpk-card">
        <div className="rpk-title">红包记录</div>

        <div className="rpk-filters">
          <div className="rpk-tabs">
            {STATUS_TABS.map((t) => (
              <button key={t} className={`rpk-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <select className="rpk-select"><option>按昵称搜</option></select>
          <input className="rpk-input" placeholder="请输入" />
          <button className="finord-btn finord-btn-primary rpk-search-btn">搜索</button>
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
                  <td className="rpk-time">{r.time}</td>
                  <td className="rpk-sender">{r.sender}</td>
                  <td className="rpk-video">{r.video}</td>
                  <td><span className="rpk-status rpk-status-paid">{r.status}</span></td>
                  <td><span className="rpk-amount">{r.amount}</span></td>
                  <td className="rpk-num">{r.totalParts}</td>
                  <td>{r.isEqual ? "是" : "否"}</td>
                  <td>
                    <div className="rpk-claim">
                      <span className="rpk-status rpk-status-pending">未领完</span>
                      <div className="rpk-claim-meta">还剩{r.remainParts}份 {r.remainAmount}</div>
                    </div>
                  </td>
                  <td>
                    <a className="finord-link" onClick={() => setDetailOpen(true)}>领取明细</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rpk-pager">
          <span className="rpk-pager-arrow">‹</span>
          <span className="rpk-pager-cur">1</span>
          <span className="rpk-pager-arrow">›</span>
        </div>
      </div>

      {detailOpen && <ClaimDetailDrawer onClose={() => setDetailOpen(false)} />}
    </div>
  );
}

function ClaimDetailDrawer({ onClose }: { onClose: () => void }) {
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
              <tr>
                <td className="rpk-detail-user">6<em>xxxx</em> N</td>
                <td className="rpk-detail-time">2026-06-14 14:12:40</td>
                <td><span className="rpk-detail-amount">0.02元</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}