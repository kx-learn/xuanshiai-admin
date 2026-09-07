"use client";
import { useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import MemberQuickProfileDrawer from "@/components/MemberQuickProfileDrawer";
import { adminApi } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";

import ListPage, { type ColumnDef, type ActionButton, type SearchField } from "@/components/ListPage";

const formatMember = (row: Record<string, unknown>, prefix: "user" | "target") => {
  const nickname = row[`${prefix}_nickname`] ?? row[`${prefix}_name`] ?? row[`${prefix}_id`] ?? "-";
  const code = row[`${prefix}_member_code`] ?? row[`${prefix}_code`];
  return code ? `${nickname}（编号：${code}）` : String(nickname);
};

const baseColumns: ColumnDef[] = [
  { title: "ID", key: "id", width: 60 },
  { title: "提交人", key: "user_id", width: 240, render: (row) => formatMember(row, "user") },
  { title: "想约见", key: "target_user_id", width: 240, render: (row) => formatMember(row, "target") },
  { title: "提交时间", key: "created_at", width: 180 },
  { title: "红娘", key: "matchmaker_name", width: 120, render: (row) => String(row.matchmaker_name ?? row.matchmaker_id ?? "") },
  {
    title: "状态标记",
    key: "status",
    width: 90,
    render: (row: Record<string, unknown>) => {
      const status = String(row.status ?? "");
      const isPending = status === "SUBMITTED" || status === "CONTACTED" || status === "PENDING" || status === "0" || status === "待处理";
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            fontSize: 12,
            borderRadius: 4,
            color: isPending ? "#fa8c16" : "#52c41a",
            backgroundColor: isPending ? "#fff7e6" : "#f6ffed",
            border: `1px solid ${isPending ? "#ffd591" : "#b7eb8f"}`,
          }}
        >
          {isPending ? "待处理" : status === "ACCEPTED" ? "已处理" : status || "待处理"}
        </span>
      );
    },
  },
];

const memberIdFromRow = (row: Record<string, unknown>) => Number(row.member_id ?? row.user_id ?? row.applicant_user_id ?? row.requester_id ?? row.submitter_id ?? 0);

const data: Record<string, unknown>[] = [];

const searchFields: SearchField[] = [
  { label: "", key: "search", type: "select", placeholder: "按提交人昵称搜", options: [{ label: "按提交人昵称搜", value: "nickname" }, { label: "按编号搜", value: "id" }], width: 150 },
  { label: "", key: "search_value", type: "input", placeholder: "请输入", width: 180 },
  { label: "", key: "from_date", type: "dateRange" },
  { label: "服务红娘", key: "matchmaker_id", type: "select", placeholder: "服务红娘：不限", options: [{ label: "服务红娘：不限", value: "" }], width: 150 },
  { label: "状态", key: "status", type: "select", placeholder: "状态：不限", options: [{ label: "状态：不限", value: "" }, { label: "待处理", value: "SUBMITTED" }, { label: "已处理", value: "ACCEPTED" }], width: 140 },
];

const actions: ActionButton[] = [
  { label: "添加约见记录", variant: "primary" },
];

export default function Page() {
  const [detailMember, setDetailMember] = useState<{ id: number; nickname?: string | null; memberCode?: string | null } | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Record<string, unknown> | null>(null);
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [savingId, setSavingId] = useState<number | null>(null);
  const review = async (row: Record<string, unknown>, status: "ACCEPTED" | "DECLINED", reason?: string) => {
    const id = Number(row.id);
    if (!id) return;
    setSavingId(id);
    try {
      await adminApi(`admin/matchmaker/meetings/requests/${id}`, { method: "PATCH", body: { status, reason } });
      setRejectTarget(null);
      setRefreshKey((value) => value + 1);
      setNotice(status === "ACCEPTED" ? "审核通过，已通知被约见会员" : "已拒绝约见申请，资源已退回");
      window.setTimeout(() => setNotice(""), 2600);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "审核失败，请稍后重试");
      window.setTimeout(() => setNotice(""), 2600);
    } finally { setSavingId(null); }
  };
  const columns: ColumnDef[] = [...baseColumns, {
    title: "操作", key: "action", width: 280,
    render: (row) => {
      const id = memberIdFromRow(row);
      const pending = ["SUBMITTED", "CONTACTED", "PENDING", "0", "待处理"].includes(String(row.status ?? ""));
      return <div className="flex items-center gap-4 whitespace-nowrap"><button type="button" className="text-[#3658f7] disabled:text-[#bbb]" disabled={!id} onClick={() => setDetailMember({ id, nickname: typeof row.user_nickname === "string" ? row.user_nickname : null, memberCode: String(row.user_member_code ?? row.user_id ?? id) })}>查看会员资料</button>{pending && <><button type="button" disabled={savingId === Number(row.id)} className="text-[#52a26b] disabled:text-[#bbb]" onClick={() => void review(row, "ACCEPTED")}>审核通过</button><button type="button" disabled={savingId === Number(row.id)} className="text-[#ff4d4f] disabled:text-[#bbb]" onClick={() => setRejectTarget(row)}>拒绝</button></>}</div>;
    },
  }];
  return (
    <>
      <ListPage
      breadcrumb={getBreadcrumb("会员服务", "约见申请")}
      pageTitle="约见申请"
      searchFields={searchFields}
      actions={actions}
      columns={columns}
      dataSource={data}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      endpoint="/api/backend/admin/matchmaker/meetings/requests"
      refreshKey={refreshKey}
      onSearch={() => {}}
      onReset={() => {}}
      />
      {notice && <div role="status" className={`fixed right-6 top-5 z-[60] border px-4 py-2 text-sm shadow ${notice.includes("失败") ? "border-[#ffa39e] bg-[#fff1f0] text-[#ff4d4f]" : "border-[#b7eb8f] bg-[#f6ffed] text-[#52a26b]"}`}>{notice}</div>}
      {detailMember && <MemberQuickProfileDrawer memberId={detailMember.id} nickname={detailMember.nickname} memberCode={detailMember.memberCode} onClose={() => setDetailMember(null)} />}
      {rejectTarget && <RejectModal saving={savingId === Number(rejectTarget.id)} onClose={() => setRejectTarget(null)} onSubmit={(reason) => void review(rejectTarget, "DECLINED", reason)} />}
    </>
  );
}

function RejectModal({ saving, onClose, onSubmit }: { saving: boolean; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"><section className="w-full max-w-[420px] rounded bg-white shadow-2xl"><header className="border-b border-[#f0f0f0] px-5 py-4 text-base font-medium text-[#333]">拒绝约见申请</header><div className="px-5 py-5"><label className="block text-sm text-[#555]">拒绝原因<span className="ml-1 text-[#ff4d4f]">*</span></label><textarea autoFocus value={reason} onChange={(event) => setReason(event.target.value)} placeholder="请输入拒绝原因" className="mt-2 h-24 w-full resize-none rounded border border-[#d9d9d9] p-3 text-sm outline-none focus:border-[#3658f7]" /></div><footer className="flex justify-end gap-2 border-t border-[#f0f0f0] px-5 py-3"><Button type="button" onClick={onClose}>取消</Button><Button type="button" variant="primary" loading={saving} disabled={!reason.trim()} onClick={() => onSubmit(reason.trim())}>确定拒绝</Button></footer></section></div>;
}
