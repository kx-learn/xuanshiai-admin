"use client";

import { useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import ListPage, { type ColumnDef, type SearchField, type TabConfig } from "@/components/ListPage";

type BehaviorTab = "browse" | "favorite" | "superlike" | "gift" | "report";

const tabs: TabConfig[] = [
  { key: "browse", label: "浏览记录" }, { key: "favorite", label: "收藏记录" },
  { key: "superlike", label: "线上爆灯" }, { key: "gift", label: "赠送礼物" }, { key: "report", label: "网友举报" },
];

const member = (row: Record<string, unknown>) => <div className="whitespace-nowrap"><div>{String(row.nickname ?? "-")}</div><div className="text-xs text-[#999]">编号：{String(row.user_id ?? "-")}</div></div>;
const target = (row: Record<string, unknown>) => <div className="whitespace-nowrap"><div>{String(row.target_nickname ?? "-")}</div><div className="text-xs text-[#999]">编号：{String(row.target_user_id ?? "-")}</div></div>;

const browseColumns: ColumnDef[] = [
  { title: "会员", key: "nickname", width: 190, render: member }, { title: "浏览了谁", key: "target_nickname", width: 190, render: target },
  { title: "第几次浏览", key: "browse_times", width: 120, render: (row) => `第 ${String(row.browse_times ?? 0)} 次` }, { title: "浏览时间", key: "occurred_at", width: 180 },
];
const relationColumns: ColumnDef[] = [
  { title: "会员", key: "nickname", width: 220, render: member }, { title: "对象会员", key: "target_nickname", width: 220, render: target }, { title: "时间", key: "occurred_at", width: 180 },
];
const reportColumns: ColumnDef[] = [
  { title: "举报会员", key: "nickname", width: 170, render: member }, { title: "被举报对象", key: "target_nickname", width: 170, render: target },
  { title: "举报类型", key: "target_type", width: 110 }, { title: "举报原因", key: "type", width: 130 }, { title: "举报说明", key: "detail", width: 220 },
  { title: "处理状态", key: "status", width: 110, render: (row) => ({ 0: "待处理", 1: "已成立", 2: "已驳回" } as Record<number, string>)[Number(row.status)] || "待处理" }, { title: "举报时间", key: "occurred_at", width: 180 },
];

export default function LoveUserBehaviorPage() {
  const [tab, setTab] = useState<BehaviorTab>("browse");
  const label = tabs.find((item) => item.key === tab)?.label || "线上行为";
  const columns = tab === "browse" ? browseColumns : tab === "report" ? reportColumns : relationColumns;
  const searchFields: SearchField[] = [
    ...(tab === "browse" ? [{ label: "浏览次数", key: "min_times", type: "select" as const, options: [{ label: "3次以上浏览", value: "3" }, { label: "5次以上浏览", value: "5" }] }] : []),
    ...(tab === "report" ? [{ label: "处理状态", key: "status", type: "select" as const, options: [{ label: "待处理", value: "0" }, { label: "已成立", value: "1" }, { label: "已驳回", value: "2" }] }] : []),
    { label: "按昵称搜", key: "search", type: "input", placeholder: "请输入会员昵称", width: 180 },
  ];
  return <ListPage breadcrumb={[...getBreadcrumb("会员CRM", "线上行为"), { label }]} pageTitle={label}
    tabs={tabs} activeTab={tab} onTabChange={(key) => setTab(key as BehaviorTab)} columns={columns} dataSource={[]} rowKey="event_id"
    endpoint={`/api/backend/admin/members/behavior/all?category=${tab}`} pagination={{ current: 1, pageSize: 20, total: 0 }}
    searchFields={searchFields} onSearch={() => undefined} onReset={() => undefined} />;
}
