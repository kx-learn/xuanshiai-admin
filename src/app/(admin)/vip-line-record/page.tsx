"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import MemberQuickProfileDrawer from "@/components/MemberQuickProfileDrawer";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/admin-api";

import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const baseColumns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "申请牵线人", key: "from_nickname", width: 200, render: (row) => `${row.from_nickname || "-"}（${row.from_user_id || "-"}）` },
  { title: "牵线对象", key: "to_nickname", width: 200, render: (row) => `${row.to_nickname || "-"}（${row.to_user_id || "-"}）` },
  { title: "牵线红娘", key: "matchmaker_id", width: 100 },
  { title: "支付状态", key: "order_id", width: 90, render: () => <span className="text-[#52a26b]">已支付</span> },
  {
    title: "牵线状态",
    key: "matchStatus",
    width: 90,
    render: (row: Record<string, unknown>) => {
    const status = String(row.status ?? "");
    const statusLabel: Record<string,string> = { "0":"待牵线", "1":"牵线中", "2":"牵线成功", "3":"牵线失败" };
      const label = statusLabel[status] || status || "-";
      const colorMap: Record<string, string> = {
        "牵线成功": "#52c41a",
        "牵线失败": "#ff4d4f",
        "待牵线": "#1890ff",
        "牵线中": "#fa8c16",
      };
      const bgMap: Record<string, string> = {
        "牵线成功": "#f6ffed",
        "牵线失败": "#fff1f0",
        "待牵线": "#e6f7ff",
        "牵线中": "#fff7e6",
      };
      const borderMap: Record<string, string> = {
        "牵线成功": "#b7eb8f",
        "牵线失败": "#ffa39e",
        "待牵线": "#91d5ff",
        "牵线中": "#ffd591",
      };
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: colorMap[label] || "#999",
            backgroundColor: bgMap[label] || "#f5f5f5",
            border: `1px solid ${borderMap[label] || "#d9d9d9"}`,
          }}
        >
          {label}
        </span>
      );
    },
  },
  { title: "申请时间", key: "created_at", width: 160 },
  { title: "完成时间", key: "responded_at", width: 160, render: (row) => row.responded_at ? String(row.responded_at) : "-" },
];

const memberIdFromRow = (row: Record<string, unknown>) => Number(row.member_id ?? row.user_id ?? row.applicant_user_id ?? row.requester_id ?? 0);

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "操作人", type: "select", placeholder: "全部操作人", options: [{ label: "全部操作人", value: "" }], width: 140 },
  { label: "服务红娘", type: "select", placeholder: "全部服务红娘", options: [{ label: "全部服务红娘", value: "" }], width: 140 },
  { label: "时间", type: "dateRange" },
  { label: "搜索", type: "select", placeholder: "按申请人昵称搜", options: [{ label: "按申请人昵称搜", value: "nickname" }, { label: "按编号搜", value: "id" }], width: 150 },
  { label: "", type: "input", placeholder: "请输入", width: 180 },
];

type MemberOption = {
  id: number;
  nickname?: string | null;
  member_code?: string | null;
  phone?: string | null;
  mobile?: string | null;
};

type MemberSearchResponse = MemberOption[] | { items?: MemberOption[]; data?: MemberOption[] };

const emptyRecord = {
  fromLoveUserId: null as number | null,
  toLoveUserId: null as number | null,
  createTime: "",
  completeTime: "",
  lineStatus: "1",
};

export default function Page() {
  const [detailMember, setDetailMember] = useState<{ id: number; nickname?: string | null; memberCode?: string | null } | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const openCreate = () => setCreateOpen(true);
  const closeCreate = () => setCreateOpen(false);
  const actions: ActionButton[] = [
    { label: "添加牵线记录", variant: "primary", onClick: openCreate },
    { label: "导出EXCEL", variant: "primary" },
  ];
  const columns: ColumnDef[] = [...baseColumns, {
    title: "操作", key: "action", width: 180,
    render: (row) => {
      const id = memberIdFromRow(row);
      return <button type="button" className="whitespace-nowrap text-[#3658f7] disabled:text-[#bbb]" disabled={!id} onClick={() => setDetailMember({ id, nickname: typeof row.nickname === "string" ? row.nickname : typeof row.user_name === "string" ? row.user_name : null, memberCode: String(row.member_code ?? row.member_no ?? row.user_id ?? id) })}>查看会员资料</button>;
    },
  }];
  return (
    <>
      <ListPage
      breadcrumb={getBreadcrumb("会员服务", "红娘牵线")}
      pageTitle="红娘牵线"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      endpoint="/api/backend/admin/matchmaker/match-records"
      refreshKey={refreshKey}
      pagination={{ current: 1, pageSize: 20, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
      />
      {notice && <div role="status" className="fixed right-6 top-5 z-[60] border border-[#b7eb8f] bg-[#f6ffed] px-4 py-2 text-sm text-[#52a26b] shadow">{notice}</div>}
      {detailMember && <MemberQuickProfileDrawer memberId={detailMember.id} nickname={detailMember.nickname} memberCode={detailMember.memberCode} onClose={() => setDetailMember(null)} />}
      {createOpen && <MatchRecordModal onClose={closeCreate} onCreated={() => { closeCreate(); setRefreshKey((value) => value + 1); setNotice("牵线记录添加成功"); window.setTimeout(() => setNotice(""), 2500); }} />}
    </>
  );
}

function MatchRecordModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [record, setRecord] = useState(emptyRecord);
  const [fromMember, setFromMember] = useState<MemberOption | null>(null);
  const [toMember, setToMember] = useState<MemberOption | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateRecord = <K extends keyof typeof emptyRecord>(key: K, value: (typeof emptyRecord)[K]) => {
    setError("");
    setRecord((current) => ({ ...current, [key]: value }));
  };
  const submit = async () => {
    if (!record.fromLoveUserId || !record.toLoveUserId || !record.createTime || !record.completeTime) {
      setError("请完成必填项");
      return;
    }
    if (record.fromLoveUserId === record.toLoveUserId) {
      setError("牵线会员与被牵线会员不能相同");
      return;
    }
    if (new Date(record.completeTime) < new Date(record.createTime)) {
      setError("牵线完成时间不能早于申请时间");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await adminApi("admin/matchmaker/match-records", {
        method: "POST",
        body: {
          from_love_user_id: record.fromLoveUserId,
          to_love_user_id: record.toLoveUserId,
          create_time: new Date(record.createTime).toISOString(),
          complete_time: new Date(record.completeTime).toISOString(),
          line_status: Number(record.lineStatus),
        },
      });
      onCreated();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "提交失败，请稍后重试";
      setError(message.includes("404") || message.includes("Not Found") ? "牵线记录服务暂未部署，暂无法提交" : message || "提交失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-labelledby="match-record-title">
    <section className="w-full max-w-[620px] rounded-[6px] bg-white shadow-2xl">
      <header className="flex h-14 items-center border-b border-[#f0f0f0] px-5">
        <h2 id="match-record-title" className="text-base font-medium text-[#333]">添加牵线记录</h2>
        <button type="button" aria-label="关闭添加牵线记录" onClick={onClose} className="ml-auto grid size-8 place-items-center text-[#999] hover:text-[#333]"><X size={18} /></button>
      </header>
      <div className="space-y-5 px-9 py-6">
        <ModalField label="牵线会员" required><MemberPicker selected={fromMember} onSelect={(member) => { setFromMember(member); updateRecord("fromLoveUserId", member?.id ?? null); }} /></ModalField>
        <ModalField label="被牵线会员" required><MemberPicker selected={toMember} onSelect={(member) => { setToMember(member); updateRecord("toLoveUserId", member?.id ?? null); }} /></ModalField>
        <ModalField label="牵线申请时间" required><input type="datetime-local" value={record.createTime} onChange={(event) => updateRecord("createTime", event.target.value)} className="h-8 w-full rounded border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#3658f7]" /></ModalField>
        <ModalField label="牵线完成时间" required><input type="datetime-local" value={record.completeTime} onChange={(event) => updateRecord("completeTime", event.target.value)} className="h-8 w-full rounded border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#3658f7]" /></ModalField>
        <ModalField label="牵线结果" required><div className="space-y-2 pt-1 text-sm text-[#555]"><label className="flex cursor-pointer items-center gap-2"><input type="radio" name="line-status" checked={record.lineStatus === "1"} onChange={() => updateRecord("lineStatus", "1")} /><span>成功</span><span className="text-[#999]">从牵线会员账号扣除 1 次牵线次数</span></label><label className="flex cursor-pointer items-center gap-2"><input type="radio" name="line-status" checked={record.lineStatus === "2"} onChange={() => updateRecord("lineStatus", "2")} /><span>失败</span><span className="text-[#999]">不扣除牵线次数</span></label></div></ModalField>
        {error && <p role="alert" className="ml-[116px] text-sm text-[#ff4d4f]">{error}</p>}
      </div>
      <footer className="flex justify-end gap-2 border-t border-[#f0f0f0] px-5 py-3"><Button type="button" onClick={onClose}>取消</Button><Button type="button" variant="primary" loading={saving} onClick={() => void submit()}>确定提交</Button></footer>
    </section>
  </div>;
}

function ModalField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div className="grid grid-cols-[104px_minmax(0,1fr)] items-start gap-3"><span className="pt-1.5 text-right text-sm text-[#555]">{required && <b className="mr-1 font-normal text-[#ff4d4f]">*</b>}{label}</span><div className="min-w-0">{children}</div></div>;
}

function MemberPicker({ selected, onSelect }: { selected: MemberOption | null; onSelect: (member: MemberOption | null) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const value = query.trim();
    if (!value) { setResults([]); return; }
    let active = true;
    const timer = window.setTimeout(() => {
      setSearching(true);
      adminApi<MemberSearchResponse>("admin/matchmaker/members", { query: { search: value, page: 1, page_size: 8 } })
        .then((response) => { if (active) setResults(Array.isArray(response) ? response : response.items ?? response.data ?? []); })
        .catch(() => { if (active) setResults([]); })
        .finally(() => { if (active) setSearching(false); });
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query]);

  const memberLabel = (member: MemberOption) => `${member.member_code ?? member.id}  ${member.nickname || "未命名会员"}${member.phone || member.mobile ? `  ${member.phone || member.mobile}` : ""}`;
  if (selected) return <div className="flex h-8 items-center rounded border border-[#d9d9d9] bg-[#fafafa] px-3 text-sm text-[#555]"><span className="min-w-0 flex-1 truncate">{memberLabel(selected)}</span><button type="button" aria-label="清除已选会员" onClick={() => { setQuery(""); setResults([]); onSelect(null); }} className="ml-2 text-[#999] hover:text-[#333]"><X size={14} /></button></div>;
  return <div className="relative"><input value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} placeholder="请输入编号/姓名/手机号/昵称" className="h-8 w-full rounded border border-[#d9d9d9] px-3 text-sm outline-none focus:border-[#3658f7]" />{open && query.trim() && <div className="absolute z-10 mt-1 max-h-52 w-full overflow-y-auto border border-[#d9d9d9] bg-white py-1 shadow-lg">{searching ? <p className="px-3 py-2 text-sm text-[#999]">搜索中...</p> : results.length ? results.map((member) => <button key={member.id} type="button" onClick={() => { onSelect(member); setQuery(""); setOpen(false); }} className="block w-full truncate px-3 py-2 text-left text-sm text-[#555] hover:bg-[#f5f7ff]">{memberLabel(member)}</button>) : <p className="px-3 py-2 text-sm text-[#999]">未找到会员</p>}</div>}</div>;
}
