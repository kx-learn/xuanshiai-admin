"use client";

import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("合伙红娘", "分成明细");

const columns = ["ID", "时间", "合伙人", "团队推广红娘", "分成类型", "分成事件", "分成金额"];

const details = [
  { id: 2, time: "2026-07-15 14:36:24", partner: "富豪爱1", teamMatchmaker: "Sofia", type: "会员注册奖励", event: "相亲会员Rasim(Q847150) - 女 - 会员注册奖励", amount: "1元" },
  { id: 1, time: "2026-07-11 11:29:57", partner: "富豪爱1", teamMatchmaker: "Sofia", type: "会员注册奖励", event: "相亲会员Thera(Q824771) - 女 - 会员注册奖励", amount: "1元" },
];

export default function LovePartnerBonusDetailsPage() {
  const [addOpen, setAddOpen] = useState(false);
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card lpbd-card">
        <div className="lpbd-head">
          <h2 className="lpbd-title">合伙人（红娘）分成明细</h2>
          <button className="finord-btn finord-btn-primary lpbd-add-btn" onClick={() => setAddOpen(true)}>＋ 录入一笔分成</button>
        </div>

        <div className="lpbd-filters">
          <select className="lpbd-select"><option>请选择事件</option></select>
          <div className="lpbd-daterange">
            <span className="lpbd-text-muted">开始日期</span>
            <input className="lpbd-date" type="date" />
            <span className="lpbd-text-muted">→</span>
            <span className="lpbd-text-muted">结束日期</span>
            <input className="lpbd-date" type="date" />
          </div>
          <input className="lpbd-input" placeholder="请输入合伙人昵称" />
          <button className="finord-btn finord-btn-primary lpbd-search-btn">搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table lpbd-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {details.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td className="lpbd-time">{d.time}</td>
                  <td>{d.partner}</td>
                  <td>{d.teamMatchmaker}</td>
                  <td><span className="lpbd-type">{d.type}</span></td>
                  <td className="lpbd-event">{d.event}</td>
                  <td><span className="lpbd-amount">{d.amount}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lpbd-pager">
          <span className="lpbd-pager-arrow">‹</span>
          <span className="lpbd-pager-cur">1</span>
          <span className="lpbd-pager-arrow">›</span>
        </div>
      </div>

      {addOpen && <AddBonusDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddBonusDrawer({ onClose }: { onClose: () => void }) {
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
            <button className="finord-btn finord-btn-primary">确定提交</button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="lpbd-info-block">① 添加记录后会自动生成分成明细、余额明细，分成金额会计入到红娘账号余额中</div>

          {/* 合伙人红娘 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊合伙人红娘</span>
            <input className="lpbd-input-wide" placeholder="请输入合伙人红娘名称" />
          </div>

          {/* 购买账号 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊购买账号</span>
            <input className="lpbd-input-wide" placeholder="请输入购买账号昵称" />
          </div>

          {/* 分成事件 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊分成事件</span>
            <select className="lpbd-select-wide"><option>请选择分成事件</option></select>
          </div>

          {/* 消费事件 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊消费事件</span>
            <select className="lpbd-select-wide"><option>请选择消费事件</option></select>
          </div>

          {/* 分成金额 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊分成金额</span>
            <div className="lpbd-amount-row">
              <input className="lpbd-num" />
              <span className="lpbd-unit">元</span>
              <button type="button" className="finord-btn finord-btn-primary lpbd-get-code-btn">获取验证码</button>
            </div>
          </div>

          {/* 短信验证码 */}
          <div className="lpbd-row">
            <span className="lpbd-label">＊短信验证码</span>
            <div className="lpbd-content">
              <input className="lpbd-input-wide" placeholder="请输入短信验证码" />
              <div className="lpbd-info">① 短信将发送至admin绑定的手机号</div>
            </div>
          </div>

          <div className="lpbd-submit-row">
            <button className="finord-btn finord-btn-primary lpbd-submit">确定提交</button>
          </div>
        </div>
      </div>
    </>
  );
}