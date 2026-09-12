"use client";
import { useEffect, useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { useConfigDomain, asStr, showConfigToast, type Dict } from "@/lib/platform-config";

export default function Page() {
  const domain = useConfigDomain<Dict>("sys_sms", {
    signature: "",
    send_enabled: true,
    notices: [],
  } as unknown as Dict);
  const [signature, setSignature] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void domain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!domain.ready || !domain.snapshot) return;
    const c = domain.snapshot.config as Dict;
    setSignature(asStr(c.signature, ""));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.ready]);

  // 改动即自动保存（debounced）
  const firstRender = useRef(true);
  useEffect(() => {
    if (!domain.ready || !loaded.current) return;
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      const c = (domain.snapshot?.config ?? {}) as Dict;
      const ok = await domain.save(
        { signature, send_enabled: c.send_enabled ?? true, notices: c.notices ?? [] },
        "更新短信签名",
      );
      if (!ok && domain.error) showConfigToast(domain.error, "error");
      else showConfigToast("短信签名已保存", "ok");
    }, 800);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  return (
    <div className="obc-page">
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          {
            label: "系统管理",
            href: "/system-setting-basic",
            children: [
              { label: "系统配置", href: "/system-setting-basic" },
              { label: "广告管理", href: "/system-setting-adconfig" },
              { label: "外呼平台", href: "/outbound-call-platform" },
              { label: "外呼状态", href: "/out-call-list" },
              { label: "呼叫记录", href: "/out-call-record" },
              { label: "签名配置", href: "/sms-signature" },
              { label: "通知配置", href: "/sms-notices" },
              { label: "短信群发", href: "/sms-group" },
              { label: "发送记录", href: "/sms-record" },
              { label: "添加账号", href: "/system-setting-admin-user-add" },
              { label: "账号管理", href: "/system-setting-admin-user" },
              { label: "权限分组", href: "/system-setting-admin-group" },
              { label: "系统日志", href: "/system-setting-admin-log" },
            ],
          },
          { label: "短信系统" },
          { label: "签名配置" },
        ]}
      />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">须知</p>
          <p className="obc-notice-desc">
            短信签名是指显示在短信开通的内容，本系统接入腾讯云短信接口，根据国家相关法律和腾讯规则，短信签名可以是备案域名的公司名称、注册商标名称。
            <br />
            请对接系统服务商进行授权委托协助您腾讯公司完成短信签名的申请，待腾讯审核通过后即可正常使用
          </p>
          <p className="obc-notice-desc">相关政策：签名实名制报备 签名审核标准</p>
        </div>
      </div>

      <div className="admin-card obc-card">
        <div className="obc-head">短信签名</div>
        <div className="obc-body">
          <div className="obc-form">
            <div className="sy-row">
              <label className="sy-label">您的短信签名</label>
              <div className="sy-ctrl">
                <input
                  className="sy-input obc-input"
                  value={signature}
                  maxLength={32}
                  onChange={(e) => setSignature(e.target.value)}
                />
              </div>
            </div>

            <div className="sign-info">
              <svg className="sign-info-i" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.9 12.1H7.1V7.2h1.8v4.9zM8 5.9a1.05 1.05 0 1 1 0-2.1 1.05 1.05 0 0 1 0 2.1z" />
              </svg>
              <span>修改签名后将自动保存到配置，无需点击按钮</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
