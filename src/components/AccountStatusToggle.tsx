"use client";

type AccountStatusToggleProps = {
  locked: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export default function AccountStatusToggle({ locked, onToggle, disabled = false }: AccountStatusToggleProps) {
  return (
    <button type="button" aria-pressed={locked} aria-label={locked ? "解锁账号" : "锁定账号"} disabled={disabled} className={`account-status-toggle ${locked ? "active" : ""}`} onClick={onToggle}>
      <span className="status-label">{locked ? "锁定" : "正常"}</span>
      <span className="knob" />
    </button>
  );
}
