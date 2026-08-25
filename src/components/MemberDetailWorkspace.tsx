"use client";

import { useEffect, useState } from "react";
import {
  Clipboard,
  Eye,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  Sparkles,
  X,
  UserRound,
} from "lucide-react";
import { adminApi, resolveMediaUrl } from "@/lib/admin-api";

type Member = {
  id: number;
  nickname?: string | null;
  phone?: string | null;
  gender?: number | null;
  status?: number | null;
  is_vip: boolean;
  matchmaker_id?: number | null;
  created_at: string;
  avatar?: string | null;
  birthday?: string | null;
  is_married?: number | null;
  height?: number | null;
  income?: number | null;
  hometown?: string | null;
  residence?: string | null;
  education?: string | null;
  job?: string | null;
  self_intro?: string | null;
  ideal_partner?: string | null;
  tags?: string[] | Record<string, string[]> | null;
  last_login_at?: string | null;
  last_login_ip?: string | null;
  ip_location?: string | null;
  wechat?: string | null;
};
type Tab = {
  key: string;
  label: string;
  endpoint?: string;
  root?: "matchmaker" | "members";
};
type RecordPage = { items?: Record<string, unknown>[]; total?: number };
const tabs: Tab[] = [
  { key: "basic", label: "基本资料" },
  {
    key: "auth",
    label: "认证信息",
    endpoint: "certifications",
    root: "matchmaker",
  },
  { key: "media", label: "照片视频", endpoint: "media" },
  { key: "intro", label: "自我介绍" },
  { key: "requirement", label: "择偶要求" },
  { key: "follow", label: "服务跟进", endpoint: "follow-ups" },
  { key: "private", label: "私密信息", endpoint: "private-info" },
  { key: "match", label: "推荐匹配", endpoint: "recommendations" },
  { key: "calls", label: "通话记录", endpoint: "call-records" },
  { key: "line", label: "牵线记录", endpoint: "match-records" },
  { key: "dating", label: "约会记录", endpoint: "dating-records" },
  { key: "activities", label: "活动报名", endpoint: "activity-signups" },
  { key: "behavior", label: "线上行为", endpoint: "behavior" },
  { key: "super", label: "超级管理", endpoint: "super-info" },
  { key: "source", label: "信息溯源", endpoint: "source-records" },
];

export default function MemberDetailWorkspace({
  member,
  initialTab = "basic",
  onClose,
}: {
  member: Member;
  initialTab?: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState(initialTab);
  const [data, setData] = useState<RecordPage | unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [status, setStatus] = useState(String(member.status ?? 1));
  const [profile, setProfile] = useState<Record<string, string>>({
    nickname: member.nickname || "",
    gender: String(member.gender || 1),
    birthday: member.birthday || "",
    height: member.height ? String(member.height) : "",
    is_married: member.is_married ? String(member.is_married) : "",
    hometown: member.hometown || "",
    residence: member.residence || "",
    education: member.education || "",
    job: member.job || "",
    income: member.income ? String(member.income) : "",
    self_intro: member.self_intro || "",
    ideal_partner: member.ideal_partner || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRecordIds, setSelectedRecordIds] = useState<number[]>([]);
  const selected = tabs.find((item) => item.key === tab) ?? tabs[0];

  useEffect(() => {
    adminApi<Member>(`admin/matchmaker/members/${member.id}`)
      .then((detail) => {
        setStatus(String(detail.status ?? 1));
        setProfile({
          nickname: detail.nickname || "",
          gender: String(detail.gender || 1),
          birthday: detail.birthday || "",
          height: detail.height ? String(detail.height) : "",
          is_married: detail.is_married ? String(detail.is_married) : "",
          hometown: detail.hometown || "",
          residence: detail.residence || "",
          education: detail.education || "",
          job: detail.job || "",
          income: detail.income ? String(detail.income) : "",
          self_intro: detail.self_intro || "",
          ideal_partner: detail.ideal_partner || "",
        });
        const tags = detail.tags;
        setSelectedTags(
          Array.isArray(tags) ? tags : tags ? Object.values(tags).flat() : [],
        );
      })
      .catch(() => undefined);
  }, [member.id]);

  useEffect(() => {
    setSelectedRecordIds([]);
    if (!selected.endpoint) {
      setData([]);
      return;
    }
    setLoading(true);
    adminApi<RecordPage | unknown[]>(
      `admin/${selected.root === "matchmaker" ? "matchmaker/members" : "members"}/${member.id}/${selected.endpoint}`,
    )
      .then(setData)
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [member.id, selected.endpoint]);

  const info = [
    ["编号", `G${String(member.id).padStart(6, "0")}`],
    ["姓名", member.nickname || "未填写"],
    ["性别", member.gender === 2 ? "女" : "男"],
    ["生日", member.birthday || "未填写"],
    ["身高", member.height ? `${member.height} cm` : "未填写"],
    [
      "婚况",
      member.is_married === 1
        ? "未婚"
        : member.is_married === 2
          ? "离异"
          : member.is_married === 3
            ? "丧偶"
            : "未填写",
    ],
    ["家乡", member.hometown || "未填写"],
    ["现居", member.residence || "未填写"],
    ["学历", member.education || "未填写"],
    ["职业", member.job || "未填写"],
    ["收入", member.income ? `${member.income} 元` : "未填写"],
    ["会员级别", member.is_vip ? "VIP会员" : "普通会员"],
  ];
  const records: Record<string, unknown>[] = Array.isArray(data)
    ? (data as Record<string, unknown>[])
    : (data.items ?? []);
  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };
  const copyProfile = async () => {
    await navigator.clipboard?.writeText(
      `${member.nickname || "未命名会员"} / G${String(member.id).padStart(6, "0")}`,
    );
    notify("资料编号已复制");
  };
  const updateStatus = async (value: string) => {
    if (Number(value) > 3) {
      notify("该状态暂未接入后端状态字段");
      return;
    }
    setStatus(value);
    try {
      await adminApi(`admin/matchmaker/members/${member.id}/status`, {
        method: "PATCH",
        body: { status: Number(value), reason: "会员详情页修改" },
      });
      notify("状态已更新");
    } catch {
      notify("状态更新失败");
    }
  };
  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await adminApi(`admin/matchmaker/members/${member.id}`, {
        method: "PATCH",
        body: {
          ...profile,
          tags: selectedTags,
          gender: Number(profile.gender),
          is_married: profile.is_married ? Number(profile.is_married) : null,
          height: profile.height ? Number(profile.height) : null,
          income: profile.income ? Number(profile.income) : null,
        },
      });
      notify("资料已保存");
    } catch {
      notify("资料保存失败");
    } finally {
      setSavingProfile(false);
    }
  };
  const saveTextProfile = async (key: "self_intro" | "ideal_partner") => {
    setSavingProfile(true);
    try {
      await adminApi(`admin/matchmaker/members/${member.id}`, {
        method: "PATCH",
        body: { [key]: profile[key] || null },
      });
      notify("资料已保存");
    } catch {
      notify("资料保存失败");
    } finally {
      setSavingProfile(false);
    }
  };
  const renderRecords = () => {
    if (!records.length)
      return (
        <div className="py-24 text-center text-sm text-[#999]">
          暂无{selected.label}记录
        </div>
      );
    if (selected.key === "media")
      return (
        <div className="grid grid-cols-4 gap-4">
          {records.map((item, index) => (
            <div
              key={String(item.id ?? index)}
              className="overflow-hidden rounded border bg-white"
            >
              <div className="aspect-square bg-[#f4f5f7]">
                {typeof item.file_url === "string" ? (
                  <img
                    src={resolveMediaUrl(item.file_url as string)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="p-2 text-xs text-[#666]">
                {String(item.media_type ?? "媒体")} ·{" "}
                {item.review_status === 1 ? "已通过" : "待审核"}
              </div>
            </div>
          ))}
        </div>
      );
    const columns = Object.keys(records[0])
      .filter((key) => key !== "id")
      .slice(0, 6);
    const recordIds = records.map((item, index) => Number(item.id ?? index));
    const allSelected = recordIds.length > 0 && recordIds.every((id) => selectedRecordIds.includes(id));
    return (
      <div className="overflow-x-auto rounded border">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f7f8fa] text-[#777]">
            <tr>
              <th className="w-12 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={(event) => setSelectedRecordIds(event.target.checked ? recordIds : [])} aria-label="选择全部记录" />
              </th>
              {columns.map((key) => (
                <th
                  key={key}
                  className="whitespace-nowrap px-4 py-3 font-medium"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((item, index) => (
              <tr key={String(item.id ?? index)} className="border-t">
                <td className="px-4 py-3"><input type="checkbox" checked={selectedRecordIds.includes(Number(item.id ?? index))} onChange={(event) => { const id = Number(item.id ?? index); setSelectedRecordIds((current) => event.target.checked ? [...current, id] : current.filter((value) => value !== id)); }} aria-label="选择记录" /></td>
                {columns.map((key) => (
                  <td key={key} className="max-w-[260px] px-4 py-3 text-[#444]">
                    {String(item[key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/45">
      <div className="ml-[18%] flex h-full min-w-[760px] flex-col bg-white shadow-2xl">
        <header className="flex h-[88px] shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center gap-5">
            <button title="关闭" onClick={onClose}>
              <X className="size-6 text-[#777]" />
            </button>
            <h2 className="text-xl font-medium">会员管理</h2>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled
              title="后端尚未提供 AI 红娘接口"
              className="inline-flex cursor-not-allowed items-center gap-1 rounded bg-[#eaf0ff] px-4 py-2 text-[#3658f7] opacity-60"
            >
              <Sparkles className="size-4" />
              AI智能红娘
            </button>
            <button
              onClick={() => void copyProfile()}
              className="inline-flex items-center gap-1 rounded border border-[#3658f7] px-4 py-2 text-[#3658f7]"
            >
              <Clipboard className="size-4" />
              复制资料
            </button>
            <button
              type="button"
              disabled
              title="后端尚未提供海报生成接口"
              className="inline-flex cursor-not-allowed items-center gap-1 rounded border border-[#3658f7] px-4 py-2 text-[#3658f7] opacity-60"
            >
              <ImageIcon className="size-4" />
              资料海报
            </button>
            <button
              type="button"
              disabled
              title="后端尚未提供嘉宾卡接口"
              className="cursor-not-allowed rounded border border-[#3658f7] px-4 py-2 text-[#3658f7] opacity-60"
            >
              制作嘉宾卡
            </button>
          </div>
        </header>
        <section className="mx-0 shrink-0 bg-[#f5f8ff] px-6 py-6">
          <div className="flex items-start gap-5">
            <div className="relative h-[208px] w-[208px] shrink-0 overflow-hidden rounded-lg bg-white">
              {member.avatar ? (
                <img
                  src={resolveMediaUrl(member.avatar)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="m-[76px] size-14 text-[#8c96a8]" />
              )}
              <button type="button" className="absolute bottom-0 left-0 right-0 bg-black/55 py-2 text-center text-sm text-white">修改头像</button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-5 text-[26px] font-semibold text-[#30343b]">
                <span>{member.nickname || "未命名会员"}</span><span className="text-[#c5cce0]">/</span>
                <span className="text-[24px]">G{String(member.id).padStart(6, "0")}</span><span className="text-[#c5cce0]">/</span>
                <span className="text-[24px]">{member.matchmaker_id ? `红娘 #${member.matchmaker_id}` : "-"}</span><span className="text-[#c5cce0]">/</span>
                <span className="text-[24px]">♡ 公开相亲</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-7">
                <div className="flex h-[68px] items-center gap-4 rounded-xl bg-white px-6 shadow-sm">
                  <Phone className="size-7 text-[#f47b36]" /><strong className="text-[23px]">{showContact ? member.phone || "未填写手机号" : "手机号已隐藏"}</strong>
                  <button type="button" onClick={() => setShowContact((value) => !value)} className="inline-flex items-center gap-1 text-sm text-[#5875eb]"><Eye className="size-4" />{showContact ? "隐藏手机" : "查看手机"}</button>
                  <button type="button" disabled className="ml-auto rounded bg-[#eef1ff] px-3 py-2 text-sm text-[#5875eb] opacity-70">发短信</button>
                  <button type="button" disabled className="rounded bg-[#eef1ff] px-3 py-2 text-sm text-[#5875eb] opacity-70">一键呼叫</button>
                </div>
                <div className="flex h-[68px] items-center gap-4 rounded-xl bg-white px-6 shadow-sm">
                  <MessageCircle className="size-7 text-[#22bf61]" /><strong className="text-[23px]">{showContact ? member.wechat || "未配置微信" : "微信已隐藏"}</strong>
                  <button type="button" onClick={() => setShowContact((value) => !value)} className="inline-flex items-center gap-1 text-sm text-[#5875eb]"><Eye className="size-4" />{showContact ? "隐藏微信" : "查看微信"}</button>
                  <button type="button" disabled className="ml-auto rounded border px-3 py-2 text-sm text-[#a0a5b1]">未设置</button>
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 text-sm text-[#9299a8]">
                <span>ID：{member.id}</span><span>加入：{member.created_at || "-"}</span><span>登记：自己注册</span><span>IP属地：{member.ip_location || "-"}</span><span>最近登录：{member.last_login_at || "-"}</span><span>跟进：{member.matchmaker_id ? `红娘 #${member.matchmaker_id}` : "未分派"}</span><span>推广：-</span><span>上次跟进：-</span>
              </div>
            </div>
          </div>
        </section>
        <nav className="flex shrink-0 gap-0 overflow-x-auto border-b px-0">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`h-14 shrink-0 border-b-2 px-7 text-[16px] ${tab === item.key ? "border-[#3658f7] font-medium text-[#3658f7]" : "border-transparent text-[#444]"}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <main className="flex-1 overflow-y-auto px-16 py-7">
          {selected.key === "basic" ? (
            <>
              <div className="mb-7 flex items-center gap-5 text-sm">
                <span className="text-[#999]">状态</span>
                {[['公开相亲', '1'], ['委托红娘', '2'], ['完全私密', '3'], ['停止相亲', '4'], ['已经脱单', '5']].map(([x, value]) => (
                  <label key={x} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="member-status"
                      checked={status === value}
                      disabled={Number(value) > 3}
                      onChange={() => void updateStatus(value)}
                    />
                    {x}
                  </label>
                ))}
              </div>
              <div className="mb-8 rounded border border-[#c6d2ff] bg-[#f2f5ff] px-5 py-4 text-sm text-[#667085]">
                ⓘ
                在平台中公开显示头像，相亲会员可查看您的详细资料（不含任何联系方式）
              </div>
              <div className="mb-6 flex flex-wrap gap-5 text-sm">
                <span className="w-16 text-[#999]">标签</span>
                {[
                  "高颜值",
                  "高收入",
                  "985毕业",
                  "211毕业",
                  "事业单位",
                  "双一流",
                  "海归",
                  "身材好",
                  "博士",
                  "央国企",
                  "银行金融",
                  "公务员",
                ].map((x) => (
                  <label key={x} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(x)}
                      onChange={(event) =>
                        setSelectedTags((current) =>
                          event.target.checked
                            ? [...current, x]
                            : current.filter((tag) => tag !== x),
                        )
                      }
                    />
                    {x}
                  </label>
                ))}
                <button className="text-[#3658f7]">标签管理</button>
              </div>
              <div className="grid grid-cols-3 gap-x-12 gap-y-6">
                {[
                  ["编号", "id"],
                  ["姓名", "nickname"],
                  ["性别", "gender"],
                  ["生日", "birthday"],
                  ["属相", "zodiac"],
                  ["身高", "height"],
                  ["体重", "weight"],
                  ["婚况", "is_married"],
                  ["家乡", "hometown"],
                  ["现居", "residence"],
                  ["户籍", "household"],
                  ["学历", "education"],
                  ["职业", "job"],
                  ["收入", "income"],
                  ["民族", "ethnicity"],
                  ["购房", "house"],
                  ["购车", "car"],
                  ["吸烟", "smoking"],
                ].map(([label, key], i) => (
                  <label
                    key={label}
                    className="flex items-center gap-4 text-sm"
                  >
                    <span className="w-16 shrink-0 text-right text-[#888]">
                      {i < 4 ? <b className="mr-1 text-red-500">*</b> : null}
                      {label}
                    </span>
                    {key === "gender" || key === "is_married" ? (
                      <select
                        value={profile[key] ?? ""}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        className="h-11 min-w-0 flex-1 rounded border border-[#d9d9d9] bg-white px-4 text-[#444] outline-none focus:border-[#3658f7]"
                      >
                        <option value="">未填写</option>
                        {key === "gender" ? (
                          <>
                            <option value="1">男</option>
                            <option value="2">女</option>
                          </>
                        ) : (
                          <>
                            <option value="1">未婚</option>
                            <option value="2">离异</option>
                            <option value="3">丧偶</option>
                          </>
                        )}
                      </select>
                    ) : (
                      <input
                        type={
                          key === "birthday"
                            ? "date"
                            : key === "height" || key === "income" || key === "weight"
                              ? "number"
                              : "text"
                        }
                        value={
                          key === "id"
                            ? `G${String(member.id).padStart(6, "0")}`
                            : ["zodiac", "weight", "household", "ethnicity", "house", "car", "smoking"].includes(key)
                              ? "暂无数据"
                              : (profile[key] ?? "")
                        }
                        readOnly={key === "id" || ["zodiac", "weight", "household", "ethnicity", "house", "car", "smoking"].includes(key)}
                        onChange={(event) =>
                          setProfile((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        className="h-11 min-w-0 flex-1 rounded border border-[#d9d9d9] px-4 text-[#444] outline-none focus:border-[#3658f7]"
                      />
                    )}
                  </label>
                ))}
              </div>
            </>
          ) : selected.key === "intro" || selected.key === "requirement" ? (
            <section className="max-w-4xl space-y-5">
              <h3 className="text-base font-medium text-[#333]">{selected.label}</h3>
              <textarea
                value={profile[selected.key === "intro" ? "self_intro" : "ideal_partner"] ?? ""}
                onChange={(event) => setProfile((current) => ({ ...current, [selected.key === "intro" ? "self_intro" : "ideal_partner"]: event.target.value }))}
                placeholder="暂无资料"
                className="min-h-[260px] w-full resize-y rounded border border-[#d9d9d9] p-4 text-sm text-[#444] outline-none focus:border-[#3658f7]"
              />
              <button type="button" onClick={() => void saveTextProfile(selected.key === "intro" ? "self_intro" : "ideal_partner")} className="rounded bg-[#3658f7] px-5 py-2 text-sm text-white">{savingProfile ? "保存中..." : "保存资料"}</button>
            </section>
          ) : loading ? (
            <div className="py-24 text-center text-sm text-[#999]">
              正在加载{selected.label}...
            </div>
          ) : (
            <div className="min-h-[240px]">{renderRecords()}</div>
          )}
        </main>
        {notice && (
          <div className="fixed bottom-20 left-1/2 z-[60] -translate-x-1/2 rounded bg-[#1f2937] px-5 py-2 text-sm text-white shadow-lg">
            {notice}
          </div>
        )}
        {selectedRecordIds.length > 0 && (
          <div className="flex shrink-0 items-center gap-3 border-t bg-white px-6 py-3 text-sm text-[#555]">
            <span>已选择 {selectedRecordIds.length} 条</span>
            <button type="button" onClick={() => setSelectedRecordIds([])} className="rounded border px-3 py-1.5 text-[#555]">取消选择</button>
          </div>
        )}
        <footer className="flex justify-end border-t px-6 py-4">
          <button
            onClick={() => {
              if (selected.key === "basic") void saveProfile();
              else onClose();
            }}
            className="rounded bg-[#3658f7] px-6 py-2 text-sm text-white"
          >
            {selected.key === "basic"
              ? savingProfile
                ? "保存中..."
                : "确定提交"
              : "关闭"}
          </button>
        </footer>
      </div>
    </div>
  );
}
