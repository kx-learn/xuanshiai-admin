"use client";

import { cn } from "@/lib/utils";

export interface BadgeProps {
  count?: number;
  dot?: boolean;
  overflowCount?: number;
  showZero?: boolean;
  color?: "red" | "blue" | "green" | "orange" | "purple" | "cyan" | "gray";
  className?: string;
  children?: React.ReactNode;
}

const colorMap: Record<NonNullable<BadgeProps["color"]>, string> = {
  red: "bg-[#ff4d4f]",
  blue: "bg-[#3658f7]",
  green: "bg-[#52c41a]",
  orange: "bg-[#fa8c16]",
  purple: "bg-[#722ed1]",
  cyan: "bg-[#13c2c2]",
  gray: "bg-[#999]",
};

export function Badge({
  count,
  dot = false,
  overflowCount = 99,
  showZero = false,
  color = "red",
  className,
  children,
}: BadgeProps) {
  if (!children) {
    // Standalone badge
    if (count === undefined && !dot) return null;
    if (count === 0 && !showZero) return null;

    const bgColor = colorMap[color];

    if (dot) {
      return (
        <span
          className={cn(
            "inline-block size-[6px] rounded-full",
            bgColor,
            className
          )}
        />
      );
    }

    const display = count !== undefined && count > overflowCount
      ? `${overflowCount}+`
      : count;

    return (
      <span
        className={cn(
          "inline-flex min-w-[16px] h-4 items-center justify-center rounded-full px-1 text-[10px] leading-none text-white",
          bgColor,
          className
        )}
      >
        {display}
      </span>
    );
  }

  // With children - badge positioned on top right
  const showBadge = dot || (count !== undefined && (count > 0 || showZero));

  return (
    <span className={cn("relative inline-flex", className)}>
      {children}
      {showBadge && (
        <sup
          className={cn(
            "absolute -right-1 -top-1 z-10 flex origin-center items-center justify-center whitespace-nowrap rounded-full text-[10px] text-white shadow-[0_0_0_1px_#fff]",
            colorMap[color]
          )}
          style={
            dot
              ? {
                  width: "6px",
                  height: "6px",
                  minWidth: "6px",
                }
              : {
                  height: "16px",
                  minWidth: "16px",
                  paddingLeft: "4px",
                  paddingRight: "4px",
                  lineHeight: "16px",
                }
          }
        >
          {dot
            ? null
            : count !== undefined && count > overflowCount
              ? `${overflowCount}+`
              : count}
        </sup>
      )}
    </span>
  );
}
