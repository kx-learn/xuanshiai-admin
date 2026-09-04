"use client";

import { useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField, type TabConfig } from "@/components/ListPage";
import { adminEndpoints } from "@/lib/admin-endpoints";

type AuthTab = "realname" | "commitment" | "marriage" | "house" | "education" | "other";

const tabs: TabConfig[] = [
  { key: "realname", label: "实名认证" }, { key: "commitment", label: "会员承诺" },
  { key: "marriage", label: "婚姻状况" }, { key: "house", label: "房产认证" },
  { key: "education", label: "学历认证" }, { key: "other", label: "其他认证" },
];

const statusLabel = (status: number, realname = false) => {
  if (realname) return ({ 0: "未认证", 1: "审核中", 2: "已通过", 3: "未通过", 4: "人工复核" } as Record<number, string>)[status] || "未认证";
  return ({ 0: "未提交", 1: "待审核", 2: "已通过", 3: "未通过" } as Record<number, string>)[status] || "未提交";
};

function ReviewAction({ row, realname, kind }: { row: Record<string, unknown>; realname?: boolean; kind?: "education" | "house" | "marriage" }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  if (Number(row.realname_status ?? row.status ?? 0) !== 1 || (!row.id && !row.user_id)) return <span className="text-xs text-[#999]">-</span>;
  const submit = async (status: 2 | 3) => {
    if (status === 3 && !reason.trim()) return;
    setBusy(true);
    try {
      const userId = String(row.user_id ?? row.id);
      if (realname) await adminEndpoints.reviewCrmRealname(userId, { status, reason: reason.trim() || undefined });
      else if (kind) await adminEndpoints.reviewCrmCertification(userId, kind, { status, reason: reason.trim() || undefined });
      window.location.reload();
    } catch (error) { window.alert(error instanceof Error ? error.message : "审核失败"); setBusy(false); }
  };
  return <><span className="flex gap-2 whitespace-nowrap text-xs"><button disabled={busy} className="text-[#3658f7]" onClick={() => { setReason(""); setOpen(true); }}>审核</button></span>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-md bg-white p-5 shadow-xl"><div className="mb-4 flex justify-between"><h2 className="text-lg font-medium">审核认证</h2><button type="button" onClick={() => setOpen(false)}>关闭</button></div><label className="block text-sm">审核意见<textarea value={reason} onChange={(event) => setReason(event.target.value)} maxLength={255} className="mt-1 w-full rounded border p-2" placeholder="不通过时请填写原因" /></label><div className="mt-5 flex justify-end gap-2"><button type="button" className="rounded border px-3 py-1.5" onClick={() => setOpen(false)}>取消</button><button type="button" disabled={busy} className="rounded border border-[#ff4d4f] px-3 py-1.5 text-[#ff4d4f]" onClick={() => void submit(3)}>不通过</button><button type="button" disabled={busy} className="rounded bg-[#3658f7] px-3 py-1.5 text-white" onClick={() => void submit(2)}>通过</button></div></section></div>}</>;
}

const realnameColumns: ColumnDef[] = [
  { title: "会员", key: "nickname", width: 170, render: (row) => <div><div>{String(row.nickname ?? "-")}</div><div className="text-xs text-[#999]">ID：{String(row.user_id ?? row.id ?? "-")}</div></div> },
  { title: "真实姓名", key: "real_name", width: 120 },
  { title: "身份证号", key: "id_card_masked", width: 150, render: (row) => String(row.id_card_masked ?? row.id_card ?? "-") },
  { title: "认证状态", key: "realname_status", width: 100, render: (row) => <span className="text-[#fa8c16]">{statusLabel(Number(row.realname_status ?? 0), true)}</span> },
  { title: "提交时间", key: "submitted_at", width: 170 },
  { title: "操作", key: "action", width: 110, render: (row) => <ReviewAction row={row} realname /> },
];

const certificationColumns = (kind: "education" | "house" | "marriage"): ColumnDef[] => [
  { title: "ID", key: "user_id", width: 80 },
  { title: "认证类型", key: "kind", width: 110, render: () => kind === "education" ? "学历认证" : kind === "house" ? "房产认证" : "婚姻状况" },
  { title: "会员", key: "nickname", width: 170 },
  { title: "文件凭证", key: "material", width: 150, render: (row) => row.material ? <a href={String(row.material)} target="_blank" rel="noreferrer" className="text-[#3658f7]">查看凭证</a> : <span className="text-[#999]">未上传</span> },
  { title: "认证结果", key: "status", width: 110, render: (row) => <span className={Number(row.status) === 1 ? "text-[#fa8c16]" : Number(row.status) === 2 ? "text-[#52c41a]" : "text-[#ff4d4f]"}>{statusLabel(Number(row.status ?? 0))}</span> },
  { title: "提交认证时间", key: "submitted_at", width: 170 },
  { title: "操作", key: "action", width: 110, render: (row) => <ReviewAction row={row} kind={kind} /> },
];

export default function LoveUserAuthPage() {
  const [tab, setTab] = useState<AuthTab>("realname");
  const realname = tab === "realname";
  const certKind = tab === "education" || tab === "house" || tab === "marriage" ? tab : null;
  const endpoint = realname ? "/api/backend/admin/matchmaker/members/realname-reviews" : certKind ? `/api/backend/admin/matchmaker/members/certification-reviews?kind=${certKind}` : undefined;
  const searchFields: SearchField[] = realname
    ? [{ label: "认证状态", key: "status", type: "select", options: [{ label: "审核中", value: "1" }, { label: "已通过", value: "2" }, { label: "未通过", value: "3" }, { label: "人工复核", value: "4" }] }, { label: "按昵称搜", key: "search", type: "input", placeholder: "请输入昵称或手机号", width: 180 }]
    : certKind ? [{ label: "认证状态", key: "status", type: "select", options: [{ label: "待审", value: "1" }, { label: "通过", value: "2" }, { label: "未通过", value: "3" }] }, { label: "按昵称搜", key: "search", type: "input", placeholder: "请输入昵称或手机号", width: 180 }] : [];
  const label = tabs.find((item) => item.key === tab)?.label || "会员认证";
  return <ListPage breadcrumb={[...getBreadcrumb("会员CRM", "会员认证"), { label }]} pageTitle={label}
    tabs={tabs} activeTab={tab} onTabChange={(key) => setTab(key as AuthTab)} searchFields={searchFields}
    actions={tab === "other" ? [{ label: "管理认证类型", variant: "default", onClick: () => window.alert("认证类型管理将在后端配置接口上线后开放") }] : []}
    columns={realname ? realnameColumns : certKind ? certificationColumns(certKind) : [{ title: "认证类型", key: "kind" }, { title: "会员", key: "nickname" }, { title: "认证结果", key: "status" }]}
    dataSource={[]} rowKey="user_id" endpoint={endpoint} pagination={{ current: 1, pageSize: 20, total: 0 }} onSearch={() => undefined} onReset={() => undefined} />;
}
