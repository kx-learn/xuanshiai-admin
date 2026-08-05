"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Tab {
  key: string;
  label: string;
}

interface AdminPageHeaderProps {
  title: string;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (key: string) => void;
  extra?: ReactNode;
}

export default function AdminPageHeader({
  title,
  tabs,
  activeTab,
  onTabChange,
  extra,
}: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h1 className="text-lg font-medium text-[#333]">{title}</h1>
        {tabs && tabs.length > 0 && (
          <div className="flex items-center gap-6 mt-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTabChange?.(tab.key)}
                className={cn(
                  "text-sm pb-2 border-b-2 transition-colors",
                  activeTab === tab.key
                    ? "text-[#3658f7] border-[#3658f7]"
                    : "text-[#666] border-transparent hover:text-[#333]"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {extra && <div className="flex items-center gap-2">{extra}</div>}
    </div>
  );
}
