"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import UserCandidatePicker from "@/components/UserCandidatePicker";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { adminEndpoints } from "@/lib/admin-endpoints";
import type { PartnerLevelId, PartnerStaffItem, PartnerUserCandidate } from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("合伙红娘", "合伙人管理");

const columns = ["ID", "合伙人", "合伙级别", "状态", "创建时间", "团队成员", "团队业绩", "团队有效会员", "累积分成", "操作"];

const LEVEL_OPTIONS: { id: PartnerLevelId; label: string }[] = [
  { id: 1, label: "初级合伙人" },
  { id: 2, label: "中级合伙人" },
  { id: 3, label: "战略合伙人" },
];

const fmt = (value: string | null) => (value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-");

export default function LovePartnerListPage() {
  const router = useRouter();
  const [rows, setRows] = useState<PartnerStaffItem[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<PartnerStaffItem | null>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);
  const [bulkRunning, setBulkRunning] = useState(false);

  const allSelected = rows.length > 0 && selected.length === rows.length;
  // 批量关闭只作用于「正常」状态的行；已关闭的行本身没有删除动作
  const selectedActiveRows = rows.filter((r) => selected.includes(r.id) && r.status === 1);

  const bulkClose = async () => {
    setBulkRunning(true);
    let done = 0;
    const failed: string[] = [];
    for (const row of selectedActiveRows) {
      try {
        await adminEndpoints.deletePartner(row.team_id);
        done += 1;
      } catch (error) {
        failed.push(`${row.account || row.id}：${error instanceof Error ? error.message : "关闭失败"}`);
      }
    }
    setBulkRunning(false);
    setBulkConfirmOpen(false);
    showConfigToast(failed.length ? `已关闭 ${done} 个，失败 ${failed.length} 个` : `已关闭 ${done} 个合伙人`, failed.length ? "error" : "ok");
    if (failed.length) setMessage(failed.join("；"));
    await load();
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminEndpoints.partnerList({ page, page_size: pageSize });
      setRows(result.items);
      setTotal(result.total);
      setSelected([]);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { void load(); }, [load]);

  const removeRow = async (row: PartnerStaffItem) => {
    if (typeof window !== "undefined" && !window.confirm(`确认关闭合伙人「${row.team_name}」？团队成员将被移出，合伙人角色将被撤销。`)) return;
    try {
      await adminEndpoints.deletePartner(row.team_id);
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "删除失败");
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
            <p>1、合伙红娘（简称：合伙人）是同城相亲平台中的一种"合作"角色，合伙人通过为平台大量发展推广红娘作为平台快速且可持续性拓展会员和变现，合伙人从中可得分成奖励。</p>
            <p>2、合伙人可以看到有多多单身的资源，兼容红娘渠道的个人与商机机构，每个合伙人被视为一个团队，可以自定义一个团队的名称，其发展来的推广红娘被纳入为团队成员，旗下推广红娘发展来的会员在平台上产生的消费总额度成为团队业绩。系统根据其团队业绩及发展会员数数量将合伙人划分为了三个不同级别，不同的级别享有不同的分佣标准（级别和分佣比例均可在后台配置）</p>
            <p>3、合伙人除了能拿到所有团队成员发展来的会员的注册奖励之外，团队成员发展来的相亲会员在平台中每一笔消费，合伙人可以获得分成</p>
            <p>4、合伙人拥有独立的管理中心，团队成员名单、业绩明细、分佣明细、有效相亲会员名单等可清晰透明可见，分佣金额可随时申请提现到微信零钱</p>
            <p>5、推广红娘可以与合伙人身份并存，但不得是服务红娘。如果合伙人本身已经是推广红娘且未加入其他团队情况下，或在成为合伙人之后成为推广红娘，则自动加入到自己的团队中。且可在推广红娘中心切换登录到合伙人管理中</p>
            <p>6、平台支持在线付费自助开通、联系平台人工开通合伙人两种形式（在平台配置-收费配置"中设置），由平台管理员人工在"系统后台-合伙人管理-开通管理"于对应权限</p>
            <p>7、推广红娘在加入团队之前，必须先在平台注册账号，再申请成为推广红娘。绑定关系后随时解绑和更换团队，重新计算累计业绩</p>
            <p>8、每个合伙人拥有独立的邀请二维码，别人扫合伙人二维码后，进入平台，只要注册为用户，即可绑定关系。任何时候该用户推广红娘，都会自动加入之前扫码的那个合伙人团队</p>
            <p>9、<b>团队成员：</b>合伙人A的团队中的推广红娘，<b>红娘业绩：</b>合伙人A团队所有推广红娘发展来的相亲会员在平台中的消费总额，<b>团队有效会员：</b>合伙人A团队所有推广红娘发展来的资料审核通过相亲会员总数，<b>累积分成：</b>合伙人获得的分成总额</p>
          </div>
        </div>
      </div>

      <div className="finord-card lpl-card au-card">
        <div className="lpl-head">
          <h2 className="lpl-title">合伙人管理</h2>
          <button className="finord-btn finord-btn-primary lpl-add-btn" onClick={() => { setEditing(null); setAddOpen(true); }}>＋ 添加合伙人</button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table lpl-table">
            <thead>
              <tr>
                <th><input type="checkbox" aria-label="全选" checked={allSelected} onChange={() => setSelected(allSelected ? [] : rows.map((r) => r.id))} /></th>
                {columns.map((c) => <th key={c}>{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className={selected.includes(p.id) ? "selected" : undefined}>
                  <td><input type="checkbox" aria-label={`选择合伙人 ${p.id}`} checked={selected.includes(p.id)} onChange={() => setSelected((current) => current.includes(p.id) ? current.filter((id) => id !== p.id) : [...current, p.id])} /></td>
                  <td>{p.id}</td>
                  <td>
                    <div className="lpl-partner">
                      <div className="lpl-avatar">?</div>
                      <div className="lpl-partner-info">
                        <div>账号：{p.account || `用户${p.user_id}`}</div>
                        <div className="lpl-team">团队：{p.team_name}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="lpl-level">{p.level_name || `级别${p.level_id}`}</span></td>
                  <td>
                    {/* 删除是「关闭」软删而非物理删除，必须让状态可见，否则用户会重复点删 */}
                    <span className={p.status === 1 ? "text-[#52c41a]" : "text-[#999]"}>
                      {p.status_label || (p.status === 1 ? "正常" : p.status === 2 ? "已关闭" : "已停用")}
                    </span>
                  </td>
                  <td className="lpl-time">{fmt(p.created_at)}</td>
                  <td>
                    {p.member_count}人{" "}
                    <a className="finord-link" role="button" onClick={() => router.push("/love-partner-relation")}>名单</a>
                  </td>
                  <td><span className="lpl-performance">{p.performance_amount}元</span></td>
                  <td>{p.effective_member_count}</td>
                  <td>
                    <span className="lpl-bonus">{p.commission_amount}元</span>
                    <a className="finord-link lpl-bonus-link" role="button" onClick={() => router.push("/love-partner-bonus-details")}>[明细]</a>
                  </td>
                  <td>
                    <div className="lpl-ops">
                      {/* 后端只有合伙人本人 JWT 的客户端接口（/matchmaker/partner-center），后台无免登签发接口，故标记禁用 */}
                      <span
                        className="finord-link text-[#bfbfbf]"
                        style={{ cursor: "not-allowed" }}
                        aria-disabled="true"
                        title="合伙人中心为客户端功能，后台暂无免登入口，已禁用"
                      >
                        合伙人中心
                      </span>
                      <a className="finord-link" role="button" onClick={() => { setEditing(p); setAddOpen(true); }}>编辑</a>
                      {p.status === 1 ? (
                        <a className="finord-link lpl-op-del" role="button" onClick={() => void removeRow(p)}>删除</a>
                      ) : (
                        // 关闭是软删，行会留在列表里；已关闭的行不再提供删除，避免重复操作
                        <span className="finord-link text-[#bfbfbf]" title="该合伙人已关闭">已删除</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: "center", color: "#999" }}>
                    {loading ? "加载中…" : "暂无数据"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selected.length > 0 && (
          <div className="lead-bulk-toolbar">
            <span>已选择 <b>{selected.length}</b> 项</span>
            <button type="button" disabled={selectedActiveRows.length === 0 || bulkRunning} onClick={() => setBulkConfirmOpen(true)}>批量关闭</button>
            <button type="button" onClick={() => setSelected([])}>取消选择</button>
          </div>
        )}
        <AdminPagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
        {message && <p style={{ color: "#faad14", marginTop: 12 }}>{message}</p>}
      </div>

      {bulkConfirmOpen && (
        <>
          <div className="tlc-mask" onClick={() => !bulkRunning && setBulkConfirmOpen(false)} />
          <div role="dialog" aria-modal="true" aria-label="批量关闭合伙人" style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1300, width: 420, background: "#fff", borderRadius: 8, padding: "20px 22px" }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#25272d", marginBottom: 12 }}>批量关闭合伙人</div>
            <p style={{ fontSize: 13, color: "#545a69", lineHeight: 1.7, margin: 0 }}>
              确认关闭已选的 {selectedActiveRows.length} 个正常状态合伙人？团队成员将被移出，合伙人角色将被撤销，关闭后无法在列表中恢复。
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button type="button" className="finord-btn lpl-cancel" disabled={bulkRunning} onClick={() => setBulkConfirmOpen(false)}>取消</button>
              <button type="button" className="finord-btn finord-btn-primary" disabled={bulkRunning || selectedActiveRows.length === 0} onClick={() => void bulkClose()}>
                {bulkRunning ? "关闭中…" : "确定关闭"}
              </button>
            </div>
          </div>
        </>
      )}

      {addOpen && (
        <AddPartnerDrawer
          partner={editing}
          onClose={() => { setAddOpen(false); setEditing(null); }}
          onSaved={() => { setAddOpen(false); setEditing(null); void load(); }}
        />
      )}
    </div>
  );
}

function AddPartnerDrawer({ partner, onClose, onSaved }: {
  partner: PartnerStaffItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [account, setAccount] = useState(partner?.account ?? "");
  const [teamName, setTeamName] = useState(partner?.team_name ?? "");
  const [level, setLevel] = useState<string>(partner ? (partner.level_name || "初级合伙人") : "初级合伙人");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const onAccountChange = (value: string, pickedId: number | null) => {
    setAccount(value);
    setSelectedUserId(pickedId);
  };

  // 选中候选账号后，若未填团队名则先用昵称兜底
  const onPickCandidate = (c: PartnerUserCandidate) => {
    if (!teamName.trim()) setTeamName(c.nickname ?? "");
  };

  const submit = async () => {
    if (!partner && !account.trim()) { setMessage("请输入账号昵称"); return; }
    if (!teamName.trim()) { setMessage("请输入团队名称"); return; }
    setSaving(true);
    setMessage("");
    try {
      if (partner) {
        await adminEndpoints.updatePartner(partner.team_id, {
          team_name: teamName.trim(),
          level_id: (LEVEL_OPTIONS.find((o) => o.label === level)?.id ?? 1) as PartnerLevelId,
        });
      } else {
        await adminEndpoints.createPartner({
          ...(selectedUserId ? { user_id: selectedUserId } : { lookup: account.trim(), lookup_by: "nickname" as const }),
          team_name: teamName.trim(),
          level_id: (LEVEL_OPTIONS.find((o) => o.label === level)?.id ?? 1) as PartnerLevelId,
        });
      }
      showConfigToast(partner ? "合伙人已更新" : "合伙人已添加");
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
      <div className="tlc-panel lpl-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭"><X size={18} /></button>
            <span className="tlc-panel-title">添加/编辑合伙人</span>
          </div>
          <div className="lpl-head-actions">
            <button className="finord-btn lpl-cancel" onClick={onClose}>关闭</button>
            <button className="finord-btn finord-btn-primary" disabled={saving} onClick={() => void submit()}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="ecl-notice lpl-drawer-notice">
            <div className="ecl-notice-body">
              <span className="ecl-notice-ic">i</span>
              <div className="ecl-notice-text">
                <p>1、合伙人需先在平台上注册账号，并已绑定手机号和微信号</p>
                <p>2、推广红娘可以同时成为合伙人，服务红娘身份不可成为合伙人</p>
                <p>3、推广红娘若归属有合伙人团队，在成为合伙人后，其默认归属关系依然保留在原有团队，直到平台中进行设置后进行"团队变更"操作</p>
                <p>4、推广红娘若没有归属团队，在成为合伙人后自动加入成为团队成员</p>
                <p>5、一个推广红娘账号只允许隶属一个合伙团队</p>
              </div>
            </div>
          </div>

          {/* 用户账号 */}
          <div className="lpl-row">
            <span className="lpl-label">＊用户账号</span>
            <div className="lpl-content">
              {partner ? (
                <input className="lpl-input-wide" value={account} readOnly onChange={(e) => setAccount(e.target.value)} />
              ) : (
                <UserCandidatePicker
                  value={account}
                  onChange={onAccountChange}
                  onSelect={onPickCandidate}
                  search={(kw) => adminEndpoints.partnerUserCandidates(kw)}
                  className="lpl-input-wide"
                  placeholder="输入昵称 / 手机号 / 用户ID / 姓名搜索已注册用户"
                />
              )}
              <div className="lpl-info">
                ① 服务红娘不能成为合伙人；支持按用户ID / 手机号 / 昵称 / 姓名搜索
                {!partner && account.trim() && (
                  selectedUserId ? `（已选择账号 ID：${selectedUserId}）` : "（未选择用户，请从候选列表中选择）"
                )}
              </div>
            </div>
          </div>

          {/* 团队名称 */}
          <div className="lpl-row">
            <span className="lpl-label">＊团队名称</span>
            <div className="lpl-content">
              <input
                className="lpl-input-wide"
                placeholder="请输入团队名称"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
              />
              <div className="lpl-info">① 请输入合伙人团队的名称，如：校园红娘小队</div>
            </div>
          </div>

          {/* 分成级别 */}
          <div className="lpl-row">
            <span className="lpl-label">＊分成级别</span>
            <div className="lpl-content">
              <div className="lpl-radio-row">
                {LEVEL_OPTIONS.map((o) => (
                  <label key={o.label} className={`lpl-radio ${level === o.label ? "active" : ""}`}>
                    <input type="radio" name="level" value={o.label} checked={level === o.label} onChange={() => setLevel(o.label)} />
                    <span>{o.label}</span>
                  </label>
                ))}
              </div>
              <div className="lpl-info">① 不同级别的享有不同的分成标准，请在分级配置中自行设定相关标准</div>
            </div>
          </div>

          {message && <p style={{ color: "#ff4d4f" }}>{message}</p>}
        </div>
      </div>
    </>
  );
}
