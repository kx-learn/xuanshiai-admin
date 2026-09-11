"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Plus, X } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = getBreadcrumb("总店红娘", "分成明细");

interface DetailRow {
  id: number;
  store: string;
  time: string;
  matchmaker: string;
  buyer: string;
  avatar: string;
  event: string;
  amount: string;
  refunded: boolean;
  commission: string;
}

const ROWS: DetailRow[] = [
  { id: 74, store: "总店", time: "2026-06-30 20:37:38", matchmaker: "芸希老师", buyer: "乌龙茶6071|朱颖|G714715", avatar: "c", event: "会员爆灯", amount: "9.9元", refunded: true, commission: "5元" },
  { id: 73, store: "总店", time: "2026-06-30 11:53:17", matchmaker: "芸希老师", buyer: "是静香本人没槽|潘圣|G858401", avatar: "d", event: "会员爆灯", amount: "9.9元", refunded: true, commission: "5元" },
  { id: 72, store: "总店", time: "2026-06-30 11:51:56", matchmaker: "芸希老师", buyer: "是静香本人没槽|潘圣|G858401", avatar: "e", event: "VIP会员", amount: "299元", refunded: true, commission: "99元" },
  { id: 71, store: "总店", time: "2026-06-28 15:38:00", matchmaker: "琴琴", buyer: "G^n|李会强|B134461", avatar: "a", event: "会员爆灯", amount: "9.9元", refunded: false, commission: "5元" },
  { id: 70, store: "总店", time: "2026-06-28 15:37:26", matchmaker: "琴琴", buyer: "出现1|张瑞|B241050", avatar: "b", event: "会员爆灯", amount: "9.9元", refunded: false, commission: "5元" },
  { id: 69, store: "总店", time: "2026-06-28 15:32:38", matchmaker: "琴琴", buyer: "G^n|李会强|B134461", avatar: "a", event: "会员爆灯", amount: "9.9元", refunded: true, commission: "5元" },
  { id: 68, store: "总店", time: "2026-06-28 15:14:43", matchmaker: "琴琴", buyer: "G^n|李会强|B134461", avatar: "c", event: "会员爆灯", amount: "9.9元", refunded: true, commission: "5元" },
  { id: 67, store: "总店", time: "2026-06-28 15:10:50", matchmaker: "琴琴", buyer: "出现1|张瑞|B241050", avatar: "b", event: "VIP会员", amount: "999元", refunded: true, commission: "300元" },
  { id: 66, store: "总店", time: "2026-06-20 11:18:42", matchmaker: "芸希老师", buyer: "毛毛|汪苏杭|G765914", avatar: "e", event: "VIP会员", amount: "999元", refunded: false, commission: "300元" },
  { id: 65, store: "总店", time: "2026-06-14 16:21:59", matchmaker: "芸希老师", buyer: "G^n|李会强|B134461", avatar: "a", event: "VIP会员", amount: "999元", refunded: false, commission: "300元" },
  { id: 8, store: "总店", time: "2026-06-06 10:12:11", matchmaker: "芸希老师", buyer: "Z|刘佳|G583088", avatar: "d", event: "活动报名", amount: "999元", refunded: false, commission: "300元" },
  { id: 6, store: "总店", time: "2026-06-04 14:27:48", matchmaker: "芸希老师", buyer: "Z|刘佳|G583088", avatar: "a", event: "VIP会员", amount: "999元", refunded: false, commission: "300元" },
  { id: 5, store: "总店", time: "2026-06-03 20:09:26", matchmaker: "芸希老师", buyer: "乐乐|潘美玲|G052362", avatar: "b", event: "VIP会员", amount: "399元", refunded: false, commission: "99元" },
];

const EVENT_OPTIONS = ["请选择消费事件", "会员爆灯", "VIP会员", "活动报名", "推广展示"];

export default function Page() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={breadcrumb} />

      {/* 须知 */}
      <div className="cdd-notice">
        <div className="cdd-notice-title">
          <span className="cdd-notice-icon">i</span>
          <span>须知</span>
        </div>
        <p>
          以下是在平台中进行线上支付后平台与服务红娘之间的分成明细，总店红娘的分成会实时计入到每个红娘的账号余额中，红娘可以实时申请提现，由平台审核后给与支付结算；分店名下红娘是统一按照分店与平台之间达成的分成标准计算分成，分店红娘所产生的分成统一计入到店长的账号余额中，门店可实时向平台申请结算提现。
        </p>
      </div>

      <section className="cdd-card">
        <div className="cdd-head">
          <h2 className="cdd-title">红娘线上分成明细</h2>
          <button type="button" className="cdd-btn primary" onClick={() => setOpen(true)}>
            <Plus size={14} />
            录入一笔分成
          </button>
        </div>

        {/* 筛选 */}
        <div className="cdd-filters">
          <div className="cdd-select">
            <select defaultValue="">
              <option value="">请选择门店</option>
              <option value="total">总店</option>
            </select>
            <ChevronDown className="cdd-caret" size={14} />
          </div>
          <div className="cdd-select">
            <select defaultValue="">
              <option value="">请选择红娘</option>
              <option value="yunxi">芸希老师</option>
              <option value="qinqin">琴琴</option>
            </select>
            <ChevronDown className="cdd-caret" size={14} />
          </div>
          <div className="cdd-select">
            <select defaultValue="">
              {EVENT_OPTIONS.map((event) => (
                <option key={event} value={event === EVENT_OPTIONS[0] ? "" : event}>
                  {event}
                </option>
              ))}
            </select>
            <ChevronDown className="cdd-caret" size={14} />
          </div>
          <div className="cdd-daterange">
            <div className="cdd-date">
              <input placeholder="开始日期" readOnly />
              <CalendarDays size={14} />
            </div>
            <span className="cdd-arrow">→</span>
            <div className="cdd-date">
              <input placeholder="结束日期" readOnly />
              <CalendarDays size={14} />
            </div>
          </div>
          <button type="button" className="cdd-search">
            搜索
          </button>
        </div>

        {/* 表格 */}
        <div className="cdd-table-wrap">
          <table className="cdd-table">
            <colgroup>
              <col style={{ width: 70 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 180 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 230 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 140 }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>门店</th>
                <th>时间</th>
                <th>红娘</th>
                <th>消费会员</th>
                <th>分成/奖励事件</th>
                <th>消费金额</th>
                <th>分成金额</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.id}>
                  <td className="cdd-td-id">{row.id}</td>
                  <td className="cdd-td-text">{row.store}</td>
                  <td className="cdd-td-time">{row.time}</td>
                  <td className="cdd-td-text">{row.matchmaker}</td>
                  <td>
                    <span className="cdd-buyer">
                      <span className={`cdd-avatar cdd-g-${row.avatar}`} />
                      <span className="cdd-buyer-name">{row.buyer}</span>
                    </span>
                  </td>
                  <td className="cdd-td-text">{row.event}</td>
                  <td className="cdd-td-amount">
                    {row.amount}
                    {row.refunded && <span className="cdd-refunded">已退款</span>}
                  </td>
                  <td className="cdd-td-commission">{row.commission}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 录入一笔分成 Drawer */}
      {open && (
        <div className="cdd-mask" onClick={() => setOpen(false)}>
          <div className="cdd-panel" onClick={(e) => e.stopPropagation()}>
            <header className="cdd-panel-head">
              <button type="button" className="cdd-panel-close-icon" onClick={() => setOpen(false)} aria-label="关闭">
                <X size={18} />
              </button>
              <h2 className="cdd-panel-title">录入一笔分成</h2>
            </header>

            <div className="cdd-panel-body">
              <div className="cdd-hint">
                <span className="cdd-hint-icon">i</span>
                <span>添加记录后会自动生成分成明细、余额明细，分成金额会计入到红娘账号余额中</span>
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>服务红娘
                </label>
                <input type="text" className="cdd-input" placeholder="请输入服务红娘账号昵称" />
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>购买账号
                </label>
                <input type="text" className="cdd-input" placeholder="请输入购买账号昵称" />
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>分成事件
                </label>
                <div className="cdd-select block">
                  <select defaultValue="">
                    <option value="">请选择消费事件</option>
                    {EVENT_OPTIONS.slice(1).map((event) => (
                      <option key={event} value={event}>
                        {event}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="cdd-caret" size={14} />
                </div>
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>消费事件
                </label>
                <div className="cdd-select block">
                  <select defaultValue="">
                    <option value="">请选择消费事件</option>
                    {EVENT_OPTIONS.slice(1).map((event) => (
                      <option key={event} value={event}>
                        {event}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="cdd-caret" size={14} />
                </div>
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>分成金额
                </label>
                <div className="cdd-inline">
                  <input type="text" className="cdd-input short" placeholder="" />
                  <span className="cdd-unit">元</span>
                </div>
              </div>

              <div className="cdd-field">
                <label className="cdd-field-label">
                  <span className="req">*</span>短信验证码
                </label>
                <div className="cdd-field-body">
                  <div className="cdd-inline">
                    <input type="text" className="cdd-input" placeholder="请输入短信验证码" />
                    <button type="button" className="cdd-code-btn">
                      获取验证码
                    </button>
                  </div>
                  <div className="cdd-hint">
                    <span className="cdd-hint-icon">i</span>
                    <span>短信将发送到admin绑定的手机号</span>
                  </div>
                </div>
              </div>

              <button type="button" className="cdd-submit">
                确定提交
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
