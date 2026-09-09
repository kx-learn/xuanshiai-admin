"use client";
import { Inbox } from "lucide-react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

export default function Page() {
  return (
    <div className="rec-page">
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
          { label: "发送记录" },
        ]}
      />

      <div className="obc-notice">
        <span className="obc-notice-i">!</span>
        <div className="obc-notice-body">
          <p className="obc-notice-t">须知</p>
          <p className="obc-notice-desc">本系统接入腾讯云短信接口，短信请求发出后，经由腾讯短信平台提交至通信运营商（此步骤成功即扣除条数），运营商再下发至客户接收端。</p>
          <p className="obc-notice-desc">1、短信因接收端空号/停机、签名问题、短信违规被拦截导致发送失败，此类情况因腾讯平台已成功提交至运营商，会扣除条数。</p>
          <p className="obc-notice-desc">2、短信因频率超限、缺少参数、无效app凭证、网络故障导致发送失败，此类情况属于腾讯平台提交失败，不会扣除条数。</p>
        </div>
      </div>

      <div className="srec-stats">
        <div className="srec-stat srec-stat-line">
          <span className="srec-stat-label">当前线路：腾讯云专线</span>
        </div>
        <div className="srec-stat">
          <span className="srec-stat-label">短信余量：<span className="srec-num srec-num-blue">9410条</span></span>
          <button type="button" className="srec-recharge">在线充值</button>
        </div>
        <div className="srec-stat">
          <span className="srec-stat-label">发送成功：<span className="srec-num srec-num-green">1585条</span></span>
        </div>
        <div className="srec-stat">
          <span className="srec-stat-label">发送失败：<span className="srec-num srec-num-red">434条</span></span>
        </div>
      </div>

      <div className="admin-card srec-card">
        <div className="srec-head">
          <h2 className="srec-title">发送记录</h2>
          <button type="button" className="srec-query">错误码查询</button>
        </div>

        <div className="srec-empty">
          <Inbox className="srec-empty-icon" />
          <span className="srec-empty-text">仅限超级管理员（admin）查看</span>
        </div>
      </div>
    </div>
  );
}
