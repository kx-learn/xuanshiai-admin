"use client";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "财务管理", href: "/finance-config" },
  { label: "电子合同", href: "/e-contract-config" },
  { label: "合同管理" },
];

export default function EContractListPage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色信息条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">预知</div>
            <p>本系统接入了腾讯电子签合同系统，您可以在本系统内灵活方便的使用腾讯电子签系统。快速与客户完成线上合同的发起、签署、和管理。</p>
            <p><b>合同发起：</b>在"会员CRM-线上VIP-会员CRM-线下VIP"中进行操作，并可重复发起合同</p>
            <p><b>合同签署：</b>合同发起后，会员进入线上平台的"会员中心-我的合同"中按照指引操作即可完成</p>
            <p><b>合同管理：</b>在本页面中您可以管理、查看、下载所有的电子合同</p>
            <p><b>法律效力：</b>腾讯电子签的签署功能均符合《电子签名法》要求，并采用区块链技术，对合同签署全程存证记录，可有效保障合同的完整性和真实性。区块链能力提供方-"至信链"基于国产开源、自主可控的"长安链"技术底层建设，是司法认可的区域链可信存证平台，并以工信部一拆、多家法院、公证处作为核心共识节点，公信力强。目前，"至信链"司法存证服务的证据效力已经得到全国各地法院的广泛认可</p>
            <p><b>使用费用：</b>腾讯电子签按照发起合同的份数扣费，您需在本系统内按合同份数进行充值。若合同剩余份数为0则无法正常使用</p>
          </div>
        </div>
      </div>

      {/* 统计卡 */}
      <div className="ecl-stats">
        <div className="ecl-stat">
          <div className="ecl-stat-icon blue">文</div>
          <div className="ecl-stat-meta">
            <div className="ecl-stat-label">已发起合同</div>
            <div className="ecl-stat-value">0条</div>
          </div>
        </div>
        <div className="ecl-stat">
          <div className="ecl-stat-icon red">文</div>
          <div className="ecl-stat-meta">
            <div className="ecl-stat-label">可用合同余量</div>
            <div className="ecl-stat-value">150条</div>
          </div>
          <button className="ecl-recharge">在线充值</button>
        </div>
      </div>

      <div className="finord-card">
        <div className="crh-head">
          <div className="crh-title">合同管理</div>
        </div>

        {/* 筛选条 */}
        <div className="finord-filters ecl-filters">
          <select className="finord-select">
            <option>按会员昵称</option>
            <option>按合同编号</option>
          </select>
          <input className="finord-search-input" placeholder="请输入" />
          <button className="finord-btn finord-btn-primary">搜索</button>
          <button className="finord-btn finord-btn-outline ecl-demo">📃 客户签署流程演示</button>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>会员</th>
                <th>合同名称</th>
                <th>合同类型</th>
                <th>发起时间</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="ecl-empty">
                  <div className="ecl-empty-inner">
                    <div className="ecl-empty-icon">▤</div>
                    <div className="ecl-empty-text">暂无数据</div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
