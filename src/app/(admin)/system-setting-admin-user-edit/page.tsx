"use client";
import { useState } from "react";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Info } from "lucide-react";

const groupOptions = [
  { label: "超级用户组" },
  { label: "管理员组" },
  { label: "红娘组" },
  { label: "客服组" },
];

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="addacct-row">
      <span className="addacct-label">
        {required && <span className="addacct-req">*</span>}
        {label}
      </span>
      <div className="addacct-content">{children}</div>
    </div>
  );
}

export default function Page() {
  const [group, setGroup] = useState("超级用户组");
  const [lockOn, setLockOn] = useState(false);

  const breadcrumb = [{ label: "首页", href: "/home" }, { label: "编辑账号" }];

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="addacct-card">
        <div className="addacct-title">编辑账号</div>

        <div className="addacct-form">
          <Field label="分组" required>
            <select
              className="addacct-select"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              {groupOptions.map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="账号" required>
            <input className="addacct-input" defaultValue="shushu" />
          </Field>

          <Field label="密码">
            <input className="addacct-input" type="password" placeholder="不修改请留空" />
          </Field>

          <Field label="姓名" required>
            <input className="addacct-input" defaultValue="shushu" />
          </Field>

          <Field label="手机" required>
            <input className="addacct-input" defaultValue="15996394511" />
            <div className="sign-info addacct-info">
              <Info className="sign-info-i" />
              <span>接收短信通知和后台登录</span>
            </div>
          </Field>

          <Field label="定时锁定">
            <div className="addacct-switch-row">
              <label className={`mp-switch ${lockOn ? "on" : ""}`}>
                {lockOn && <span className="mp-switch-label">开启</span>}
                <span className="mp-switch-knob"></span>
              </label>
              <span className="addacct-switch-text">开启</span>
            </div>
            <div className="sign-info addacct-info">
              <Info className="sign-info-i" />
              <span>开启定时锁定后，到了时间后该账号自动锁定</span>
            </div>
          </Field>

          <Field label="微信">
            <div className="addacct-wx-row">
              <span className="addacct-wx-unbind">未绑定</span>
              <button className="addacct-wx-btn">立即绑定</button>
            </div>
          </Field>

          <div className="addacct-actions">
            <button className="addacct-btn">确定提交</button>
          </div>
        </div>
      </div>
    </div>
  );
}
