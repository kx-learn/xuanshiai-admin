"use client";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Plus } from "lucide-react";

const rows = [
  { id: 1, name: "超级用户组", users: "admin、shushu", hasUsers: true },
  { id: 2, name: "一般用户组", users: "", hasUsers: false },
  { id: 3, name: "一般运营组", users: "", hasUsers: false },
];

export default function Page() {
  const base = getBreadcrumb("系统管理", "权限分组");
  const breadcrumb = [
    base[0],
    base[1],
    { label: "后台账号" },
    base[2],
  ];

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="admin-card au-card">
        <div className="au-head au-head-between">
          <h2 className="au-title">权限分组</h2>
          <button className="au-add">
            <Plus className="au-add-plus" />
            添加用户组
          </button>
        </div>

        <div className="au-table-wrap">
          <table className="au-table au-group-table">
            <thead>
              <tr>
                <th>用户组名</th>
                <th>当前用户</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="au-group-name">{r.name}</td>
                  <td className="au-group-users">{r.hasUsers ? r.users : <span className="au-wechat-none">无当前用户</span>}</td>
                  <td>
                    <span className="au-actions">
                      <button className="au-edit">编辑</button>
                      <button className="au-edit">权限管理</button>
                      <button className="au-del">删除</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="au-pagination">
          <button className="au-page-btn">‹</button>
          <span className="au-page-num">1</span>
          <button className="au-page-btn">›</button>
        </div>
      </div>
    </div>
  );
}
