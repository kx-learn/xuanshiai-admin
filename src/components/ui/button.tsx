"use client";

import { cn } from "@/lib/utils";
import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "default"
  | "primary"
  | "outline"
  | "ghost"
  | "link"
  | "danger"
  | "danger-outline";
type ButtonSize = "default" | "sm" | "lg";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#3658f7] text-white border border-[#3658f7] hover:bg-[#5281f3] hover:border-[#5281f3] shadow-[0_2px_0_rgba(0,0,0,0.043)]",
  default:
    "bg-white text-[#333] border border-[#d9d9d9] hover:text-[#3658f7] hover:border-[#3658f7]",
  outline:
    "bg-white text-[#333] border border-[#d9d9d9] hover:text-[#3658f7] hover:border-[#3658f7]",
  ghost:
    "bg-transparent text-[#333] border border-transparent hover:bg-[#f5f5f5]",
  link: "bg-transparent text-[#3658f7] border-none hover:text-[#5281f3] px-1",
  danger:
    "bg-[#ff4d4f] text-white border border-[#ff4d4f] hover:bg-[#ff7875] hover:border-[#ff7875]",
  "danger-outline":
    "bg-white text-[#ff4d4f] border border-[#ff4d4f] hover:text-[#ff7875] hover:border-[#ff7875]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-6 px-[7px] text-xs rounded",
  default: "h-8 px-[15px] text-sm rounded-[6px]",
  lg: "h-10 px-[15px] text-base rounded-[6px]",
};

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  danger?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-normal transition-all duration-200 select-none outline-none",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#3658f7]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin size-3.5"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonVariant, type ButtonSize };
