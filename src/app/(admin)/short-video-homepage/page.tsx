"use client";

import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";

const breadcrumb = getBreadcrumb("短视频", "会员主页");

interface HomeRow {
  id: number;
  nickname: string;
  videoCount: number;
  views: number;
  followers: number;
  likes: number;
  tip: string;
  certified: boolean;
  createdAt: string;
}

const rows: HomeRow[] = [
  { id: 4, nickname: "扒姐说媒", videoCount: 14, views: 97648, followers: 0, likes: 7, tip: "0元", certified: false, createdAt: "2026-06-13 13:22:28" },
  { id: 3, nickname: "查营家-扒姐助理", videoCount: 0, views: 0, followers: 0, likes: 0, tip: "0元", certified: false, createdAt: "2026-06-12 17:30:06" },
  { id: 2, nickname: "不吃猪肉", videoCount: 0, views: 0, followers: 1, likes: 0, tip: "0元", certified: false, createdAt: "2026-06-12 17:21:20" },
  { id: 1, nickname: "SG小Q-WS", videoCount: 0, views: 0, followers: 0, likes: 0, tip: "0元", certified: false, createdAt: "2026-06-12 12:57:21" },
];

export default function ShortVideoHomepagePage() {
  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card svh-card">
        <div className="svh-title">会员主页</div>

        <div className="svh-filters">
          <input className="svh-input" placeholder="请输入会员昵称" />
          <button className="finord-btn finord-btn-primary svh-search-btn">搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table svh-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>会员昵称</th>
                <th>微信号</th>
                <th>主页简介</th>
                <th>作品数</th>
                <th>播放量</th>
                <th>粉丝量</th>
                <th>获赞量</th>
                <th>获得打赏</th>
                <th>认证</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="svh-id">{r.id}</td>
                  <td className="svh-nick">{r.nickname}</td>
                  <td className="svh-empty">-</td>
                  <td className="svh-empty">-</td>
                  <td className="svh-num">{r.videoCount}</td>
                  <td className="svh-num">{r.views}</td>
                  <td className="svh-num">{r.followers}</td>
                  <td className="svh-num">{r.likes}</td>
                  <td><span className="svh-tip">{r.tip}</span></td>
                  <td>
                    <button type="button" className={`mp-switch ${r.certified ? "on" : ""}`}>
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                  <td className="svh-time">{r.createdAt}</td>
                  <td>
                    <div className="svh-ops">
                      <a className="finord-link">预览主页</a>
                      <a className="finord-link">编辑资料</a>
                      <a className="finord-link svh-op-del">删除</a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="svh-pager">
          <span className="svh-pager-arrow">‹</span>
          <span className="svh-pager-cur">1</span>
          <span className="svh-pager-arrow">›</span>
        </div>
      </div>
    </div>
  );
}