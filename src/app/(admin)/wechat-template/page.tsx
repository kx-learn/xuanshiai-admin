"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

/**
 * 模板消息（纯前端演示，无后端接口）
 * 页面结构：面包屑 / 须知 / 模板消息卡片（分类下拉 + 表格）
 * 点击「选择模板」弹出右侧「选择模板」抽屉（须知 + 添加新模板 + 模板列表）
 */

interface TemplateRow {
  id: number;
  title: string; // 模板标题
  member: string; // 关联会员
  recNo: string; // 推荐使用模板编号
  event: string; // 推送事件
  receiver: string; // 消息接收人
  platformTpl: string; // 对应公众号平台模板（已选择则显示编号，否则显示「选择模板」）
  enabled: boolean; // 开关
}

interface TemplateItem {
  no: string;
}

const rows: TemplateRow[] = [
  {
    id: 1,
    title: "奖品兑换成功通知",
    member: "兑换会员",
    recNo: "OPENtMD2D7327376",
    event: "拼分商城用兑换礼品成功后通知申请人",
    receiver: "前台会员",
    platformTpl: "",
    enabled: true,
  },
  {
    id: 2,
    title: "账户资金变动提醒",
    member: "财务",
    recNo: "OPENtMD415437054",
    event: "账号的余额发生变动的时候发送通知消息给会员",
    receiver: "前台会员",
    platformTpl: "",
    enabled: true,
  },
];

const tplList: TemplateItem[] = [
  { no: "订阅模板消息:g5pgUjQpmiNGjYDNknSr6rC[TJmGnk5OkYfKinaQy1E" },
];

/** 编辑配置弹窗：字段行 */
interface ConfigField {
  id: number;
  key: string; // first / keyword1... / remark
  content: string;
  color: string;
}

const initialConfigFields: ConfigField[] = [
  { id: 1, key: "first", content: "{{会员昵称}}您申请的兑换礼品已成功", color: "#000000" },
  { id: 2, key: "keyword1", content: "{{兑换礼物名称}}", color: "#000000" },
  { id: 3, key: "keyword2", content: "{{兑换积分}}", color: "#000000" },
  { id: 4, key: "keyword3", content: "{{剩余积分}}", color: "#000000" },
  { id: 5, key: "keyword4", content: "{{兑换时间}}", color: "#000000" },
  { id: 6, key: "remark", content: "感谢您对本站的支持，祝您生活愉快！", color: "#000000" },
];

function TplModal({ onClose, onPick }: { onClose: () => void; onPick: (no: string) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

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
          {/* 须知 + 添加新模板 */}
          <div className="tm-modal-notice">
            <div className="tm-modal-notice-text">
              <span className="tm-notice-icon">i</span>
              如果选择模板清单中没有这个模板，应该在这里添加。
            </div>
            <button type="button" className="tm-add-btn">
              + 添加新模板
            </button>
          </div>

          {/* 模板列表 */}
          <div className="tm-tpl-box">
            <div className="tm-tpl-row tm-tpl-head">
              <div className="tm-tpl-no">模板</div>
              <div className="tm-tpl-act">选择</div>
            </div>
            {tplList.length === 0 ? (
              <div className="tm-tpl-empty">暂无模板</div>
            ) : (
              tplList.map((tpl) => (
                <div key={tpl.no} className="tm-tpl-row">
                  <div className="tm-tpl-no">{tpl.no}</div>
                  <div className="tm-tpl-act">
                    <button type="button" className="tm-pick-btn" onClick={() => onPick(tpl.no)}>
                      选择
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

function EditConfigModal({ title, onClose }: { title: string; onClose: () => void }) {
  const [name, setName] = useState(title);
  const [fields, setFields] = useState<ConfigField[]>(initialConfigFields);
  const [linkType, setLinkType] = useState("网页");
  const [linkUrl, setLinkUrl] = useState("{{SiteUrl}}/subpages/gift/exchange");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const updateField = (id: number, patch: Partial<ConfigField>) => {
    setFields((cur) => cur.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const insertVar = (id: number) => {
    setFields((cur) => cur.map((f) => (f.id === id ? { ...f, content: `${f.content}{{变量}}` } : f)));
  };

  const addRow = () => {
    const nextKey = `keyword${fields.filter((f) => f.key.startsWith("keyword")).length + 1}`;
    setFields((cur) => [...cur, { id: Date.now(), key: nextKey, content: "", color: "#000000" }]);
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
          {/* 须知 */}
          <div className="ec-notice">
            <span className="ec-notice-icon">i</span>
            <span>切勿在微信推送模板中配置违反微信规则的内容或链接，微信模板消息违规说明</span>
          </div>

          <div className="ec-columns">
            {/* 左：表单 */}
            <div className="ec-form">
              <div className="ec-sid">模板ID</div>

              <div className="ec-row">
                <span className="ec-key">名称</span>
                <input className="ec-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              {fields.map((f) => (
                <div key={f.id} className="ec-row">
                  <span className="ec-key">{f.key}</span>
                  <input
                    className="ec-input"
                    value={f.content}
                    onChange={(e) => updateField(f.id, { content: e.target.value })}
                  />
                  <label className="ec-color" style={{ background: f.color }} title="颜色">
                    <input
                      type="color"
                      className="ec-color-input"
                      value={f.color}
                      onChange={(e) => updateField(f.id, { color: e.target.value })}
                    />
                  </label>
                  <button type="button" className="ec-btn" onClick={() => insertVar(f.id)}>
                    插入可用变量
                  </button>
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

            {/* 右：消息预览 */}
            <div className="ec-preview">
              <div className="ec-preview-title">消息预览</div>
              <div className="ec-preview-body">
                <div className="ec-preview-line ec-preview-first">{first?.content || name}</div>
                {fields
                  .filter((f) => f.key.startsWith("keyword"))
                  .map((f) => (
                    <div key={f.id} className="ec-preview-line">
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
          <button type="button" className="ec-ok" onClick={onClose}>确定</button>
        </div>
      </div>
    </div>
  );
}

export default function WechatTemplatePage() {
  const [category, setCategory] = useState("全部分类");
  const [data, setData] = useState<TemplateRow[]>(rows);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [configRowId, setConfigRowId] = useState<number | null>(null);

  const activeRow = data.find((r) => r.id === activeRowId);

  const openTpl = (id: number) => {
    setActiveRowId(id);
    setModalOpen(true);
  };

  const openConfig = (id: number) => {
    setConfigRowId(id);
    setConfigOpen(true);
  };

  const pickTpl = (no: string) => {
    if (activeRowId !== null) {
      setData((cur) => cur.map((r) => (r.id === activeRowId ? { ...r, platformTpl: no } : r)));
    }
    setModalOpen(false);
  };

  const toggle = (id: number) => {
    setData((cur) => cur.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

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
          {/* 分类下拉 */}
          <div className="flex items-center">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-[150px] rounded border border-[#d9d9d9] bg-white px-3 text-sm text-[#6b7688] outline-none"
            >
              <option value="全部分类">全部分类</option>
              <option value="IT科技-互联网">IT科技-互联网</option>
              <option value="IT科技-电子商务">IT科技-电子商务</option>
              <option value="IT科技-IT软件与服务">IT科技-IT软件与服务</option>
            </select>
          </div>

          {/* 表格 */}
          <div className="mt-4 overflow-auto rounded-[6px] border border-[#f0f0f0]">
            <table className="tm-table">
              <thead>
                <tr className="bg-[#fafafa]">
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
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-0">
                      <div className="flex flex-col items-center justify-center py-16 text-sm text-[#999]">暂无数据</div>
                    </td>
                  </tr>
                ) : (
                  data.map((r) => (
                    <tr key={r.id} className="border-b border-[#f0f0f0] transition-colors hover:bg-[#fafafa]">
                      <td className="tm-td tm-td-seq">{r.id}</td>
                      <td className="tm-td tm-td-v">{r.title}</td>
                      <td className="tm-td tm-td-v">{r.member}</td>
                      <td className="tm-td">{r.recNo}</td>
                      <td className="tm-td">{r.event}</td>
                      <td className="tm-td">{r.receiver}</td>
                      <td className="tm-td">
                        {r.platformTpl ? (
                          <span className="tm-tpl-picked">{r.platformTpl}</span>
                        ) : (
                          <button type="button" className="tm-link" onClick={() => openTpl(r.id)}>
                            选择模板
                          </button>
                        )}
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
                        <button type="button" className="tm-link" onClick={() => openConfig(r.id)}>
                          配置
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <TplModal
          onClose={() => setModalOpen(false)}
          onPick={pickTpl}
        />
      )}

      {configOpen && (
        <EditConfigModal
          title={data.find((r) => r.id === configRowId)?.title ?? ""}
          onClose={() => setConfigOpen(false)}
        />
      )}
    </div>
  );
}
