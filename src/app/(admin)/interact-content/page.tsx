"use client";
import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "互动消息", href: "/interact-config" },
  { label: "内容设置" },
];

interface TopicRow {
  id: number;
  content: string;
  replyCount: number;
  enabled: boolean;
  showUp: boolean;
}

const rows: TopicRow[] = [
  { id: 8, content: "你好，刚到你感觉很有眼缘，想简单聊两句互相了解下", replyCount: 2, enabled: true, showUp: false },
  { id: 7, content: "你看去过好多城市旅行，印象最好的目的地是哪里呀？", replyCount: 0, enabled: true, showUp: true },
  { id: 6, content: "你好，抱着认真找对象的心态，看你的规划和我很契合，想沟通了解下", replyCount: 0, enabled: true, showUp: true },
  { id: 5, content: "你好，我看到了你资料，感觉咱俩择偶要求各方面都很匹配，想跟你进一步了解下可以吗？", replyCount: 3, enabled: false, showUp: true },
  { id: 4, content: "你看过你的资料，觉得我们挺合拍的，希望我们能进一步了解更多", replyCount: 3, enabled: true, showUp: true },
];

export default function InteractContentPage() {
  const [items, setItems] = useState<TopicRow[]>(rows);
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState("");

  const toggle = (id: number) =>
    setItems((list) => list.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  const confirmAdd = () => {
    if (!newContent.trim()) return;
    setItems((list) => [
      { id: (list[0]?.id ?? 0) + 1, content: newContent.trim(), replyCount: 0, enabled: true, showUp: true },
      ...list,
    ]);
    setNewContent("");
    setAdding(false);
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
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
          <button className="ic-add" onClick={() => setAdding(true)}>
            ＋ 新建内容主题
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table ic-table">
            <thead>
              <tr>
                <th className="ic-th-topic">消息内容主题</th>
                <th>显示排序</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="ic-topic">{r.content}</td>
                  <td>
                    <span className="ic-sorts">
                      {r.showUp && <a className="ic-move" href="#">↑ 上移</a>}
                      <a className="ic-move" href="#">↓ 下移</a>
                    </span>
                  </td>
                  <td>
                    <span className="ic-status">
                      <button
                        className={`mp-switch ${r.enabled ? "on" : ""}`}
                        onClick={() => toggle(r.id)}
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
                      <a className="finord-link" href="#">编辑</a>
                      <span className="cs-op-sep">|</span>
                      <a className="finord-link" href="#">回复内容管理 ({r.replyCount})</a>
                      <span className="cs-op-sep">|</span>
                      <a className="finord-link" href="#">删除</a>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 新建内容主题弹窗 */}
      {adding && (
        <div className="ic-mask" onClick={() => setAdding(false)}>
          <div className="ic-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ic-panel-head">
              <span className="ic-panel-title">新建消息内容主题</span>
              <button className="ic-panel-x" onClick={() => setAdding(false)} aria-label="关闭">
                <X />
              </button>
            </div>
            <div className="ic-panel-body">
              <textarea
                className="ic-panel-textarea"
                placeholder="输入主题内容,100字符以内"
                maxLength={100}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={5}
              />
            </div>
            <div className="ic-panel-actions">
              <button className="ic-cancel" onClick={() => setAdding(false)}>取消</button>
              <button className="ic-ok" onClick={confirmAdd}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
