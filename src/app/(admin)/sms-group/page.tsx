"use client";
import { useCallback, useEffect, useState } from "react";
import { Inbox, X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

const DEFAULTS = { items: [] as unknown[] } as const;

interface BroadcastRow {
  id: number;
  name: string;
  created_at: string | null;
  target: string;
  phones: string;
  status: string;
  content: string;
  scheduled_at: string | null;
}

const columns = [
  "任务名称",
  "创建时间",
  "发送对象",
  "手机号码清单",
  "任务状态",
  "发送统计",
  "发送明细",
  "操作",
];

const now = () => {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")} ${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
};

export default function Page() {
  const domain = useConfigDomain<Dict>("sms_broadcasts", DEFAULTS as Dict);
  const [rows, setRows] = useState<BroadcastRow[]>([]);
  const [creating, setCreating] = useState(false);

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    setRows(list.map((r, i) => {
      const o = asObject(r as Dict);
      return {
        id: Number(o.id ?? i + 1),
        name: asStr(o.name, ""),
        created_at: asStr(o.created_at, "") || null,
        target: asStr(o.target, "全部会员"),
        phones: asStr(o.phones, ""),
        status: asStr(o.status, "待发送"),
        content: asStr(o.content, ""),
        scheduled_at: asStr(o.scheduled_at, "") || null,
      };
    }));
  }, []);

  useEffect(() => { domain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const persist = async (next: BroadcastRow[], summary: string) => {
    setRows(next);
    const ok = await domain.save({ items: next } as Partial<Dict>, summary);
    if (ok) showConfigToast("已保存");
    else if (domain.error) showConfigToast(domain.error, "error");
  };

  const remove = async (id: number) => {
    if (!window.confirm("确认删除该群发任务？")) return;
    await persist(rows.filter((r) => r.id !== id), "删除短信群发任务");
  };

  return (
    <div className="grp-page">
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
          { label: "短信群发" },
        ]}
      />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">须知</p>
          <p className="obc-notice-desc">本系统整合开发了腾讯短信的群发功能，可以对指定的用户群发各种合规短信内容，提升平台与用户的连接</p>
        </div>
      </div>

      <div className="admin-card grp-card">
        <div className="grp-head">
          <h2 className="grp-title">短信群发</h2>
          <div className="grp-actions">
            <button type="button" className="grp-btn" onClick={() => setCreating(true)}>
              <span className="grp-btn-plus">+</span> 创建群发任务
            </button>
            <button type="button" className="grp-btn" onClick={() => showConfigToast("短信充值需接入短信服务商后可用", "error")}>
              <svg className="grp-btn-ico" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2.5A4.5 4.5 0 0 1 12.5 8H8V4.5A4.5 4.5 0 0 1 8 3.5z" />
              </svg>
              短信充值
            </button>
            <button type="button" className="grp-btn" onClick={() => showConfigToast("群发模板需提交短信服务商审核", "error")}>
              <svg className="grp-btn-ico" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.5 2.5h8l3 3v8h-11v-11zM9 4v3h3M4 9h8M4 11h8M4 7h2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
              </svg>
              提交群发模板
            </button>
          </div>
        </div>

        <div className="grp-table-wrap">
          <table className="grp-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="grp-empty">
                      <Inbox className="grp-empty-icon" />
                      <span className="grp-empty-text">{domain.loading ? "加载中…" : "暂无数据"}</span>
                    </div>
                  </td>
                </tr>
              ) : rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.created_at ? r.created_at.replace("T", " ").slice(0, 19) : "-"}</td>
                  <td>{r.target}</td>
                  <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.phones}>{r.phones || "-"}</td>
                  <td>{r.scheduled_at ? `定时 ${r.scheduled_at.replace("T", " ").slice(0, 16)}` : r.status}</td>
                  <td>{r.status === "已发送" ? "已发送" : "-"}</td>
                  <td>
                    <button type="button" className="text-[#3658f7] text-sm cursor-pointer bg-transparent border-none p-0" onClick={() => showConfigToast("发送明细需短信服务商回执后生成", "error")}>明细</button>
                  </td>
                  <td>
                    <button type="button" className="text-[#ff4d4f] text-sm cursor-pointer bg-transparent border-none p-0" onClick={() => remove(r.id)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {creating && (
        <CreateModal
          onClose={() => setCreating(false)}
          onSave={async (row) => {
            setCreating(false);
            await persist([...rows, row], `创建短信群发任务「${row.name}」`);
          }}
        />
      )}
    </div>
  );
}

function CreateModal({ onClose, onSave }: { onClose: () => void; onSave: (row: BroadcastRow) => void }) {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("全部会员");
  const [phones, setPhones] = useState("");
  const [content, setContent] = useState("");
  const [timed, setTimed] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  return (
    <div className="ec-modal-mask" onClick={onClose}>
      <div className="ec-modal" style={{ maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal-header">
          <span className="ec-modal-title">创建群发任务</span>
          <button type="button" className="ec-modal-close" aria-label="关闭" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="ec-modal-body">
          <div className="ec-row">
            <span className="ec-key">任务名称</span>
            <input className="ec-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入任务名称" />
          </div>
          <div className="ec-row">
            <span className="ec-key">发送对象</span>
            <select className="ec-input" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="全部会员">全部会员</option>
              <option value="全部红娘">全部红娘</option>
              <option value="指定手机号">指定手机号</option>
            </select>
          </div>
          {target === "指定手机号" && (
            <div className="ec-row">
              <span className="ec-key">手机号码</span>
              <textarea className="ec-input" rows={2} value={phones} onChange={(e) => setPhones(e.target.value)} placeholder="多个号码用英文逗号分隔" />
            </div>
          )}
          <div className="ec-row">
            <span className="ec-key">短信内容</span>
            <textarea className="ec-input" rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="请输入短信内容" />
          </div>
          <div className="ec-row">
            <span className="ec-key">定时发送</span>
            <div className="flex items-center gap-2">
              <button type="button" className={`tm-switch${timed ? " on" : ""}`} onClick={() => setTimed((v) => !v)}>
                <span className="tm-switch-text">{timed ? "开" : "关"}</span>
                <span className="tm-switch-knob" />
              </button>
              {timed && <input type="datetime-local" className="ec-input" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />}
            </div>
          </div>
          <div className="ec-row">
            <span className="ec-key" />
            <span className="text-xs text-[#999]">任务创建后进入队列；实际下发需接入短信服务商</span>
          </div>
        </div>
        <div className="ec-modal-footer">
          <button type="button" className="ec-cancel" onClick={onClose}>取消</button>
          <button
            type="button"
            className="ec-ok"
            onClick={() => {
              if (!name.trim()) { showConfigToast("请填写任务名称", "error"); return; }
              if (!content.trim()) { showConfigToast("请填写短信内容", "error"); return; }
              onSave({
                id: Date.now(),
                name: name.trim(),
                created_at: now(),
                target,
                phones: phones.trim(),
                status: timed ? "待定时发送" : "待发送",
                content: content.trim(),
                scheduled_at: timed && scheduledAt ? scheduledAt : null,
              });
            }}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
