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

const tabs: TabConfig[] = [
  { key: "intro", label: "个人介绍" },
  { key: "avatar", label: "头像" },
  { key: "photo", label: "照片" },
  { key: "video", label: "视频" },
  { key: "all", label: "全部" },
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

const data: ContentRow[] = [
  { memberName: "泥絮", memberCode: "B914415", content: "", updateTime: "2026-07-14 18:40:19" },
  { memberName: "Oᴗoಣ", memberCode: "G239989", content: "", updateTime: "2026-07-14 17:20:31" },
  { memberName: "唱起那首笑忘歌", memberCode: "G533829", content: "", updateTime: "2026-07-13 22:35:01" },
  { memberName: "rasin", memberCode: "G847150", content: "", updateTime: "2026-07-12 20:47:24" },
  { memberName: "hunyun", memberCode: "B470445", content: "", updateTime: "2026-07-12 11:13:13" },
  { memberName: "張.先生", memberCode: "B598549", content: "", updateTime: "2026-07-11 15:29:43" },
  { memberName: "小稳", memberCode: "B671811", content: "", updateTime: "2026-07-11 13:52:02" },
  { memberName: "Thera", memberCode: "G824771", content: "", updateTime: "2026-07-10 14:15:52" },
  { memberName: "xy", memberCode: "B011925", content: "", updateTime: "2026-07-10 14:00:27" },
  { memberName: "优米", memberCode: "G411232", content: "", updateTime: "2026-07-10 13:15:37" },
];

const dataSource = data as unknown as Record<string, unknown>[];

export default function ContentVerifyPage() {
  return (
    <ListPage
      breadcrumb={[...getBreadcrumb("会员CRM", "内容核查"), { label: "个人介绍" }]}
      pageTitle="个人介绍"
      tabs={tabs}
      activeTab="intro"
      columns={columns}
      dataSource={dataSource}
      endpoint="/api/backend/admin/community/moderation-items?page=1&page_size=20&status=pending"
      rowKey="id"
      pagination={{ current: 1, pageSize: 10, total: 765 }}
      onSearch={() => {}}
      onReset={() => {}}
    />
  );
}
