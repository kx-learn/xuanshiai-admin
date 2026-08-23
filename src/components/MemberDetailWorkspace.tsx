"use client";

import { useEffect, useState } from "react";
import { X, UserRound } from "lucide-react";
import { adminApi } from "@/lib/admin-api";

type Member = { id: number; nickname?: string | null; phone?: string | null; gender?: number | null; is_vip: boolean; matchmaker_id?: number | null; created_at: string; avatar?: string | null; birthday?: string | null; is_married?: number | null; height?: number | null; income?: number | null; hometown?: string | null; residence?: string | null; education?: string | null; job?: string | null };
type Tab = { key: string; label: string; endpoint?: string; root?: "matchmaker" | "members" };
type RecordPage = { items?: Record<string, unknown>[]; total?: number };
const tabs: Tab[] = [
  { key: "basic", label: "基本资料" }, { key: "auth", label: "认证信息", endpoint: "certifications", root: "matchmaker" }, { key: "media", label: "照片视频", endpoint: "media" },
  { key: "intro", label: "自我介绍" }, { key: "requirement", label: "择偶要求" }, { key: "follow", label: "服务跟进", endpoint: "follow-ups" },
  { key: "private", label: "私密信息", endpoint: "private-info" }, { key: "match", label: "推荐匹配", endpoint: "recommendations" }, { key: "calls", label: "通话记录", endpoint: "call-records" },
  { key: "line", label: "牵线记录", endpoint: "match-records" }, { key: "dating", label: "约会记录", endpoint: "dating-records" }, { key: "activities", label: "活动报名", endpoint: "activity-signups" },
  { key: "behavior", label: "线上行为", endpoint: "behavior" }, { key: "super", label: "超级管理", endpoint: "super-info" }, { key: "source", label: "信息溯源", endpoint: "source-records" },
];

export default function MemberDetailWorkspace({ member, initialTab = "basic", onClose }: { member: Member; initialTab?: string; onClose: () => void }) {
  const [tab, setTab] = useState(initialTab);
  const [data, setData] = useState<RecordPage | unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const selected = tabs.find((item) => item.key === tab) ?? tabs[0];

  useEffect(() => {
    if (!selected.endpoint) { setData([]); return; }
    setLoading(true);
    adminApi<RecordPage | unknown[]>(`admin/${selected.root === "matchmaker" ? "matchmaker/members" : "members"}/${member.id}/${selected.endpoint}`)
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [member.id, selected.endpoint]);

  const info = [["编号", `G${String(member.id).padStart(6, "0")}`], ["姓名", member.nickname || "未填写"], ["性别", member.gender === 2 ? "女" : "男"], ["生日", member.birthday || "未填写"], ["身高", member.height ? `${member.height} cm` : "未填写"], ["婚况", member.is_married === 1 ? "未婚" : member.is_married === 2 ? "离异" : member.is_married === 3 ? "丧偶" : "未填写"], ["家乡", member.hometown || "未填写"], ["现居", member.residence || "未填写"], ["学历", member.education || "未填写"], ["职业", member.job || "未填写"], ["收入", member.income ? `${member.income} 元` : "未填写"], ["会员级别", member.is_vip ? "VIP会员" : "普通会员"]];
  const records: Record<string, unknown>[] = Array.isArray(data) ? data as Record<string, unknown>[] : data.items ?? [];
  const renderRecords = () => {
    if (!records.length) return <div className="py-24 text-center text-sm text-[#999]">暂无{selected.label}记录</div>;
    if (selected.key === "media") return <div className="grid grid-cols-4 gap-4">{records.map((item, index) => <div key={String(item.id ?? index)} className="overflow-hidden rounded border bg-white"><div className="aspect-square bg-[#f4f5f7]">{typeof item.file_url === "string" ? <img src={item.file_url} alt="" className="h-full w-full object-cover" /> : null}</div><div className="p-2 text-xs text-[#666]">{String(item.media_type ?? "媒体")} · {item.review_status === 1 ? "已通过" : "待审核"}</div></div>)}</div>;
    const columns = Object.keys(records[0]).filter((key) => key !== "id").slice(0, 6);
    return <div className="overflow-x-auto rounded border"><table className="w-full text-left text-sm"><thead className="bg-[#f7f8fa] text-[#777]"><tr>{columns.map((key) => <th key={key} className="whitespace-nowrap px-4 py-3 font-medium">{key}</th>)}</tr></thead><tbody>{records.map((item, index) => <tr key={String(item.id ?? index)} className="border-t">{columns.map((key) => <td key={key} className="max-w-[260px] px-4 py-3 text-[#444]">{String(item[key] ?? "-")}</td>)}</tr>)}</tbody></table></div>;
  };
  return <div className="fixed inset-0 z-50 bg-black/45"><div className="ml-[18%] flex h-full min-w-[760px] flex-col bg-white shadow-2xl"><header className="flex h-24 items-center justify-between border-b px-6"><div className="flex items-center gap-5"><button title="关闭" onClick={onClose}><X className="size-6 text-[#777]" /></button><h2 className="text-xl font-medium">会员管理</h2></div><div className="flex gap-3"><button className="rounded bg-[#eaf0ff] px-4 py-2 text-[#3658f7]">AI智能红娘</button><button className="rounded border border-[#3658f7] px-4 py-2 text-[#3658f7]">复制资料</button><button className="rounded border border-[#3658f7] px-4 py-2 text-[#3658f7]">资料海报</button><button className="rounded border border-[#3658f7] px-4 py-2 text-[#3658f7]">制作嘉宾卡</button></div></header><div className="m-6 rounded-lg bg-[#f3f6ff] p-5"><div className="flex items-center gap-5"><div className="h-24 w-24 overflow-hidden rounded-lg bg-white">{member.avatar ? <img src={member.avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="m-7 size-10 text-[#8c96a8]" />}</div><div className="flex-1"><div className="text-2xl font-semibold">{member.nickname || "未命名会员"} <span className="mx-3 text-[#b8c3e8]">/</span> G{String(member.id).padStart(6, "0")} <span className="mx-3 text-[#b8c3e8]">/</span> {member.matchmaker_id ? `红娘 #${member.matchmaker_id}` : "-"} <span className="mx-3 text-[#b8c3e8]">/</span> ♡ 公开相亲</div><div className="mt-5 flex items-center gap-8 rounded-lg bg-white px-5 py-3 text-lg"><span>☎ {member.phone || "未填写手机号"}</span><button className="text-sm text-[#3658f7]">查看手机</button><span className="ml-4">微信 {member.phone || "未填写微信"}</span><button className="text-sm text-[#3658f7]">查看微信</button></div><div className="mt-3 text-xs text-[#9299a8]">ID：{member.id}　加入：{member.created_at}　登记：自己注册　跟进：{member.matchmaker_id ? `红娘 #${member.matchmaker_id}` : "未分派"}</div></div></div></div><nav className="mx-6 flex gap-7 overflow-x-auto border-b">{tabs.map((item) => <button key={item.key} onClick={() => setTab(item.key)} className={`h-12 shrink-0 border-b-2 text-sm ${tab === item.key ? "border-[#3658f7] font-medium text-[#3658f7]" : "border-transparent text-[#444]"}`}>{item.label}</button>)}</nav><main className="flex-1 overflow-y-auto px-12 py-7">{selected.key === "basic" ? <><div className="mb-7 flex items-center gap-5 text-sm"><span className="text-[#999]">状态</span>{["公开相亲", "委托红娘", "完全私密", "停止相亲", "已经脱单"].map((x, i) => <label key={x} className="flex items-center gap-2"><input type="radio" name="member-status" defaultChecked={i === 0} />{x}</label>)}</div><div className="mb-8 rounded border border-[#c6d2ff] bg-[#f2f5ff] px-5 py-4 text-sm text-[#667085]">ⓘ 在平台中公开显示头像，相亲会员可查看您的详细资料（不含任何联系方式）</div><div className="mb-6 flex flex-wrap gap-5 text-sm"><span className="w-16 text-[#999]">标签</span>{["高颜值", "高收入", "985毕业", "211毕业", "事业单位", "双一流", "海归", "身材好", "博士", "央国企", "银行金融", "公务员"].map((x) => <label key={x} className="flex items-center gap-1"><input type="checkbox" />{x}</label>)}<button className="text-[#3658f7]">标签管理</button></div><div className="grid grid-cols-3 gap-x-12 gap-y-6">{info.map(([label, value], i) => <label key={label} className="flex items-center gap-4 text-sm"><span className="w-16 shrink-0 text-right text-[#888]">{i < 4 ? <b className="mr-1 text-red-500">*</b> : null}{label}</span><input defaultValue={value} className="h-11 min-w-0 flex-1 rounded border border-[#d9d9d9] px-4 text-[#444] outline-none focus:border-[#3658f7]" /></label>)}</div></> : loading ? <div className="py-24 text-center text-sm text-[#999]">正在加载{selected.label}...</div> : <div className="min-h-[240px]">{renderRecords()}</div>}</main><footer className="flex justify-end border-t px-6 py-4"><button onClick={onClose} className="rounded bg-[#3658f7] px-6 py-2 text-sm text-white">确定提交</button></footer></div></div>;
}
