"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { PartnerRelationItem, PartnerTeamOption } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("合伙红娘", "团队关系");

const columns = ["ID", "推广红娘", "隶属合伙人（团队）", "加入团队时间", "发展会员数量", "团队业绩贡献", "团队关系状态", "操作"];

const fmt = (value: string | null) => (value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-");

export default function LovePartnerRelationPage() {
  const [rows, setRows] = useState<PartnerRelationItem[]>([]);
  const [teams, setTeams] = useState<PartnerTeamOption[]>([]);
  const [teamFilter, setTeamFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [applied, setApplied] = useState({ team: "", keyword: "" });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [bindOpen, setBindOpen] = useState(false);
  const [bindTarget, setBindTarget] = useState<PartnerRelationItem | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.partnerRelations({
        page,
        page_size: pageSize,
        team_id: applied.team ? Number(applied.team) : undefined,
        keyword: applied.keyword || undefined,
      });
      setRows(result.items);
      setTotal(result.total);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, applied]);

  useEffect(() => { void load(); }, [load]);

  useEffect(() => {
    adminEndpoints.partnerTeamOptions().then(setTeams).catch(() => setTeams([]));
  }, []);

  const search = () => {
    setPage(1);
    setApplied({ team: teamFilter, keyword: keyword.trim() });
  };

  const removeRow = async (row: PartnerRelationItem) => {
    const reason = typeof window !== "undefined"
      ? window.prompt(`确认将「${row.promoter_name ?? row.promoter_id}」移出团队「${row.team_name ?? ""}」？请填写原因`, "后台人工移出团队")
      : "后台人工移出团队";
    if (reason === null) return;
    if (!reason.trim()) { setMessage("请填写移出原因"); return; }
    try {
      await adminEndpoints.removePartnerRelation(row.id, reason.trim());
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "移出失败");
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>推广红娘有4种方式加入合伙人团队，从属建立团队关系：</p>
            <p>1、每个合伙人拥有独立的邀请二维码，别人扫合伙人二维码后，进入平台，只要注册为用户，即可绑定关系。任何时候该用户推广红娘，都会自动加入到之前扫码的那个合伙人团队</p>
            <p>2、在推广红娘中心点击加入团队，在弹出来选择要加入的团队，选择后则立即加入到合伙人团队中</p>
            <p>3、平台管理员在后台人工操作，可将推广红娘加入指定的合伙人团队中去</p>
            <p>4、如果合伙人本身已经是推广红娘且未加入其他团队、或在成为合伙人之后成为推广红娘，则自动加入到自己的团队中</p>
            <p><b>每个推广红娘只可以加入1个合伙人团队，</b>若已经有团队，则不允许加入新的团队以及自动升级为合伙人，若需要变更或者解除团队关系，需要联系平台管理员在后台操作</p>
            <p>只有团队关系状态为"正常"才会为团队成员。当团队关系状态变除了非正常时此记录变更。在原来的团队的记录中团队关系将 移出或变更，并记录有时间，从此时间开始将原成员不再为团队成员</p>
          </div>
        </div>
      </div>

      <div className="finord-card lpr-card">
        <div className="lpr-head">
          <h2 className="lpr-title">合伙人团队关系</h2>
          <button className="finord-btn finord-btn-primary lpr-bind-btn" onClick={() => { setBindTarget(null); setBindOpen(true); }}>人工绑定团队关系</button>
        </div>

        <div className="lpr-filters">
          <select className="lpr-select" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
            <option value="">按隶属合伙人搜</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>{`${team.name}${team.owner_name ? `（${team.owner_name}）` : ""}`}</option>
            ))}
          </select>
          <input
            className="lpr-input"
            placeholder="请输入"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") search(); }}
          />
          <button className="finord-btn finord-btn-primary lpr-search-btn" onClick={search}>搜索</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table lpr-table">
            <thead>
              <tr>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.promoter_name ?? `红娘${r.promoter_id}`}</td>
                  <td>{r.team_name ?? "-"}</td>
                  <td className="lpr-time">{fmt(r.joined_at)}</td>
                  <td>{r.member_count}</td>
                  <td><span className="lpr-performance">{r.performance_amount}元</span></td>
                  <td><span className="lpr-status">{r.status_label}</span></td>
                  <td>
                    <div className="lpr-ops">
                      <a className="finord-link" role="button" onClick={() => void removeRow(r)}>移出团队</a>
                      <a className="finord-link" role="button" onClick={() => { setBindTarget(r); setBindOpen(true); }}>变更团队</a>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ textAlign: "center", color: "#999" }}>
                    {loading ? "加载中…" : "暂无数据"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="lpr-pager">
          <span
            className="lpr-pager-arrow"
            style={{ cursor: page > 1 ? "pointer" : "default" }}
            onClick={() => { if (page > 1) setPage(page - 1); }}
          >
            ‹
          </span>
          <span className="lpr-pager-cur">{page}</span>
          <span
            className="lpr-pager-arrow"
            style={{ cursor: page < totalPages ? "pointer" : "default" }}
            onClick={() => { if (page < totalPages) setPage(page + 1); }}
          >
            ›
          </span>
        </div>
        {message && <p style={{ color: "#ff4d4f", marginTop: 12 }}>{message}</p>}
      </div>

      {bindOpen && (
        <BindRelationDrawer
          target={bindTarget}
          teams={teams}
          onClose={() => { setBindOpen(false); setBindTarget(null); }}
          onSaved={() => { setBindOpen(false); setBindTarget(null); void load(); }}
        />
      )}
    </div>
  );
}

function BindRelationDrawer({ target, teams, onClose, onSaved }: {
  target: PartnerRelationItem | null;
  teams: PartnerTeamOption[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [promoter, setPromoter] = useState(target?.promoter_name ?? "");
  const [teamId, setTeamId] = useState(target ? String(target.team_id) : "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async () => {
    if (!promoter.trim()) { setMessage("请输入推广红娘的账号昵称"); return; }
    if (!teamId) { setMessage("请选择一个团队"); return; }
    setSaving(true);
    setMessage("");
    try {
      await adminEndpoints.bindPartnerRelation({
        promoter_user_id: target?.promoter_id,
        promoter_lookup: target ? undefined : promoter.trim(),
        team_id: Number(teamId),
        reason: target ? "后台人工变更团队" : "后台人工绑定团队",
      });
      showConfigToast(target ? "团队关系已变更" : "团队关系已绑定");
      onSaved();
    } catch (error) {
      const text = error instanceof Error ? error.message : "提交失败";
      setMessage(text);
      showConfigToast(text, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel lpr-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">人工绑定团队关系</span>
          </div>
          <div className="lpr-head-actions">
            <button className="finord-btn lpr-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary" disabled={saving} onClick={() => void submit()}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="lpr-warn">① 若推广红娘已经隶属于其他合伙人团队，本操作会将其从原有团队中移除并绑定到您指定的团队中</div>

          {/* 推广红娘 */}
          <div className="lpr-row">
            <span className="lpr-label">＊推广红娘</span>
            <div className="lpr-content">
              <input
                className="lpr-input-wide"
                placeholder="请输入推广红娘的账号昵称"
                value={promoter}
                readOnly={Boolean(target)}
                onChange={(e) => setPromoter(e.target.value)}
              />
              <div className="lpr-info">① 请填写推广红娘的账号昵称</div>
            </div>
          </div>

          {/* 绑定到 */}
          <div className="lpr-row">
            <span className="lpr-label">＊绑定到</span>
            <select className="lpr-select-wide" value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">请选择一个团队</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{`${team.name}${team.owner_name ? `（${team.owner_name}）` : ""}`}</option>
              ))}
            </select>
          </div>

          {message && <p style={{ color: "#ff4d4f" }}>{message}</p>}
        </div>
      </div>
    </>
  );
}
