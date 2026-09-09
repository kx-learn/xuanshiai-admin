"use client";
import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { User, Armchair, Clock, Phone, Inbox, X } from "lucide-react";
import { asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

const SEATS_DEFAULTS = { items: [] as unknown[] } as const;
const OUTBOUND_DEFAULTS = { provider: null, account_name: null, call_center_url: null, record_download_url: null } as const;

interface SeatRow {
  id: number;
  code: string;
  status: string;
  phone: string;
  matchmaker: string;
  call_count: number;
  connected_count: number;
  total_seconds: number;
}

const columns = [
  "坐席工号",
  "坐席状态",
  "外呼号码",
  "绑定服务红娘",
  "呼出次数",
  "接通次数",
  "呼出通话总时长",
  "平均时长",
  "本月呼出通话总时长",
  "当天呼出次数",
  "当天呼出时长",
  "操作",
];

const fmtSeconds = (s: number) => (s > 0 ? `${s}秒` : "0秒");

export default function Page() {
  const seatsDomain = useConfigDomain<Dict>("outbound_seats", SEATS_DEFAULTS as Dict);
  const outboundDomain = useConfigDomain<Dict>("sys_outbound", OUTBOUND_DEFAULTS as Dict);
  const [seats, setSeats] = useState<SeatRow[]>([]);
  const [adding, setAdding] = useState(false);

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    setSeats(list.map((r, i) => {
      const o = asObject(r as Dict);
      return {
        id: Number(o.id ?? i + 1),
        code: asStr(o.code, ""),
        status: asStr(o.status, "空闲"),
        phone: asStr(o.phone, ""),
        matchmaker: asStr(o.matchmaker, ""),
        call_count: Number(o.call_count ?? 0),
        connected_count: Number(o.connected_count ?? 0),
        total_seconds: Number(o.total_seconds ?? 0),
      };
    }));
  }, []);

  useEffect(() => {
    seatsDomain.reload();
    outboundDomain.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { apply(seatsDomain.snapshot?.config ?? null); }, [seatsDomain.snapshot, apply]);

  const provider = asStr(outboundDomain.snapshot?.config.provider, "未配置");
  const accountName = asStr(outboundDomain.snapshot?.config.account_name, "未开通服务");

  const totalCalls = seats.reduce((s, r) => s + r.call_count, 0);
  const totalSeconds = seats.reduce((s, r) => s + r.total_seconds, 0);
  const monthSeconds = totalSeconds; // 占位数据源暂不区分月份，接入服务商后按月统计

  const cards = [
    { key: "a", label: "外呼服务商", value: provider, color: "#3658f7", icon: User },
    { key: "b", label: "外呼账号", value: accountName, color: "#b0b7c2", icon: null },
    { key: "c", label: "坐席数量", value: String(seats.length), color: "#fa8c16", icon: Armchair },
    { key: "d", label: "所有坐席通话总时长", value: fmtSeconds(totalSeconds), color: "#722ed1", icon: Clock },
    { key: "e", label: "本月通话总时长", value: fmtSeconds(monthSeconds), color: "#f5222d", icon: Phone },
  ];

  const persist = async (next: SeatRow[], summary: string) => {
    setSeats(next);
    const ok = await seatsDomain.save({ items: next } as Partial<Dict>, summary);
    if (ok) showConfigToast("已保存");
    else if (seatsDomain.error) showConfigToast(seatsDomain.error, "error");
  };

  const removeSeat = async (id: number) => {
    if (!window.confirm("确认删除该坐席？")) return;
    await persist(seats.filter((r) => r.id !== id), "删除外呼坐席");
  };

  return (
    <div className="oc-page">
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
          { label: "外呼状态" },
        ]}
      />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">须知</p>
          <p className="obc-notice-desc">
            智能云呼（简称外呼系统）适用于需要频繁使用电话方式进行客户沟通、邀约到店的业务。能够更加规范化的管理公司的内部运营管理和业务能力提升。并有助于提高客户服务质量和业务成单率；
            <br />
            本系统将第三方的外呼服务深入开发整合融入到了自身的会员CRM中，不必在通过第三方平台维护客户数据和进行呼叫。仅需在本系统中即可一站式完成所有电销流程，大大提升您的工作效能；
            <br />
            开通使用外呼系统需联系本系统所对接的第三方通信线路服务商办理开户手续并充值话费，并由通信服务商为您提供相关所有服务和使用指导.更加详细数据报表可登录外呼服务商平台查看。
          </p>
        </div>
      </div>

      <div className="oc-stats">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="oc-stat">
              <div className="oc-stat-top">
                {Icon && (
                  <span className="oc-stat-icon" style={{ background: card.color }}>
                    <Icon className="oc-stat-svg" />
                  </span>
                )}
                <span className="oc-stat-label">{card.label}</span>
              </div>
              <div className="oc-stat-value">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="admin-card oc-card">
        <div className="oc-head">
          <h2 className="oc-title">外呼状态</h2>
          <button className="oc-add" onClick={() => setAdding(true)}>
            <span className="oc-add-plus">+</span> 添加坐席
          </button>
        </div>
        <div className="oc-body">
          <div className="oc-table-scroll">
            <table className="oc-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seats.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="oc-empty">
                      <Inbox className="oc-empty-icon" />
                      <span>{seatsDomain.loading ? "加载中…" : "暂无数据"}</span>
                    </td>
                  </tr>
                ) : seats.map((r) => (
                  <tr key={r.id}>
                    <td>{r.code}</td>
                    <td>{r.status}</td>
                    <td>{r.phone || "-"}</td>
                    <td>{r.matchmaker || "-"}</td>
                    <td>{r.call_count}</td>
                    <td>{r.connected_count}</td>
                    <td>{fmtSeconds(r.total_seconds)}</td>
                    <td>{r.call_count > 0 ? fmtSeconds(Math.round(r.total_seconds / r.call_count)) : "0秒"}</td>
                    <td>{fmtSeconds(r.total_seconds)}</td>
                    <td>0</td>
                    <td>0秒</td>
                    <td>
                      <button type="button" className="text-[#ff4d4f] hover:text-[#ff7875] text-sm cursor-pointer bg-transparent border-none p-0" onClick={() => removeSeat(r.id)}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {adding && (
        <SeatModal
          onClose={() => setAdding(false)}
          onSave={async (row) => {
            setAdding(false);
            await persist([...seats, row], `添加外呼坐席「${row.code}」`);
          }}
        />
      )}
    </div>
  );
}

function SeatModal({ onClose, onSave }: { onClose: () => void; onSave: (row: SeatRow) => void }) {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [matchmaker, setMatchmaker] = useState("");
  return (
    <div className="ec-modal-mask" onClick={onClose}>
      <div className="ec-modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal-header">
          <span className="ec-modal-title">添加坐席</span>
          <button type="button" className="ec-modal-close" aria-label="关闭" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ec-modal-body">
          <div className="ec-row">
            <span className="ec-key">坐席工号</span>
            <input className="ec-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="请输入坐席工号" />
          </div>
          <div className="ec-row">
            <span className="ec-key">外呼号码</span>
            <input className="ec-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入外呼号码" />
          </div>
          <div className="ec-row">
            <span className="ec-key">绑定服务红娘</span>
            <input className="ec-input" value={matchmaker} onChange={(e) => setMatchmaker(e.target.value)} placeholder="请输入绑定的服务红娘姓名" />
          </div>
        </div>
        <div className="ec-modal-footer">
          <button type="button" className="ec-cancel" onClick={onClose}>取消</button>
          <button
            type="button"
            className="ec-ok"
            onClick={() => {
              if (!code.trim()) { showConfigToast("请填写坐席工号", "error"); return; }
              onSave({ id: Date.now(), code: code.trim(), status: "空闲", phone: phone.trim(), matchmaker: matchmaker.trim(), call_count: 0, connected_count: 0, total_seconds: 0 });
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
