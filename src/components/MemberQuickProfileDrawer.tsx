"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Eye,
  Heart,
  LoaderCircle,
  MessageCircle,
  Phone,
  Send,
  UserRound,
  X,
} from "lucide-react";
import { adminApi, resolveMediaUrl } from "@/lib/admin-api";

type Tab = "profile" | "follow";
type MemberDetail = Record<string, unknown>;
type FollowUp = Record<string, unknown>;
type FollowUpPage = { items?: FollowUp[]; data?: FollowUp[] } | FollowUp[];

type Props = {
  memberId: number;
  nickname?: string | null;
  memberCode?: string | null;
  initialTab?: Tab;
  onClose: () => void;
};

const text = (value: unknown, fallback = "-") =>
  value === undefined || value === null || value === "" ? fallback : String(value);
const dateTime = (value: unknown) => {
  if (!value) return "-";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString("zh-CN", { hour12: false });
};
const gender = (value: unknown) => Number(value) === 2 ? "女" : Number(value) === 1 ? "男" : "-";
const marital = (value: unknown) => ({ 1: "未婚", 2: "离异", 3: "丧偶" })[Number(value)] || "-";
const income = (value: unknown) => value ? `${text(value)} 元` : "-";
const memberNumber = (id: number, code?: string | null) => code || `G${String(id).padStart(6, "0")}`;

function Field({ label, value }: { label: string; value: unknown }) {
  return <div className="flex min-w-0 gap-3 text-sm leading-6"><span className="shrink-0 text-[#aaa]">{label}：</span><span className="min-w-0 truncate text-[#555]">{text(value)}</span></div>;
}

export default function MemberQuickProfileDrawer({ memberId, nickname, memberCode, initialTab = "profile", onClose }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [followLoading, setFollowLoading] = useState(false);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => { setTab(initialTab); }, [initialTab, memberId]);
  useEffect(() => {
    let active = true;
    setLoading(true);
    adminApi<MemberDetail>(`admin/matchmaker/members/${memberId}`)
      .then((result) => { if (active) setMember(result); })
      .catch(() => { if (active) setMember(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [memberId]);
  const loadFollowUps = async () => {
    setFollowLoading(true);
    try {
      const result = await adminApi<FollowUpPage>(`admin/members/${memberId}/follow-ups`, { query: { page: 1, page_size: 20 } });
      setFollowUps(Array.isArray(result) ? result : result.items ?? result.data ?? []);
    } catch { setFollowUps([]); } finally { setFollowLoading(false); }
  };
  useEffect(() => { if (tab === "follow") void loadFollowUps(); }, [tab, memberId]);

  const detail = member ?? {};
  const name = text(detail.nickname ?? nickname, "未命名会员");
  const code = memberNumber(memberId, text(detail.member_code ?? detail.member_no ?? memberCode, "") || undefined);
  const phone = text(detail.phone ?? detail.mobile ?? detail.phone_number, "未填写");
  const wechat = text(detail.wechat ?? detail.wechat_id ?? detail.wx, "未填写");
  const avatar = typeof (detail.avatar ?? detail.avatar_url) === "string" ? resolveMediaUrl((detail.avatar ?? detail.avatar_url) as string) : undefined;
  const tags = Array.isArray(detail.tags) ? detail.tags : [];
  const submitFollowUp = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setNotice("");
    try {
      await adminApi(`admin/members/${memberId}/follow-ups`, { method: "POST", body: { method: "PHONE", content: content.trim(), next_follow_at: null } });
      setContent("");
      setNotice("跟进已提交");
      await loadFollowUps();
    } catch { setNotice("提交失败，请稍后重试"); } finally { setSaving(false); }
  };

  return <div className="fixed inset-0 z-50 bg-black/45" role="dialog" aria-modal="true" aria-label="会员快捷资料">
    <section className="ml-[max(224px,18%)] flex h-full min-w-[760px] flex-col bg-white shadow-2xl max-lg:ml-0 max-lg:min-w-0">
      <header className="flex h-[76px] shrink-0 items-center border-b border-[#f0f0f0] px-7">
        <button type="button" aria-label="关闭会员快捷资料" onClick={onClose} className="mr-5 grid size-8 place-items-center text-[#999] hover:text-[#333]"><X size={22} /></button>
        <h2 className="text-lg font-semibold text-[#333]">会员快捷资料</h2>
        <button type="button" className="ml-auto inline-flex h-9 items-center gap-1.5 rounded bg-[#3658f7] px-4 text-sm text-white"><Eye size={16} />预览主页</button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-7 py-7">
        <div className="flex min-w-0 gap-4 bg-[#f6f8fd] p-3 max-xl:flex-wrap">
          <div className="relative size-[154px] shrink-0 overflow-hidden rounded-lg bg-[#e7eaf1]">
            {avatar ? <img src={avatar} alt="" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-[#abb2c0]"><UserRound size={48} /></div>}
            {Number(detail.is_vip) === 1 && <span className="absolute bottom-0 left-0 bg-[#8055ee] px-2 py-0.5 text-xs text-white">VIP</span>}
          </div>
          <div className="min-w-[460px] flex-1 max-sm:min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xl font-semibold text-[#303644]">
              <span className="inline-flex items-center gap-1"><UserRound size={21} />{gender(detail.gender)}</span><i className="text-[#cbd2ec]">/</i><span>{code}</span><i className="text-[#cbd2ec]">/</i><span>{name}</span><i className="text-[#cbd2ec]">/</i><span className="inline-flex items-center gap-1"><Heart size={21} />公开相亲</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3"><Phone size={23} className="text-[#fb8a49]" /><strong className="text-xl text-[#333]">{phone}</strong><button type="button" className="ml-auto text-sm text-[#6381ff]">查看手机</button></div>
              <div className="flex min-w-[280px] flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3"><MessageCircle size={23} className="text-[#13bc62]" /><strong className="text-xl text-[#333]">{wechat}</strong><button type="button" className="ml-auto text-sm text-[#6381ff]">查看微信</button></div>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-7 gap-y-1 text-xs text-[#999]"><span>ID：{memberId}</span><span>加入时间：{dateTime(detail.created_at)}</span><span>最近登录：{dateTime(detail.last_login_at)}</span><span>红娘：{text(detail.matchmaker_name ?? detail.matchmaker_nickname)}</span><span>上次跟进：{dateTime(detail.last_follow_at)}</span></div>
          </div>
        </div>
        <nav className="mt-5 flex h-11 gap-8 border-b border-[#eee]" aria-label="资料页签">
          <button type="button" onClick={() => setTab("profile")} className={`border-b-2 px-1 text-base ${tab === "profile" ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#555]"}`}>会员资料</button>
          <button type="button" onClick={() => setTab("follow")} className={`border-b-2 px-1 text-base ${tab === "follow" ? "border-[#3658f7] text-[#3658f7]" : "border-transparent text-[#555]"}`}>跟进记录</button>
        </nav>
        {loading ? <div className="grid min-h-80 place-items-center text-sm text-[#999]"><LoaderCircle className="mr-2 animate-spin" size={18} />加载中...</div> : tab === "profile" ? <div className="pb-10">
          <ProfileSection title="基本信息"><div className="grid grid-cols-4 gap-x-10 gap-y-3 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1"><Field label="状态" value={text(detail.status) === "1" ? "正常" : text(detail.status)} /><Field label="编号" value={code} /><Field label="姓名" value={name} /><Field label="性别" value={gender(detail.gender)} /><Field label="生日" value={detail.birthday} /><Field label="标签" value={tags.length ? tags.join("、") : "-"} /><Field label="家乡" value={detail.hometown} /><Field label="现居" value={detail.residence} /><Field label="体重" value={detail.weight ? `${text(detail.weight)}kg` : "-"} /><Field label="身高" value={detail.height ? `${text(detail.height)}cm` : "-"} /><Field label="学历" value={detail.education} /><Field label="婚况" value={marital(detail.is_married)} /><Field label="职业" value={detail.job} /><Field label="收入" value={income(detail.income)} /><Field label="民族" value={detail.ethnicity} /><Field label="购房" value={detail.house} /><Field label="购车" value={detail.car} /><Field label="吸烟" value={detail.smoking} /><Field label="喝酒" value={detail.drinking} /><Field label="宗教信仰" value={detail.religion} /><Field label="结婚意向" value={detail.marriage_intention} /></div></ProfileSection>
          <ProfileSection title="自我介绍"><div className="grid grid-cols-3 gap-x-10 gap-y-3 max-lg:grid-cols-1"><Field label="性格" value={detail.character} /><Field label="爱好" value={detail.hobby} /><Field label="自我介绍" value={detail.self_intro} /></div></ProfileSection>
          <ProfileSection title="择偶要求"><div className="grid grid-cols-4 gap-x-10 gap-y-3 max-2xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1"><Field label="年龄" value={detail.ideal_age ?? detail.partner_age} /><Field label="身高" value={detail.ideal_height ?? detail.partner_height} /><Field label="收入" value={detail.ideal_income ?? detail.partner_income} /><Field label="学历" value={detail.ideal_education ?? detail.partner_education} /><Field label="职业" value={detail.ideal_job ?? detail.partner_job} /><Field label="婚况" value={detail.ideal_marital ?? detail.partner_marital} /><Field label="住房" value={detail.ideal_house ?? detail.partner_house} /><Field label="吸烟" value={detail.ideal_smoking ?? detail.partner_smoking} /><Field label="喝酒" value={detail.ideal_drinking ?? detail.partner_drinking} /><Field label="结婚意向" value={detail.ideal_partner ?? detail.partner_requirement} /></div></ProfileSection>
        </div> : <div className="py-7">
          <div className="flex gap-4 max-lg:flex-col"><label className="w-20 shrink-0 pt-3 text-sm text-[#777]">服务跟进</label><div className="flex-1"><textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={1000} placeholder="本跟进内容仅红娘可见，不对外公开，1000字以内" className="h-48 w-full resize-none rounded border border-[#e5e7eb] p-4 text-sm outline-none focus:border-[#3658f7]" /><button type="button" disabled={!content.trim() || saving} onClick={() => void submitFollowUp()} className="mt-4 inline-flex h-10 items-center gap-1.5 rounded bg-[#3658f7] px-5 text-sm text-white disabled:cursor-not-allowed disabled:bg-[#aab7f5]"><Send size={15} />{saving ? "提交中" : "确定提交"}</button>{notice && <span className="ml-3 text-sm text-[#6381ff]">{notice}</span>}</div></div>
          <div className="ml-[96px] mt-7 max-lg:ml-0">{followLoading ? <div className="py-8 text-center text-sm text-[#999]">加载中...</div> : followUps.length === 0 ? <div className="py-8 text-center text-sm text-[#999]">暂无跟进记录</div> : <ol className="border-l-2 border-[#dce4ff] pl-6">{followUps.map((item, index) => <li key={String(item.id ?? item.follow_up_id ?? index)} className="relative pb-7"><i className="absolute -left-[31px] top-1 size-3 rounded-full border-[3px] border-white bg-[#3658f7]" /><div className="flex flex-wrap gap-x-3 text-sm text-[#999]"><span>{dateTime(item.created_at ?? item.follow_at ?? item.follow_time)}</span><span>{text(item.matchmaker_name ?? item.creator_name ?? item.follow_by_name, "后台管理员")}</span></div><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#4b5563]">{text(item.content ?? item.follow_content ?? item.remark ?? item.note)}</p></li>)}</ol>}</div>
        </div>}
      </div>
    </section>
  </div>;
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-b border-[#eee] py-7"><h3 className="mb-5 border-l-[3px] border-[#6381ff] pl-2 text-lg font-semibold text-[#444]">{title}</h3>{children}</section>;
}
