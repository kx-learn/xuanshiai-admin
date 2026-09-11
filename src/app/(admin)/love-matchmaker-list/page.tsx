"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  MessageSquare,
  Phone,
  Plus,
  X,
} from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import ConfirmDialog from "@/components/ConfirmDialog";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { resolveMediaUrl } from "@/lib/admin-api";
import { adminEndpoints } from "@/lib/admin-endpoints";
import {
  pickAndUploadImage,
  showConfigToast,
} from "@/lib/platform-config";
import type {
  AdminMenuNode,
  MatchmakerStaffItem,
  MatchmakerTutorial,
  MatchmakerUserCandidate,
  MatchmakerWorkReport,
  CommissionLevelDictItem,
} from "@/lib/admin-endpoints";

const breadcrumb = getBreadcrumb("总店红娘", "红娘管理");

const PAGE_SIZE = 20;

const SLOGAN_OPTIONS = [
  "为爱牵线，成就幸福",
  "专业红娘，一对一服务",
  "真实靠谱的脱单平台",
  "用心守护每一段缘分",
  "让相遇不再困难",
];

const reportCols = [
  "红娘",
  "线索新增客源",
  "会员CRM新增资料",
  "线索跟进",
  "会员CRM跟进",
  "新增线上牵线",
  "牵线成功",
  "预约申请",
  "约会安排",
  "线上分成",
  "线下业绩",
];

function paletteOf(id: number): string {
  return ["a", "b", "c", "d", "e", "f"][((id % 6) + 6) % 6];
}

function fmtDate(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function last30Range(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: fmtDate(from), to: fmtDate(to) };
}

export default function LoveMatchmakerListPage() {
  const [list, setList] = useState<MatchmakerStaffItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");

  const [reportOpen, setReportOpen] = useState(false);
  const [reportRow, setReportRow] = useState<MatchmakerStaffItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<MatchmakerStaffItem | null>(null);

  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorial, setTutorial] = useState<MatchmakerTutorial | null>(null);

  const [permOpen, setPermOpen] = useState(false);
  const [permRow, setPermRow] = useState<MatchmakerStaffItem | null>(null);

  const [delRow, setDelRow] = useState<MatchmakerStaffItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminEndpoints.matchmakerStaffList({
        page,
        page_size: PAGE_SIZE,
        keyword: keyword.trim() || undefined,
      });
      setList(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearch = () => {
    setPage(1);
    void load();
  };

  const onToggleLock = async (row: MatchmakerStaffItem) => {
    try {
      await adminEndpoints.updateMatchmakerLock(row.id, { locked: !row.locked });
      showConfigToast("已更新锁定状态");
      void load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "更新失败", "error");
    }
  };

  const onToggleVisible = async (row: MatchmakerStaffItem) => {
    try {
      await adminEndpoints.updateMatchmakerVisibility(row.id, { visible: !row.visible });
      showConfigToast("已更新前台展示状态");
      void load();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "更新失败", "error");
    }
  };

  const onPlatform = async (row: MatchmakerStaffItem) => {
    try {
      const res = await adminEndpoints.matchmakerPlatformToken(row.id);
      if (res.jump_url) window.open(res.jump_url, "_blank");
      else showConfigToast("未返回跳转地址", "error");
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "获取令牌失败", "error");
    }
  };

  const onPoster = async (row: MatchmakerStaffItem) => {
    try {
      const res = await adminEndpoints.matchmakerPoster(row.id);
      if (res.url) window.open(resolveMediaUrl(res.url) ?? res.url, "_blank");
      showConfigToast("海报已生成");
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "生成海报失败", "error");
    }
  };

  const onTutorial = async () => {
    try {
      const t = await adminEndpoints.matchmakerTutorial();
      setTutorial(t);
      setTutorialOpen(true);
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "加载教程失败", "error");
    }
  };

  const onConfirmDelete = async () => {
    if (!delRow) return;
    try {
      await adminEndpoints.deleteMatchmakerStaff(delRow.id);
      showConfigToast("红娘已删除");
      setDelRow(null);
      void load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "删除失败";
      if (/客源|牵线|记录|409/.test(msg)) {
        showConfigToast("该红娘存在客源或牵线记录，无法删除", "error");
      } else {
        showConfigToast(msg, "error");
      }
    }
  };

  return (
    <div className="min-w-0">
      <AdminBreadcrumb items={breadcrumb} />

      {/* 须知 */}
      <div className="ecl-notice">
        <div className="ecl-notice-body">
          <span className="ecl-notice-ic">i</span>
          <div className="ecl-notice-text">
            <div className="ecl-notice-title">须知</div>
            <p>
              <b>平台运营老板：</b>
              即系统后台管理员,能查看、管理平台中的所有门店的客源信息、会员资料、联系方式、牵线记录、跟进档案等、红娘,并可以创建分店
            </p>
            <p>
              <b>总店-超级红娘：</b>
              在红娘平台中可以查看、操作、编辑平台的全部客源信息、会员资料、联系方式、牵线记录、跟进档案等
            </p>
            <p>
              <b>总店-普通红娘：</b>
              在红娘平台中可以查看、操作、编辑在总店中归属自己名下的全部客源信息、联系方式、会员资料、牵线记录、跟进档案等
            </p>
          </div>
        </div>
      </div>

      <div className="finord-card hm-card">
        <div className="hm-head">
          <div className="hm-head-left">
            <h2 className="hm-title">红娘管理</h2>
            <button type="button" className="hm-tutorial" onClick={onTutorial}>
              <BookOpen size={13} />
              红娘使用教程
            </button>
          </div>
          <div className="hm-head-actions">
            <button
              type="button"
              className="finord-btn finord-btn-outline hm-report-btn"
              onClick={() => {
                setReportRow(list[0] ?? null);
                setReportOpen(true);
              }}
            >
              <BarChart3 size={14} />
              红娘工作汇报
            </button>
            <button
              type="button"
              className="finord-btn finord-btn-primary hm-add-btn"
              onClick={() => {
                setEditRow(null);
                setAddOpen(true);
              }}
            >
              <Plus size={14} />
              添加红娘
            </button>
          </div>
        </div>

        <div className="hm-filters">
          <input
            className="hm-input"
            placeholder="请输入红娘昵称/账号/手机"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <button type="button" className="finord-btn finord-btn-primary hm-search-btn" onClick={handleSearch}>
            搜索
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table hm-table">
            <colgroup>
              <col style={{ width: 250 }} />
              <col style={{ width: 160 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 104 }} />
              <col style={{ width: 104 }} />
              <col style={{ width: 90 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: "auto" }} />
            </colgroup>
            <thead>
              <tr>
                <th>红娘</th>
                <th>手机/微信</th>
                <th>分成级别</th>
                <th>牵线成功数</th>
                <th>累计分成</th>
                <th>锁定</th>
                <th>前台展示</th>
                <th>菜单权限</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="hm-empty">加载中…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={9} className="hm-empty hm-empty-error">{error}</td>
                </tr>
              )}
              {!loading && !error && list.length === 0 && (
                <tr>
                  <td colSpan={9} className="hm-empty">暂无数据</td>
                </tr>
              )}
              {!loading &&
                !error &&
                list.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="hm-member">
                        <div className="hm-avatar-wrap">
                          {row.avatar ? (
                            <img className={`hm-avatar hm-g-${paletteOf(row.id)}`} src={resolveMediaUrl(row.avatar)} alt="" />
                          ) : (
                            <span className={`hm-avatar hm-g-${paletteOf(row.id)}`} />
                          )}
                          <span className="hm-role-badge">{row.role_label}</span>
                        </div>
                        <div className="hm-member-info">
                          <div className="hm-line">
                            <span className="hm-line-k">称呼：</span>
                            {row.display_name}
                          </div>
                          <div className="hm-line">
                            <span className="hm-line-k">账号：</span>
                            {row.username ?? "-"}
                          </div>
                          <div className="hm-line">
                            <span className="hm-line-k">归属：</span>
                            {row.store_name ?? "-"}
                          </div>
                          <div className="hm-line">
                            <span className="hm-line-k">描述：</span>
                            {row.description ?? "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="hm-contact">
                        <Phone size={12} />
                        <span>{row.phone ?? "-"}</span>
                      </div>
                      <div className="hm-contact">
                        <MessageSquare size={12} />
                        <span>{row.wechat ?? "-"}</span>
                      </div>
                    </td>
                    <td>
                      <span className="hm-level">{row.commission_level_name ?? "-"}</span>
                    </td>
                    <td>{row.success_count}人</td>
                    <td>{row.commission_amount}</td>
                    <td>
                      <button
                        type="button"
                        className={`hm-pill ${row.locked ? "lock" : "normal"}`}
                        onClick={() => onToggleLock(row)}
                      >
                        {row.locked ? "已锁定" : "正常"}
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`hm-pill ${row.visible ? "show" : "hide"}`}
                        onClick={() => onToggleVisible(row)}
                      >
                        {row.visible ? "展示" : "隐藏"}
                      </button>
                    </td>
                    <td>
                      <button type="button" className="hm-link" onClick={() => { setPermRow(row); setPermOpen(true); }}>
                        菜单管理
                      </button>
                    </td>
                    <td>
                      <div className="hm-actions">
                        <button type="button" className="hm-link" onClick={() => onPlatform(row)}>
                          红娘平台
                        </button>
                        <button type="button" className="hm-link" onClick={() => { setReportRow(row); setReportOpen(true); }}>
                          数据报表
                        </button>
                        <button type="button" className="hm-link" onClick={() => onPoster(row)}>
                          海报
                        </button>
                        <button type="button" className="hm-link" onClick={() => { setEditRow(row); setAddOpen(true); }}>
                          编辑
                        </button>
                        <button type="button" className="hm-link danger" onClick={() => setDelRow(row)}>
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <AdminPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={(p) => setPage(p)}
          />
        )}
      </div>

      {reportOpen && reportRow && (
        <ReportDrawer row={reportRow} onClose={() => setReportOpen(false)} />
      )}
      {addOpen && (
        <AddMatchmakerDrawer
          editRow={editRow}
          onClose={() => setAddOpen(false)}
          onSaved={() => {
            setAddOpen(false);
            void load();
          }}
        />
      )}
      {permOpen && permRow && (
        <PermDialog row={permRow} onClose={() => setPermOpen(false)} />
      )}
      {tutorialOpen && tutorial && (
        <TutorialDialog tutorial={tutorial} onClose={() => setTutorialOpen(false)} />
      )}

      <ConfirmDialog
        open={delRow !== null}
        title="删除红娘"
        message={`确定要删除「${delRow?.display_name ?? ""}」吗？此操作不可恢复。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={onConfirmDelete}
        onCancel={() => setDelRow(null)}
      />
    </div>
  );
}

function ReportDrawer({ row, onClose }: { row: MatchmakerStaffItem; onClose: () => void }) {
  const [range, setRange] = useState(last30Range());
  const [report, setReport] = useState<MatchmakerWorkReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminEndpoints.matchmakerWorkReport(row.id, { from: range.from, to: range.to });
      setReport(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [row.id, range.from, range.to]);

  useEffect(() => {
    void load();
  }, [load]);

  const reportValues = report
    ? [
        report.new_lead_count,
        report.new_member_count,
        report.lead_follow_up_count,
        report.follow_up_count,
        report.matchmaking_count,
        report.success_count,
        report.meeting_request_count,
        report.meeting_arranged_count,
        report.commission_amount,
        report.offline_income,
      ]
    : [];

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel hm-report-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">红娘工作汇报</span>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="hm-report-notice">
            <p>
              <b>线上分成：</b>红娘名下的会员在平台中线上消费的分成
            </p>
            <p>
              <b>线下业绩：</b>在线下VIP中作为“销售红娘”的合同金额
            </p>
          </div>

          <div className="hm-report-filters">
            <div className="hm-report-date">
              <input
                type="date"
                value={range.from}
                onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              />
              <span className="hm-report-arrow">→</span>
              <input
                type="date"
                value={range.to}
                onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              />
              <CalendarDays size={14} />
            </div>
            <div className="hm-select">
              <select defaultValue="">
                <option value="">默认排序</option>
              </select>
              <ChevronDown className="hm-caret" size={14} />
            </div>
          </div>

          {loading && <div className="hm-empty">加载中…</div>}
          {!loading && error && <div className="hm-empty hm-empty-error">{error}</div>}

          {!loading && !error && (
            <div className="hm-report-table-wrap">
              <table className="hm-report-table">
                <thead>
                  <tr>
                    {reportCols.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="hm-report-member">
                        {row.avatar ? (
                          <img className="hm-avatar hm-avatar-sm" src={resolveMediaUrl(row.avatar)} alt="" />
                        ) : (
                          <span className={`hm-avatar hm-avatar-sm hm-g-${paletteOf(row.id)}`} />
                        )}
                        <span>{row.display_name}</span>
                      </div>
                    </td>
                    {reportValues.map((v, i) => (
                      <td key={i}>{v === null || v === undefined ? "-" : v}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function AddMatchmakerDrawer({
  editRow,
  onClose,
  onSaved,
}: {
  editRow: MatchmakerStaffItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = editRow !== null;
  const [lookupBy, setLookupBy] = useState<"nickname" | "phone">("nickname");
  const [lookup, setLookup] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<MatchmakerUserCandidate[]>([]);
  const [candidateOpen, setCandidateOpen] = useState(false);

  const [avatar, setAvatar] = useState<string | null>(null);
  const [wechatQr, setWechatQr] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [wechat, setWechat] = useState("");
  const [phone, setPhone] = useState("");
  const [roleTag, setRoleTag] = useState<"super" | "normal">("normal");
  const [commissionLevelId, setCommissionLevelId] = useState<string>("");
  const [contactEditable, setContactEditable] = useState(true);

  const [customSlogan, setCustomSlogan] = useState(false);
  const [sloganSelect, setSloganSelect] = useState("");
  const [sloganCustom, setSloganCustom] = useState("");

  const [timedLock, setTimedLock] = useState(false);
  const [lockAt, setLockAt] = useState("");
  const [sort, setSort] = useState("");

  const [commissionLevels, setCommissionLevels] = useState<CommissionLevelDictItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void adminEndpoints.dictCommissionLevels().then(setCommissionLevels).catch(() => setCommissionLevels([]));
  }, []);

  useEffect(() => {
    if (editRow) {
      setAvatar(editRow.avatar);
      setWechatQr(null);
      setDisplayName(editRow.display_name);
      setDescription(editRow.description ?? "");
      setWechat(editRow.wechat ?? "");
      setPhone(editRow.phone ?? "");
      setRoleTag(editRow.role_tag);
      setCommissionLevelId(editRow.commission_level_id ? String(editRow.commission_level_id) : "");
      setContactEditable(editRow.contact_editable ?? true);
      setCustomSlogan(!!editRow.slogan && !SLOGAN_OPTIONS.includes(editRow.slogan));
      setSloganSelect(SLOGAN_OPTIONS.includes(editRow.slogan ?? "") ? (editRow.slogan ?? "") : "");
      setSloganCustom(SLOGAN_OPTIONS.includes(editRow.slogan ?? "") ? "" : (editRow.slogan ?? ""));
      setTimedLock(!!editRow.lock_at);
      setLockAt(editRow.lock_at ?? "");
      setSort(editRow.sort != null ? String(editRow.sort) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRow]);

  const onLookupChange = (value: string) => {
    setLookup(value);
    setSelectedUserId(null);
    if (value.trim().length >= 2) {
      adminEndpoints
        .matchmakerUserCandidates(value.trim())
        .then((list) => {
          setCandidates(list);
          setCandidateOpen(true);
        })
        .catch(() => {
          setCandidates([]);
          setCandidateOpen(false);
        });
    } else {
      setCandidates([]);
      setCandidateOpen(false);
    }
  };

  const sloganValue = customSlogan ? sloganCustom.trim() : sloganSelect;

  const submit = async () => {
    if (!displayName.trim()) {
      showConfigToast("请填写红娘称呼", "error");
      return;
    }
    if (!phone.trim()) {
      showConfigToast("请填写手机号码", "error");
      return;
    }
    setSaving(true);
    try {
      if (isEdit && editRow) {
        const body: Record<string, unknown> = {};
        if (avatar) body.avatar = avatar;
        body.display_name = displayName.trim();
        body.phone = phone.trim();
        if (wechat.trim()) body.wechat = wechat.trim();
        if (description.trim()) body.description = description.trim();
        body.role_tag = roleTag;
        if (commissionLevelId) body.commission_level_id = Number(commissionLevelId);
        body.contact_editable = contactEditable;
        if (sloganValue) body.slogan = sloganValue;
        if (sort !== "") body.sort = Number(sort);
        if (timedLock && lockAt) body.lock_at = lockAt;
        await adminEndpoints.updateMatchmakerStaff(editRow.id, body);
        showConfigToast("已保存");
      } else {
        const body: Record<string, unknown> = {
          display_name: displayName.trim(),
          phone: phone.trim(),
          role_tag: roleTag,
          contact_editable: contactEditable,
        };
        if (avatar) body.avatar = avatar;
        if (wechat.trim()) body.wechat = wechat.trim();
        if (description.trim()) body.description = description.trim();
        if (commissionLevelId) body.commission_level_id = Number(commissionLevelId);
        if (sloganValue) body.slogan = sloganValue;
        if (sort !== "") body.sort = Number(sort);
        if (timedLock && lockAt) body.lock_at = lockAt;
        if (selectedUserId) {
          body.user_id = selectedUserId;
        } else if (lookup.trim()) {
          body.lookup = lookup.trim();
          body.lookup_by = lookupBy;
        }
        await adminEndpoints.createMatchmakerStaff(body as never);
        showConfigToast("已添加");
      }
      onSaved();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "提交失败", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel bm-drawer-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">添加/编辑服务红娘</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose} disabled={saving}>
              关闭
            </button>
            <button className="finord-btn finord-btn-primary" onClick={submit} disabled={saving}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 账号绑定 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>账号绑定
            </span>
            <div className="bm-content">
              <div className="bm-acct-row">
                <input
                  className="bm-input-wide"
                  placeholder="请输入已注册账号的昵称"
                  value={lookup}
                  disabled={isEdit}
                  onChange={(e) => onLookupChange(e.target.value)}
                />
                {["按昵称", "按手机"].map((o) => {
                  const value = o === "按昵称" ? "nickname" : "phone";
                  return (
                    <label key={o} className={`bm-radio ${lookupBy === value ? "active" : ""}`}>
                      <input
                        type="radio"
                        name="lookupBy"
                        value={value}
                        disabled={isEdit}
                        checked={lookupBy === value}
                        onChange={() => setLookupBy(value as "nickname" | "phone")}
                      />
                      <span>{o}</span>
                    </label>
                  );
                })}
              </div>
              {candidateOpen && candidates.length > 0 && (
                <div className="bm-candidate-list">
                  {candidates.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      className="bm-candidate"
                      onClick={() => {
                        setSelectedUserId(c.id);
                        setLookup(c.nickname ?? c.phone ?? String(c.id));
                        setCandidateOpen(false);
                      }}
                    >
                      {c.avatar ? <img className="bm-candidate-avatar" src={resolveMediaUrl(c.avatar)} alt="" /> : <span className="bm-candidate-avatar bm-candidate-ph" />}
                      <span className="bm-candidate-name">{c.nickname ?? "-"}</span>
                      <span className="bm-candidate-phone">{c.phone ?? "-"}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="bm-info">
                ① 如果查询不到账号，请先让红娘使用微信在平台中登录注册；一个账号只能绑定一个红娘。
                {selectedUserId ? `（已选择账号 ID：${selectedUserId}）` : ""}
              </div>
            </div>
          </div>

          {/* 红娘头像 + 微信二维码 */}
          <div className="bm-row bm-row-top">
            <span className="bm-label">红娘头像</span>
            <div className="bm-content">
              <div className="hm-pick-row">
                <button
                  type="button"
                  className="hm-upload-btn"
                  onClick={(e) => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = () => pickAndUploadImage(input.files?.[0], (url) => setAvatar(url), (m) => showConfigToast(m, "error"));
                    input.click();
                    e.preventDefault();
                  }}
                >
                  {avatar ? <img src={avatar} alt="" className="hm-pick-thumb" /> : <><Plus size={14} /> 上传图片</>}
                </button>
                <div className="hm-pick-item">
                  <span className="hm-pick-label">微信二维码</span>
                  <button
                    type="button"
                    className="hm-upload-btn"
                    onClick={(e) => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = "image/*";
                      input.onchange = () => pickAndUploadImage(input.files?.[0], (url) => setWechatQr(url), (m) => showConfigToast(m, "error"));
                      input.click();
                      e.preventDefault();
                    }}
                  >
                    {wechatQr ? <img src={wechatQr} alt="" className="hm-pick-thumb" /> : <><Plus size={14} /> 上传图片</>}
                  </button>
                </div>
              </div>
              <div className="bm-info">微信二维码仅在前端展示，不提交到后端。</div>
            </div>
          </div>

          {/* 红娘称呼 + 岗位描述 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>红娘称呼
            </span>
            <div className="bm-content">
              <div className="bm-two-col">
                <input
                  className="bm-input-wide"
                  placeholder="请输入红娘称呼"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <div className="hm-inline-field">
                  <span className="hm-inline-label">岗位描述</span>
                  <input
                    className="bm-input-wide"
                    placeholder="如：电话邀约、匹配牵线"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 红娘口号 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>红娘口号
            </span>
            <div className="bm-content">
              <div className="hm-slogan-row">
                <select
                  className="bm-select bm-select-wide"
                  value={customSlogan ? "" : sloganSelect}
                  onChange={(e) => setSloganSelect(e.target.value)}
                  disabled={customSlogan}
                >
                  <option value="">请选择</option>
                  {SLOGAN_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
                <label className="hm-check">
                  <input
                    type="checkbox"
                    checked={customSlogan}
                    onChange={() => setCustomSlogan(!customSlogan)}
                  />
                  <span>自定义输入</span>
                </label>
              </div>
              {customSlogan && (
                <input
                  className="bm-input-wide"
                  placeholder="请输入自定义口号"
                  value={sloganCustom}
                  onChange={(e) => setSloganCustom(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* 微信号 + 手机号码 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>微信号
            </span>
            <div className="bm-content">
              <div className="bm-two-col">
                <input
                  className="bm-input-wide"
                  placeholder="请输入微信号"
                  value={wechat}
                  onChange={(e) => setWechat(e.target.value)}
                />
                <div className="hm-inline-field">
                  <span className="hm-inline-label">
                    <b className="hm-req">*</b>手机号码
                  </span>
                  <input
                    className="bm-input-wide"
                    placeholder="请输入手机号码"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 红娘角色 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>红娘角色
            </span>
            <div className="bm-content">
              <select
                className="bm-select bm-select-wide"
                value={roleTag}
                onChange={(e) => setRoleTag(e.target.value as "super" | "normal")}
              >
                <option value="">请选择红娘角色</option>
                <option value="super">超级红娘</option>
                <option value="normal">普通红娘</option>
              </select>
            </div>
          </div>

          {/* 分成级别 */}
          <div className="bm-row">
            <span className="bm-label">分成级别</span>
            <div className="bm-content">
              <div className="hm-select">
                <select
                  className="bm-select bm-select-wide"
                  value={commissionLevelId}
                  onChange={(e) => setCommissionLevelId(e.target.value)}
                >
                  <option value="">请选择分成级别</option>
                  {commissionLevels.map((lv) => (
                    <option key={lv.id} value={lv.id}>{lv.name}</option>
                  ))}
                </select>
                <ChevronDown className="hm-caret" size={14} />
              </div>
            </div>
          </div>

          {/* 修改联系方式 */}
          <div className="bm-row">
            <span className="bm-label">修改联系方式</span>
            <div className="bm-content">
              <div className="bm-radio-row">
                {["不允许", "允许"].map((o) => (
                  <label key={o} className={`bm-radio ${contactEditable === (o === "允许") ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="editContact"
                      value={o}
                      checked={contactEditable === (o === "允许")}
                      onChange={() => setContactEditable(o === "允许")}
                    />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
              <div className="bm-info">
                ① 若设置为“不允许”则红娘在其红娘平台中无法修改客户的手机号码和微信（包括客源线索、会员CRM）
              </div>
            </div>
          </div>

          {/* 定时锁定 */}
          <div className="bm-row">
            <span className="bm-label">定时锁定</span>
            <div className="bm-content">
              <div className="bm-switch-row">
                <span className="hm-switch-label">{timedLock ? "开启" : "关闭"}</span>
                <button
                  type="button"
                  className={`mp-switch ${timedLock ? "on" : ""}`}
                  onClick={() => setTimedLock(!timedLock)}
                >
                  <span className="mp-switch-knob" />
                </button>
              </div>
              {timedLock && (
                <input
                  type="datetime-local"
                  className="hm-sort-input"
                  value={lockAt}
                  onChange={(e) => setLockAt(e.target.value)}
                />
              )}
              <div className="bm-info">① 开启定时锁定后，到了时间后该账号自动锁定</div>
            </div>
          </div>

          {/* 显示排序 */}
          <div className="bm-row">
            <span className="bm-label">显示排序</span>
            <div className="bm-content">
              <input
                className="hm-sort-input"
                placeholder="数字越大显示越靠前"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PermDialog({ row, onClose }: { row: MatchmakerStaffItem; onClose: () => void }) {
  const [tree, setTree] = useState<AdminMenuNode[]>([]);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([adminEndpoints.adminMenuTree(), adminEndpoints.matchmakerPermissions(row.id)])
      .then(([nodes, perms]) => {
        setTree(nodes);
        setChecked(new Set(perms.menuIds));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [row.id]);

  const toggle = (id: number, value: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminEndpoints.updateMatchmakerPermissions(row.id, { menuIds: [...checked] });
      showConfigToast("菜单权限已保存");
      onClose();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const renderNode = (node: AdminMenuNode, depth: number): React.ReactNode => (
    <div key={node.id} style={{ paddingLeft: depth * 16 }} className="hm-perm-node">
      <label className="hm-perm-item">
        <input
          type="checkbox"
          checked={checked.has(node.id)}
          onChange={(e) => toggle(node.id, e.target.checked)}
        />
        <span>{node.name}</span>
        {node.permission_code ? <span className="hm-perm-code">（{node.permission_code}）</span> : null}
      </label>
      {node.children?.map((c) => renderNode(c, depth + 1))}
    </div>
  );

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel hm-perm-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">菜单权限 - {row.display_name}</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose} disabled={saving}>关闭</button>
            <button className="finord-btn finord-btn-primary" onClick={save} disabled={saving}>
              {saving ? "保存中…" : "保存"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {loading && <div className="hm-empty">加载中…</div>}
          {!loading && error && <div className="hm-empty hm-empty-error">{error}</div>}
          {!loading && !error && <div className="hm-perm-tree">{tree.map((n) => renderNode(n, 0))}</div>}
        </div>
      </div>
    </>
  );
}

function TutorialDialog({ tutorial, onClose }: { tutorial: MatchmakerTutorial; onClose: () => void }) {
  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel hm-tutorial-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">{tutorial.title}</span>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="hm-tutorial-content" style={{ whiteSpace: "pre-wrap" }}>{tutorial.content}</div>
          {tutorial.link_url ? (
            <a className="hm-tutorial-link" href={tutorial.link_url} target="_blank" rel="noreferrer">
              {tutorial.link_url}
            </a>
          ) : null}
        </div>
      </div>
    </>
  );
}
