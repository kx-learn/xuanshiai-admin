import Link from "next/link";
import { BadgeCheck, CalendarCheck, Coins, Database, FilePlus2, GraduationCap, Heart, HeartHandshake, House, Pencil, Send, ShieldAlert, UserRound, UserRoundCheck, Users, Video } from "lucide-react";

type PendingItem = { key: string; label: string; action: string; href: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string };

const items: PendingItem[] = [
  { key: "member_review", label: "相亲会员", action: "资料待审", href: "/love-user-auth", icon: UserRound, color: "#5274f5" },
  { key: "match_application", label: "会员牵线", action: "待牵线", href: "/love-matchmaker-list", icon: HeartHandshake, color: "#ee7375" },
  { key: "match_request", label: "约见申请", action: "待处理", href: "/love-appointment", icon: CalendarCheck, color: "#9b6bf4" },
  { key: "activity_signup", label: "活动报名", action: "待处理", href: "/active-signupmanager", icon: BadgeCheck, color: "#3fbd8b" },
  { key: "promotion_application", label: "推广申请", action: "待处理", href: "/poplove-matchmaker-list", icon: Send, color: "#f39a38" },
  { key: "withdrawal", label: "提现管理", action: "待处理", href: "/system-cashout-history", icon: Coins, color: "#9a67ef" },
  { key: "report", label: "网友举报", action: "待处理", href: "/content-verify", icon: ShieldAlert, color: "#ee7670" },
  { key: "short_video", label: "短视频", action: "待审", href: "/short-video-list", icon: Video, color: "#f39a38" },
  { key: "points_exchange", label: "积分兑换", action: "待处理", href: "/gift-exchange", icon: Database, color: "#35ad83" },
  { key: "member_commitment", label: "会员承诺", action: "待审", href: "/love-user-auth", icon: Heart, color: "#8e6be7" },
  { key: "house_certification", label: "房产认证", action: "待审", href: "/love-user-auth", icon: House, color: "#f39a38" },
  { key: "education_certification", label: "学历认证", action: "待审", href: "/love-user-auth", icon: GraduationCap, color: "#35ad83" },
  { key: "other_certification", label: "其他认证", action: "待审", href: "/love-user-auth", icon: UserRoundCheck, color: "#5274f5" },
];

const quickActions = [
  { label: "添加账号", href: "/reg-user-all", icon: UserRound },
  { label: "添加资料", href: "/love-user-list", icon: FilePlus2 },
  { label: "添加红娘", href: "/love-matchmaker-list", icon: UserRoundCheck },
  { label: "发布活动", href: "/active-list", icon: Pencil },
  { label: "发布视频", href: "/short-video-list", icon: Video },
];

function countOf(pending: Record<string, unknown> | undefined, key: string) {
  const value = pending?.[key];
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

export default function PendingReviews({ pending }: { pending?: Record<string, unknown> }) {
  return <section className="dashboard-pending">
    <div className="dashboard-section-title"><h2>待审工作</h2><div className="dashboard-quick-actions">{quickActions.map((action) => { const Icon = action.icon; return <Link href={action.href} key={action.label}><Icon className="h-3.5 w-3.5" />{action.label}</Link>; })}</div></div>
    <div className="dashboard-pending-grid">{items.map((item) => {
      const Icon = item.icon;
      const count = countOf(pending, item.key);
      return <Link className="dashboard-pending-item" href={item.href} key={item.key}>
        <span className="dashboard-pending-name"><Icon className="h-4 w-4" style={{ color: item.color }} />{item.label}</span>
        <strong className={count > 0 ? "has-pending" : ""}>{count}</strong>
        <small>{item.action}</small>
      </Link>;
    })}</div>
  </section>;
}
