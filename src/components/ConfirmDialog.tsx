"use client";
import { CircleAlert } from "lucide-react";

export default function ConfirmDialog({
  open,
  title = "提示",
  message,
  confirmText = "确定",
  cancelText = "取消",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="cfm-mask" onClick={onCancel}>
      <div className="cfm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cfm-body">
          <div className="cfm-head">
            <CircleAlert className="cfm-icon" />
            <span className="cfm-title">{title}</span>
          </div>
          <p className="cfm-message">{message}</p>
        </div>
        <div className="cfm-actions">
          <button type="button" className="cfm-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className="cfm-ok" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
