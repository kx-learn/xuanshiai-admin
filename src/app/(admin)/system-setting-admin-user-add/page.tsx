"use client";
import { useEffect, useState } from "react";
import { getBreadcrumb } from "@/lib/breadcrumb-config";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Info } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { asObject, showConfigToast, useConfigDomain, type Dict } from "@/lib/platform-config";

const GROUPS_DEFAULTS = { groups: [] as unknown[] } as const;

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
  const groupsDomain = useConfigDomain<Dict>("admin_groups", GROUPS_DEFAULTS as Dict);
  const [groupOptions, setGroupOptions] = useState<{ label: string }[]>([{ label: "管理员组" }, { label: "红娘组" }, { label: "客服组" }]);

  const [group, setGroup] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [lockOn, setLockOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!groupsDomain.ready) groupsDomain.reload();
  }, [groupsDomain]);
  useEffect(() => {
    const groups = Array.isArray(groupsDomain.snapshot?.config.groups) ? groupsDomain.snapshot!.config.groups : [];
    if (groups.length > 0) {
      setGroupOptions(groups.map((g) => ({ label: String(asObject(g as Dict).name ?? "") })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupsDomain.snapshot]);

  const submit = async () => {
    if (!username.trim() || !password || !displayName.trim()) {
      showConfigToast("请填写账号、密码与姓名", "error");
      return;
    }
    if (password.length < 8) {
      showConfigToast("密码至少 8 位", "error");
      return;
    }
    setBusy(true);
    try {
      // 分组权限：所选分组里配置的权限集合会作为新账号的初始权限
      const groups = Array.isArray(groupsDomain.snapshot?.config.groups) ? groupsDomain.snapshot!.config.groups : [];
      const hit = groups.map((g) => asObject(g as Dict)).find((g) => String(g.name ?? "") === group);
      const perms = Array.isArray(hit?.permissions) ? (hit!.permissions as unknown[]).map(String) : [];
      await adminApi("/admin/matchmaker/accounts", {
        method: "POST",
        body: JSON.stringify({ username: username.trim(), password, display_name: displayName.trim(), permissions: perms }),
      });
      showConfigToast("账号创建成功");
      setUsername("");
      setPassword("");
      setDisplayName("");
      setPhone("");
    } catch (e) {
      showConfigToast(e instanceof Error ? e.message : "创建失败", "error");
    } finally {
      setBusy(false);
    }
  };

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
            <input className="addacct-input" placeholder="3-28字符，字母/数字/._-" value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>

          <Field label="密码" required>
            <input className="addacct-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="至少8位" />
          </Field>

          <Field label="姓名" required>
            <input className="addacct-input" placeholder="4-16字符，最多8个汉字" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </Field>

          <Field label="手机" required>
            <input className="addacct-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
            <button className="addacct-btn" disabled={busy} onClick={submit}>确定提交</button>
          </div>
        </div>
      </div>
    </div>
  );
}
