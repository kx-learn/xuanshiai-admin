"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

interface Plugin {
  id: number;
  name: string;
  iconText: [string, string];
  gradient: string;
  category: string;
  purchased: boolean;
  description: string;
  detail: string;
}

const plugins: Plugin[] = [
  {
    id: 1,
    name: "互选活动",
    iconText: ["互选", "活动"],
    gradient: "linear-gradient(135deg, #6a34f0 0%, #8b5af7 100%)",
    category: "独立模块",
    purchased: true,
    description:
      "互选CP活动是目前非常流行且受欢迎的一种线上交友形式。参与者可以在互选大厅中，自主浏览并选择自己心仪的对象，当两个人都选择了对方时，视为互选成功，即可互加微信（或红娘介入推荐名片）。互选互动可以有效地帮婚恋公司获取单身客源、激活僵尸客户，还能大大促进客户与红娘之间的粘性和沟通，提高销售转换。同时，互选的结果也给红娘提供了非常精准的数据依据，判断客户的意向和择偶需求，帮助红娘提高匹配精准度。活动流程：1.创建活动 2.活动宣传邀约报名（这是最重要的获客引流环节） 3.互选活动开始 4.活动结束（红娘根据选择结果进行逐一服务跟进） 5.活动回顾。",
    detail:
      "互选CP活动是目前非常流行且受欢迎的一种线上交友形式。参与者可以在互选大厅中，自主浏览并选择自己心仪的对象。当两个人都选择了对方时，视为互选成功，即可互加微信（或红娘介入推荐名片）。互选互动可以有效地帮婚恋公司获取单身客源、激活僵尸客户，还能大大促进客户与红娘之间的粘性和沟通，提高销售转换。同时，互选的结果也给红娘提供了非常精准的数据依据，判断客户的意向和择偶需求，帮助红娘提高匹配精准度。活动流程：1.创建活动 2.活动宣传邀约报名（这是最重要的获客引流环节） 3.互选活动开始 4.活动结束（红娘根据选择结果进行逐一服务跟进） 5.活动回顾。",
  },
  {
    id: 2,
    name: "商家联盟",
    iconText: ["优选", "商家"],
    gradient: "linear-gradient(135deg, #7b3ff2 0%, #9b6cf5 100%)",
    category: "独立模块",
    purchased: true,
    description:
      "商家联盟系统是一套多商家线上商城系统，拥有商品发布、商家展示、下单支付、订单管理、消费券核销、分成结算、提现等整套完善的功能，并在本系统中将与“推广红娘”的角色和功能进行了深入结合。本套系统能够帮助您总平台大大提升商家业合作的意愿、借助商家为平台获取单身客源，规范化商家合作流程，信息公示透明，完美解决不诚信商家送单、遇单行为，为您的业务合作拓展带来更多的发挥空间和实施更具竞争力的运营方案。",
    detail:
      "商家联盟系统是一套多商家线上商城系统，拥有商品发布、商家展示、下单支付、订单管理、消费券核销、分成结算、提现等整套完善的功能，并在本系统中将与“推广红娘”的角色和功能进行了深入结合。本套系统能够帮助您总平台大大提升商家业合作的意愿、借助商家为平台获取单身客源，规范化商家合作流程，信息公示透明，完美解决不诚信商家送单、遇单行为，为您的业务合作拓展带来更多的发挥空间和实施更具竞争力的运营方案。",
  },
  {
    id: 3,
    name: "互动消息",
    iconText: ["会员", "消息"],
    gradient: "linear-gradient(135deg, #8253f4 0%, #a678f6 100%)",
    category: "运营工具",
    purchased: true,
    description:
      "会员消息功能是为了促进会员在网上的互动性、刺激牵线需求为目的。会员之间虽然可以在线上平台互相发送消息，但消息内容仅能从平台设置好的模板中选择；通过平台设置的“消息话术”可以大大提升会员之间的互动、提高牵线需求率、促进会员开通VIP会员！",
    detail:
      "会员消息功能是为了促进会员在网上的互动性、刺激牵线需求为目的。会员之间虽然可以在线上平台互相发送消息，但消息内容仅能从平台设置好的模板中选择；通过平台设置的“消息话术”可以大大提升会员之间的互动、提高牵线需求率、促进会员开通VIP会员！",
  },
  {
    id: 4,
    name: "多门店系统",
    iconText: ["多门店", "系统"],
    gradient: "linear-gradient(135deg, #6a34f0 0%, #8b5af7 100%)",
    category: "独立模块",
    purchased: false,
    description:
      "多门店（分店）系统是为拥有多家线下门店的婚恋公司、有招商加盟业务的品牌加盟公司提供了一整套的平台解决方案，可以实现一套系统中由总平台统一掌管，对外共享一个线上平台统一进行会员展示、拓客派客和牵线；又能让每个门店（或加盟商）拥有独立的会员管理平台，再结合异地道自动跳分转店，完美解决...",
    detail:
      "多门店（分店）系统是为拥有多家线下门店的婚恋公司、有招商加盟业务的品牌加盟公司提供了一整套的平台解决方案，可以实现一套系统中由总平台统一掌管，对外共享一个线上平台统一进行会员展示、拓客派客和牵线；又能让每个门店（或加盟商）拥有独立的会员管理平台，再结合异地道自动跳分转店，完美实现线上统一运营、线下分散管理的连锁经营模式。",
  },
  {
    id: 5,
    name: "销售匹配库",
    iconText: ["销售", "匹配"],
    gradient: "linear-gradient(135deg, #7b3ff2 0%, #9b6cf5 100%)",
    category: "运营工具",
    purchased: true,
    description:
      "销售匹配库（眼缘库）是帮助红娘在销售环节快速匹配单身客源、提高成交效率的运营工具。系统根据会员的择偶偏好、年龄、地域、条件等维度进行智能初筛匹配，红娘可一键查看符合要求的推荐名单，便于在销售谈判中快速满足客户需求，提升谈单成功率和客户满意度。",
    detail:
      "销售匹配库（眼缘库）是帮助红娘在销售环节快速匹配单身客源、提高成交效率的运营工具。系统根据会员的择偶偏好、年龄、地域、条件等维度进行智能初筛匹配，红娘可一键查看符合要求的推荐名单，便于在销售谈判中快速满足客户需求，提升谈单成功率和客户满意度。",
  },
  {
    id: 6,
    name: "朋友圈",
    iconText: ["朋友", "圈"],
    gradient: "linear-gradient(135deg, #8253f4 0%, #a678f6 100%)",
    category: "独立模块",
    purchased: false,
    description:
      "朋友圈功能为婚恋平台打造一个会员专属的社交分享空间。会员可以在平台上发布动态、分享生活、展示自我，其他会员可进行点赞、评论互动，增强平台内的活跃氛围和会员粘性，同时也能为平台带来更多的活跃单身流量。",
    detail:
      "朋友圈功能为婚恋平台打造一个会员专属的社交分享空间。会员可以在平台上发布动态、分享生活、展示自我，其他会员可进行点赞、评论互动，增强平台内的活跃氛围和会员粘性，同时也能为平台带来更多的活跃单身流量，助力平台持续获客与留存。",
  },
];

function PluginIcon({ plugin, large = false }: { plugin: Plugin; large?: boolean }) {
  return (
    <div
      className={large ? "app-icon app-icon-lg" : "app-icon"}
      style={{ background: plugin.gradient }}
    >
      <span className="app-icon-line">{plugin.iconText[0]}</span>
      <span className="app-icon-line">{plugin.iconText[1]}</span>
    </div>
  );
}

function DetailModal({ plugin, onClose }: { plugin: Plugin; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="app-modal-mask" onClick={onClose}>
      <div className="app-modal" onClick={(e) => e.stopPropagation()}>
        <div className="app-modal-header">
          <button type="button" className="app-modal-close" aria-label="关闭" onClick={onClose}>
            <X size={18} />
          </button>
          <span className="app-modal-title">查看详情</span>
        </div>
        <div className="app-modal-body">
          <PluginIcon plugin={plugin} large />
          <div className="app-modal-info">
            <div className="app-modal-name">{plugin.name}</div>
            <div className="app-modal-cat">分类：{plugin.category}</div>
            <div className="app-modal-section">应用介绍</div>
            <p className="app-modal-text">{plugin.description}</p>
            <div className="app-modal-section">详细介绍</div>
            <p className="app-modal-text">{plugin.detail}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PluginCenterPage() {
  const [selected, setSelected] = useState<Plugin | null>(null);

  return (
    <div>
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          { label: "应用中心" },
        ]}
      />

      <div className="admin-card">
        <div className="admin-card-header">应用中心</div>
        <div className="app-list">
          {plugins.map((plugin) => (
            <div key={plugin.id} className="app-item">
              <PluginIcon plugin={plugin} />
              <div className="app-main">
                <div className="app-title-row">
                  <span className="app-name">{plugin.name}</span>
                  <span className="app-cat-tag">{plugin.category}</span>
                  {plugin.purchased && <span className="app-purchased-tag">已购买</span>}
                </div>
                <div className="app-desc">{plugin.description}</div>
                <button type="button" className="app-detail-btn" onClick={() => setSelected(plugin)}>
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && <DetailModal plugin={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
