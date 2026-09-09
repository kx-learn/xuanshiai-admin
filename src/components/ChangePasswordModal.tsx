"use client";
import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

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
          <button type="button" className="chgp-ok">
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
