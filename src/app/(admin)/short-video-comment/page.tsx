"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type VideoCommentItem } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("短视频", "评论管理");

const STATUS_TABS: { label: string; value: string | undefined }[] = [
  { label: "全部", value: undefined },
  { label: "通过", value: "approved" },
  { label: "待审", value: "pending" },
  { label: "未通过", value: "rejected" },
];
const AUDIT_OPTIONS = [
  { label: "通过", value: "approved" },
  { label: "待审", value: "pending" },
  { label: "未通过", value: "rejected" },
];

const fmt = (v: string | null | undefined) => (v ? v.replace("T", " ").slice(0, 19) : "-");

export default function ShortVideoCommentPage() {
  const [rows, setRows] = useState<VideoCommentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<string | undefined>(undefined);
  const [checked, setChecked] = useState<number[]>([]);

  const load = useCallback(async (audit?: string) => {
    setLoading(true);
    try {
      const res = await adminEndpoints.videoCommentList({ page: 1, page_size: 50, audit_status: audit });
      setRows(res.items);
      setChecked([]);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(tab); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [tab]);

  const allChecked = rows.length > 0 && checked.length === rows.length;
  const toggleHead = () => setChecked(allChecked ? [] : rows.map((r) => r.id));
  const toggleRow = (id: number) => setChecked((cur) => (cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id]));

  const changeAudit = async (id: number, auditStatus: string) => {
    try {
      await adminEndpoints.updateVideoComment(id, { audit_status: auditStatus });
      setRows((l) => l.map((x) => (x.id === id ? { ...x, audit_status: auditStatus } : x)));
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "操作失败", "error");
    }
  };

  const editContent = async (r: VideoCommentItem) => {
    const next = window.prompt("修改评论内容", r.content);
    if (next === null || next === r.content) return;
    try {
      const updated = await adminEndpoints.updateVideoComment(r.id, { content: next });
      setRows((l) => l.map((x) => (x.id === r.id ? updated : x)));
      showConfigToast("修改成功", "ok");
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "修改失败", "error");
    }
  };

  const deleteRow = async (r: VideoCommentItem) => {
    if (!window.confirm(`确定删除评论 ${r.id}？`)) return;
    try {
      await adminEndpoints.deleteVideoComment(r.id);
      showConfigToast("删除成功", "ok");
      load(tab);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "删除失败", "error");
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="finord-card cmt-card">
        <div className="cmt-title">评论管理</div>

        <div className="cmt-filters">
          <div className="cmt-tabs">
            {STATUS_TABS.map((t) => (
              <button key={t.label} className={`cmt-tab ${tab === t.value ? "active" : ""}`} onClick={() => setTab(t.value)}>{t.label}</button>
            ))}
          </div>
          <label className="cmt-head-check">
            <input type="checkbox" className="cmt-check" checked={allChecked} onChange={toggleHead} />
          </label>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table cmt-table">
            <thead>
              <tr>
                <th className="cmt-col-check">
                  <input type="checkbox" className="cmt-check" checked={allChecked} onChange={toggleHead} />
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
                    <input type="checkbox" className="cmt-check" checked={checked.includes(r.id)} onChange={() => toggleRow(r.id)} />
                  </td>
                  <td className="cmt-id">{r.id}</td>
                  <td className="cmt-content">
                    <div className="cmt-content-text">{r.content}</div>
                    <div className="cmt-content-source">原文：{r.video_description || "-"}</div>
                  </td>
                  <td className="cmt-likes">{r.like_count}</td>
                  <td className="cmt-time">{fmt(r.created_at)}</td>
                  <td className="cmt-ip">{r.ip || "-"}</td>
                  <td className="cmt-member">{r.nickname || r.user_id}</td>
                  <td>
                    <select className="cmt-audit-select" value={r.audit_status} onChange={(e) => changeAudit(r.id, e.target.value)}>
                      {AUDIT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="cmt-ops">
                      <a className="finord-link" onClick={() => editContent(r)}>编辑</a>
                      <a className="finord-link">回复</a>
                      <a className="finord-link cmt-op-del" onClick={() => deleteRow(r)}>删除</a>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "32px 0", color: "#98a2b3" }}>暂无数据</td></tr>
              )}
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
