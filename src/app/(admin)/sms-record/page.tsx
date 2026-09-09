"use client";
import { useCallback, useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { asNumber, asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

const DEFAULTS = { items: [] as unknown[], balance: 0, provider: "腾讯云专线" } as const;

interface SendRow {
  id: number;
  phone: string;
  scene: string;
  status: string;
  sent_at: string | null;
  reason: string;
}

const columns = ["手机号", "发送场景", "发送状态", "发送时间", "失败原因"];

export default function Page() {
  const domain = useConfigDomain<Dict>("sms_send_records", DEFAULTS as Dict);
  const [rows, setRows] = useState<SendRow[]>([]);
  const [balance, setBalance] = useState(0);
  const [provider, setProvider] = useState("腾讯云专线");

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    setRows(list.map((r, i) => {
      const o = asObject(r as Dict);
      return {
        id: Number(o.id ?? i + 1),
        phone: asStr(o.phone, ""),
        scene: asStr(o.scene, ""),
        status: asStr(o.status, "成功"),
        sent_at: asStr(o.sent_at, "") || null,
        reason: asStr(o.reason, ""),
      };
    }));
    setBalance(asNumber(config?.balance, 0));
    setProvider(asStr(config?.provider, "腾讯云专线"));
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const okCount = rows.filter((r) => r.status === "成功").length;
  const failCount = rows.length - okCount;

  return (
    <div className="rec-page">
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
          { label: "发送记录" },
        ]}
      />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">须知</p>
          <p className="obc-notice-desc">本系统接入腾讯云短信接口，短信请求发出后，经由腾讯短信平台提交至通信运营商（此步骤成功即扣除条数），运营商再下发至客户接收端。</p>
          <p className="obc-notice-desc">1、短信因接收端空号/停机、签名问题、短信违规被拦截导致发送失败，此类情况因腾讯平台已成功提交至运营商，会扣除条数。</p>
          <p className="obc-notice-desc">2、短信因频率超限、缺少参数、无效app凭证、网络故障导致发送失败，此类情况属于腾讯平台提交失败，不会扣除条数。</p>
        </div>
      </div>

      <div className="srec-stats">
        <div className="srec-stat srec-stat-line">
          <span className="srec-stat-label">当前线路：{provider}</span>
        </div>
        <div className="srec-stat">
          <span className="srec-stat-label">短信余量：<span className="srec-num srec-num-blue">{balance}条</span></span>
          <button type="button" className="srec-recharge" onClick={() => showConfigToast("在线充值需接入短信服务商后可用", "error")}>在线充值</button>
        </div>
        <div className="srec-stat">
          <span className="srec-stat-label">发送成功：<span className="srec-num srec-num-green">{okCount}条</span></span>
        </div>
        <div className="srec-stat">
          <span className="srec-stat-label">发送失败：<span className="srec-num srec-num-red">{failCount}条</span></span>
        </div>
      </div>

      <div className="admin-card srec-card">
        <div className="srec-head">
          <h2 className="srec-title">发送记录</h2>
          <button type="button" className="srec-query" onClick={() => showConfigToast("错误码表可参考腾讯云短信文档", "error")}>错误码查询</button>
        </div>

        {rows.length === 0 ? (
          <div className="srec-empty">
            <Inbox className="srec-empty-icon" />
            <span className="srec-empty-text">{domain.loading ? "加载中…" : "暂无发送记录（接入短信服务商后自动生成）"}</span>
          </div>
        ) : (
          <div className="syslog-table-wrap">
            <table className="syslog-table">
              <thead>
                <tr>
                  {columns.map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.phone}</td>
                    <td>{r.scene || "-"}</td>
                    <td>
                      <span className={r.status === "成功" ? "inline-block px-2 py-0.5 text-xs rounded bg-[#f6ffed] text-[#52c41a] border border-[#b7eb8f]" : "inline-block px-2 py-0.5 text-xs rounded bg-[#fff1f0] text-[#ff4d4f] border border-[#ffa39e]"}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.sent_at ? r.sent_at.replace("T", " ").slice(0, 19) : "-"}</td>
                    <td>{r.reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
