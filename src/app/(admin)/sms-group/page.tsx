"use client";
import { Inbox } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

const columns = [
  "任务名称",
  "创建时间",
  "发送对象",
  "手机号码清单",
  "任务状态",
  "发送统计",
  "发送明细",
  "操作",
];

export default function Page() {
  return (
    <div className="grp-page">
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
          { label: "短信系统" },
          { label: "短信群发" },
        ]}
      />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">须知</p>
          <p className="obc-notice-desc">本系统整合开发了腾讯短信的群发功能，可以对指定的用户群发各种合规短信内容，提升平台与用户的连接</p>
        </div>
      </div>

      <div className="admin-card grp-card">
        <div className="grp-head">
          <h2 className="grp-title">短信群发</h2>
          <div className="grp-actions">
            <button type="button" className="grp-btn">
              <span className="grp-btn-plus">+</span> 创建群发任务
            </button>
            <button type="button" className="grp-btn">
              <svg className="grp-btn-ico" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 2.5A4.5 4.5 0 0 1 12.5 8H8V4.5A4.5 4.5 0 0 1 8 3.5z" />
              </svg>
              短信充值
            </button>
            <button type="button" className="grp-btn">
              <svg className="grp-btn-ico" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2.5 2.5h8l3 3v8h-11v-11zM9 4v3h3M4 9h8M4 11h8M4 7h2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
              </svg>
              提交群发模板
            </button>
          </div>
        </div>

        <div className="grp-table-wrap">
          <table className="grp-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={8}>
                  <div className="grp-empty">
                    <Inbox className="grp-empty-icon" />
                    <span className="grp-empty-text">暂无数据</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
