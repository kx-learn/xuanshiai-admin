"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  FileSpreadsheet,
  Images,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import AdminPagination from "@/components/AdminPagination";
import ConfirmDialog from "@/components/ConfirmDialog";
import UserCandidatePicker from "@/components/UserCandidatePicker";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import { resolveMediaUrl } from "@/lib/admin-api";
import { adminEndpoints, PROMOTER_LEVELS } from "@/lib/admin-endpoints";
import type {
  PromoterCreatePayload,
  PromoterStaffItem,
  PromoterStatistics,
  PromoterTeamItem,
  PromoterUpdatePayload,
  PromoterUserCandidate,
} from "@/lib/admin-endpoints";
import { showConfigToast } from "@/lib/platform-config";

const breadcrumb = getBreadcrumb("推广红娘", "红娘管理");

const PAGE_SIZE = 20;

const STAT_METAS = [
  { unit: "人", label: "兼职推广红娘", bar: "linear-gradient(90deg,#ff6b81,#ff9a76)" },
  { unit: "人", label: "全职推广红娘", bar: "linear-gradient(90deg,#ffa940,#ffc069)" },
  { unit: "人", label: "共引流注册会员", bar: "linear-gradient(90deg,#a0d911,#d3f261)" },
  { unit: "人", label: "本月引流注册会员", bar: "linear-gradient(90deg,#36cfc9,#87e8de)" },
  { unit: "人", label: "上月引流注册会员", bar: "linear-gradient(90deg,#40a9ff,#91d5ff)" },
  { unit: "人", label: "共录入客源线索", bar: "linear-gradient(90deg,#597ef7,#85a5ff)" },
  { unit: "人", label: "本月录入客源线索", bar: "linear-gradient(90deg,#9254de,#b37feb)" },
  { unit: "人", label: "上月录入客源线索", bar: "linear-gradient(90deg,#ff7a45,#ffa940)" },
];

const SLOGAN_OPTIONS = [
  "为爱牵线，成就幸福",
  "专业红娘，一对一服务",
  "真实靠谱的脱单平台",
  "用心守护每一段缘分",
  "让相遇不再困难",
];

const LEVELS = PROMOTER_LEVELS;

function paletteOf(id: number): string {
  return ["a", "b", "c", "d", "e", "f"][((id % 6) + 6) % 6];
}

export default function PoploveMatchmakerListPage() {
  const router = useRouter();

  const [list, setList] = useState<PromoterStaffItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [teamId, setTeamId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [sort, setSort] = useState<"joined_desc" | "joined_asc">("joined_desc");

  const [teams, setTeams] = useState<PromoterTeamItem[]>([]);
  const [stats, setStats] = useState<PromoterStatistics | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editRow, setEditRow] = useState<PromoterStaffItem | null>(null);
  const [teamRow, setTeamRow] = useState<PromoterStaffItem | null>(null);
  const [delRow, setDelRow] = useState<PromoterStaffItem | null>(null);

  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminEndpoints.promoterStaffList({
        page,
        page_size: PAGE_SIZE,
        keyword: keyword.trim() || undefined,
        team_id: teamId ? Number(teamId) : undefined,
        commission_level_id: levelId ? Number(levelId) : undefined,
        sort,
      });
      setList(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, teamId, levelId, sort]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    adminEndpoints
      .promoterStatistics()
      .then(setStats)
      .catch(() => setStats(null));
    adminEndpoints
      .promoterTeams()
      .then(setTeams)
      .catch(() => setTeams([]));
  }, []);

  const handleSearch = () => {
    setPage(1);
    void load();
  };

  const toggleSort = () => {
    setSort((s) => (s === "joined_desc" ? "joined_asc" : "joined_desc"));
    setPage(1);
  };

  const onToggleVisible = async (row: PromoterStaffItem) => {
    const next = !row.visible;
    setList((prev) => prev.map((r) => (r.id === row.id ? { ...r, visible: next } : r)));
    try {
      await adminEndpoints.updatePromoterStaff(row.user_id, { visible: next });
      showConfigToast("已更新展示状态");
    } catch (e) {
      setList((prev) => prev.map((r) => (r.id === row.id ? { ...r, visible: row.visible } : r)));
      showConfigToast(e instanceof Error ? e.message : "更新失败", "error");
    }
  };

  const onPlatform = async (row: PromoterStaffItem) => {
    try {
      const res = await adminEndpoints.promoterPlatformToken(row.user_id);
      if (res.jump_url) window.open(res.jump_url, "_blank");
      else showConfigToast("未返回跳转地址", "error");
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "获取令牌失败", "error");
    }
  };

  const onPoster = async (row: PromoterStaffItem) => {
    try {
      const res = await adminEndpoints.promoterPoster(row.user_id);
      if (res.url) setPosterUrl(resolveMediaUrl(res.url) ?? res.url);
      else showConfigToast("未返回海报地址", "error");
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "生成海报失败", "error");
    }
  };

  const onConfirmDelete = async () => {
    if (!delRow) return;
    try {
      await adminEndpoints.deletePromoterStaff(delRow.user_id);
      showConfigToast("推广红娘已删除");
      setDelRow(null);
      void load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "删除失败";
      if (/409|会员归属|客源线索|存在/.test(msg)) {
        showConfigToast("该推广红娘名下存在会员归属或客源线索，无法删除", "error");
      } else {
        showConfigToast(msg, "error");
      }
      setDelRow(null);
    }
  };

  const onGoCommission = (row: PromoterStaffItem) => {
    router.push(`/poplove-matchmaker-distribution-details?promoter_id=${row.user_id}`);
  };

  const exportCsv = () => {
    try {
      const header = ["ID", "称呼", "账号", "团队", "分成级别", "加入时间", "名下会员", "本月会员", "客源线索", "本月线索", "是否展示"];
      const rows = list.map((r) => [
        r.id,
        r.display_name,
        r.account ?? "",
        r.team_name ?? "",
        r.commission_level_name ?? "",
        r.reviewed_at ?? "",
        r.member_count,
        r.member_month,
        r.lead_total,
        r.lead_month,
        r.visible ? "展示" : "隐藏",
      ]);
      const csv = [header, ...rows]
        .map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "推广红娘列表.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      showConfigToast("导出失败", "error");
    }
  };

  const statValues = stats
    ? [
        stats.part_time_count,
        stats.full_time_count,
        stats.member_total,
        stats.member_month,
        stats.member_last_month,
        stats.lead_total,
        stats.lead_month,
        stats.lead_last_month,
      ]
    : null;

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
              推广红娘是一种专门为平台发展相亲会员的「推广员」身份，只要身边有单身资源的人都可以无门槛成为平台中的「推广红娘」。
            </p>
            <p>
              每个推广红娘拥有专属的链接、二维码、海报，用户在其推广链接下进入平台注册成为会员后即归属在其名下，会员的分佣资料审核通过（成为有效会员）即可获得会员注册奖励，其名下的会员在日后的线上消费均可按比例获得分成。
            </p>
            <p>
              推广红娘根据其累计发展的会员数量划分为四个分成级别，每个级别可以自定义不同的会员注册奖励标准、是否享有会员消费分成，以及详细的分成标准。
            </p>
            <p>
              每个推广红娘都拥有自己独立的红娘管理后台，能够清清楚楚的看到自己发展的会员清单、审核状态、奖励明细、分成标准，以及各类数据统计报表等。
            </p>
            <p>
              推广红娘的提成收入是统一计入到平台的余额账户中，可用于支付在平台中任何消费，也可以随时进行提现，实时自动支付到其微信零钱账户。
            </p>
            <p>通过推广红娘的链接注册的会员默认分散到服务红娘里，如果服务红娘配置进行分派。</p>
            <p>推广红娘与服务红娘身份互斥，状态为展示的推广红娘会按有效会员数前10位进行排序显示在红娘列表中。</p>
            <p>
              推广红娘分为兼职和全职两种类型，全职类型推广红娘为婚恋公司内部专职招客引流人员，全职推广红娘请注意使用PC版进行办公，登录入口：
              <button type="button" className="pml-notice-link">点击打开</button>
            </p>
          </div>
        </div>
      </div>

      {/* 统计卡 */}
      <div className="pml-stats">
        {STAT_METAS.map((s, i) => (
          <div className="pml-stat" key={s.label}>
            <span className="pml-stat-bar" style={{ background: s.bar }} />
            <div className="pml-stat-value">
              {statValues ? statValues[i] : "—"}
              <em>{s.unit}</em>
            </div>
            <div className="pml-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="finord-card pml-card">
        <div className="pml-head">
          <h2 className="pml-title">红娘管理</h2>
          <div className="pml-head-actions">
            <button type="button" className="finord-btn finord-btn-primary pml-add-btn" onClick={() => { setEditRow(null); setAddOpen(true); }}>
              <Plus size={14} />
              添加推广红娘
            </button>
            <button type="button" className="finord-btn finord-btn-primary pml-export-btn" onClick={exportCsv}>
              <FileSpreadsheet size={14} />
              导出EXCEL
            </button>
            <button type="button" className="pml-tutorial">
              <Images size={14} />
              图文解说推广红娘
            </button>
          </div>
        </div>

        <div className="pml-filters">
          <div className="pml-select">
            <select value={teamId} onChange={(e) => setTeamId(e.target.value)}>
              <option value="">按团队：不限</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>{`按团队：${t.name}`}</option>
              ))}
            </select>
            <ChevronDown className="pml-caret" size={14} />
          </div>
          <div className="pml-select">
            <select value={levelId} onChange={(e) => setLevelId(e.target.value)}>
              <option value="">分成级别：不限</option>
              {LEVELS.map((lv) => (
                <option key={lv.id} value={lv.id}>{`分成级别：${lv.name}`}</option>
              ))}
            </select>
            <ChevronDown className="pml-caret" size={14} />
          </div>
          <div className="pml-search-group">
            <span className="pml-search-prefix">按账号搜</span>
            <input
              className="pml-input"
              placeholder="请输入"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            />
          </div>
          <button type="button" className="finord-btn finord-btn-primary pml-search-btn" onClick={handleSearch}>
            搜索
          </button>
          <button type="button" className="pml-sort" onClick={toggleSort}>
            <RotateCcw size={13} />
            {sort === "joined_desc" ? "按加入时间排序(默认)" : "按加入时间排序(正序)"}
          </button>
        </div>

        <div className="finord-table-wrap">
          <table className="finord-table pml-table">
            <colgroup>
              <col style={{ width: 54 }} />
              <col style={{ width: 210 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 96 }} />
              <col style={{ width: 170 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: 100 }} />
              <col style={{ width: "auto" }} />
            </colgroup>
            <thead>
              <tr>
                <th>ID</th>
                <th>推广红娘</th>
                <th>隶属团队</th>
                <th>分成级别</th>
                <th>加入时间</th>
                <th>名下会员</th>
                <th>录入客源线索</th>
                <th>开单明细</th>
                <th>是否展示</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="pml-td-id" colSpan={10}>加载中…</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td className="pml-td-id" colSpan={10}>{error}</td>
                </tr>
              )}
              {!loading && !error && list.length === 0 && (
                <tr>
                  <td className="pml-td-id" colSpan={10}>暂无数据</td>
                </tr>
              )}
              {!loading &&
                !error &&
                list.map((row) => (
                  <tr key={row.id}>
                    <td className="pml-td-id">{row.id}</td>
                    <td>
                      <div className="pml-member">
                        {row.avatar ? (
                          <img className={`pml-avatar pml-g-${paletteOf(row.id)}`} src={resolveMediaUrl(row.avatar)} alt="" />
                        ) : (
                          <span className={`pml-avatar pml-g-${paletteOf(row.id)}`} />
                        )}
                        <div className="pml-member-info">
                          <div className="pml-line">
                            <span className="pml-k">称呼：</span>
                            {row.display_name}
                          </div>
                          <div className="pml-line">
                            <span className="pml-k">账号：</span>
                            {row.account ?? "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="pml-team">
                        <span>{row.team_name ?? "—"}</span>
                        <button type="button" className="pml-team-btn" onClick={() => setTeamRow(row)}>
                          变更团队
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className="pml-level">{row.commission_level_name ?? "—"}</span>
                    </td>
                    <td className="pml-td-time">{row.reviewed_at ?? "—"}</td>
                    <td>
                      <div className="pml-cell-lines">
                        <div className="pml-cell-line">
                          <span className="pml-k">共{row.member_count}人</span>
                          <span className="pml-k">本月{row.member_month}人</span>
                        </div>
                        <div className="pml-cell-links">
                          <button type="button" className="pml-mini-btn">明细</button>
                          <button type="button" className="pml-mini-btn">报表</button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="pml-cell-lines">
                        <div className="pml-cell-line">
                          <span className="pml-k">共{row.lead_total}条</span>
                          <span className="pml-k">本月{row.lead_month}条</span>
                        </div>
                        <div className="pml-cell-links">
                          <button type="button" className="pml-mini-btn">明细</button>
                          <button type="button" className="pml-mini-btn">报表</button>
                        </div>
                      </div>
                    </td>
                    <td>
                      <button type="button" className="pml-link" onClick={() => onGoCommission(row)}>
                        线上分成
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`pml-switch ${row.visible ? "on" : ""}`}
                        onClick={() => void onToggleVisible(row)}
                        aria-label="是否展示"
                      >
                        <span className="pml-switch-knob" />
                      </button>
                    </td>
                    <td>
                      <div className="pml-actions">
                        <button type="button" className="pml-link" onClick={() => void onPlatform(row)}>红娘平台</button>
                        <button type="button" className="pml-link" onClick={() => void onPoster(row)}>推广海报</button>
                        <button type="button" className="pml-link" onClick={() => { setEditRow(row); setAddOpen(true); }}>编辑</button>
                        <button type="button" className="pml-link danger" onClick={() => setDelRow(row)}>删除</button>
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

      {addOpen && (
        <AddPromoterDrawer
          row={editRow}
          teams={teams}
          onClose={() => setAddOpen(false)}
          onSaved={() => {
            setAddOpen(false);
            setEditRow(null);
            void load();
          }}
        />
      )}
      {teamRow && (
        <ChangeTeamDrawer
          row={teamRow}
          teams={teams}
          onClose={() => setTeamRow(null)}
          onSaved={() => {
            setTeamRow(null);
            void load();
          }}
        />
      )}

      <ConfirmDialog
        open={delRow !== null}
        title="删除推广红娘"
        message={`确定要删除「${delRow?.display_name ?? ""}」吗？此操作不可恢复。`}
        confirmText="删除"
        cancelText="取消"
        onConfirm={() => void onConfirmDelete()}
        onCancel={() => setDelRow(null)}
      />

      {posterUrl && (
        <>
          <div className="tlc-mask" onClick={() => setPosterUrl(null)} />
          <div className="tlc-panel pml-poster-panel">
            <div className="tlc-panel-head">
              <div className="tlc-panel-head-left">
                <button className="tlc-x" onClick={() => setPosterUrl(null)} aria-label="关闭">
                  <X size={18} />
                </button>
                <span className="tlc-panel-title">推广海报</span>
              </div>
            </div>
            <div className="tlc-panel-body">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="pml-poster-img" src={posterUrl} alt="推广海报" />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function AddPromoterDrawer({
  row,
  teams,
  onClose,
  onSaved,
}: {
  row: PromoterStaffItem | null;
  teams: PromoterTeamItem[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = row !== null;
  const [type, setType] = useState<"兼职" | "全职">("兼职");
  const [level, setLevel] = useState(1);
  const [customSlogan, setCustomSlogan] = useState(false);
  const [sloganSelect, setSloganSelect] = useState("");
  const [sloganCustom, setSloganCustom] = useState("");
  const [leadView, setLeadView] = useState("不允许");
  const [leadWrite, setLeadWrite] = useState("不允许");
  const [crmView, setCrmView] = useState("不允许");
  const [saving, setSaving] = useState(false);

  const [lookup, setLookup] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const onLookupChange = (value: string, pickedId: number | null) => {
    setLookup(value);
    setSelectedUserId(pickedId);
  };

  const onPickCandidate = (c: PromoterUserCandidate) => {
    if (!displayName.trim()) setDisplayName(c.nickname ?? c.real_name ?? "");
  };

  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    setType("兼职");
    setLevel(1);
    setCustomSlogan(false);
    setSloganSelect("");
    setSloganCustom("");
    setLeadView("不允许");
    setLeadWrite("不允许");
    setCrmView("不允许");
    setLookup("");
    setSelectedUserId(null);
    setDisplayName("");
    if (row) {
      setType(row.matchmaker_type === "full_time" ? "全职" : "兼职");
      setLevel(row.commission_level_id ?? 1);
      setDisplayName(row.display_name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row]);

  const sloganValue = customSlogan ? sloganCustom.trim() : sloganSelect;

  const submit = async () => {
    if (!displayName.trim()) {
      showConfigToast("请填写红娘称呼", "error");
      return;
    }
    const body: Record<string, unknown> = {
      display_name: displayName.trim(),
      matchmaker_type: type === "全职" ? "full_time" : "part_time",
      commission_level_id: level,
    };
    if (sloganValue) body.slogan = sloganValue;
    body.can_view_lead_follow = leadView === "允许";
    body.can_write_lead_follow = leadWrite === "允许";
    body.can_view_member_crm_follow = crmView === "允许";

    setSaving(true);
    try {
      if (isEdit && row) {
        await adminEndpoints.updatePromoterStaff(row.user_id, body as PromoterUpdatePayload);
        showConfigToast("已保存");
      } else {
        if (!selectedUserId && !lookup.trim()) {
          showConfigToast("请先绑定已注册账号", "error");
          setSaving(false);
          return;
        }
        const createBody: Record<string, unknown> = { ...body };
        if (selectedUserId) createBody.user_id = selectedUserId;
        else {
          createBody.lookup = lookup.trim();
          createBody.lookup_by = "nickname";
        }
        await adminEndpoints.createPromoterStaff(createBody as PromoterCreatePayload);
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
      <div className="tlc-panel pml-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">添加/编辑推广红娘</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose} disabled={saving}>
              关闭
            </button>
            <button className="finord-btn finord-btn-primary" onClick={() => void submit()} disabled={saving}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          {/* 红娘类型 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>红娘类型
            </span>
            <div className="bm-content">
              <div className="pml-radio-row">
                {["兼职", "全职"].map((o) => (
                  <label key={o} className="pml-radio">
                    <input type="radio" name="pml-type" checked={type === o} onChange={() => setType(o as "兼职" | "全职")} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 账号绑定 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>账号绑定
            </span>
            <div className="bm-content">
              <UserCandidatePicker
                value={lookup}
                onChange={onLookupChange}
                onSelect={onPickCandidate}
                search={(kw) => adminEndpoints.promoterUserCandidates(kw)}
                disabled={isEdit}
                placeholder="输入昵称 / 手机号 / 用户ID / 姓名搜索已注册用户"
              />
              <div className="bm-info">必须是网站已注册用户且绑定了微信，且非服务红娘{isEdit ? "（编辑时不可变更）" : ""}</div>
            </div>
          </div>

          {/* 红娘称呼 */}
          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>红娘称呼
            </span>
            <div className="bm-content">
              <input
                className="bm-input-wide"
                placeholder="请输入红娘称呼"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
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

          {/* 分成级别 */}
          <div className="bm-row">
            <span className="bm-label">分成级别</span>
            <div className="bm-content">
              <div className="pml-level-radios">
                {LEVELS.map((item) => (
                  <label key={item.id} className="pml-radio">
                    <input
                      type="radio"
                      name="pml-level"
                      checked={level === item.id}
                      onChange={() => setLevel(item.id)}
                    />
                    <span>
                      级别：{item.id}（{item.name}）
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 查看客源线索跟进记录 */}
          <div className="bm-row">
            <span className="bm-label">查看客源线索跟进记录</span>
            <div className="bm-content">
              <div className="pml-radio-row">
                {["允许", "不允许"].map((o) => (
                  <label key={o} className="pml-radio">
                    <input type="radio" name="pml-lead-view" checked={leadView === o} onChange={() => setLeadView(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 客源线索中写跟进 */}
          <div className="bm-row">
            <span className="bm-label">客源线索中写跟进</span>
            <div className="bm-content">
              <div className="pml-radio-row">
                {["允许", "不允许"].map((o) => (
                  <label key={o} className="pml-radio">
                    <input type="radio" name="pml-lead-write" checked={leadWrite === o} onChange={() => setLeadWrite(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 查看会员CRM跟进记录 */}
          <div className="bm-row">
            <span className="bm-label">查看会员CRM跟进记录</span>
            <div className="bm-content">
              <div className="pml-radio-row">
                {["允许", "不允许"].map((o) => (
                  <label key={o} className="pml-radio">
                    <input type="radio" name="pml-crm-view" checked={crmView === o} onChange={() => setCrmView(o)} />
                    <span>{o}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ChangeTeamDrawer({
  row,
  teams,
  onClose,
  onSaved,
}: {
  row: PromoterStaffItem;
  teams: PromoterTeamItem[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [team, setTeam] = useState<string>(row.team_id != null ? String(row.team_id) : "");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      const teamId = team === "" ? null : Number(team);
      await adminEndpoints.updatePromoterTeam(row.user_id, {
        team_id: teamId,
        reason: reason.trim() || undefined,
      });
      showConfigToast(teamId == null ? "已移出团队" : "已变更团队");
      onSaved();
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "变更失败", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="tlc-mask" onClick={onClose} />
      <div className="tlc-panel pml-team-panel">
        <div className="tlc-panel-head">
          <div className="tlc-panel-head-left">
            <button className="tlc-x" onClick={onClose} aria-label="关闭">
              <X size={18} />
            </button>
            <span className="tlc-panel-title">变更团队</span>
          </div>
          <div className="bm-head-actions">
            <button className="finord-btn bm-cancel" onClick={onClose} disabled={saving}>
              关闭
            </button>
            <button className="finord-btn finord-btn-primary" onClick={() => void submit()} disabled={saving}>
              {saving ? "提交中…" : "确定提交"}
            </button>
          </div>
        </div>
        <div className="tlc-panel-body">
          <div className="pml-team-tip">
            <i className="pml-team-tip-icon">i</i>
            <span>
              本操作会将其从原有团队中移除并绑定到您新的指定团队中，变更或移出团队后该推广红娘在原有团队中的产生的业绩和有效会员数据依然保留在原有团队，并自动解除与原有名下会员的关联性
            </span>
          </div>

          <div className="bm-row">
            <span className="bm-label">
              <b className="hm-req">*</b>合伙团队
            </span>
            <div className="bm-content">
              <select className="bm-select bm-select-wide" value={team} onChange={(e) => setTeam(e.target.value)}>
                <option value="">移出团队（空）</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bm-row">
            <span className="bm-label">变更说明</span>
            <div className="bm-content">
              <input className="bm-input-wide" placeholder="可选" value={reason} onChange={(e) => setReason(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
