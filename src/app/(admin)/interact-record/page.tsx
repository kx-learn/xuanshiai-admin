"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "互动消息", href: "/interact-config" },
  { label: "消息记录" },
];

type MsgContent = {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  amount: number | null;
  status: number;
  sort: number;
  extra: Record<string, unknown>;
  created_at: string | null;
};

type MsgPage = { items: MsgContent[]; total: number; page: number; page_size: number };

const sortOptions = ["按首次发送时间", "按首次回复时间", "按最后互动时间"];

export default function InteractRecordPage() {
  const [rows, setRows] = useState<MsgContent[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIdx, setPageIdx] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState(0);
  const [preview, setPreview] = useState(false);

  const load = async (page = pageIdx) => {
    try {
      const resp = await adminApi<MsgPage>("admin/content/interactive_message", {
        method: "GET",
        query: {
          page,
          page_size: 20,
          keyword: keyword || undefined,
          sort_mode: sort,
        },
      });
      setRows(resp.items);
      setTotal(resp.total);
      setPageIdx(resp.page);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    }
  };

  useEffect(() => {
    void load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const remove = async (id: number) => {
    if (!window.confirm("确定删除该消息记录？")) return;
    try {
      await adminApi(`admin/content/interactive_message/${id}`, { method: "DELETE" });
      showConfigToast("已删除", "ok");
      void load(pageIdx);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>消息记录功能让您全面掌握了解会员在本平台上的互动情况和消息记录，帮助红娘了解会员之间的意向情况及时做好跟进和牵线服务</p>
            <p>首次发送人：是指初次给其他会员主动发送信息的会员；首次回复时间：是被动接收到消息后第一次回复的时间；最后互动时间：是指有第一次回复后，最近一次在平台上发送或回答消息的时间</p>
          </div>
        </div>
      </div>

      <div className="finord-card">
        <div className="ir-title">消息记录</div>

        <div className="ir-filters">
          <input
            className="ir-search-input"
            placeholder="请输入主动发送人昵称/编号/手机/姓名"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void load(1);
            }}
          />
          <button className="ir-search-btn" onClick={() => void load(1)}>搜索</button>
          <div className="ir-sorts">
            {sortOptions.map((s, i) => (
              <label className="ir-sort" key={s}>
                <input type="radio" checked={sort === i} onChange={() => setSort(i)} />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table ir-table">
            <thead>
              <tr>
                <th>首次发送人</th>
                <th>发送给</th>
                <th>首次发送时间</th>
                <th>首次回复时间</th>
                <th>最后互动时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const extra = r.extra ?? {};
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="ir-person">
                        <span className="ir-avatar" />
                        <div className="ir-person-info">
                          <div className="ir-name">
                            {typeof extra.sender_name === "string" ? extra.sender_name : r.title}
                            <span className="ir-id">{typeof extra.sender_id === "string" ? extra.sender_id : ""}</span>
                          </div>
                          <div className="ir-match">{typeof extra.sender_matchmaker === "string" ? extra.sender_matchmaker : "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="ir-person">
                        <span className="ir-avatar" />
                        <div className="ir-person-info">
                          <div className="ir-name">
                            {typeof extra.recv_name === "string" ? extra.recv_name : (r.subtitle ?? "-")}
                            <span className="ir-id">{typeof extra.recv_id === "string" ? extra.recv_id : ""}</span>
                          </div>
                          <div className="ir-match">{typeof extra.recv_matchmaker === "string" ? extra.recv_matchmaker : "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="ir-time">{typeof extra.send_at === "string" ? extra.send_at : ((r.created_at ?? "-").replace("T", " ").slice(0, 16))}</td>
                    <td className="ir-time">{typeof extra.reply_at === "string" ? extra.reply_at : "未回复"}</td>
                    <td className="ir-time">{typeof extra.last_at === "string" ? extra.last_at : "-"}</td>
                    <td>
                      <span className="ir-ops">
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); setPreview(true); }}>
                          查看消息内容记录
                        </a>
                        <span className="cs-op-sep">|</span>
                        <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); void remove(r.id); }}>删除</a>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#888" }}>
                    暂无消息记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="finord-pagination">
          <span className="finord-info">共 {total} 条</span>
          <div className="finord-pages">
            <button className="finord-page nav" onClick={() => load(Math.max(1, pageIdx - 1))} disabled={pageIdx <= 1}>‹</button>
            <span className="finord-page active">{pageIdx} / {totalPages}</span>
            <button className="finord-page nav" onClick={() => load(Math.min(totalPages, pageIdx + 1))} disabled={pageIdx >= totalPages}>›</button>
          </div>
        </div>
      </div>

      {preview && (
        <div className="ir-mask" onClick={() => setPreview(false)}>
          <div className="ir-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="ir-drawer-head">
              <button className="ir-drawer-x" onClick={() => setPreview(false)} aria-label="关闭">
                <X />
              </button>
              <span className="ir-drawer-title">预览前台</span>
              <button className="ir-drawer-close" onClick={() => setPreview(false)}>关闭</button>
            </div>

            <div className="ir-msg">
              <div className="ir-msg-top">
                <span className="ir-back">←</span>
                <span className="ir-msg-title">消息中心</span>
                <span className="ir-msg-tools">👥 ☰</span>
              </div>

              <div className="ir-user-card">
                <span className="ir-user-avatar">用户</span>
                <div className="ir-user-info">
                  <div className="ir-user-line">
                    <span className="ir-user-name">互动对象</span>
                    <span className="ir-user-badge">已实名</span>
                  </div>
                  <div className="ir-user-detail">
                    <a href="#">详细</a>
                    <span className="ir-detail-arrow">&gt;</span>
                  </div>
                </div>
              </div>

              <div className="ir-chat-time">--</div>

              <div className="ir-bubble-wrap">
                <div className="ir-bubble">
                  你好，看过你的资料，觉得我们挺合拍的，希望我们能进一步了解更多
                </div>
                <div className="ir-bubble-time">⏱ 等等Ta回复 · 时间戳</div>
              </div>

              <div className="ir-system-tip">
                <span className="ir-talk-ic">💬</span>
                系统已经给Ta发送短信提醒
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
