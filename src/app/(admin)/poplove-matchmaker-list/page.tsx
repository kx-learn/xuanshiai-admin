"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import {
  adminEndpoints,
  PROMOTER_LEVELS,
  type PromoterStaffDetail,
  type PromoterStaffItem,
  type PromoterUserCandidate,
} from "@/lib/admin-endpoints";
import { clearAdminToken } from "@/lib/admin-api";

const breadcrumb = [
  { label: "首页", href: "/" },
  { label: "推广红娘", href: "/poplove-matchmaker-list" },
  { label: "推广红娘管理" },
];

const CHANNEL_PRESETS = [
  "微信",
  "朋友圈",
  "公众号",
  "小程序",
  "抖音",
  "快手",
  "小红书",
  "视频号",
  "线下门店",
  "老带新",
];

const SLOGAN_PRESETS = [
  "牵线搭桥，成就美好姻缘！",
  "红娘在手，幸福我有！",
  "缘分天空，红娘相牵！",
  "红娘巧手，织就爱情网！",
  "寻觅真爱，红娘相伴！",
];

type TabKey = "all" | "active" | "inactive";

const TABS: { key: TabKey; label: string; status?: 1 | 2 }[] = [
  { key: "all", label: "全部" },
  { key: "active", label: "在职", status: 1 },
  { key: "inactive", label: "离职", status: 2 },
];

function text(value: unknown) {
  return value == null || value === "" ? "-" : String(value);
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return <img src={src} alt={name} className="size-9 rounded-full object-cover" />;
  }
  return (
    <span className="grid size-9 place-items-center rounded-full bg-[#edf2ff] text-sm text-[#3658f7]">
      {(name || "?").slice(0, 1)}
    </span>
  );
}

function StatusTag({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={
        active
          ? "inline-block rounded bg-[#f6ffed] px-2 py-0.5 text-xs text-[#52c41a] border border-[#b7eb8f]"
          : "inline-block rounded bg-[#f5f5f5] px-2 py-0.5 text-xs text-[#999] border border-[#d9d9d9]"
      }
    >
      {label}
    </span>
  );
}

const fmtTime = (value: string | null) => {
  if (!value) return "-";
  return value.includes("T") ? value.replace("T", " ").replace(/\..*$/, "") : value;
};

interface RowState {
  items: PromoterStaffItem[];
  total: number;
  page: number;
  pageSize: number;
}

export default function PoploveMatchmakerListPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [rowState, setRowState] = useState<RowState>({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<PromoterStaffDetail | null>(null);
  const [editing, setEditing] = useState<PromoterStaffDetail | null>(null);

  const flash = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const fetchList = useCallback(
    async (override: { page?: number; pageSize?: number; keyword?: string; tab?: TabKey } = {}) => {
      const tab = override.tab ?? activeTab;
      const targetPage = override.page ?? rowState.page;
      const pageSize = override.pageSize ?? rowState.pageSize;
      const kw = override.keyword !== undefined ? override.keyword : appliedKeyword;
      const tabDef = TABS.find((item) => item.key === tab);
      setLoading(true);
      setError(null);
      try {
        const page = await adminEndpoints.promoterStaffList({
          page: targetPage,
          page_size: pageSize,
          keyword: kw || undefined,
          status: tabDef?.status,
        });
        setRowState({ items: page.items, total: page.total, page: page.page, pageSize: page.page_size });
      } catch (err: unknown) {
        if (err instanceof Error && /登录/.test(err.message)) {
          clearAdminToken();
          if (typeof window !== "undefined" && window.location.pathname !== "/login") window.location.replace("/login");
          return;
        }
        setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, appliedKeyword, rowState.page, rowState.pageSize],
  );

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(rowState.total / rowState.pageSize)), [rowState.total, rowState.pageSize]);

  const switchTab = (tab: TabKey) => {
    setActiveTab(tab);
    setRowState((prev) => ({ ...prev, page: 1 }));
    fetchList({ tab, page: 1 });
  };

  const handleSearch = () => {
    setRowState((prev) => ({ ...prev, page: 1 }));
    setAppliedKeyword(keyword.trim());
    fetchList({ keyword: keyword.trim(), page: 1 });
  };

  const handleReset = () => {
    setKeyword("");
    setAppliedKeyword("");
    setRowState((prev) => ({ ...prev, page: 1 }));
    fetchList({ keyword: "", page: 1 });
  };

  const gotoPage = (next: number) => {
    if (next < 1 || next > totalPages) return;
    setRowState((prev) => ({ ...prev, page: next }));
    fetchList({ page: next });
  };

  const reload = (message: string) => {
    flash(message);
    fetchList();
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />
      <div className="mb-4">
        <h1 className="mb-3 text-xl font-medium text-[#333]">推广红娘管理</h1>
        <div className="flex border-b border-[#f0f0f0]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchTab(tab.key)}
              className={`px-4 py-3 text-sm ${activeTab === tab.key ? "border-b-2 border-[#3658f7] text-[#3658f7]" : "text-[#666]"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 rounded-md border border-[#f0f0f0] bg-white px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="请输入姓名、手机号搜索"
            className="h-8 w-56 rounded-md border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#3658f7]"
          />
          <Button size="sm" variant="primary" onClick={handleSearch}>搜索</Button>
          <Button size="sm" variant="default" onClick={handleReset}>重置</Button>
          <div className="flex-1" />
          <Button size="sm" variant="primary" onClick={() => setCreating(true)} disabled={busy}>
            + 添加推广红娘
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#f0f0f0]">
        {loading ? (
          <div className="p-8 text-center text-[#999]">加载中...</div>
        ) : error ? (
          <div className="p-8 text-center text-[#ff4d4f]">{error}</div>
        ) : rowState.items.length === 0 ? (
          <div className="p-8 text-center text-[#999]">暂无数据</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr>
                {["编号", "姓名", "手机号", "推广渠道", "推广会员数", "入职时间", "状态", "操作"].map((title) => (
                  <th key={title} className="whitespace-nowrap border-b border-[#f0f0f0] bg-[#fafafa] p-3 text-left text-sm font-medium">
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowState.items.map((row) => (
                <tr key={row.user_id} className="hover:bg-[#fafafa]">
                  <td className="border-b border-[#f0f0f0] p-3 text-center text-sm">{row.user_id}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar src={row.avatar} name={row.display_name} />
                      <span className="font-medium">{row.display_name}</span>
                    </div>
                  </td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">{text(row.phone)}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">
                    {row.channel ? (
                      <span className="inline-block rounded bg-[#edf2ff] px-2 py-0.5 text-xs text-[#3658f7] border border-[#adc6ff]">
                        {row.channel}
                      </span>
                    ) : (
                      <span className="text-[#ccc]">-</span>
                    )}
                  </td>
                  <td className="border-b border-[#f0f0f0] p-3 text-center text-sm">{row.member_count}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">{fmtTime(row.reviewed_at)}</td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">
                    <StatusTag label={row.status_label} active={row.status === 1} />
                  </td>
                  <td className="border-b border-[#f0f0f0] p-3 text-sm">
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <button
                        type="button"
                        className="text-[#3658f7]"
                        onClick={() => {
                          setBusy(true);
                          adminEndpoints.promoterStaff(row.user_id)
                            .then(setViewing)
                            .catch((err: unknown) => flash(err instanceof Error ? err.message : "加载详情失败"))
                            .finally(() => setBusy(false));
                        }}
                      >
                        查看
                      </button>
                      <button
                        type="button"
                        className="text-[#3658f7]"
                        onClick={() => {
                          setBusy(true);
                          adminEndpoints.promoterStaff(row.user_id)
                            .then(setEditing)
                            .catch((err: unknown) => flash(err instanceof Error ? err.message : "加载详情失败"))
                            .finally(() => setBusy(false));
                        }}
                      >
                        编辑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="flex items-center justify-between px-4 py-4 text-sm text-[#999]">
          <span>共 {rowState.total} 条</span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="上一页" disabled={rowState.page <= 1} onClick={() => gotoPage(rowState.page - 1)} className="grid size-7 place-items-center border disabled:text-[#d9d9d9]">
              <span className="size-1.5 rotate-45 border-b border-l border-current" />
            </button>
            <span className="px-2">{rowState.page} / {totalPages}</span>
            <button type="button" aria-label="下一页" disabled={rowState.page >= totalPages} onClick={() => gotoPage(rowState.page + 1)} className="grid size-7 place-items-center border disabled:text-[#d9d9d9]">
              <span className="size-1.5 -rotate-45 border-r border-t border-current" />
            </button>
            <label className="relative ml-2">
              <select
                aria-label="每页条数"
                value={rowState.pageSize}
                onChange={(e) => {
                  const size = Number(e.target.value);
                  setRowState({ items: [], total: 0, page: 1, pageSize: size });
                  fetchList({ page: 1, pageSize: size });
                }}
                className="h-7 appearance-none border bg-white py-0 pl-2 pr-7 text-xs"
              >
                <option value={20}>20 条/页</option>
                <option value={50}>50 条/页</option>
                <option value={100}>100 条/页</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-2 size-1.5 rotate-45 border-b border-r" />
            </label>
          </div>
        </div>
      </div>

      {notice && (
        <div role="status" className="fixed right-6 top-5 z-[60] border border-[#b7eb8f] bg-[#f6ffed] px-4 py-2 text-sm text-[#52a26b] shadow">
          {notice}
        </div>
      )}
      {creating && (
        <CreatePanel
          close={() => setCreating(false)}
          done={() => { setCreating(false); reload("推广红娘已添加"); }}
          error={flash}
        />
      )}
      {editing && (
        <EditPanel
          row={editing}
          close={() => setEditing(null)}
          done={(message) => { setEditing(null); reload(message); }}
          error={flash}
        />
      )}
      {viewing && <ViewModal row={viewing} close={() => setViewing(null)} />}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs text-[#999]">{label}</div>
      <div className="text-sm text-[#333]">{children}</div>
    </div>
  );
}

function ViewModal({ row, close }: { row: PromoterStaffDetail; close: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onMouseDown={close}>
      <div className="w-full max-w-xl rounded bg-white shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-medium">推广红娘详情</h2>
          <button type="button" aria-label="关闭" className="text-xl text-[#999]" onClick={close}>×</button>
        </div>
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <Avatar src={row.avatar} name={row.display_name} />
          <div>
            <div className="font-medium">{row.display_name}</div>
            <div className="text-xs text-[#999]">普通用户 ID: {row.user_id}</div>
          </div>
          <div className="ml-auto"><StatusTag label={row.status_label} active={row.status === 1} /></div>
        </div>
        <div className="grid grid-cols-2 gap-4 p-5 text-sm">
          <FieldRow label="手机号">{text(row.phone)}</FieldRow>
          <FieldRow label="红娘类型">{row.matchmaker_type === "full_time" ? "全职" : row.matchmaker_type === "part_time" ? "兼职" : "-"}</FieldRow>
          <FieldRow label="推广渠道">{row.channel ? <span className="rounded bg-[#edf2ff] px-2 py-0.5 text-xs text-[#3658f7] border border-[#adc6ff]">{row.channel}</span> : "-"}</FieldRow>
          <FieldRow label="分成级别">{row.commission_level_id ? `${PROMOTER_LEVELS.find((l) => l.id === row.commission_level_id)?.name || "-"}（级别${row.commission_level_id}）` : "-"}</FieldRow>
          <FieldRow label="红娘口号">{text(row.slogan)}</FieldRow>
          <FieldRow label="推广会员数">{row.member_count} 人</FieldRow>
          <FieldRow label="推广分享码数">{row.touch_count} 个</FieldRow>
          <FieldRow label="入职时间">{fmtTime(row.reviewed_at)}</FieldRow>
          <FieldRow label="查看客源线索">{row.can_view_lead_follow ? "允许" : "不允许"}</FieldRow>
          <FieldRow label="客源线索写跟进">{row.can_write_lead_follow ? "允许" : "不允许"}</FieldRow>
          <FieldRow label="查看会员CRM">{row.can_view_member_crm_follow ? "允许" : "不允许"}</FieldRow>
          <FieldRow label="创建时间">{fmtTime(row.created_at)}</FieldRow>
          {row.status === 2 && row.suspension_reason && (
            <div className="col-span-2"><FieldRow label="离职原因">{row.suspension_reason}</FieldRow></div>
          )}
          <div className="col-span-2"><FieldRow label="备注 / 简介">{text(row.intro)}</FieldRow></div>
        </div>
        <div className="border-t px-5 py-3 text-right">
          <button type="button" className="rounded border px-4 py-1.5 text-sm" onClick={close}>关闭</button>
        </div>
      </div>
    </div>
  );
}

function CreatePanel({ close, done, error }: { close: () => void; done: () => void; error: (message: string) => void }) {
  const [lookup, setLookup] = useState("");
  const [lookupBy, setLookupBy] = useState<"nickname" | "phone">("nickname");
  const [candidates, setCandidates] = useState<PromoterUserCandidate[]>([]);
  const [selected, setSelected] = useState<PromoterUserCandidate | null>(null);
  const [matchmakerType, setMatchmakerType] = useState<"part_time" | "full_time">("part_time");
  const [channel, setChannel] = useState("");
  const [customChannel, setCustomChannel] = useState(false);
  const [slogan, setSlogan] = useState("");
  const [customSlogan, setCustomSlogan] = useState(false);
  const [commissionLevelId, setCommissionLevelId] = useState<1 | 2 | 3 | 4>(1);
  const [intro, setIntro] = useState("");
  const [canViewLeadFollow, setCanViewLeadFollow] = useState(true);
  const [canWriteLeadFollow, setCanWriteLeadFollow] = useState(true);
  const [canViewMemberCrmFollow, setCanViewMemberCrmFollow] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const keywordText = lookup.trim();
    if (keywordText.length < 2 || selected) {
      setCandidates([]);
      return;
    }
    const timer = window.setTimeout(() => {
      adminEndpoints.promoterUserCandidates(keywordText)
        .then(setCandidates)
        .catch(() => setCandidates([]));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [lookup, selected]);

  const submit = async () => {
    if (!selected) {
      error("请从搜索结果中选择要绑定的普通用户");
      return;
    }
    if (!channel.trim()) {
      error("请填写推广渠道");
      return;
    }
    setSaving(true);
    try {
      await adminEndpoints.createPromoterStaff({
        user_id: selected.id,
        channel: channel.trim(),
        intro: intro.trim() || null,
        matchmaker_type: matchmakerType,
        slogan: slogan.trim() || null,
        commission_level_id: commissionLevelId,
        can_view_lead_follow: canViewLeadFollow,
        can_write_lead_follow: canWriteLeadFollow,
        can_view_member_crm_follow: canViewMemberCrmFollow,
      });
      done();
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "添加失败");
    } finally {
      setSaving(false);
    }
  };

  const input = "h-10 w-full rounded border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#3658f7]";
  const labelClass = "mb-1 text-sm text-[#666]";
  const rowClass = "grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3";

  return (
    <div className="fixed inset-0 z-50 bg-black/30" onMouseDown={close}>
      <aside className="ml-auto flex h-full w-full max-w-[560px] flex-col bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <h2 className="text-lg font-medium">添加推广红娘</h2>
          <button type="button" aria-label="关闭" className="text-2xl text-[#888]" onClick={close}>×</button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div>
            <div className={labelClass}>红娘类型 <b className="text-[#ff4d4f]">*</b></div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={matchmakerType === "part_time"} onChange={() => setMatchmakerType("part_time")} />兼职
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={matchmakerType === "full_time"} onChange={() => setMatchmakerType("full_time")} />全职
              </label>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">绑定普通用户 <b className="text-[#ff4d4f]">*</b></div>
            {selected ? (
              <div className="flex items-center gap-3 rounded border border-[#bfcaff] bg-[#f4f6ff] px-4 py-3">
                <Avatar src={selected.avatar} name={selected.nickname || ""} />
                <div>
                  <div className="text-sm font-medium">{selected.nickname || "-"}</div>
                  <div className="text-xs text-[#999]">ID: {selected.id} · {text(selected.phone)}</div>
                </div>
                <button
                  type="button"
                  className="ml-auto text-sm text-[#3658f7]"
                  onClick={() => { setSelected(null); setLookup(""); }}
                >
                  重新选择
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-4">
                  <input value={lookup} onChange={(e) => setLookup(e.target.value)} placeholder="请输入昵称或手机号搜索普通用户" className={`${input} w-[300px]`} />
                  <label className="flex items-center gap-1 text-sm"><input type="radio" checked={lookupBy === "nickname"} onChange={() => setLookupBy("nickname")} />按昵称</label>
                  <label className="flex items-center gap-1 text-sm"><input type="radio" checked={lookupBy === "phone"} onChange={() => setLookupBy("phone")} />按手机</label>
                </div>
                {candidates.length > 0 && (
                  <div className="absolute left-0 top-11 z-20 w-[300px] overflow-hidden rounded border bg-white shadow-lg">
                    {candidates.map((candidate) => (
                      <button
                        type="button"
                        key={candidate.id}
                        className="block w-full border-b px-3 py-2 text-left text-sm hover:bg-[#f5f7ff]"
                        onClick={() => setSelected(candidate)}
                      >
                        <div>{candidate.nickname || "-"}</div>
                        <div className="text-xs text-[#999]">ID: {candidate.id} · {text(candidate.phone)}</div>
                      </button>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">推广渠道 <b className="text-[#ff4d4f]">*</b></div>
            {customChannel ? (
              <input value={channel} onChange={(e) => setChannel(e.target.value)} placeholder="请输入推广渠道" className={input} autoFocus />
            ) : (
              <select
                value={channel}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "__custom__") {
                    setCustomChannel(true);
                    setChannel("");
                  } else {
                    setChannel(value);
                  }
                }}
                className={input}
              >
                <option value="">请选择推广渠道</option>
                {CHANNEL_PRESETS.map((item) => <option key={item} value={item}>{item}</option>)}
                <option value="__custom__">自定义...</option>
              </select>
            )}
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">红娘口号 <b className="text-[#ff4d4f]">*</b></div>
            {customSlogan ? (
              <input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="请输入红娘口号" className={input} autoFocus />
            ) : (
              <select
                value={slogan}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "__custom__") {
                    setCustomSlogan(true);
                    setSlogan("");
                  } else {
                    setSlogan(value);
                  }
                }}
                className={input}
              >
                <option value="">请选择红娘口号</option>
                {SLOGAN_PRESETS.map((item) => <option key={item} value={item}>{item}</option>)}
                <option value="__custom__">自定义输入</option>
              </select>
            )}
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">分成级别 <b className="text-[#ff4d4f]">*</b></div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {PROMOTER_LEVELS.map((level) => (
                <label key={level.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="commission-level"
                    checked={commissionLevelId === level.id}
                    onChange={() => setCommissionLevelId(level.id)}
                  />
                  级别：{level.id}（{level.name}）
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">查看客源线索跟进记录</div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="perm-lead-view" checked={canViewLeadFollow} onChange={() => setCanViewLeadFollow(true)} />允许
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="perm-lead-view" checked={!canViewLeadFollow} onChange={() => setCanViewLeadFollow(false)} />不允许
              </label>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">客源线索中写跟进</div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="perm-lead-write" checked={canWriteLeadFollow} onChange={() => setCanWriteLeadFollow(true)} />允许
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="perm-lead-write" checked={!canWriteLeadFollow} onChange={() => setCanWriteLeadFollow(false)} />不允许
              </label>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">查看会员CRM跟进记录</div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="perm-crm-view" checked={canViewMemberCrmFollow} onChange={() => setCanViewMemberCrmFollow(true)} />允许
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="perm-crm-view" checked={!canViewMemberCrmFollow} onChange={() => setCanViewMemberCrmFollow(false)} />不允许
              </label>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">备注 / 简介</div>
            <textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} placeholder="可填写该推广红娘的简介或备注" className="w-full rounded border border-[#d9d9d9] px-3 py-2 text-sm outline-none focus:border-[#3658f7]" />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button type="button" className="rounded border px-6 py-2 text-sm" onClick={close}>取消</button>
          <button type="button" disabled={saving} className="rounded bg-[#3658f7] px-6 py-2 text-sm text-white disabled:opacity-60" onClick={() => void submit()}>
            {saving ? "提交中..." : "确定提交"}
          </button>
        </div>
      </aside>
    </div>
  );
}

function EditPanel({ row, close, done, error }: { row: PromoterStaffDetail; close: () => void; done: (message: string) => void; error: (message: string) => void }) {
  const [displayName, setDisplayName] = useState(row.display_name);
  const [phone, setPhone] = useState(row.phone || "");
  const [matchmakerType, setMatchmakerType] = useState<"part_time" | "full_time">(row.matchmaker_type || "part_time");
  const [channel, setChannel] = useState(row.channel || "");
  const [slogan, setSlogan] = useState(row.slogan || "");
  const [customSlogan, setCustomSlogan] = useState(row.slogan ? !SLOGAN_PRESETS.includes(row.slogan) : false);
  const [commissionLevelId, setCommissionLevelId] = useState<1 | 2 | 3 | 4>((row.commission_level_id || 1) as 1 | 2 | 3 | 4);
  const [canViewLeadFollow, setCanViewLeadFollow] = useState(Boolean(row.can_view_lead_follow));
  const [canWriteLeadFollow, setCanWriteLeadFollow] = useState(Boolean(row.can_write_lead_follow));
  const [canViewMemberCrmFollow, setCanViewMemberCrmFollow] = useState(Boolean(row.can_view_member_crm_follow));
  const [intro, setIntro] = useState(row.intro || "");
  const [status, setStatus] = useState<1 | 2>(row.status);
  const [reason, setReason] = useState(row.suspension_reason || "");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!displayName.trim()) {
      error("请填写姓名");
      return;
    }
    if (status === 2 && !reason.trim()) {
      error("离职时必须填写离职原因");
      return;
    }
    setSaving(true);
    try {
      const payload: Parameters<typeof adminEndpoints.updatePromoterStaff>[1] = {
        display_name: displayName.trim(),
        channel: channel.trim() || null,
        intro: intro.trim() || null,
        status,
        reason: status === 2 ? reason.trim() : null,
        matchmaker_type: matchmakerType,
        slogan: slogan.trim() || null,
        commission_level_id: commissionLevelId,
        can_view_lead_follow: canViewLeadFollow,
        can_write_lead_follow: canWriteLeadFollow,
        can_view_member_crm_follow: canViewMemberCrmFollow,
      };
      if (phone.trim()) payload.phone = phone.trim();
      await adminEndpoints.updatePromoterStaff(row.user_id, payload);
      done(status === 2 ? "已设为离职" : "推广红娘已更新");
    } catch (err: unknown) {
      error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const input = "h-10 w-full rounded border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#3658f7]";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onMouseDown={close}>
      <div className="w-full max-w-xl rounded bg-white shadow-lg" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-medium">编辑推广红娘</h2>
          <button type="button" aria-label="关闭" className="text-xl text-[#999]" onClick={close}>×</button>
        </div>
        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3 rounded border border-[#f0f0f0] bg-[#fafafa] px-4 py-3">
            <Avatar src={row.avatar} name={row.display_name} />
            <div className="text-sm text-[#666]">
              普通用户 ID: {row.user_id} · 推广会员 {row.member_count} 人
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">红娘类型 <b className="text-[#ff4d4f]">*</b></div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={matchmakerType === "part_time"} onChange={() => setMatchmakerType("part_time")} />兼职
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" checked={matchmakerType === "full_time"} onChange={() => setMatchmakerType("full_time")} />全职
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="mb-1 text-sm text-[#666]">姓名 <b className="text-[#ff4d4f]">*</b></div>
              <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={input} />
            </div>
            <div>
              <div className="mb-1 text-sm text-[#666]">手机号</div>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={input} />
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">推广渠道</div>
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className={input}>
              <option value="">未设置</option>
              {CHANNEL_PRESETS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">红娘口号</div>
            {customSlogan ? (
              <div className="flex items-center gap-2">
                <input value={slogan} onChange={(e) => setSlogan(e.target.value)} placeholder="请输入红娘口号" className={input} />
                <button type="button" className="whitespace-nowrap text-sm text-[#999]" onClick={() => { setCustomSlogan(false); setSlogan(""); }}>返回选择</button>
              </div>
            ) : (
              <select
                value={slogan}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "__custom__") {
                    setCustomSlogan(true);
                    setSlogan("");
                  } else {
                    setSlogan(value);
                  }
                }}
                className={input}
              >
                <option value="">未设置</option>
                {SLOGAN_PRESETS.map((item) => <option key={item} value={item}>{item}</option>)}
                <option value="__custom__">自定义输入</option>
              </select>
            )}
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">分成级别 <b className="text-[#ff4d4f]">*</b></div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {PROMOTER_LEVELS.map((level) => (
                <label key={level.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="edit-commission-level"
                    checked={commissionLevelId === level.id}
                    onChange={() => setCommissionLevelId(level.id)}
                  />
                  级别：{level.id}（{level.name}）
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">查看客源线索跟进记录</div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="edit-perm-lead-view" checked={canViewLeadFollow} onChange={() => setCanViewLeadFollow(true)} />允许
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="edit-perm-lead-view" checked={!canViewLeadFollow} onChange={() => setCanViewLeadFollow(false)} />不允许
              </label>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">客源线索中写跟进</div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="edit-perm-lead-write" checked={canWriteLeadFollow} onChange={() => setCanWriteLeadFollow(true)} />允许
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="edit-perm-lead-write" checked={!canWriteLeadFollow} onChange={() => setCanWriteLeadFollow(false)} />不允许
              </label>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">查看会员CRM跟进记录</div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="edit-perm-crm-view" checked={canViewMemberCrmFollow} onChange={() => setCanViewMemberCrmFollow(true)} />允许
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="edit-perm-crm-view" checked={!canViewMemberCrmFollow} onChange={() => setCanViewMemberCrmFollow(false)} />不允许
              </label>
            </div>
          </div>
          <div>
            <div className="mb-1 text-sm text-[#666]">备注 / 简介</div>
            <textarea value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} className="w-full rounded border border-[#d9d9d9] px-3 py-2 text-sm outline-none focus:border-[#3658f7]" />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <div className="mb-1 text-sm text-[#666]">状态</div>
              <select value={status} onChange={(e) => setStatus(Number(e.target.value) === 2 ? 2 : 1)} className={input}>
                <option value={1}>在职</option>
                <option value={2}>离职</option>
              </select>
            </div>
            {status === 2 && (
              <div>
                <div className="mb-1 text-sm text-[#666]">离职原因 <b className="text-[#ff4d4f]">*</b></div>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="请输入离职原因" className={input} />
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button type="button" className="rounded border px-5 py-1.5 text-sm" onClick={close}>取消</button>
          <button type="button" disabled={saving} className="rounded bg-[#3658f7] px-5 py-1.5 text-sm text-white disabled:opacity-60" onClick={() => void submit()}>
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
