"use client";

import { useRef, type CSSProperties } from "react";

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

/** antd CalendarOutlined 同款日历图标 */
function CalendarIcon() {
  return (
    <svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32z m-40 656H184V460h656v380z m0-448H184V232h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v160z" />
    </svg>
  );
}

/** antd SwapRight 同款「→」分隔箭头 */
function SwapRightIcon() {
  return (
    <svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M873.1 596.2l-164-208A32 32 0 0 0 684 376h-64.5c-4.8 0-8.7 3.9-8.7 8.7v86.2c0 4.8-3.9 8.7-8.7 8.7H167.7c-4.8 0-8.7 3.9-8.7 8.7v63.3c0 4.8 3.9 8.7 8.7 8.7h434.4c4.8 0 8.7 3.9 8.7 8.7v86.2c0 4.8 3.9 8.7 8.7 8.7H684a32 32 0 0 0 25.1-12.2l164-208c4.2-5.3 4.2-12.9 0-18.2z" />
    </svg>
  );
}

/** 统一的日期范围选择器（原站 antd RangePicker 同款外观）：开始日期 → 结束日期 📅 */
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

  const renderField = (which: "start" | "end") => {
    const value = which === "start" ? startValue : endValue;
    const placeholder = which === "start" ? startPlaceholder : endPlaceholder;
    const ref = which === "start" ? startInputRef : endInputRef;
    return (
      <span className="dr-field">
        {/* 显示层：占位符或已选日期（原生输入的文字恒为透明，杜绝「年/月/日」叠字） */}
        <span className="dr-text" data-empty={value ? "false" : "true"}>{value || placeholder}</span>
        <input
          ref={ref}
          aria-label={placeholder}
          type="date"
          value={value}
          onClick={() => openPicker(ref.current)}
          onChange={(event) => (which === "start" ? onStartChange : onEndChange)(event.target.value)}
        />
      </span>
    );
  };

  return (
    <div className={`date-range-picker ${className ?? ""}`.trim()} style={style}>
      {renderField("start")}
      <span aria-hidden className="dr-sep"><SwapRightIcon /></span>
      {renderField("end")}
      <button type="button" aria-label="选择日期" className="dr-suffix" onClick={openTarget}>
        <CalendarIcon />
      </button>
      {label && <span className="dr-label">{label}</span>}
    </div>
  );
}
