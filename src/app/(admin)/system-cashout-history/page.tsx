"use client";
import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

type Record = {
  id: number;
  nickname: string;
  uid: number;
  phone: string;
  apply: number; // 申请提现金额
  fee: number; // 手续费
  arrive: number; // 到账金额
  status: "已提现" | "待处理" | "提现中" | "拒绝提现";
  balance: string; // 当前账号余额
  applyTime: string;
  arriveTime?: string;
  payTo: string; // 支付方式名+账号
  payeeName: string;
  payMethod: string; // 支付方式
};

const seedRecords: Record[] = [
  { id: 548, nickname: "σπη'η", uid: 548, phone: "188****7690", apply: 10, fee: 0, arrive: 10, status: "已提现", balance: "9.91元", applyTime: "2026-06-28 15:35:52", arriveTime: "2026-06-28 15:36:50", payTo: "人工转账微信 18856767590", payeeName: "李会强", payMethod: "线下支付" },
  { id: 54, nickname: "出现1", uid: 54, phone: "132****8888", apply: 999, fee: 9.99, arrive: 989.01, status: "已提现", balance: "-", applyTime: "2026-06-28 15:24:18", arriveTime: "2026-06-28 15:25:16", payTo: "人工转账微信 13285288888", payeeName: "张瑞", payMethod: "线下支付" },
  { id: 506, nickname: "憨喜", uid: 506, phone: "182****5504", apply: 74, fee: 0, arrive: 0, status: "待处理", balance: "-", applyTime: "2026-06-14 13:22:30", payTo: "支付宝 18263955504", payeeName: "夏建军", payMethod: "-" },
  { id: 506, nickname: "憨喜", uid: 506, phone: "182****5504", apply: 380, fee: 3.8, arrive: 0, status: "待处理", balance: "-", applyTime: "2026-06-13 17:48:54", payTo: "银行卡 6228481829047928370", payeeName: "夏建军", payMethod: "-" },
  { id: 506, nickname: "憨喜", uid: 506, phone: "182****5504", apply: 80, fee: 0, arrive: 0, status: "待处理", balance: "-", applyTime: "2026-06-13 13:57:26", payTo: "银行卡 6228481829047928370", payeeName: "夏建军", payMethod: "-" },
];

const STATUS_TABS = ["全部", "待处理", "已提现", "提现中", "拒绝提现"];

export default function SystemCashoutHistoryPage() {
  const [statusTab, setStatusTab] = useState("全部");
  const breadcrumb = getBreadcrumb("财务管理", "余额提现");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色信息条 */}
      <div className="cs-info">
        <div className="cs-info-body">
          <span className="cs-info-ic"><span>ℹ</span></span>
          <div className="cs-info-text">
            <p>平台中的用户可以将账号中的"余额"，以两种方式与平台进行现金结算（提现）：</p>
            <p>1、用户可自主操作自动提现到其微信零钱中，无需您的审核，秒到账。钱款将自动从您的微信商户号的"运营资金"中支付。开启本功能前请确保 您已经在微信商户平台中开通了"商家转账功能"且您的微信商户号中需有足额资金用于支付提现。微信商户系统会根据您的账号安全情况限制用户单次提现金额的上限（一般200元）、单日提现的总上限（一般1万元）</p>
            <p>2、用户输入金额向平台提出结算提现申请，其金额会从余额中扣除，平台工作人员核实后人工转账到用户指定的银行卡或者支付宝中，然后操作点击"已完成转账"，即完成提现，若操作点击"拒绝提现"，则对应金额退回 到其账号余额中。</p>
          </div>
        </div>
      </div>

      {/* 统计卡 */}
      <div className="cs-stats">
        <div className="cs-stat">
          <div className="cs-stat-icon green">¥</div>
          <div className="cs-stat-meta">
            <div className="cs-stat-label">未申请提现总额</div>
            <div className="cs-stat-value">15756.58元</div>
          </div>
        </div>
        <div className="cs-stat">
          <div className="cs-stat-icon red">☺</div>
          <div className="cs-stat-meta">
            <div className="cs-stat-label">已提现总额</div>
            <div className="cs-stat-value">1009元</div>
          </div>
        </div>
        <div className="cs-stat">
          <div className="cs-stat-icon blue">✓</div>
          <div className="cs-stat-meta">
            <div className="cs-stat-label">提现中的总额</div>
            <div className="cs-stat-value">0元</div>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="crh-head">
          <div className="crh-title">余额提现</div>
        </div>

        {/* 筛选条 */}
        <div className="cs-filters">
          <div className="cs-radios">
            {STATUS_TABS.map((t) => (
              <label key={t} className={`cs-radio ${statusTab === t ? "active" : ""}`}>
                <input type="radio" name="cs-status" checked={statusTab === t} onChange={() => setStatusTab(t)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
          <select className="finord-select">
            <option>全部支付类型</option>
            <option>自动提现</option>
            <option>人工转账</option>
          </select>
          <input className="finord-search-input crh-search-input" placeholder="请输入账号昵称" />
          <button className="finord-btn finord-btn-primary">搜索</button>
          <button className="finord-btn finord-btn-outline cs-clear">🗑 清空数据</button>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table">
            <thead>
              <tr>
                <th>提现账号</th>
                <th>联系方式</th>
                <th>申请提现金额</th>
                <th>手续费</th>
                <th>到账金额</th>
                <th>提现状态</th>
                <th>当前账号余额</th>
                <th>时间</th>
                <th>支付到</th>
                <th>支付方式</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {seedRecords.map((rec) => (
                <tr key={`${rec.id}-${rec.applyTime}`}>
                  <td>
                    <div className="cs-nick">{rec.nickname}</div>
                    <div className="cs-uid">ID: {rec.uid}</div>
                  </td>
                  <td className="cs-phone">{rec.phone}</td>
                  <td className="cs-amount">{rec.apply}元</td>
                  <td className="cs-fee">{rec.fee}元</td>
                  <td className={`cs-arrive ${rec.status === "已提现" ? "done" : ""}`}>{rec.arrive}元</td>
                  <td>
                    <span className={`cs-status ${rec.status === "已提现" ? "done" : "pending"}`}>{rec.status}</span>
                  </td>
                  <td className="cs-balance">{rec.balance}</td>
                  <td>
                    <div className="cs-time">申请时间:{rec.applyTime}</div>
                    {rec.arriveTime && <div className="cs-time">到账时间:{rec.arriveTime}</div>}
                  </td>
                  <td>
                    <div className="cs-payto">{rec.payTo}</div>
                    <div className="cs-payname">{rec.payeeName}</div>
                  </td>
                  <td className="cs-paymethod">{rec.payMethod}</td>
                  <td>
                    {rec.status === "待处理" ? (
                      <div className="cs-ops">
                        <span className="finord-link">已完成转账</span>
                        <span className="cs-op-sep">|</span>
                        <span className="finord-link">拒绝提现</span>
                      </div>
                    ) : (
                      <span className="finord-td-dash">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="finord-pagination">
          <div className="finord-pages">
            <button className="finord-page nav" disabled>‹</button>
            <button className="finord-page active">1</button>
            <button className="finord-page nav" disabled>›</button>
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
