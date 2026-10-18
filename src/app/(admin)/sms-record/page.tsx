"use client";
import { useCallback, useEffect, useState } from "react";
import { Inbox } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { asNumber, asObject, asStr, useConfigDomain, type Dict } from "@/lib/platform-config";

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

  const [showErrors, setShowErrors] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const okCount = rows.filter((r) => r.status === "成功").length;
  const failCount = rows.length - okCount;
  const failureReasons = Object.entries(
    rows.filter((r) => r.status !== "成功").reduce<Record<string, number>>((acc, r) => {
      const key = r.reason || r.status || "未知原因";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([reason, count]) => ({ reason, count }));

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
          <button type="button" className="srec-recharge" disabled title="后端暂无短信充值接口，接入短信服务商充值能力后开放">在线充值</button>
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
          <button type="button" className="srec-query" aria-expanded={showErrors} onClick={() => setShowErrors((v) => !v)}>错误码查询</button>
        </div>

        {showErrors && (
          <div className="syslog-table-wrap">
            <table className="syslog-table">
              <thead>
                <tr><th>失败原因</th><th style={{ width: 90 }}>次数</th></tr>
              </thead>
              <tbody>
                {failureReasons.length === 0 ? (
                  <tr><td colSpan={2} style={{ textAlign: "center", color: "#999" }}>暂无失败记录</td></tr>
                ) : failureReasons.map((item) => (
                  <tr key={item.reason}>
                    <td>{item.reason}</td>
                    <td>{item.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "8px 0", fontSize: 12, color: "#666" }}>
              完整错误码说明请参考 <a href="https://cloud.tencent.com/document/product/382" target="_blank" rel="noreferrer" style={{ color: "#3658f7" }}>腾讯云短信文档</a>
            </div>
          </div>
        )}

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
                  <th><input type="checkbox" aria-label="全选发送记录" checked={rows.length > 0 && selectedIds.length === rows.length} onChange={(event) => setSelectedIds(event.target.checked ? rows.map((r) => r.id) : [])} /></th>
                  {columns.map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><input type="checkbox" aria-label={`选择发送记录 ${r.phone}`} checked={selectedIds.includes(r.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, r.id] : current.filter((id) => id !== r.id))} /></td>
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
        {selectedIds.length > 0 && <div className="lead-bulk-toolbar"><span>已选择 <b>{selectedIds.length}</b> 项</span><button type="button" onClick={() => setSelectedIds([])}>取消选择</button></div>}
      </div>
    </div>
  );
}
