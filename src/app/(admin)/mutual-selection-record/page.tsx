"use client";

import { useCallback, useEffect, useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints, type MutualOptions, type MutualRecordItem } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("活动报名", "互选记录");

const columns = ["时间", "行为方", "行为动作", "行为对象", "活动名称", "互选结果"];

const STATUS_MAP: Record<string, "none" | "fail" | "success" | undefined> = {
  "不选": undefined,
  "未成功": "fail",
  "已成功": "success",
};

export default function MutualSelectionRecordPage() {
  const [status, setStatus] = useState("不选");
  const [activityId, setActivityId] = useState("");
  const [actorId, setActorId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [options, setOptions] = useState<MutualOptions>({ activities: [], actors: [] });
  const [rows, setRows] = useState<MutualRecordItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    adminEndpoints.mutualRecordOptions().then(setOptions).catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminEndpoints.mutualRecordList({
        page: 1,
        page_size: 50,
        activity_id: activityId ? Number(activityId) : undefined,
        actor_id: actorId ? Number(actorId) : undefined,
        keyword: keyword || undefined,
        result: STATUS_MAP[status],
      });
      setRows(res.items);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [activityId, actorId, keyword, status]);

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const fmt = (v: string | null) => (v ? v.replace("T", " ").slice(0, 16) : "-");

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>在这里记录了所有活动参与者「选择心动嘉宾」的历史记录，可以让红娘掌握客户的心动意向，为精准服务和跟进提供重要参考；</p>
            <p>活动结束之后，若互选都选择了对方心动嘉宾，则被视为「互选成功」，可自行添加对方微信或者由红娘介入互推微信名片。</p>
          </div>
        </div>
      </div>

      <div className="finord-card mr-card">
        <div className="mr-title">互选记录</div>

        <div className="mr-filters">
          <select className="mr-select" value={activityId} onChange={(e) => setActivityId(e.target.value)}>
            <option value="">按活动筛选</option>
            {options.activities.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
          <select className="mr-select" value={actorId} onChange={(e) => setActorId(e.target.value)}>
            <option value="">按行为方</option>
            {options.actors.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
          <input className="mr-input" placeholder="输入会员昵称/编号/姓名" value={keyword} onChange={(e) => setKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} />
          <button className="finord-btn finord-btn-primary mr-search-btn" onClick={() => load()}>搜索</button>
          <div className="mr-status">
            <span className="mr-status-label">状态：</span>
            {["不选", "未成功", "已成功"].map((o) => (
              <label key={o} className={`mr-radio ${status === o ? "active" : ""}`}>
                <input type="radio" name="status" value={o} checked={status === o} onChange={() => setStatus(o)} />
                <span>{o}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table mr-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{fmt(r.created_at)}</td>
                  <td>{r.from_nickname || r.from_user_id}</td>
                  <td>{r.action_label || r.action}</td>
                  <td>{r.to_nickname || r.to_user_id}</td>
                  <td>{r.activity_title || "-"}</td>
                  <td>{r.result_label || r.result}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="mr-empty">
                    <div className="mr-empty-inner">
                      <div className="mr-empty-icon">📦</div>
                      <div className="mr-empty-text">暂无数据</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
