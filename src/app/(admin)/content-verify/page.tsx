"use client";
import { useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type TabConfig } from "@/components/ListPage";
import { adminEndpoints } from "@/lib/admin-endpoints";

function ModerationActions({ row }: { row: Record<string, unknown> }) {
  const [busy, setBusy] = useState(false);
  const taskId = row.id;
  if (taskId === undefined || taskId === null) return <span className="text-[#999] text-xs">-</span>;
  const review = async (action: "approve" | "reject") => {
    setBusy(true);
    try {
      await adminEndpoints.reviewModerationItem(String(taskId), { action, reason: action === "reject" ? "管理员审核未通过" : "管理员审核通过" });
      window.location.reload();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "审核失败");
      setBusy(false);
    }
  };
  return <span className="flex items-center gap-2 text-xs">
    <button disabled={busy} onClick={() => review("approve")} className="text-[#3658f7] disabled:opacity-50">通过</button>
    <button disabled={busy} onClick={() => review("reject")} className="text-[#ff4d4f] disabled:opacity-50">拒绝</button>
  </span>;
}

function ReportActions({ row }: { row: Record<string, unknown> }) {
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState("");
  const [action, setAction] = useState("hide_content");
  const status = Number(row.status);
  if (!row.id || status !== 0) return <span className="text-xs text-[#999]">已处理</span>;
  const submit = async (nextStatus: 1 | 2) => {
    if (!result.trim()) return;
    setBusy(true);
    try {
      await adminEndpoints.reviewReport(String(row.id), { status: nextStatus, result: result.trim(), action: nextStatus === 2 ? "dismiss" : action });
      window.location.reload();
    } catch (error) { window.alert(error instanceof Error ? error.message : "审核失败"); setBusy(false); }
  };
  const isUserReport = row.target_type === "user";
  return <><span className="flex items-center gap-2 whitespace-nowrap text-xs"><button disabled={busy} className="text-[#3658f7]" onClick={() => { setAction(isUserReport ? "none" : "hide_content"); setOpen(true); }}>成立</button><button disabled={busy} className="text-[#ff4d4f]" onClick={() => { setAction("dismiss"); setOpen(true); }}>驳回</button></span>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4"><section role="dialog" aria-modal="true" className="w-full max-w-md rounded-md bg-white p-5 shadow-xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-medium">审核举报 #{String(row.id)}</h2><button type="button" onClick={() => setOpen(false)}>关闭</button></div><label className="block text-sm">处理结果<textarea value={result} onChange={(event) => setResult(event.target.value)} maxLength={255} className="mt-1 w-full rounded border p-2" placeholder="请输入处理结果" /></label>{action !== "dismiss" && !isUserReport && <label className="mt-3 block text-sm">内容处置<select value={action} onChange={(event) => setAction(event.target.value)} className="mt-1 h-9 w-full rounded border bg-white px-2"><option value="hide_content">下架被举报内容</option><option value="none">仅记录，不处置</option></select></label>}<div className="mt-5 flex justify-end gap-2"><button type="button" className="rounded border px-3 py-1.5" onClick={() => setOpen(false)}>取消</button><button type="button" disabled={!result.trim() || busy} className="rounded bg-[#3658f7] px-3 py-1.5 text-white disabled:opacity-50" onClick={() => void submit(action === "dismiss" ? 2 : 1)}>确认</button></div></section></div>}</>;
}

const tabs: TabConfig[] = [
  { key: "intro", label: "个人介绍" },
  { key: "avatar", label: "头像" },
  { key: "photo", label: "照片" },
  { key: "video", label: "视频" },
  { key: "all", label: "全部" },
  { key: "reports", label: "举报审核" },
];

const columns: ColumnDef[] = [
  {
    title: "会员",
    key: "member",
    width: 200,
    render: (row: Record<string, unknown>) => {
      const r = row as { memberName?: string; memberCode?: string; user_id?: number; target_type?: string; target_id?: number };
      return (
        <div className="text-xs leading-relaxed">
          <div>{r.memberName || `用户 ${r.user_id ?? "-"}`}</div>
          <div className="text-[#999]">编号：{r.memberCode}</div>
        </div>
      );
    },
  },
  { title: "自白内容(个人介绍)", key: "content", render: (row: Record<string, unknown>) => {
    const r = row as { content?: string; display_content?: string; raw_content?: string };
    const content = r.display_content || r.content || r.raw_content || "-";
    return <span className={content === "-" ? "text-xs text-[#999]" : "text-xs"}>{content}</span>;
  }},
  { title: "修改时间", key: "updateTime", width: 180 },
  {
    title: "操作",
    key: "action",
    width: 90,
    render: (row) => <ModerationActions row={row} />,
    /* render: () => (
      <span className="text-[#3658f7] cursor-pointer hover:underline text-xs">查看资料</span>
    ), */
  },
];

interface ContentRow {
  memberName: string;
  memberCode: string;
  content: string;
  updateTime: string;
}

const data: ContentRow[] = [];

const dataSource = data as unknown as Record<string, unknown>[];

const reportColumns: ColumnDef[] = [
  { title: "举报ID", key: "id", width: 90 },
  { title: "举报人", key: "reporter_user_id", width: 100, render: (row) => <span>用户 {String(row.reporter_user_id ?? "-")}</span> },
  { title: "被举报对象", key: "target", width: 150, render: (row) => <span>用户 {String(row.target_user_id ?? "-")}<br /><span className="text-[#999]">{String(row.target_type ?? "-")} #{String(row.target_id ?? "-")}</span></span> },
  { title: "举报类型", key: "type", width: 130 },
  { title: "举报说明", key: "description", width: 260, render: (row) => <div className="max-w-[240px] truncate" title={String(row.description ?? "")}>{String(row.description ?? "-")}</div> },
  { title: "证据", key: "images", width: 120, render: (row) => { const images = Array.isArray(row.images) ? row.images as string[] : []; return images.length ? <div className="flex gap-1">{images.slice(0, 3).map((src, i) => <a key={i} href={src} target="_blank" rel="noreferrer"><img src={src} alt="举报证据" className="size-9 rounded border object-cover" /></a>)}</div> : <span className="text-[#999]">-</span>; } },
  { title: "状态", key: "status", width: 90, render: (row) => <span className={Number(row.status) === 0 ? "text-[#fa8c16]" : Number(row.status) === 1 ? "text-[#52c41a]" : "text-[#999]"}>{Number(row.status) === 0 ? "待审核" : Number(row.status) === 1 ? "举报成立" : "已驳回"}</span> },
  { title: "提交时间", key: "created_at", width: 170 },
  { title: "操作", key: "action", width: 100, render: (row) => <ReportActions row={row} /> },
];

export default function ContentVerifyPage() {
  const [tab, setTab] = useState("intro");
  const isReports = tab === "reports";
  return (
    <ListPage
      breadcrumb={[...getBreadcrumb("会员CRM", "内容核查"), { label: isReports ? "举报审核" : "个人介绍" }]}
      pageTitle={isReports ? "举报审核" : "个人介绍"}
      tabs={tabs}
      activeTab={tab}
      onTabChange={setTab}
      columns={isReports ? reportColumns : columns}
      dataSource={dataSource}
      searchFields={isReports ? [{ label: "状态", key: "status", type: "select", options: [{ label: "待审核", value: "0" }, { label: "举报成立", value: "1" }, { label: "已驳回", value: "2" }] }, { label: "对象类型", key: "target_type", type: "select", options: [{ label: "用户", value: "user" }, { label: "文字/帖子", value: "post" }, { label: "评论", value: "comment" }, { label: "图片/媒体", value: "user_media" }, { label: "社区图片", value: "community_media" }, { label: "聊天消息", value: "message" }] }] : []}
      endpoint={isReports ? "/api/backend/admin/reports" : "/api/backend/admin/community/moderation-items?page=1&page_size=20&status=pending"}
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 0 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
