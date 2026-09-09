"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const links = [
  { label: "授权版本", value: <>高级版</> },
  { label: "授权机构", value: <>宜春爱</> },
  { label: "运营区域", value: <>江苏省 南京市</> },
  { label: "区域保护", value: <>无</> },
  { label: "授权域名", value: <>www.xuanshiai.com, xuanshiai.163kyun.com</> },
  { label: "授权期限", value: <>2027年04月30日 还有233天授权到期</> },
  { label: "授权产品", value: <>《163K相亲系统》SaaS</> },
  { label: "授权协议", value: <>未上传</> },
  { label: "客户经理", value: <>小丽</> },
  { label: "技术维护", value: <>崔工</> },
  {
    label: "产品官网",
    value: (
      <>
        <a href="http://www.163kyun.com" target="_blank" rel="noreferrer">http://www.163kyun.com</a>&nbsp;&nbsp;<a href="http://www.163k.com" target="_blank" rel="noreferrer">http://www.163k.com</a>
      </>
    ),
  },
];

export default function SystemEmpowerPage() {
  return (
    <div className="service-page">
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "官方服务" },
          { label: "软件授权" },
        ]}
      />
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="font-medium text-base">软件授权</span>
        </div>
        <div className="admin-card-body">
          <div className="license-info">
            {links.map((item) => (
              <div key={item.label} className="license-field">
                <span className="license-label">{item.label}</span>
                <span className="license-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
