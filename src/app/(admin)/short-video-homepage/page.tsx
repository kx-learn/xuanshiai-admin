"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type VideoHomepageItem } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("短视频", "会员主页");

const fmt = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 19) : "-");

export default function ShortVideoHomepagePage() {
  const [rows, setRows] = useState<VideoHomepageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");

  const load = useCallback(async (kw = keyword) => {
    setLoading(true);
    try {
      const res = await adminEndpoints.videoHomepageList({ page: 1, page_size: 50, keyword: kw || undefined });
      setRows(res.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => { load(""); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const toggleCertified = async (r: VideoHomepageItem) => {
    const next = !r.certified;
    setRows((l) => l.map((x) => (x.id === r.id ? { ...x, certified: next } : x)));
    try {
      await adminEndpoints.updateVideoHomepage(r.id, { certified: next });
    } catch (e) {
      setRows((l) => l.map((x) => (x.id === r.id ? { ...x, certified: r.certified } : x)));
      showConfigToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const editProfile = async (r: VideoHomepageItem) => {
    const wechat = window.prompt("微信号", r.wechat ?? "");
    if (wechat === null) return;
    const bio = window.prompt("主页简介", r.bio ?? "");
    if (bio === null) return;
    try {
      const updated = await adminEndpoints.updateVideoHomepage(r.id, { wechat, bio });
      setRows((l) => l.map((x) => (x.id === r.id ? updated : x)));
      showConfigToast("修改成功", "ok");
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "修改失败", "error");
    }
  };

  const deleteRow = async (r: VideoHomepageItem) => {
    if (!window.confirm(`确定删除会员主页「${r.nickname || r.id}」？`)) return;
    try {
      await adminEndpoints.deleteVideoHomepage(r.id);
      showConfigToast("删除成功", "ok");
      load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card svh-card">
        <div className="svh-title">会员主页</div>

        <div className="svh-filters">
          <input className="svh-input" placeholder="请输入会员昵称" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <button className="finord-btn finord-btn-primary svh-search-btn" onClick={() => load()}>搜索</button>
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
                  <td className="svh-nick">{r.nickname || "-"}</td>
                  <td className={r.wechat ? "" : "svh-empty"}>{r.wechat || "-"}</td>
                  <td className={r.bio ? "" : "svh-empty"}>{r.bio || "-"}</td>
                  <td className="svh-num">{r.video_count}</td>
                  <td className="svh-num">{r.view_count}</td>
                  <td className="svh-num">{r.follower_count}</td>
                  <td className="svh-num">{r.like_count}</td>
                  <td><span className="svh-tip">{r.tip_amount}元</span></td>
                  <td>
                    <button type="button" className={`mp-switch ${r.certified ? "on" : ""}`} onClick={() => toggleCertified(r)}>
                      <span className="mp-switch-knob"></span>
                    </button>
                  </td>
                  <td className="svh-time">{fmt(r.created_at)}</td>
                  <td>
                    <div className="svh-ops">
                      <a className="finord-link">预览主页</a>
                      <a className="finord-link" onClick={() => editProfile(r)}>编辑资料</a>
                      <a className="finord-link svh-op-del" onClick={() => deleteRow(r)}>删除</a>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={12} style={{ textAlign: "center", padding: "32px 0", color: "#98a2b3" }}>暂无数据</td></tr>
              )}
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
