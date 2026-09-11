"use client";
import { useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "运营工具", href: "/free-pay" },
  { label: "互动消息", href: "/interact-config" },
  { label: "消息记录" },
];

interface MsgRow {
  id: number;
  senderName: string;
  senderId: string;
  senderMatch: string;
  recvName: string;
  recvId: string;
  recvMatch: string;
  sendAt: string;
  replyAt: string;
  lastAt: string;
}

const rows: MsgRow[] = [
  { id: 8, senderName: "秋刀鱼", senderId: "B976071", senderMatch: "李会强", recvName: "", recvId: "G397921", recvMatch: "-", sendAt: "2026-07-09 10:44", replyAt: "未回复", lastAt: "2026-07-09 10:44" },
  { id: 7, senderName: "出现1", senderId: "B241050", senderMatch: "张瑞", recvName: "1196", recvId: "G617884", recvMatch: "荷菱颖", sendAt: "2026-07-09 09:38", replyAt: "未回复", lastAt: "2026-07-09 09:38" },
  { id: 6, senderName: "秋刀鱼", senderId: "B976071", senderMatch: "李会强", recvName: "", recvId: "G397921", recvMatch: "-", sendAt: "2026-07-08 10:00", replyAt: "未回复", lastAt: "2026-07-08 10:00" },
  { id: 5, senderName: "出现", senderId: "B237195", senderMatch: "张瑞", recvName: "0哔吧啦", recvId: "G368717", recvMatch: "冯琴", sendAt: "2026-06-28 15:32", replyAt: "未回复", lastAt: "2026-06-28 15:32" },
  { id: 4, senderName: "σπη'η", senderId: "B108658", senderMatch: "李会强", recvName: "爱慕药", recvId: "G152031", recvMatch: "杨奕斌", sendAt: "2026-06-25 16:59", replyAt: "未回复", lastAt: "2026-06-25 16:59" },
  { id: 3, senderName: "σπη'η", senderId: "B108658", senderMatch: "李会强", recvName: "0哔吧啦", recvId: "G368717", recvMatch: "冯琴", sendAt: "2026-06-25 16:56", replyAt: "未回复", lastAt: "2026-06-25 16:56" },
  { id: 2, senderName: "σπη'η", senderId: "B108658", senderMatch: "李会强", recvName: "小Yang又困❀", recvId: "G667599", recvMatch: "方梓涵", sendAt: "2026-06-25 16:56", replyAt: "未回复", lastAt: "2026-06-25 16:56" },
  { id: 1, senderName: "σπη'η", senderId: "B108658", senderMatch: "李会强", recvName: "毛毛", recvId: "G765914", recvMatch: "汪苏杭", sendAt: "2026-06-25 16:55", replyAt: "未回复", lastAt: "2026-06-25 16:55" },
];

const sortOptions = ["按首次发送时间", "按首次回复时间", "按最后互动时间"];

export default function InteractRecordPage() {
  const [sort, setSort] = useState(0);
  const [preview, setPreview] = useState(false);

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      {/* 蓝色须知条 */}
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
          <input className="ir-search-input" placeholder="请输入主动发送人昵称/编号/手机/姓名" />
          <button className="ir-search-btn">搜索</button>
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
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="ir-person">
                      <span className="ir-avatar" />
                      <div className="ir-person-info">
                        <div className="ir-name">{r.senderName} <span className="ir-id">{r.senderId}</span></div>
                        <div className="ir-match">{r.senderMatch}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ir-person">
                      {r.recvName && <span className="ir-avatar" />}
                      <div className="ir-person-info">
                        {r.recvName ? (
                          <>
                            <div className="ir-name">{r.recvName} <span className="ir-id">{r.recvId}</span></div>
                            <div className="ir-match">{r.recvMatch}</div>
                          </>
                        ) : (
                          <div className="ir-name"><span className="ir-id">{r.recvId}</span> <span className="ir-dash">-</span></div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="ir-time">{r.sendAt}</td>
                  <td className="ir-time">{r.replyAt}</td>
                  <td className="ir-time">{r.lastAt}</td>
                  <td>
                    <a className="finord-link" href="#" onClick={(e) => { e.preventDefault(); setPreview(true); }}>
                      查看消息内容记录
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 预览前台 Drawer */}
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
                <span className="ir-user-avatar">1196</span>
                <div className="ir-user-info">
                  <div className="ir-user-line">
                    <span className="ir-user-name">1196</span>
                    <span className="ir-user-badge">已实名</span>
                    <span className="ir-user-meta">26岁</span>
                    <span className="ir-user-meta">166cm</span>
                  </div>
                  <div className="ir-user-detail">
                    <a href="#">详细</a>
                    <span className="ir-detail-arrow">&gt;</span>
                  </div>
                </div>
              </div>

              <div className="ir-chat-time">07-09 09:38</div>

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
