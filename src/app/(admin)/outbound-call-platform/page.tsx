"use client";
import { useEffect, useRef, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { useConfigDomain, showConfigToast, asStr, type Dict } from "@/lib/platform-config";

const providers = ["建讯通讯", "厚朴通讯", "云客"];

export default function Page() {
  const [provider, setProvider] = useState(providers[0]);
  const [account, setAccount] = useState("");
  const [center, setCenter] = useState("");
  const [record, setRecord] = useState("https://node-api-gz-hunlian01.puntel.com");
  const domain = useConfigDomain<Dict>("sys_outbound", {});
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
    setProvider(asStr(c.provider, providers[0]));
    setAccount(asStr(c.account_name, ""));
    setCenter(asStr(c.call_center_url, ""));
    setRecord(asStr(c.record_download_url, "https://node-api-gz-hunlian01.puntel.com"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.ready]);

  const flush = async (summary = "自动保存外呼平台") => {
    const ok = await domain.save(
      { provider, account_name: account, call_center_url: center, record_download_url: record },
      summary,
    );
    if (!ok && domain.error) showConfigToast(domain.error, "error");
    return ok;
  };
  const flushRef = useRef(flush);
  flushRef.current = flush;

  useEffect(() => {
    if (!domain.ready || !loaded.current) return;
    const timer = setTimeout(() => void flushRef.current(), 700);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, account, center, record]);

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
          { label: "电话外呼" },
          { label: "外呼平台" },
        ]}
      />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">通知</p>
          <p className="obc-notice-desc">
            本系统集成了多家外呼服务商供您选择。并且您可以随时在已开户的服务商中自由切换。
            <br />
            每个平台服务商需要独立办理开户手续，同时只能启用1家服务商，每家服务商的坐席根据您的开户情况独立配置
          </p>
        </div>
      </div>

      <div className="admin-card obc-card">
        <div className="obc-head">外呼平台</div>
        <div className="obc-body">
          <div className="obc-form">
            <div className="sy-row">
              <label className="sy-label">外呼平台服务商</label>
              <div className="obc-radio-wrap">
                {providers.map((name) => (
                  <label key={name} className="pcfg-radio">
                    <input
                      type="radio"
                      name="provider"
                      checked={provider === name}
                      onChange={() => setProvider(name)}
                    />
                    <span className="pcfg-radio-dot"></span>
                    <span className="pcfg-radio-label">{name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="sy-row">
              <label className="sy-label">{provider}外呼账户名称</label>
              <div className="sy-ctrl">
                <input className="sy-input obc-input" value={account} onChange={(e) => setAccount(e.target.value)} placeholder={`请输入${provider}外呼账户名称`} />
              </div>
            </div>

            <div className="sy-row">
              <label className="sy-label">{provider}外呼呼叫中心地址</label>
              <div className="sy-ctrl">
                <input className="sy-input obc-input" value={center} onChange={(e) => setCenter(e.target.value)} placeholder={`请输入${provider}外呼呼叫中心地址`} />
              </div>
            </div>

            <div className="sy-row">
              <label className="sy-label">录音下载地址</label>
              <div className="sy-ctrl">
                <input
                  className="sy-input obc-input obc-input-readonly"
                  value={record}
                  onChange={(e) => setRecord(e.target.value)}
                  readOnly
                />
              </div>
            </div>

            <div className="obc-actions">
              <button
                type="button"
                className="obc-save"
                onClick={async () => {
                  const ok = await flushRef.current("保存外呼平台配置");
                  if (ok) showConfigToast("已保存");
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
