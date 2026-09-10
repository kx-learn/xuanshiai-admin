"use client";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "搭子社群", href: "/group-menu" },
  { label: "报名管理" },
];

interface Signup {
  id: number;
  time: string;
  nick: string;
  phone: string;
  profile: string;
  auth: string;
  group: string;
  count: number;
  pay: string;
  orderNo: string;
  payWay: string;
  promoter: string;
}

const signups: Signup[] = [
  {
    id: 1,
    time: "2026-05-31 17:44:26",
    nick: "别吻我橘子",
    phone: "166****8875",
    profile: "已完善",
    auth: "已认证",
    group: "美食干饭搭子",
    count: 1,
    pay: "免费",
    orderNo: "",
    payWay: "",
    promoter: "",
  },
];

export default function GroupSignupPage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">ℹ</span>
          <div className="ecl-notice-text">在这里可以查看到在您平台上报名入群的所有信息</div>
        </div>
      </div>

      <div className="finord-card">
        {/* 筛选条 */}
        <div className="finord-filters gsm-filters">
          <select className="finord-select gsm-gap">
            <option>所有社群</option>
          </select>
          <select className="finord-select">
            <option>支付: 不限</option>
            <option>支付: 免费</option>
            <option>支付: 已支付</option>
          </select>
          <span className="finord-searchbox">
            <span className="finord-search-label">按昵称</span>
            <input className="finord-search-input gsm-search" placeholder="请输入" />
          </span>
          <button className="finord-btn finord-btn-primary gsm-search-btn">搜索</button>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table gsm-table">
            <thead>
              <tr>
                <th>报名时间</th>
                <th>昵称/手机</th>
                <th>资料完善</th>
                <th>实名认证</th>
                <th>加入社群</th>
                <th>第几次报名</th>
                <th>在线支付</th>
                <th>支付方式/单号</th>
                <th>推广红娘</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {signups.map((s) => (
                <tr key={s.id}>
                  <td className="gsm-time">{s.time}</td>
                  <td>
                    <div className="gsm-nick">{s.nick}</div>
                    <div className="gsm-phone">{s.phone}</div>
                  </td>
                  <td>{s.profile}</td>
                  <td>{s.auth}</td>
                  <td>{s.group}</td>
                  <td>
                    <div className="gsm-count">{s.count}</div>
                    <a className="finord-link" href="#">报名历史</a>
                  </td>
                  <td>{s.pay}</td>
                  <td>
                    <div>单号:</div>
                    <div>方式:-</div>
                  </td>
                  <td>{s.promoter}</td>
                  <td>
                    <span className="gsm-ops">
                      <a className="finord-link" href="#">查看资料</a>
                      <a className="finord-link" href="#">删除</a>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="finord-pagination">
          <span />
          <span className="gsm-pages">
            <button className="finord-page">&lsaquo;</button>
            <button className="finord-page active">1</button>
            <button className="finord-page">&rsaquo;</button>
          </span>
        </div>
      </div>
    </div>
  );
}
