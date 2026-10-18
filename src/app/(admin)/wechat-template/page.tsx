"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { asNumber, asObject, asStr, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

interface TemplateRow {
  id: number;
  title: string;
  member: string;
  recNo: string;
  event: string;
  receiver: string;
  platformTpl: string;
  enabled: boolean;
  config_fields: { key: string; content: string; color: string }[];
  link_type: string;
  link_url: string;
}

interface TplItem {
  no: string;
}

const DEFAULTS = { items: [] as unknown[] } as const;

const SEED_ROWS: Omit<TemplateRow, "id">[] = [
  {
    title: "奖品兑换成功通知", member: "兑换会员", recNo: "OPENtMD2D7327376",
    event: "拼分商城用兑换礼品成功后通知申请人", receiver: "前台会员", platformTpl: "", enabled: true,
    config_fields: [
      { key: "first", content: "{{会员昵称}}您申请的兑换礼品已成功", color: "#000000" },
      { key: "keyword1", content: "{{兑换礼物名称}}", color: "#000000" },
      { key: "keyword2", content: "{{兑换积分}}", color: "#000000" },
      { key: "keyword3", content: "{{剩余积分}}", color: "#000000" },
      { key: "keyword4", content: "{{兑换时间}}", color: "#000000" },
      { key: "remark", content: "感谢您对本站的支持，祝您生活愉快！", color: "#000000" },
    ],
    link_type: "网页", link_url: "{{SiteUrl}}/subpages/gift/exchange",
  },
  {
    title: "账户资金变动提醒", member: "财务", recNo: "OPENtMD415437054",
    event: "账号的余额发生变动的时候发送通知消息给会员", receiver: "前台会员", platformTpl: "", enabled: true,
    config_fields: [
      { key: "first", content: "您的账户资金发生变动", color: "#000000" },
      { key: "keyword1", content: "{{变动类型}}", color: "#000000" },
      { key: "keyword2", content: "{{变动金额}}", color: "#000000" },
      { key: "keyword3", content: "{{账户余额}}", color: "#000000" },
      { key: "remark", content: "如非本人操作请及时联系客服。", color: "#000000" },
    ],
    link_type: "网页", link_url: "{{SiteUrl}}/member/wallet",
  },
];

/** 从模板字段与链接中提取其自身使用的 {{变量}} 名（去重，保持出现顺序） */
function extractTemplateVars(texts: string[]): string[] {
  const found: string[] = [];
  for (const text of texts) {
    for (const m of text.matchAll(/\{\{([^{}]+)\}\}/g)) {
      const name = m[1].trim();
      if (name && !found.includes(name)) found.push(name);
    }
  }
  return found;
}

function TplModal({ tplList, onAddNew, onDelete, onClose, onPick, onClear, hasCurrent }: {
  tplList: TplItem[];
  onAddNew: (no: string) => void;
  onDelete: (no: string) => void;
  onClose: () => void;
  onPick: (no: string) => void;
  onClear: () => void;
  hasCurrent: boolean;
}) {
  const [newNo, setNewNo] = useState("");
  return (
    <div className="tm-modal-mask" onClick={onClose}>
      <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tm-modal-header">
          <span className="tm-modal-title">选择模板</span>
          <button type="button" className="tm-modal-close" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="tm-modal-body">
          <div className="tm-modal-notice">
            <div className="tm-modal-notice-text">
              <span className="tm-notice-icon">i</span>
              如果选择模板清单中没有这个模板，应该在这里添加。
            </div>
            <div className="flex items-center gap-2">
              <input
                className="h-8 rounded border border-[#d9d9d9] px-2 text-sm"
                placeholder="输入公众号平台模板编号"
                value={newNo}
                onChange={(e) => setNewNo(e.target.value)}
              />
              <button type="button" className="tm-add-btn" onClick={() => { if (newNo.trim()) { onAddNew(newNo.trim()); setNewNo(""); } }}>
                + 添加新模板
              </button>
            </div>
          </div>

          <div className="tm-tpl-box">
            <div className="tm-tpl-row tm-tpl-head">
              <div className="tm-tpl-no">模板</div>
              <div className="tm-tpl-act">操作</div>
            </div>
            {tplList.length === 0 ? (
              <div className="tm-tpl-empty">暂无模板</div>
            ) : (
              tplList.map((tpl) => (
                <div key={tpl.no} className="tm-tpl-row">
                  <div className="tm-tpl-no">{tpl.no}</div>
                  <div className="tm-tpl-act" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                    <button type="button" className="tm-pick-btn" onClick={() => onPick(tpl.no)}>
                      选择
                    </button>
                    <button type="button" className="tm-link" onClick={() => onDelete(tpl.no)}>
                      删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          {hasCurrent && (
            <div className="mt-4 flex justify-end">
              <button type="button" className="tm-link" onClick={onClear}>
                清除当前模板
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditConfigModal({ row, onClose, onSave }: { row: TemplateRow; onClose: () => void; onSave: (patch: Partial<TemplateRow>) => void }) {
  const [name, setName] = useState(row.title);
  const [fields, setFields] = useState(row.config_fields);
  const [linkType, setLinkType] = useState(row.link_type);
  const [linkUrl, setLinkUrl] = useState(row.link_url);

  const updateField = (index: number, patch: Partial<{ key: string; content: string; color: string }>) => {
    setFields((cur) => cur.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  /** 本模板自身已使用的变量名（来自字段内容与链接地址） */
  const templateVars = extractTemplateVars([...fields.map((f) => f.content), linkUrl]);

  const insertVar = (index: number, varName: string) => {
    setFields((cur) => cur.map((f, i) => (i === index ? { ...f, content: `${f.content}{{${varName}}}` } : f)));
  };

  const addRow = () => {
    setFields((cur) => [...cur, { key: `keyword${cur.filter((f) => f.key.startsWith("keyword")).length + 1}`, content: "", color: "#000000" }]);
  };

  const first = fields.find((f) => f.key === "first");
  const remark = fields.find((f) => f.key === "remark");

  return (
    <div className="ec-modal-mask" onClick={onClose}>
      <div className="ec-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal-header">
          <span className="ec-modal-title">编辑配置</span>
          <button type="button" className="ec-modal-close" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="ec-modal-body">
          <div className="ec-notice">
            <span className="ec-notice-icon">i</span>
            <span>切勿在微信推送模板中配置违反微信规则的内容或链接，微信模板消息违规说明</span>
          </div>

          <div className="ec-columns">
            <div className="ec-form">
              <div className="ec-sid">模板ID</div>

              <div className="ec-row">
                <span className="ec-key">名称</span>
                <input className="ec-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              {fields.map((f, idx) => (
                <div key={`${f.key}-${idx}`} className="ec-row">
                  <span className="ec-key">{f.key}</span>
                  <input
                    className="ec-input"
                    value={f.content}
                    onChange={(e) => updateField(idx, { content: e.target.value })}
                  />
                  <label className="ec-color" style={{ background: f.color }} title="颜色">
                    <input
                      type="color"
                      className="ec-color-input"
                      value={f.color}
                      onChange={(e) => updateField(idx, { color: e.target.value })}
                    />
                  </label>
                  <select
                    className="ec-btn"
                    value=""
                    disabled={templateVars.length === 0}
                    title={templateVars.length === 0 ? "该模板暂无可用变量" : "插入可用变量"}
                    aria-label="插入可用变量"
                    onChange={(e) => { if (e.target.value) insertVar(idx, e.target.value); }}
                  >
                    <option value="">插入可用变量</option>
                    {templateVars.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <button type="button" className="ec-btn" onClick={addRow}>
                    增加一行
                  </button>
                </div>
              ))}

              <div className="ec-row">
                <span className="ec-key">链接类型</span>
                <div className="ec-radios">
                  {["网页", "小程序", "空"].map((t) => (
                    <label key={t} className="ec-radio">
                      <input
                        type="radio"
                        name="ecLinkType"
                        checked={linkType === t}
                        onChange={() => setLinkType(t)}
                      />
                      <span className="ec-radio-dot" />
                      <span className="ec-radio-label">{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="ec-row">
                <span className="ec-key ec-req-label">*链接地址</span>
                <input
                  className="ec-input"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  disabled={linkType === "空"}
                />
              </div>
            </div>

            <div className="ec-preview">
              <div className="ec-preview-title">消息预览</div>
              <div className="ec-preview-body">
                <div className="ec-preview-line ec-preview-first">{first?.content || name}</div>
                {fields
                  .filter((f) => f.key.startsWith("keyword"))
                  .map((f, idx) => (
                    <div key={`${f.key}-${idx}`} className="ec-preview-line">
                      {f.key}: {f.content}
                    </div>
                  ))}
                <div className="ec-preview-line">{remark?.content || ""}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="ec-modal-footer">
          <button type="button" className="ec-cancel" onClick={onClose}>取消</button>
          <button type="button" className="ec-ok" onClick={() => onSave({ title: name, config_fields: fields, link_type: linkType, link_url: linkUrl })}>确定</button>
        </div>
      </div>
    </div>
  );
}

export default function WechatTemplatePage() {
  const domain = useConfigDomain<Dict>("wechat_mp_templates", DEFAULTS as Dict);
  const mpDomain = useConfigDomain<Dict>("wechat_mp", { platform_templates: [] } as unknown as Dict);
  const [data, setData] = useState<TemplateRow[]>([]);
  const [platformTpls, setPlatformTpls] = useState<TplItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [configRowId, setConfigRowId] = useState<number | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const apply = useCallback((config: Dict | null) => {
    const list = Array.isArray(config?.items) ? config!.items : [];
    if (list.length === 0) {
      // 首次使用时把两条演示模板种子写入配置域
      return;
    }
    setData(list.map((r, i) => {
      const o = asObject(r as Dict);
      const fields = Array.isArray(o.config_fields) ? o.config_fields : [];
      return {
        id: asNumber(o.id, i + 1),
        title: asStr(o.title, ""),
        member: asStr(o.member, ""),
        recNo: asStr(o.recNo, ""),
        event: asStr(o.event, ""),
        receiver: asStr(o.receiver, ""),
        platformTpl: asStr(o.platformTpl, ""),
        enabled: o.enabled !== false,
        config_fields: fields.map((f) => {
          const fo = asObject(f as Dict);
          return { key: asStr(fo.key, ""), content: asStr(fo.content, ""), color: asStr(fo.color, "#000000") };
        }),
        link_type: asStr(o.link_type, "网页"),
        link_url: asStr(o.link_url, ""),
      };
    }));
  }, []);

  useEffect(() => { domain.reload(); mpDomain.reload(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  // 首次进入且配置域为空时，写入两条内置模板作为初始数据
  useEffect(() => {
    if (!domain.ready || domain.loading) return;
    const items = domain.snapshot?.config.items;
    if (Array.isArray(items) && items.length === 0) {
      domain.save({ items: SEED_ROWS.map((r, i) => ({ ...r, id: i + 1 })) } as Partial<Dict>, "初始化模板消息");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain.ready, domain.snapshot]);
  useEffect(() => {
    const list = Array.isArray(mpDomain.snapshot?.config.platform_templates) ? mpDomain.snapshot!.config.platform_templates : [];
    setPlatformTpls(list.map((x) => ({ no: asStr(asObject(x as Dict).no, asStr(x as unknown as string, "")) })));
  }, [mpDomain.snapshot]);
  useEffect(() => { apply(domain.snapshot?.config ?? null); }, [domain.snapshot, apply]);

  const persist = async (next: TemplateRow[], summary: string) => {
    setData(next);
    await domain.save({ items: next } as Partial<Dict>, summary);
  };

  const pickTpl = (no: string) => {
    if (activeRowId !== null) {
      const next = data.map((r) => (r.id === activeRowId ? { ...r, platformTpl: no } : r));
      persist(next, `选择公众号平台模板 ${no}`);
    }
    setModalOpen(false);
  };

  const clearTpl = () => {
    if (activeRowId !== null) {
      const next = data.map((r) => (r.id === activeRowId ? { ...r, platformTpl: "" } : r));
      persist(next, "清除公众号平台模板");
    }
    setModalOpen(false);
  };

  const addPlatformTpl = async (no: string) => {
    if (platformTpls.some((t) => t.no === no)) {
      showConfigToast("该模板编号已在平台清单中", "error");
      return;
    }
    const next = [...platformTpls, { no }];
    setPlatformTpls(next);
    const ok = await mpDomain.save({ platform_templates: next } as Partial<Dict>, `添加平台模板 ${no}`);
    if (ok) showConfigToast("已添加模板");
    else {
      setPlatformTpls(platformTpls);
      showConfigToast("添加失败，请稍后重试", "error");
    }
  };

  /** 从平台清单删除；使用该编号的消息模板同时清空对应关联，避免残留失效编号 */
  const removePlatformTpl = async (no: string) => {
    const nextList = platformTpls.filter((t) => t.no !== no);
    setPlatformTpls(nextList);
    const ok = await mpDomain.save({ platform_templates: nextList } as Partial<Dict>, `删除平台模板 ${no}`);
    if (!ok) {
      setPlatformTpls(platformTpls);
      showConfigToast("删除失败，请稍后重试", "error");
      return;
    }
    if (data.some((r) => r.platformTpl === no)) {
      await persist(data.map((r) => (r.platformTpl === no ? { ...r, platformTpl: "" } : r)), `清除已删除的平台模板 ${no} 关联`);
    }
    showConfigToast("已从平台清单删除");
  };

  const visibleData = data.filter((r) => {
    const kw = keyword.trim();
    if (!kw) return true;
    return [r.title, r.member, r.recNo, r.event, r.receiver, r.platformTpl].some((v) => v.includes(kw));
  });

  const allChecked = visibleData.length > 0 && visibleData.every((r) => selectedIds.includes(r.id));

  /** 导出当前列表为 CSV（本地生成，不依赖接口） */
  const exportCsv = () => {
    const header = ["序号", "模板标题", "关联会员", "推荐使用模板编号", "推送事件", "消息接收人", "对应公众号平台模板", "开关"];
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = visibleData.map((r) => [
      String(r.id), r.title, r.member, r.recNo, r.event, r.receiver, r.platformTpl, r.enabled ? "开" : "关",
    ].map(esc).join(","));
    const csv = "﻿" + [header.map(esc).join(","), ...lines].join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "模板消息.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggle = (id: number) => {
    const next = data.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    persist(next, "模板消息开关调整");
  };

  const activeRow = data.find((r) => r.id === activeRowId);
  const configRow = data.find((r) => r.id === configRowId);

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "公众号", href: "/wechat-template", children: [{ label: "模板消息", href: "/wechat-template" }] },
          { label: "模板消息" },
        ]}
      />

      {/* 须知 */}
      <div className="tm-notice">
        <div className="tm-notice-title">
          <span className="tm-notice-icon">i</span>须知
        </div>
        <div className="tm-notice-lines">
          <p>在您的公众号中平台添加模板消息功能，并选择行业分类为：IT科技-互联网|电子商务，IT科技-IT软件与服务</p>
          <p>搜索模板标题找到对应的模板添加到我的模板、选择推荐的模板编号可达到最佳效果，若无法找到推荐编号请选择相近模板</p>
          <p>添加完成模板后，在下面列表中对应选择公众号中与之相对应匹配的模板。</p>
          <p>由于受到微信消息模板数量和模板内容的限制，建议您与手机短信通知互补使用</p>
          <p>指定的管理员必须绑定微信账号，否则无法接受微信消息</p>
        </div>
      </div>

      {/* 模板消息 */}
      <div className="admin-card">
        <div className="admin-card-header">模板消息</div>
        <div className="admin-card-body px-6 pb-6">
          <div className="flex flex-wrap items-center justify-end gap-3 pb-3">
            <input
              className="h-8 w-[220px] rounded border border-[#d9d9d9] px-2 text-sm outline-none focus:border-[#3658f7]"
              placeholder="搜索模板标题/编号/事件"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              aria-label="搜索模板"
            />
            <button
              type="button"
              disabled
              title="真实发送测试模板消息需接入公众号平台，暂不可用"
              className="h-8 cursor-not-allowed rounded border border-[#d9d9d9] px-3 text-sm text-[#999] opacity-60"
            >
              发送测试
            </button>
            <button type="button" className="h-8 rounded bg-[#3658f7] px-3 text-sm text-white" onClick={exportCsv}>
              导出
            </button>
          </div>
          <table className="tm-table">
            <thead>
              <tr className="bg-[#fafafa]">
                <th className="tm-th" style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    aria-label="全选"
                    checked={allChecked}
                    onChange={(e) => setSelectedIds(e.target.checked ? visibleData.map((r) => r.id) : [])}
                  />
                </th>
                <th className="tm-th tm-th-seq">序号</th>
                <th className="tm-th tm-th-v">模板标题</th>
                <th className="tm-th tm-th-v">关联会员</th>
                <th className="tm-th">推荐使用模板编号</th>
                <th className="tm-th">推送事件</th>
                <th className="tm-th">消息接收人</th>
                <th className="tm-th">对应公众号平台模板</th>
                <th className="tm-th">开关</th>
                <th className="tm-th">操作</th>
              </tr>
            </thead>
            <tbody>
              {visibleData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-0">
                    <div className="flex flex-col items-center justify-center py-16 text-sm text-[#999]">
                      {domain.loading ? "加载中…" : "暂无数据"}
                    </div>
                  </td>
                </tr>
              ) : (
                visibleData.map((r) => (
                  <tr key={r.id} className="border-b border-[#f0f0f0] transition-colors hover:bg-[#fafafa]">
                    <td className="tm-td" style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(r.id)}
                        onChange={(e) => setSelectedIds((cur) => (e.target.checked ? [...cur, r.id] : cur.filter((id) => id !== r.id)))}
                      />
                    </td>
                    <td className="tm-td tm-td-seq">{r.id}</td>
                    <td className="tm-td tm-td-v">{r.title}</td>
                    <td className="tm-td tm-td-v">{r.member}</td>
                    <td className="tm-td">{r.recNo}</td>
                    <td className="tm-td">{r.event}</td>
                    <td className="tm-td">{r.receiver}</td>
                    <td className="tm-td">
                      <button
                        type="button"
                        className={r.platformTpl ? "tm-tpl-picked tm-tpl-picked-btn" : "tm-link"}
                        onClick={() => { setActiveRowId(r.id); setModalOpen(true); }}
                        title={r.platformTpl ? "点击更换模板" : undefined}
                      >
                        {r.platformTpl || "选择模板"}
                      </button>
                    </td>
                    <td className="tm-td">
                      <button
                        type="button"
                        aria-label="开关"
                        className={`tm-switch${r.enabled ? " on" : ""}`}
                        onClick={() => toggle(r.id)}
                      >
                        <span className="tm-switch-text">{r.enabled ? "开" : "关"}</span>
                        <span className="tm-switch-knob" />
                      </button>
                    </td>
                    <td className="tm-td">
                      <button type="button" className="tm-link" onClick={() => { setConfigRowId(r.id); setConfigOpen(true); }}>
                        配置
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {selectedIds.length > 0 && (
            <div className="lead-bulk-toolbar">
              <span>已选择 <b>{selectedIds.length}</b> 项</span>
              <button type="button" onClick={() => setSelectedIds([])}>取消选择</button>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <TplModal
          tplList={platformTpls}
          onAddNew={addPlatformTpl}
          onDelete={removePlatformTpl}
          onClose={() => setModalOpen(false)}
          onPick={pickTpl}
          onClear={clearTpl}
          hasCurrent={Boolean(activeRow?.platformTpl)}
        />
      )}

      {configOpen && configRow && (
        <EditConfigModal
          row={configRow}
          onClose={() => setConfigOpen(false)}
          onSave={(patch) => {
            const next = data.map((r) => (r.id === configRow.id ? { ...r, ...patch } : r));
            persist(next, `修改模板「${configRow.title}」配置`);
            setConfigOpen(false);
            showConfigToast("已保存");
          }}
        />
      )}
    </div>
  );
}
