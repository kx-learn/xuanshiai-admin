"use client";

import { useCallback, useEffect, useState } from "react";
import { X, Inbox } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { asNumber, asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

type LinkType = "empty" | "miniprogram" | "web";

interface SendRow {
  id: number;
  title: string;
  platformTpl: string;
  updatetime: string;
  /** 本地草稿内容（不会真实群发） */
  content: string;
  link_type: LinkType;
}

interface TplItem {
  no: string;
}

const DEFAULTS = { items: [] as unknown[] } as const;

const LINK_LABEL: Record<LinkType, string> = { empty: "空", miniprogram: "小程序", web: "网页" };
const SEND_UNAVAILABLE_REASON = "真实群发需接入公众号平台，暂不可用";
const TARGET_UNAVAILABLE_REASON = "群发对象选择需接入公众号粉丝分组，暂不可用";
const SCHEDULE_UNAVAILABLE_REASON = "定时群发需接入公众号平台，暂不可用";
const EXPORT_UNAVAILABLE_REASON = "群发记录导出需后端导出接口，暂不可用";

function SendDrawer({ tplList, onAddNew, onClose, onPick }: {
  tplList: TplItem[];
  onAddNew: (no: string) => void;
  onClose: () => void;
  onPick: (no: string, linkType: LinkType) => void;
}) {
  const [newNo, setNewNo] = useState("");
  const [linkType, setLinkType] = useState<LinkType>("empty");
  return (
    <div className="sd-modal-mask" onClick={onClose}>
      <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sd-modal-header">
          <span className="sd-modal-title">新建群发消息</span>
          <button type="button" className="sd-modal-close" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="sd-modal-body">
          <div className="sd-modal-notice">
            <span className="sd-notice-icon">i</span>
            <span>切勿滥用和违规使用本功能，微信模板消息违规说明</span>
          </div>

          <div className="flex items-center gap-2 pb-3">
            <select
              className="h-8 cursor-not-allowed rounded border border-[#d9d9d9] bg-white px-2 text-sm opacity-60"
              aria-label="群发分组"
              title={TARGET_UNAVAILABLE_REASON}
              disabled
              defaultValue=""
            >
              <option value="">请选择分组</option>
            </select>
            <select
              className="h-8 rounded border border-[#d9d9d9] bg-white px-2 text-sm"
              aria-label="链接类型"
              value={linkType}
              onChange={(e) => setLinkType(e.target.value as LinkType)}
            >
              <option value="empty">空</option>
              <option value="miniprogram">小程序</option>
              <option value="web">网页</option>
            </select>
            <input
              className="h-8 flex-1 rounded border border-[#d9d9d9] px-2 text-sm"
              placeholder="输入公众号平台模板编号"
              value={newNo}
              onChange={(e) => setNewNo(e.target.value)}
            />
            <button type="button" className="sd-pick-btn" onClick={() => { if (newNo.trim()) { onAddNew(newNo.trim()); setNewNo(""); } }}>
              添加
            </button>
          </div>

          <div className="sd-tpl-box">
            <div className="sd-tpl-head">
              <div className="sd-tpl-no">模板</div>
              <div className="sd-tpl-act">选择</div>
            </div>
            {tplList.length === 0 ? (
              <div className="sd-tpl-empty">暂无模板</div>
            ) : (
              tplList.map((tpl) => (
                <div key={tpl.no} className="sd-tpl-row">
                  <div className="sd-tpl-no">
                    {tpl.no}
                    <svg className="sd-tpl-help" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div className="sd-tpl-act">
                    <button type="button" className="sd-pick-btn" onClick={() => onPick(tpl.no, linkType)}>
                      确定
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WechatSendPage() {
  const domain = useConfigDomain<Dict>("wechat_mp_broadcasts", DEFAULTS as Dict);
  const mpDomain = useConfigDomain<Dict>("wechat_mp", { platform_templates: [] } as unknown as Dict);
  const [data, setData] = useState<SendRow[]>([]);
  const [platformTpls, setPlatformTpls] = useState<TplItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editing, setEditing] = useState<{ id: number; title: string; link_type: LinkType; content: string } | null>(null);

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    setData(list.map((r, i) => {
      const o = asObject(r as Dict);
      const linkRaw = asStr(o.link_type, "empty");
      return {
        id: asNumber(o.id, i + 1),
        title: asStr(o.title, ""),
        platformTpl: asStr(o.platformTpl, ""),
        updatetime: asStr(o.updatetime, ""),
        content: asStr(o.content, ""),
        link_type: (linkRaw === "miniprogram" || linkRaw === "web" ? linkRaw : "empty") as LinkType,
      };
    }));
  }, []);

  useEffect(() => { domain.reload(); mpDomain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => {
    const list = Array.isArray(mpDomain.snapshot?.config.platform_templates) ? mpDomain.snapshot!.config.platform_templates : [];
    setPlatformTpls(list.map((x) => ({ no: asStr(asObject(x as Dict).no, asStr(x as unknown as string, "")) })));
  }, [mpDomain.snapshot]);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  /** 提交并刷新视图；失败时回滚到提交前快照 */
  const persist = async (next: SendRow[], summary: string) => {
    const before = domain.snapshot?.config ?? null;
    setData(next);
    const ok = await domain.save({ items: next } as Partial<Dict>, summary);
    if (!ok) apply(before);
    return ok;
  };

  const addPlatformTpl = async (no: string) => {
    const next = [...platformTpls, { no }];
    setPlatformTpls(next);
    await mpDomain.save({ platform_templates: next } as Partial<Dict>, `添加平台模板 ${no}`);
  };

  const pickTpl = async (no: string, linkType: LinkType) => {
    const now = new Date();
    const updatetime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const ok = await persist(
      [...data, { id: Date.now(), title: "新建群发", platformTpl: no, updatetime, content: "", link_type: linkType }],
      `新建群发消息（模板 ${no}）`,
    );
    if (ok) {
      setDrawerOpen(false);
      showConfigToast("已新建群发草稿");
    } else {
      showConfigToast("新建失败，请稍后重试", "error");
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("确认删除该群发消息？")) return;
    setSelectedIds((cur) => cur.filter((x) => x !== id));
    await persist(data.filter((r) => r.id !== id), "删除群发消息");
  };

  const removeSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`确认删除已选择的 ${selectedIds.length} 条群发消息？`)) return;
    const ids = new Set(selectedIds);
    const ok = await persist(data.filter((r) => !ids.has(r.id)), "批量删除群发消息");
    if (ok) setSelectedIds([]);
  };

  const startEdit = (r: SendRow) => setEditing({ id: r.id, title: r.title, link_type: r.link_type, content: r.content });

  const saveEdit = async () => {
    if (!editing) return;
    const title = editing.title.trim();
    if (!title) {
      showConfigToast("请输入模板标题", "error");
      return;
    }
    const next = data.map((r) => (r.id === editing.id
      ? { ...r, title, link_type: editing.link_type, content: editing.content }
      : r));
    const unchanged = JSON.stringify(next) === JSON.stringify(data);
    if (unchanged) {
      setEditing(null);
      showConfigToast("没有需要保存的修改");
      return;
    }
    const ok = await persist(next, "编辑群发消息内容");
    if (ok) {
      setEditing(null);
      showConfigToast("已保存草稿");
    } else {
      showConfigToast("保存失败，请稍后重试", "error");
    }
  };

  const allChecked = data.length > 0 && selectedIds.length === data.length;

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "公众号", href: "/wechat-send", children: gzhChildren },
          { label: "消息群发" },
        ]}
      />

      {/* 须知 */}
      <div className="sd-notice">
        <div className="sd-notice-title">
          <span className="sd-notice-icon">i</span>须知
        </div>
        <div className="sd-notice-lines">
          <p>基于微信公众平台模板消息的群发系统.网站可用来给网站会员、粉丝（包括关注了公众号但未注册为网站会员的粉丝）群发推送各种通知和消息</p>
          <p>微信模板消息群发推送有别于服务号的自带群发推送，他是不受到条数限制的，合理善用本功能将给网站的营销推广带来巨大的帮助</p>
          <p>支持按照粉丝分组群发，实现精准推送</p>
          <p>可以自定义每个消息模板的链接，支持关闭链接、小程序链接、网页链接</p>
          <p>可以自由编辑消息模板的每个字段的文字内容、颜色、变量，方便灵活实现与所选择的模板进行匹配，已达到最佳的推送效果</p>
          <p>使用步骤：1、新建群发   2、编辑模板内容   3、发送</p>
        </div>
      </div>

      {/* 已创建的群发消息 */}
      <div className="admin-card">
        <div className="sd-card-head">
          <span className="sd-card-title">已创建的群发消息</span>
          <button type="button" className="sd-add-btn" onClick={() => setDrawerOpen(true)}>
            + 添加新模板
          </button>
          <button
            type="button"
            className="sd-add-btn"
            disabled
            title={EXPORT_UNAVAILABLE_REASON}
            style={{ opacity: 0.5, cursor: "not-allowed" }}
          >
            导出
          </button>
        </div>
        <div className="admin-card-body px-6 pb-6">
          {/* 表格 */}
          <div className="mt-2 overflow-auto rounded-[6px] border border-[#f0f0f0]">
            <table className="sd-table">
              <thead>
                <tr className="bg-[#fafafa]">
                  <th className="sd-th" style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      aria-label="全选"
                      checked={allChecked}
                      onChange={(e) => setSelectedIds(e.target.checked ? data.map((r) => r.id) : [])}
                    />
                  </th>
                  <th className="sd-th sd-th-id">ID</th>
                  <th className="sd-th">模板标题</th>
                  <th className="sd-th">对应公众号平台模板</th>
                  <th className="sd-th">更新时间</th>
                  <th className="sd-th sd-th-act">操作</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-0">
                      <div className="flex flex-col items-center justify-center py-16 text-sm text-[#999]">
                        <Inbox className="mb-2 h-10 w-10 text-[#d8dde6]" strokeWidth={1.2} />
                        {domain.loading ? "加载中…" : "暂无数据"}
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.map((r) => (
                    <tr key={r.id} className="border-b border-[#f0f0f0] transition-colors hover:bg-[#fafafa]">
                      <td className="sd-td" style={{ width: 40 }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id)}
                          onChange={(e) => setSelectedIds((cur) => (e.target.checked ? [...cur, r.id] : cur.filter((x) => x !== r.id)))}
                        />
                      </td>
                      <td className="sd-td sd-td-id">{r.id}</td>
                      <td className="sd-td">{r.title}</td>
                      <td className="sd-td">{r.platformTpl}</td>
                      <td className="sd-td">{r.updatetime}</td>
                      <td className="sd-td sd-td-act" style={{ whiteSpace: "nowrap" }}>
                        <button type="button" className="sd-link" onClick={() => startEdit(r)}>编辑内容</button>
                        <button
                          type="button"
                          className="sd-link"
                          disabled
                          title={SEND_UNAVAILABLE_REASON}
                          style={{ opacity: 0.5, cursor: "not-allowed" }}
                        >
                          发送
                        </button>
                        <button
                          type="button"
                          className="sd-link"
                          disabled
                          title={TARGET_UNAVAILABLE_REASON}
                          style={{ opacity: 0.5, cursor: "not-allowed" }}
                        >
                          对象选择
                        </button>
                        <button
                          type="button"
                          className="sd-link"
                          disabled
                          title={SCHEDULE_UNAVAILABLE_REASON}
                          style={{ opacity: 0.5, cursor: "not-allowed" }}
                        >
                          定时
                        </button>
                        <button type="button" className="sd-link" onClick={() => remove(r.id)}>删除</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 草稿编辑 */}
          {editing && (
            <div className="mt-4 rounded-[6px] border border-[#e5e9f2] p-4" style={{ display: "grid", gap: 10 }}>
              <div className="flex items-center gap-3">
                <span className="w-[72px] text-sm text-[#333]">模板标题</span>
                <input
                  className="h-8 flex-1 rounded border border-[#d9d9d9] px-2 text-sm outline-none focus:border-[#3658f7]"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="w-[72px] text-sm text-[#333]">链接类型</span>
                <select
                  className="h-8 rounded border border-[#d9d9d9] bg-white px-2 text-sm"
                  value={editing.link_type}
                  onChange={(e) => setEditing({ ...editing, link_type: e.target.value as LinkType })}
                >
                  <option value="empty">空</option>
                  <option value="miniprogram">小程序</option>
                  <option value="web">网页</option>
                </select>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-[72px] pt-2 text-sm text-[#333]">消息内容</span>
                <textarea
                  className="min-h-[72px] flex-1 rounded border border-[#d9d9d9] px-2 py-1.5 text-sm outline-none focus:border-[#3658f7]"
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="h-8 rounded border border-[#d9d9d9] px-4 text-sm" onClick={() => setEditing(null)}>取消</button>
                <button type="button" className="h-8 rounded bg-[#3658f7] px-4 text-sm text-white" onClick={() => void saveEdit()}>保存草稿</button>
              </div>
            </div>
          )}

          {selectedIds.length > 0 && (
            <div className="lead-bulk-toolbar">
              <span>已选择 <b>{selectedIds.length}</b> 项</span>
              <button type="button" onClick={() => void removeSelected()}>批量删除</button>
              <button type="button" onClick={() => setSelectedIds([])}>取消选择</button>
            </div>
          )}
        </div>
      </div>

      {drawerOpen && (
        <SendDrawer
          tplList={platformTpls}
          onAddNew={addPlatformTpl}
          onClose={() => setDrawerOpen(false)}
          onPick={pickTpl}
        />
      )}
    </div>
  );
}

const gzhChildren = [
  { label: "参数配置", href: "/wechat-config" },
  { label: "关注粉丝", href: "/wechat-fans" },
  { label: "菜单配置", href: "/wechat-menu" },
  { label: "自动回复", href: "/wechat-autoreply" },
  { label: "模板消息", href: "/wechat-template" },
  { label: "消息群发", href: "/wechat-send" },
];
