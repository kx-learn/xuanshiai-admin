"use client";

import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "评论管理");

const STATUS_TABS = ["全部", "通过", "待审", "未通过"];

interface CmtRow {
  id: number;
  content: string;
  source: string;
  likes: number;
  time: string;
  ip: string;
  member: string;
  audit: string;
}

const rows: CmtRow[] = [
  { id: 3, content: "太真实了😂😂", source: "原文：相亲一定要先见见面再聊天！！文字都是冷冰冰的，真实的见面才能拉近两颗心的距离 ❤", likes: 0, time: "2026-06-12 18:03:42", ip: "180.111.215.178", member: "不吃猪肉", audit: "通过" },
  { id: 2, content: "总结的太到位了，感觉我就是这样😂", source: "原文：相亲一定要先见见面再聊天！！文字都是冷冰冰的，真实的见面才能拉近两颗心的距离 ❤", likes: 0, time: "2026-06-12 17:29:43", ip: "116.147.253.130", member: "出现1", audit: "通过" },
  { id: 1, content: "总结的太到位了，感觉我就是这样😂", source: "原文：相亲一定要先见见面再聊天！！文字都是冷冰冰的，真实的见面才能拉近两颗心的距离 ❤", likes: 0, time: "2026-06-12 17:28:41", ip: "116.147.253.130", member: "出现1", audit: "通过" },
];

export default function ShortVideoCommentPage() {
  const [tab, setTab] = useState("全部");
  const [headChecked, setHeadChecked] = useState(false);
  const [rowChecked, setRowChecked] = useState<number[]>([]);

  const toggleHead = () => {
    const next = !headChecked;
    setHeadChecked(next);
    setRowChecked(next ? rows.map((r) => r.id) : []);
  };
  const toggleRow = (id: number) => {
    setRowChecked((cur) => (cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id]));
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card cmt-card">
        <div className="cmt-title">评论管理</div>

        <div className="cmt-filters">
          <div className="cmt-tabs">
            {STATUS_TABS.map((t) => (
              <button key={t} className={`cmt-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>
          <label className="cmt-head-check">
            <input type="checkbox" className="cmt-check" checked={headChecked} onChange={toggleHead} />
          </label>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table cmt-table">
            <thead>
              <tr>
                <th className="cmt-col-check">
                  <input type="checkbox" className="cmt-check" checked={headChecked} onChange={toggleHead} />
                </th>
                <th>ID</th>
                <th>评论内容</th>
                <th>点赞数</th>
                <th>发布时间</th>
                <th>IP</th>
                <th>会员</th>
                <th>审核</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="cmt-col-check">
                    <input type="checkbox" className="cmt-check" checked={rowChecked.includes(r.id)} onChange={() => toggleRow(r.id)} />
                  </td>
                  <td className="cmt-id">{r.id}</td>
                  <td className="cmt-content">
                    <div className="cmt-content-text">{r.content}</div>
                    <div className="cmt-content-source">{r.source}</div>
                  </td>
                  <td className="cmt-likes">{r.likes}</td>
                  <td className="cmt-time">{r.time}</td>
                  <td className="cmt-ip">{r.ip}</td>
                  <td className="cmt-member">{r.member}</td>
                  <td>
                    <select className="cmt-audit-select">
                      <option>{r.audit}</option>
                      <option>待审</option>
                      <option>未通过</option>
                    </select>
                  </td>
                  <td>
                    <div className="cmt-ops">
                      <a className="finord-link">编辑</a>
                      <a className="finord-link">回复</a>
                      <a className="finord-link cmt-op-del">删除</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cmt-pager">
          <span className="cmt-pager-arrow">‹</span>
          <span className="cmt-pager-cur">1</span>
          <span className="cmt-pager-arrow">›</span>
        </div>
      </div>
    </div>
  );
}