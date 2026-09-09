"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "积分商城", href: "/gift-list" },
  { label: "兑换管理" },
];

const columns = ["ID", "申请人", "兑换礼物", "积分", "申请兑换时间", "状态", "操作"];

function Applicant({ hasAvatar, initial, nick, name, mobile, address }: {
  hasAvatar?: boolean;
  initial?: string;
  nick?: string;
  name: string;
  mobile: string;
  address: string;
}) {
  return (
    <div className="ex-applicant">
      {hasAvatar && (
        <div className="ex-avatar-block">
          <div className="ex-avatar">{initial}</div>
          <div className="ex-nick">{nick}</div>
        </div>
      )}
      <div className="ex-userinfo">
        <div className="ex-name">{name}</div>
        <div className="ex-meta">姓名：{name}</div>
        <div className="ex-meta">手机：{mobile}</div>
        <div className="ex-meta">地址：{address}</div>
      </div>
    </div>
  );
}

export default function GiftExchangePage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card ex-card">
        <div className="ex-head">
          <h2 className="ex-title">兑换管理</h2>
        </div>

        <div className="ex-filters">
          <div className="ex-searchbox">
            <select className="ex-search-select">
              <option>按礼品搜</option>
              <option>按申请人搜</option>
            </select>
            <input className="ex-search-input" placeholder="请输入" />
            <button className="finord-btn finord-btn-primary ex-search-btn">搜索</button>
          </div>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table ex-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 行 1：无头像 */}
              <tr>
                <td className="ex-id">2</td>
                <td>
                  <Applicant name="毛毛" mobile="18926072282" address="南京市「建邺区(?)」" />
                </td>
                <td><a className="finord-link">指甲刀</a></td>
                <td className="ex-points">100</td>
                <td className="ex-time">2026-07-01 10:45:24</td>
                <td><span className="ex-status ex-status-pending">等待审核</span></td>
                <td>
                  <div className="ex-ops">
                    <a className="finord-link ex-op">兑换成功</a>
                    <span className="ex-op-sep">/</span>
                    <a className="finord-link ex-op">兑换失败</a>
                    <span className="ex-op-sep">/</span>
                    <a className="finord-link ex-op">删除</a>
                  </div>
                </td>
              </tr>

              {/* 行 2：带头像 */}
              <tr>
                <td className="ex-id">1</td>
                <td>
                  <Applicant hasAvatar initial="G" nick="Good Nl" name="李" mobile="18856767690" address="南京市建邺区新城科技园" />
                </td>
                <td><a className="finord-link">指甲刀</a></td>
                <td className="ex-points">100</td>
                <td className="ex-time">2026-06-30 17:59:59</td>
                <td><span className="ex-status ex-status-success">兑换成功</span></td>
                <td>
                  <div className="ex-ops">
                    <a className="finord-link ex-op">删除</a>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="ex-pager">
          <span className="ex-pager-arrow">‹</span>
          <span className="ex-pager-cur">1</span>
          <span className="ex-pager-arrow">›</span>
        </div>
      </div>
    </div>
  );
}