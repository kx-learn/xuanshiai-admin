"use client";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "财务管理", href: "/finance-config" },
  { label: "电子合同", href: "/e-contract-config" },
  { label: "模板管理" },
];

export default function EContractTemplatePage() {
  return (
    <div>
      {/* 红色提示条 */}
      <div className="etc-alert">
        <span className="etc-alert-x">✕</span>
        <span className="etc-alert-text">电子签功能已关闭,请先打开电子签配置</span>
      </div>

      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">◇</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>在这里您可以添加和管理您的电子合同模板。</p>
            <p>1、合同模板类型分为线上会员合同和线下会员合同。</p>
            <p>2、在签署合同时，不支持人工对合同内容进行编辑或填写。系统会通过合同控件自动填写平台内的相应数据。</p>
            <p>3、系统已提供了合同控件，详情可参考添加合同模板页面的"合同控件使用说明"。如果您合同模板中的填写项不在说明内，建议您直接写明在模板中或删除此项。</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="crh-head">
          <div className="crh-title">模板管理</div>
          <div className="etc-actions">
            <button className="finord-btn finord-btn-primary">＋ 添加合同模板</button>
            <button className="finord-btn finord-btn-primary">↻ 刷新列表</button>
          </div>
        </div>

        {/* 表格 */}
        <div className="finord-table-wrap">
          <table className="finord-table">
            <thead>
              <tr>
                <th>版本号</th>
                <th>模板名称</th>
                <th>模板ID</th>
                <th>创建人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="ecl-empty">
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
