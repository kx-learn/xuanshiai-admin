"use client";
import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "财务管理", href: "/finance-config" },
  { label: "电子合同", href: "/e-contract-config" },
  { label: "合同配置" },
];

export default function EContractConfigPage() {
  const [enabled, setEnabled] = useState(false);

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
            <p>本系统接入了腾讯电子签合同系统，您可以在本系统内灵活方便的使用腾讯电子签系统，快速与客户完成线上合同的发起、签署、和管理。电子签功能与服务由腾讯提供，腾讯电子签官网：https://qian.tencent.com/</p>
            <p>1、您可以根据您的运营需求自行设置是否启用腾讯电子签系统</p>
            <p>2、在下面正确填写企业名称、信用代码、法人代表，先点击"确定提交"，然后点击"授权电子签"，按照指引完成授权开通流程</p>
            <p>3、在模板管理中创建您的合同模板，您至少需要创建两份合同模板，创建成功后配置到本页面</p>
            <p>4、使用腾讯电子签您需在本系统内按合同份数进行充值，若合同剩余份数为0则无法正常使用</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        {/* 卡片头部 */}
        <div className="ecc-head">
          <div className="crh-title">合同配置</div>
          <div className="ecc-links">
            <button className="ecc-link">配置使用教程</button>
            <button className="ecc-link">客户签署流程演示</button>
          </div>
          <button className="finord-btn finord-btn-primary ecc-auth">授权电子签</button>
        </div>

        {/* 表单 */}
        <div className="ecc-form">
          <div className="ecc-row">
            <span className="ecc-label">腾讯电子签系统</span>
            <label className="ecc-radio">
              <input
                type="radio"
                name="ecc-enable"
                checked={enabled}
                onChange={() => setEnabled(true)}
              />
              <span>开启</span>
            </label>
            <label className="ecc-radio">
              <input
                type="radio"
                name="ecc-enable"
                checked={!enabled}
                onChange={() => setEnabled(false)}
              />
              <span>关闭</span>
            </label>
          </div>

          <button className="ecc-submit">确定提交</button>
        </div>
      </div>
    </div>
  );
}
