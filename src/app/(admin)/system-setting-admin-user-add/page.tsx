"use client";
import { useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Info } from "lucide-react";

const groupOptions = [
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
  const [group, setGroup] = useState("");
  const [lockOn, setLockOn] = useState(false);

  const base = getBreadcrumb("系统管理", "添加账号");
  const breadcrumb = [
    base[0],
    base[1],
    { label: "后台账号" },
    { label: "添加账号" },
  ];

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="addacct-card">
        <div className="addacct-title">添加账号</div>

        <div className="addacct-form">
          <Field label="分组" required>
            <select
              className="addacct-select"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="" disabled>
                请选择分组
              </option>
              {groupOptions.map((opt) => (
                <option key={opt.label} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="账号" required>
            <input className="addacct-input" placeholder="3-28字符，最多14个汉字" />
          </Field>

          <Field label="密码" required>
            <input className="addacct-input" type="password" />
          </Field>

          <Field label="姓名" required>
            <input className="addacct-input" placeholder="4-16字符，最多8个汉字" />
          </Field>

          <Field label="手机" required>
            <input className="addacct-input" />
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

          <div className="addacct-actions">
            <button className="addacct-btn">确定提交</button>
          </div>
        </div>
      </div>
    </div>
  );
}
