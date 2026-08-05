"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  allowClear?: boolean;
  onClear?: () => void;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, allowClear, onClear, value, ...props }, ref) => {
    return (
      <span className="relative inline-flex w-full">
        <input
          ref={ref}
          value={value}
          className={cn(
            "h-8 w-full rounded-[6px] border border-[#d9d9d9] bg-white px-[11px] py-1 text-sm text-[#333] outline-none transition-all duration-200",
            "placeholder:text-[#bfbfbf]",
            "hover:border-[#3658f7]",
            "focus:border-[#3658f7] focus:shadow-[0_0_0_2px_rgba(54,88,247,0.2)]",
            "disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#999]",
            allowClear && value && "pr-7",
            className
          )}
          {...props}
        />
        {allowClear && value && (
          <button
            type="button"
            onClick={() => onClear?.()}
            className="absolute right-[7px] top-1/2 -translate-y-1/2 flex size-4 items-center justify-center rounded-full text-[#bfbfbf] transition-colors hover:text-[#999]"
          >
            <svg
              viewBox="0 0 12 12"
              fill="currentColor"
              className="size-[10px]"
            >
              <path d="M6 4.586L10.293.293l1.414 1.414L7.414 6l4.293 4.293-1.414 1.414L6 7.414l-4.293 4.293-1.414-1.414L4.586 6 .293 1.707 1.707.293 6 4.586z" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);

Input.displayName = "Input";

export { Input };
