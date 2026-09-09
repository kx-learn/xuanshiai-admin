"use client";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { User, Armchair, Clock, Phone, Inbox } from "lucide-react";

const columns = [
  "坐席工号",
  "坐席状态",
  "外呼号码",
  "绑定服务红娘",
  "呼出次数",
  "接通次数",
  "呼出通话总时长",
  "平均时长",
  "本月呼出通话总时长",
  "当天呼出次数",
  "当天呼出时长",
  "操作",
];

const cards = [
  { key: "a", label: "外呼服务商", value: "捷讯通讯", color: "#3658f7", icon: User },
  { key: "b", label: "外呼账号", value: "未开通服务", color: "#b0b7c2", icon: null },
  { key: "c", label: "坐席数量", value: "0", color: "#fa8c16", icon: Armchair },
  { key: "d", label: "所有坐席通话总时长", value: "0秒", color: "#722ed1", icon: Clock },
  { key: "e", label: "本月通话总时长", value: "0秒", color: "#f5222d", icon: Phone },
];

export default function Page() {
  return (
    <div className="oc-page">
      <AdminBreadcrumb
        items={[
          { label: "首页", href: "/" },
          {
            label: "系统管理",
            href: "/system-setting-basic",
            children: [
              { label: "系统配置", href: "/system-setting-basic" },
              { label: "广告管理", href: "/system-setting-adconfig" },
              { label: "外呼平台", href: "/outbound-call-platform" },
              { label: "外呼状态", href: "/out-call-list" },
              { label: "呼叫记录", href: "/out-call-record" },
              { label: "签名配置", href: "/sms-signature" },
              { label: "通知配置", href: "/sms-notices" },
              { label: "短信群发", href: "/sms-group" },
              { label: "发送记录", href: "/sms-record" },
              { label: "添加账号", href: "/system-setting-admin-user-add" },
              { label: "账号管理", href: "/system-setting-admin-user" },
              { label: "权限分组", href: "/system-setting-admin-group" },
              { label: "系统日志", href: "/system-setting-admin-log" },
            ],
          },
          { label: "电话外呼" },
          { label: "外呼状态" },
        ]}
      />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">须知</p>
          <p className="obc-notice-desc">
            智能云呼（简称外呼系统）适用于需要频繁使用电话方式进行客户沟通、邀约到店的业务。能够更加规范化的管理公司的内部运营管理和业务能力提升。并有助于提高客户服务质量和业务成单率；
            <br />
            本系统将第三方的外呼服务深入开发整合融入到了自身的会员CRM中，不必在通过第三方平台维护客户数据和进行呼叫。仅需在本系统中即可一站式完成所有电销流程，大大提升您的工作效能；
            <br />
            开通使用外呼系统需联系本系统所对接的第三方通信线路服务商办理开户手续并充值话费，并由通信服务商为您提供相关所有服务和使用指导.更加详细数据报表可登录外呼服务商平台查看。
          </p>
        </div>
      </div>

      <div className="oc-stats">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="oc-stat">
              <div className="oc-stat-top">
                {Icon && (
                  <span className="oc-stat-icon" style={{ background: card.color }}>
                    <Icon className="oc-stat-svg" />
                  </span>
                )}
                <span className="oc-stat-label">{card.label}</span>
              </div>
              <div className="oc-stat-value">{card.value}</div>
            </div>
          );
        })}
      </div>

      <div className="admin-card oc-card">
        <div className="oc-head">
          <h2 className="oc-title">外呼状态</h2>
          <button className="oc-add">
            <span className="oc-add-plus">+</span> 添加坐席
          </button>
        </div>
        <div className="oc-body">
          <div className="oc-table-scroll">
            <table className="oc-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={columns.length} className="oc-empty">
                    <Inbox className="oc-empty-icon" />
                    <span>暂无数据</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
