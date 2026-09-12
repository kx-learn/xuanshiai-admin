"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { showConfigToast, useConfigDomain } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("运营工具", "互动内容");

type MessageTemplate = {
  id: number;
  content: string;
  reply_count: number;
  enabled: boolean;
  show_up: boolean;
  sort_order: number;
};

type InteractContentConfig = {
  templates: MessageTemplate[];
};

const DEFAULTS: InteractContentConfig = {
  templates: [
    { id: 1, content: "你好，刚到你感觉很有眼缘，想简单聊两句互相了解下", reply_count: 2, enabled: true, show_up: false, sort_order: 100 },
    { id: 2, content: "你看去过好多城市旅行，印象最好的目的地是哪里呀？", reply_count: 0, enabled: true, show_up: true, sort_order: 90 },
    { id: 3, content: "你好，抱着认真找对象的心态，看你的规划和我很契合，想沟通了解下", reply_count: 0, enabled: true, show_up: true, sort_order: 80 },
    { id: 4, content: "你好，我看到了你资料，感觉咱俩择偶要求各方面都很匹配，想跟你进一步了解下可以吗？", reply_count: 3, enabled: false, show_up: true, sort_order: 70 },
    { id: 5, content: "你看过你的资料，觉得我们挺合拍的，希望我们能进一步了解更多", reply_count: 3, enabled: true, show_up: true, sort_order: 60 },
  ],
};

function nextId(rows: MessageTemplate[]): number {
  return rows.length === 0 ? 1 : Math.max(...rows.map((r) => r.id)) + 1;
}

export default function InteractContentPage() {
  const { snapshot, save } = useConfigDomain<InteractContentConfig>("tools_interactive_content", DEFAULTS);
  const [items, setItems] = useState<MessageTemplate[]>(DEFAULTS.templates);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<MessageTemplate | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (!snapshot) return;
    const data = snapshot.config;
    if (Array.isArray(data.templates) && data.templates.length > 0) {
      setItems(data.templates.map((r) => ({ ...r })));
    } else {
      setItems(DEFAULTS.templates);
    }
  }, [snapshot]);

  const toggleEnabled = (id: number) =>
    setItems((rows) => rows.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  const remove = (id: number) => {
    if (!window.confirm("确定删除该消息主题？")) return;
    setItems((rows) => rows.filter((r) => r.id !== id));
  };

  const move = (id: number, dir: -1 | 1) => {
    setItems((rows) => {
      const idx = rows.findIndex((r) => r.id === id);
      const next = idx + dir;
      if (idx < 0 || next < 0 || next >= rows.length) return rows;
      const arr = [...rows];
      [arr[idx], arr[next]] = [arr[next], arr[idx]];
      return arr.map((r, i) => ({ ...r, show_up: i > 0 && arr[i + 1] !== undefined }));
    });
  };

  const confirmAdd = () => {
    const text = draft.trim();
    if (!text) {
      showConfigToast("内容不能为空", "error");
      return;
    }
    if (text.length > 100) {
      showConfigToast("请控制在 100 字符以内", "error");
      return;
    }
    setItems((rows) => [
      { id: nextId(rows), content: text, reply_count: 0, enabled: true, show_up: rows.length > 0, sort_order: (rows[0]?.sort_order ?? 0) + 10 },
      ...rows,
    ]);
    setDraft("");
    setAdding(false);
  };

  const confirmEdit = () => {
    if (!editing) return;
    const text = draft.trim();
    if (!text) {
      showConfigToast("内容不能为空", "error");
      return;
    }
    if (text.length > 100) {
      showConfigToast("请控制在 100 字符以内", "error");
      return;
    }
    setItems((rows) => rows.map((r) => (r.id === editing.id ? { ...r, content: text } : r)));
    setEditing(null);
    setDraft("");
  };

  const submit = async () => {
    const ok = await save({ templates: items }, "互动消息内容设置更新");
    showConfigToast(ok ? "保存成功" : "内容无变化", ok ? "ok" : "error");
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>您可以在这里自由添加、修改消息的内容主题、回复内容;好的创意内容将有助提升会员的互动性哦</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="ic-head">
          <span className="ic-title">消息内容设置</span>
          <button type="button" className="ic-add" onClick={() => { setAdding(true); setDraft(""); }}>
            ＋ 新建内容主题
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table ic-table">
            <thead>
              <tr>
                <th className="ic-th-topic">消息内容主题</th>
                <th style={{ width: 130 }}>显示排序</th>
                <th style={{ width: 140 }}>状态</th>
                <th style={{ width: 260 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r, i) => (
                <tr key={r.id}>
                  <td className="ic-topic">{r.content}</td>
                  <td>
                    <span className="ic-sorts">
                      {i > 0 && (
                        <button type="button" className="ic-move" onClick={() => move(r.id, -1)}>↑ 上移</button>
                      )}
                      {i < items.length - 1 && (
                        <button type="button" className="ic-move" onClick={() => move(r.id, 1)}>↓ 下移</button>
                      )}
                    </span>
                  </td>
                  <td>
                    <span className="ic-status">
                      <button
                        type="button"
                        className={`mp-switch ${r.enabled ? "on" : ""}`}
                        onClick={() => toggleEnabled(r.id)}
                      >
                        <span className="mp-switch-knob"></span>
                      </button>
                      <span className={`ic-status-label ${r.enabled ? "on" : "off"}`}>
                        {r.enabled ? "启用" : "关闭"}
                      </span>
                    </span>
                  </td>
                  <td>
                    <span className="ic-ops">
                      <button
                        type="button"
                        className="finord-link"
                        style={{ background: "none", border: 0, cursor: "pointer", color: "inherit" }}
                        onClick={() => { setEditing(r); setDraft(r.content); }}
                      >
                        编辑
                      </button>
                      <span className="cs-op-sep">|</span>
                      <a
                        className="finord-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          showConfigToast(`已查看回复内容管理（${r.reply_count} 条）`, "ok");
                        }}
                      >
                        回复内容管理 ({r.reply_count})
                      </a>
                      <span className="cs-op-sep">|</span>
                      <button
                        type="button"
                        className="finord-link"
                        style={{ background: "none", border: 0, cursor: "pointer", color: "inherit" }}
                        onClick={() => remove(r.id)}
                      >
                        删除
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂未配置消息主题，点击右上角「新建内容主题」开始添加
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="xm-actions" style={{ marginTop: 16 }}>
          <button type="button" className="xm-submit" onClick={submit}>确定提交</button>
        </div>
      </div>

      {adding && (
        <div className="ic-mask" onClick={() => setAdding(false)}>
          <div className="ic-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ic-panel-head">
              <span className="ic-panel-title">新建消息内容主题</span>
              <button type="button" className="ic-panel-x" onClick={() => setAdding(false)} aria-label="关闭"><X /></button>
            </div>
            <div className="ic-panel-body">
              <textarea
                className="ic-panel-textarea"
                placeholder="输入主题内容,100字符以内"
                maxLength={100}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
              />
            </div>
            <div className="ic-panel-actions">
              <button type="button" className="ic-cancel" onClick={() => setAdding(false)}>取消</button>
              <button type="button" className="ic-ok" onClick={confirmAdd}>确定</button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <div className="ic-mask" onClick={() => setEditing(null)}>
          <div className="ic-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ic-panel-head">
              <span className="ic-panel-title">编辑消息内容主题</span>
              <button type="button" className="ic-panel-x" onClick={() => setEditing(null)} aria-label="关闭"><X /></button>
            </div>
            <div className="ic-panel-body">
              <textarea
                className="ic-panel-textarea"
                placeholder="输入主题内容,100字符以内"
                maxLength={100}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={5}
              />
            </div>
            <div className="ic-panel-actions">
              <button type="button" className="ic-cancel" onClick={() => setEditing(null)}>取消</button>
              <button type="button" className="ic-ok" onClick={confirmEdit}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
