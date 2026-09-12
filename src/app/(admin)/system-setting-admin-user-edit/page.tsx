"use client";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Info } from "lucide-react";
import { adminEndpoints } from "@/lib/admin-endpoints";

type AdminAccountForm = {
  display_name: string;
  username: string;
  password: string;
  phone: string;
  data_scope: "SELF" | "STORE" | "ORGANIZATION" | "ALL";
  locked: boolean;
  matchmaker_user_id: number | null;
};

const EMPTY: AdminAccountForm = {
  display_name: "",
  username: "",
  password: "",
  phone: "",
  data_scope: "STORE",
  locked: false,
  matchmaker_user_id: null,
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get("id");
  const isEdit = !!editId;

  const [form, setForm] = useState<AdminAccountForm>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumb = [
    { label: "首页", href: "/home" },
    { label: "后台账号", href: "/system-setting-admin-user" },
    { label: isEdit ? "编辑账号" : "添加账号" },
  ];

  const loadAccount = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const acc = await adminEndpoints.adminAccount(id);
      setForm({
        display_name: acc.display_name ?? "",
        username: acc.username ?? "",
        password: "",
        phone: "",
        data_scope: acc.data_scope,
        locked: false,
        matchmaker_user_id: acc.matchmaker_user_id ?? null,
      });
    } catch (e) {
      setError("加载账号失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (editId) void loadAccount(editId);
  }, [editId, loadAccount]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (isEdit && editId) {
        await adminEndpoints.updateAdminAccount(editId, {
          display_name: form.display_name,
          data_scope: form.data_scope,
        });
      } else {
        await adminEndpoints.createAdminAccount({
          username: form.username,
          display_name: form.display_name,
          password: form.password,
          phone: form.phone,
          data_scope: form.data_scope,
        });
      }
      router.push("/system-setting-admin-user");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "保存失败";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <AdminBreadcrumb items={breadcrumb} />

      <div className="addacct-card">
        <div className="addacct-title">{isEdit ? "编辑账号" : "添加账号"}</div>

        {error ? (
          <div className="addacct-error" style={{ color: "#d33", padding: "8px 16px" }}>
            {error}
          </div>
        ) : null}

        <div className="addacct-form">
          <Field label="账号" required>
            <input
              className="addacct-input"
              value={form.username}
              disabled={isEdit}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </Field>

          {!isEdit && (
            <Field label="密码" required>
              <input
                className="addacct-input"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Field>
          )}

          <Field label="姓名" required>
            <input
              className="addacct-input"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            />
          </Field>

          {!isEdit && (
            <Field label="手机" required>
              <input
                className="addacct-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <div className="sign-info addacct-info">
                <Info className="sign-info-i" />
                <span>接收短信通知和后台登录</span>
              </div>
            </Field>
          )}

          <Field label="数据范围">
            <select
              className="addacct-select"
              value={form.data_scope}
              onChange={(e) =>
                setForm({
                  ...form,
                  data_scope: e.target.value as AdminAccountForm["data_scope"],
                })
              }
            >
              <option value="SELF">仅本人</option>
              <option value="STORE">本店</option>
              <option value="ORGANIZATION">本组织</option>
              <option value="ALL">全部</option>
            </select>
          </Field>

          {isEdit && (
            <Field label="定时锁定">
              <div className="addacct-switch-row">
                <label className={`mp-switch ${form.locked ? "on" : ""}`}>
                  {form.locked && <span className="mp-switch-label">开启</span>}
                  <span className="mp-switch-knob"></span>
                </label>
                <span className="addacct-switch-text">
                  {form.locked ? "已锁定" : "未锁定"}
                </span>
              </div>
              <div className="sign-info addacct-info">
                <Info className="sign-info-i" />
                <span>开启定时锁定后，到了时间后该账号自动锁定</span>
              </div>
            </Field>
          )}

          {isEdit && (
            <Field label="微信">
              <div className="addacct-wx-row">
                <span className="addacct-wx-unbind">未绑定</span>
                <button className="addacct-wx-btn">立即绑定</button>
              </div>
            </Field>
          )}

          <div className="addacct-actions">
            <button className="addacct-btn" onClick={handleSave} disabled={saving || loading}>
              {saving ? "保存中..." : "确定提交"}
            </button>
            <button
              className="addacct-btn"
              style={{ marginLeft: 8 }}
              onClick={() => router.push("/system-setting-admin-user")}
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
