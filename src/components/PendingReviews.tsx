import Link from "next/link";
import { Coins, HeartHandshake, ShieldAlert, UserRoundCheck, Users } from "lucide-react";

type PendingItem = { key: string; label: string; action: string; href: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color: string };

const items: PendingItem[] = [
  { key: "matchmaker_application", label: "红娘申请", action: "待审核", href: "/love-matchmaker-list", icon: UserRoundCheck, color: "#5274f5" },
  { key: "matchmaker_service", label: "红娘服务", action: "待开始", href: "/love-interview", icon: Users, color: "#9b6bf4" },
  { key: "match_application", label: "会员牵线", action: "待处理", href: "/love-appointment", icon: HeartHandshake, color: "#ee7375" },
  { key: "withdrawal", label: "提现管理", action: "待处理", href: "/system-cashout-history", icon: Coins, color: "#9a67ef" },
  { key: "report", label: "网友举报", action: "待处理", href: "/content-verify", icon: ShieldAlert, color: "#ee7670" },
];

const quickActions = [
  { label: "添加账号", href: "/reg-user-all" },
  { label: "添加资料", href: "/love-user-list" },
  { label: "添加红娘", href: "/love-matchmaker-list" },
  { label: "发布活动", href: "/active-list" },
  { label: "发布视频", href: "/short-video-list" },
];

function countOf(pending: Record<string, unknown> | undefined, key: string) {
  const value = pending?.[key];
  return typeof value === "number" ? value : Number(value ?? 0) || 0;
}

export default function PendingReviews({ pending }: { pending?: Record<string, unknown> }) {
  return <section className="dashboard-pending">
    <div className="dashboard-section-title"><h2>待审工作</h2><div className="dashboard-quick-actions">{quickActions.map((action) => <Link href={action.href} key={action.label}>{action.label}</Link>)}</div></div>
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
