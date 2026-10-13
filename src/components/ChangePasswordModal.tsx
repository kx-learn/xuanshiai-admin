"use client";
import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import { showConfigToast } from "@/lib/platform-config";

function PwdField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="chgp-row">
      <span className="chgp-label">
        <span className="chgp-req">*</span>
        {label}
      </span>
      <div className="chgp-input-wrap">
        <input
          className="chgp-input"
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          className="chgp-eye"
          onClick={() => setVisible((v) => !v)}
          aria-label="切换密码可见性"
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) return showConfigToast("请完整填写密码", "error");
    if (newPwd.length < 8) return showConfigToast("新密码至少 8 位", "error");
    if (newPwd !== confirmPwd) return showConfigToast("两次输入的新密码不一致", "error");
    setSaving(true);
    try {
      await adminApi("admin/matchmaker/auth/change-password", { method: "POST", body: { old_password: oldPwd, new_password: newPwd } });
      showConfigToast("密码已修改", "ok");
      setOldPwd(""); setNewPwd(""); setConfirmPwd("");
      onClose();
    } catch (error) {
      showConfigToast(error instanceof Error ? error.message : "修改密码失败", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="chgp-mask" onClick={onClose}>
      <div className="chgp-panel" onClick={(e) => e.stopPropagation()}>
        <div className="chgp-head">
          <span className="chgp-title">修改密码</span>
          <button type="button" className="chgp-x" onClick={onClose} aria-label="关闭">
            <X />
          </button>
        </div>

        <div className="chgp-body">
          <PwdField
            label="旧密码"
            placeholder="请输入旧密码"
            value={oldPwd}
            onChange={setOldPwd}
          />
          <PwdField
            label="新密码"
            placeholder="请输入新密码"
            value={newPwd}
            onChange={setNewPwd}
          />
          <PwdField
            label="确认密码"
            placeholder="请输入确认密码"
            value={confirmPwd}
            onChange={setConfirmPwd}
          />
        </div>

        <div className="chgp-actions">
          <button type="button" className="chgp-cancel" onClick={onClose}>
            取消
          </button>
          <button type="button" className="chgp-ok" disabled={saving} onClick={() => void submit()}>
            {saving ? "提交中..." : "确定"}
          </button>
        </div>
      </div>
    </div>
  );
}
