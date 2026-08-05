"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useCallback } from "react";
import type { ReactNode } from "react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
}

export function Select({
  value: controlledValue,
  defaultValue,
  onChange,
  options,
  placeholder = "Please select",
  disabled = false,
  className,
  allowClear = false,
}: SelectProps) {
  const [internalValue, setInternalValue] = useState<string>(
    controlledValue ?? defaultValue ?? ""
  );
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = useCallback(
    (val: string) => {
      if (controlledValue === undefined) {
        setInternalValue(val);
      }
      onChange?.(val);
      setOpen(false);
    },
    [controlledValue, onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (controlledValue === undefined) {
        setInternalValue("");
      }
      onChange?.("");
    },
    [controlledValue, onChange]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative inline-block w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          "flex h-8 w-full items-center justify-between rounded-[6px] border border-[#d9d9d9] bg-white px-[11px] text-sm text-[#333] outline-none transition-all duration-200",
          "hover:border-[#3658f7]",
          open && "border-[#3658f7] shadow-[0_0_0_2px_rgba(54,88,247,0.2)]",
          "disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#999]",
          !selectedOption && "text-[#bfbfbf]"
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="ml-2 flex shrink-0 items-center gap-1">
          {allowClear && selectedOption && (
            <svg
              viewBox="0 0 12 12"
              fill="currentColor"
              className="size-[10px] text-[#bfbfbf] transition-colors hover:text-[#999]"
              onClick={handleClear}
            >
              <path d="M6 4.586L10.293.293l1.414 1.414L7.414 6l4.293 4.293-1.414 1.414L6 7.414l-4.293 4.293-1.414-1.414L4.586 6 .293 1.707 1.707.293 6 4.586z" />
            </svg>
          )}
          <svg
            viewBox="0 0 12 12"
            fill="currentColor"
            className={cn(
              "size-3 text-[#bfbfbf] transition-transform duration-200",
              open && "rotate-180"
            )}
          >
            <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </span>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1 w-full min-w-[max-content] overflow-hidden rounded-[6px] border border-[#d9d9d9] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
          <div className="max-h-64 overflow-auto py-1">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-[#999]">No options</div>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex w-full items-center px-3 py-[5px] text-left text-sm text-[#333] transition-colors",
                    option.value === value
                      ? "bg-[#edf2ff] font-medium text-[#3658f7]"
                      : option.disabled
                        ? "cursor-not-allowed text-[#bfbfbf]"
                        : "hover:bg-[#f5f5f5]"
                  )}
                >
                  {option.label}
                  {option.value === value && (
                    <svg
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="ml-auto size-4 text-[#3658f7]"
                    >
                      <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
