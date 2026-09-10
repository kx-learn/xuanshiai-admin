"use client";

import { useState } from "react";
import { CalendarDays, ChevronDown, Download, Plus, X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("推广红娘", "分成明细");

type DetailRow = {
  id: number;
  time: string;
  promoter: string;
  palette: string;
  member: string;
  event: string;
  amount: string;
};

const rows: DetailRow[] = [
  { id: 75, time: "2026-07-05 08:32:15", promoter: "Sofia", palette: "a", member: "fu福|", event: "活动报名", amount: "0元" },
  { id: 64, time: "2026-06-14 11:32:29", promoter: "悲喜", palette: "b", member: "BjAlex|张鹏|B721295", event: "会员注册奖励", amount: "11元" },
  { id: 63, time: "2026-06-14 11:23:23", promoter: "悲喜", palette: "b", member: "一个人的浪漫|朱帅|B978705", event: "会员注册奖励", amount: "11元" },
  { id: 62, time: "2026-06-14 11:13:04", promoter: "悲喜", palette: "b", member: "SomnusL|鲁鑫喆|B36358", event: "会员注册奖励", amount: "11元" },
  { id: 61, time: "2026-06-14 11:05:00", promoter: "悲喜", palette: "b", member: "zzz|李超|B451744", event: "会员注册奖励", amount: "11元" },
  { id: 60, time: "2026-06-14 11:00:35", promoter: "悲喜", palette: "b", member: "小拓|韩杰|B241658", event: "会员注册奖励", amount: "10元" },
  { id: 59, time: "2026-06-14 10:55:57", promoter: "悲喜", palette: "b", member: "空白|陈茂元|B508345", event: "会员注册奖励", amount: "10元" },
  { id: 58, time: "2026-06-14 10:00:15", promoter: "悲喜", palette: "b", member: "馋|周文阳|B706944", event: "会员注册奖励", amount: "10元" },
  { id: 57, time: "2026-06-13 17:33:03", promoter: "悲喜", palette: "b", member: "🌱1986|苟雯颖|G617884", event: "会员注册奖励", amount: "20元" },
  { id: 56, time: "2026-06-13 17:30:57", promoter: "悲喜", palette: "b", member: "！！！|gbfs|李力华|B501213", event: "会员注册奖励", amount: "10元" },
  { id: 55, time: "2026-06-13 17:27:57", promoter: "悲喜", palette: "b", member: "-1+1=|李小龙|B846068", event: "会员注册奖励", amount: "10元" },
  { id: 54, time: "2026-06-13 16:36:55", promoter: "悲喜", palette: "b", member: "伟|邓承伟|B631678", event: "会员注册奖励", amount: "10元" },
  { id: 53, time: "2026-06-13 15:31:56", promoter: "悲喜", palette: "b", member: "王秋霞1510|王秋霞|G063146", event: "会员注册奖励", amount: "20元" },
  { id: 52, time: "2026-06-13 15:29:10", promoter: "悲喜", palette: "b", member: "童话故事导演🎬|尹广案|B015527", event: "会员注册奖励", amount: "10元" },
  { id: 51, time: "2026-06-13 15:27:22", promoter: "悲喜", palette: "b", member: "小黄先森。|黄智|B782572", event: "会员注册奖励", amount: "10元" },
  { id: 50, time: "2026-06-13 15:25:55", promoter: "悲喜", palette: "b", member: "久伴|武丽娜|G327343", event: "会员注册奖励", amount: "20元" },
];

export default function PoploveMatchmakerDistributionDetailsPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={breadcrumb} />

      <div className="pdd-card">
        <div className="pdd-head">
          <h2 className="pdd-title">推广红娘分成明细</h2>
          <div className="pdd-head-actions">
            <button type="button" className="pdd-btn primary" onClick={() => setAddOpen(true)}>
              <Plus size={14} />
              录入一笔分成
            </button>
            <button type="button" className="pdd-btn primary">
              <Download size={14} />
              导出EXCEL
            </button>
          </div>
        </div>

        <div className="pdd-filters">
          <div className="pdd-select">
            <select defaultValue="">
              <option value="">请选择事件</option>
            </select>
            <ChevronDown className="pdd-caret" size={14} />
          </div>
          <div className="pdd-daterange">
            <div className="pdd-date">
              <input placeholder="开始日期" />
              <CalendarDays size={14} />
            </div>
            <span className="pdd-arrow">→</span>
            <div className="pdd-date">
              <input placeholder="结束日期" />
              <CalendarDays size={14} />
            </div>
          </div>
          <div className="pdd-select">
            <select defaultValue="">
              <option value="">按关键字搜</option>
            </select>
            <ChevronDown className="pdd-caret" size={14} />
          </div>
          <input className="pdd-filter-input" placeholder="请输入" />
          <button type="button" className="pdd-search">
            搜索
          </button>
        </div>

        <div className="pdd-table-wrap">
          <table className="pdd-table">
            <colgroup>
              <col style={{ width: 80 }} />
              <col style={{ width: 200 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: "auto" }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 120 }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>时间</th>
                <th>推广红娘</th>
                <th>消费会员</th>
                <th>分成/奖励事件</th>
                <th>分成金额</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="pdd-td-id">{row.id}</td>
                  <td className="pdd-td-time">{row.time}</td>
                  <td>
                    <span className="pdd-promoter">
                      <span className={`pdd-avatar pdd-g-${row.palette}`} />
                      {row.promoter}
                    </span>
                  </td>
                  <td className="pdd-td-text">{row.member}</td>
                  <td className="pdd-td-text">{row.event}</td>
                  <td className="pdd-td-amount">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {addOpen && <AddCommissionDrawer onClose={() => setAddOpen(false)} />}
    </div>
  );
}

function AddCommissionDrawer({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div className="pdd-mask" onClick={onClose} />
      <div className="pdd-panel">
        <div className="pdd-panel-head">
          <button className="pdd-panel-close-icon" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
          <h2 className="pdd-panel-title">录入一笔分成</h2>
        </div>

        <div className="pdd-panel-body">
          <div className="pdd-hint">
            <i className="pdd-hint-icon">i</i>
            添加记录后会自动生成分成明细、余额明细，分成金额会计入到红娘账号余额中
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>推广红娘
            </span>
            <div className="pdd-field-body">
              <input className="pdd-input" placeholder="请输入推广红娘账号昵称" />
            </div>
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>购买账号
            </span>
            <div className="pdd-field-body">
              <input className="pdd-input" placeholder="请输入购买账号昵称" />
            </div>
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>分成事件
            </span>
            <div className="pdd-field-body">
              <div className="pdd-select block">
                <select defaultValue="">
                  <option value="">请选择分成事件</option>
                </select>
                <ChevronDown className="pdd-caret" size={14} />
              </div>
            </div>
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>消费事件
            </span>
            <div className="pdd-field-body">
              <div className="pdd-select block">
                <select defaultValue="">
                  <option value="">请选择消费事件</option>
                </select>
                <ChevronDown className="pdd-caret" size={14} />
              </div>
            </div>
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>分成金额
            </span>
            <div className="pdd-field-body">
              <div className="pdd-inline">
                <input className="pdd-input short" placeholder="请输入金额" />
                <span className="pdd-unit">元</span>
              </div>
            </div>
          </div>

          <div className="pdd-field">
            <span className="pdd-field-label">
              <b className="req">*</b>短信验证码
            </span>
            <div className="pdd-field-body">
              <div className="pdd-inline">
                <input className="pdd-input" placeholder="请输入短信验证码" />
                <button type="button" className="pdd-code-btn">
                  获取验证码
                </button>
              </div>
              <div className="pdd-hint">
                <i className="pdd-hint-icon">i</i>
                短信将发送到admin绑定的手机号
              </div>
            </div>
          </div>

          <button type="button" className="pdd-submit">
            确定提交
          </button>
        </div>
      </div>
    </>
  );
}
