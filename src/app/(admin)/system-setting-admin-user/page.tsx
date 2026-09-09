"use client";
import { useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { ChevronDown } from "lucide-react";

const rows = [
  { id: 1, username: "shushu", name: "shushu", group: "超级用户组", phone: "15996394511", wechat: "-", time: "2026-07-14 13:51:11", lock: "normal", timed: "未开启" },
  { id: 2, username: "admin", name: "admin", group: "超级用户组", phone: "-", wechat: "已绑定", time: "2025-02-24 22:22:34", lock: "normal", timed: "未开启" },
];

const statusTabs = ["全部", "正常", "已锁定"];

export default function Page() {
  const [status, setStatus] = useState("全部");

  const base = getBreadcrumb("系统管理", "账号管理");
  const breadcrumb = [
    base[0],
    base[1],
    {
      label: "后台账号",
      children: [
        { label: "添加账号", href: "/system-setting-admin-user-add" },
        { label: "账号管理", href: "/system-setting-admin-user" },
        { label: "权限分组", href: "/system-setting-admin-group" },
      ],
    },
    base[2],
  ];

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="admin-card au-card">
        <div className="au-head">
          <h2 className="au-title">账号管理</h2>
        </div>

        {/* 筛选栏 */}
        <div className="au-filter">
          <div className="au-tabs">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatus(tab)}
                className={`au-tab ${status === tab ? "au-tab-active" : ""}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="au-fd">
            <span className="au-fd-label">全部</span>
            <ChevronDown className="au-fd-chevron" />
          </div>

          <div className="au-group">
            <span className="au-group-label">分组：</span>
            <div className="au-fd">
              <span className="au-fd-label">不分</span>
              <ChevronDown className="au-fd-chevron" />
            </div>
          </div>

          <input className="au-phone" placeholder="请输入手机号" />

          <button className="au-search">搜索</button>
        </div>

        {/* 表格 */}
        <div className="au-table-wrap">
          <table className="au-table">
            <thead>
              <tr>
                <th className="au-th-check"><input type="checkbox" /></th>
                <th>用户名</th>
                <th>姓名</th>
                <th>用户组</th>
                <th>手机号</th>
                <th>绑定微信</th>
                <th>添加时间</th>
                <th>一般锁定</th>
                <th>定时锁定</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="au-td-check"><input type="checkbox" /></td>
                  <td>{r.username}</td>
                  <td>{r.name}</td>
                  <td>{r.group}</td>
                  <td>{r.phone}</td>
                  <td>
                    {r.wechat === "已绑定" ? (
                      <span className="au-wechat-bind">已绑定</span>
                    ) : (
                      <span className="au-wechat-none">{r.wechat}</span>
                    )}
                  </td>
                  <td>{r.time}</td>
                  <td>
                    <span className="au-lock">
                      {r.lock === "normal" ? "正常" : "已锁定"}
                      <ChevronDown className="au-lock-chevron" />
                    </span>
                  </td>
                  <td><span className="au-timed">{r.timed}</span></td>
                  <td>
                    <span className="au-actions">
                      <button className="au-edit">编辑</button>
                      {r.id === 1 && <button className="au-del">删除</button>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="au-pagination">
          <button className="au-page-btn">‹</button>
          <span className="au-page-num">1</span>
          <button className="au-page-btn">›</button>
        </div>
      </div>
    </div>
  );
}
