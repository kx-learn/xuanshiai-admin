"use client";
import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

type AdRow = {
  id: string;
  code: string;
  title: string;
  type: string;
  platform: string;
  on: boolean;
};

const initialRows: AdRow[] = [
  { id: "1", code: "h5_index", title: "h5端首页轮播图", type: "轮播图", platform: "H5端", on: true },
  { id: "2", code: "active_h5_index", title: "h5端活动页首页轮播图", type: "轮播图", platform: "H5端", on: true },
  { id: "3", code: "active_mp_index", title: "小程序端活动页首页轮播图", type: "轮播图", platform: "小程序端", on: true },
  { id: "4", code: "h5_index_nosingle", title: "h5端首页宣传广告图", type: "图片", platform: "H5端", on: true },
  { id: "5", code: "h5_theme_banner", title: "h5端会员专区广告图", type: "图片", platform: "H5端", on: true },
  { id: "6", code: "member_h5_integrity", title: "会员端诚信认证banner广告", type: "图片", platform: "H5端", on: true },
  { id: "7", code: "member_mp_integrity", title: "小程序端会员诚信认证banner广告", type: "图片", platform: "小程序端", on: true },
  { id: "8", code: "mp_index", title: "小程序端首页轮播图", type: "轮播图", platform: "小程序端", on: true },
  { id: "9", code: "mp_index_nosingle", title: "小程序端首页宣传广告图", type: "图片", platform: "小程序端", on: true },
  { id: "10", code: "mp_index_open", title: "小程序起开屏广告", type: "图片", platform: "小程序端", on: false },
  { id: "11", code: "mp_theme_banner", title: "小程序端会员专区广告图", type: "图片", platform: "小程序端", on: true },
  { id: "12", code: "video_h5_index", title: "h5端短视频首页轮播图", type: "轮播图", platform: "H5端", on: false },
  { id: "13", code: "video_mp_index", title: "小程序端短视频首页轮播图", type: "轮播图", platform: "小程序端", on: false },
];

function Switch({ on }: { on: boolean }) {
  return (
    <span className={"mp-switch" + (on ? " on" : "")}>
      {on && <span className="mp-switch-label">开</span>}
      <span className="mp-switch-knob"></span>
    </span>
  );
}

export default function Page() {
  const [rows, setRows] = useState<AdRow[]>(initialRows);

  const toggle = (id: string) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, on: !row.on } : row)));
  };

  return (
    <div className="adcfg-page">
      {/* 面包屑 */}
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
          { label: "广告管理", href: "/system-setting-adconfig" },
          { label: "全部广告" },
        ]}
      />

      <div className="admin-card mt-3">
        <div className="adcfg-head">
          <h2 className="adcfg-title">广告管理</h2>
          <button className="adcfg-add">
            <span className="adcfg-add-plus">+</span> 添加广告
          </button>
        </div>

        <div className="adcfg-body">
          <table className="adcfg-table">
            <thead>
              <tr>
                <th className="adcfg-col-code">广告编号</th>
                <th className="adcfg-col-title">广告标题</th>
                <th className="adcfg-col-type">广告类型</th>
                <th className="adcfg-col-platform">平台</th>
                <th className="adcfg-col-status">状态</th>
                <th className="adcfg-col-op">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="adcfg-td-code">{row.code}</td>
                  <td className="adcfg-td-title">{row.title}</td>
                  <td className="adcfg-td-type">{row.type}</td>
                  <td className="adcfg-td-platform">{row.platform}</td>
                  <td className="adcfg-td-status">
                    <button type="button" className="adcfg-switch" onClick={() => toggle(row.id)}>
                      <Switch on={row.on} />
                    </button>
                  </td>
                  <td className="adcfg-td-op">
                    <button type="button" className="adcfg-edit">编辑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-pagination">
          <button disabled>‹</button>
          <span className="active">1</span>
          <button disabled>›</button>
        </div>
      </div>
    </div>
  );
}
