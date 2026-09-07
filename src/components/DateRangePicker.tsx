"use client";

import { useRef, type CSSProperties } from "react";
import { CalendarDays } from "lucide-react";

type DateRangePickerProps = {
  /** 右侧小标签，如「录」「派」 */
  label?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  startValue: string;
  endValue: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  className?: string;
  style?: CSSProperties;
};

/** 统一的日期范围选择器：开始日期 → 结束日期 📅 */
export default function DateRangePicker({
  label,
  startPlaceholder = "开始日期",
  endPlaceholder = "结束日期",
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  className,
  style,
}: DateRangePickerProps) {
  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);
  const openPicker = (input: HTMLInputElement | null) => {
    if (!input) return;
    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
        return;
      }
    } catch {
      /* 部分浏览器限制时降级 */
    }
    input.focus();
    input.click();
  };
  const openTarget = () => openPicker((startValue ? endInputRef : startInputRef).current);
  return (
    <div className={`date-range-picker ${className ?? ""}`.trim()} style={style}>
      <span className="dr-field">
        {!startValue && <span className="dr-placeholder">{startPlaceholder}</span>}
        <input ref={startInputRef} aria-label={startPlaceholder} type="date" value={startValue} className={startValue ? "" : "empty"} onClick={() => openPicker(startInputRef.current)} onChange={(event) => onStartChange(event.target.value)} />
      </span>
      <span aria-hidden className="dr-arrow">→</span>
      <span className="dr-field">
        {!endValue && <span className="dr-placeholder">{endPlaceholder}</span>}
        <input ref={endInputRef} aria-label={endPlaceholder} type="date" value={endValue} className={endValue ? "" : "empty"} onClick={() => openPicker(endInputRef.current)} onChange={(event) => onEndChange(event.target.value)} />
      </span>
      <button type="button" aria-label="选择日期" className="dr-picker-btn" onClick={openTarget}>
        <CalendarDays size={16} />
      </button>
      {label && <span className="dr-label">{label}</span>}
    </div>
  );
}
