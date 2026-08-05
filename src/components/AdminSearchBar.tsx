"use client";

import { Input } from "@/components/ui/input";
import { Button, type ButtonVariant } from "@/components/ui/button";

export interface SearchField {
  label: string;
  name: string;
  type: "text" | "select" | "date-range";
  placeholder?: string;
  options?: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
}

export interface SearchAction {
  label: string;
  variant?: ButtonVariant;
  onClick?: () => void;
}

interface AdminSearchBarProps {
  fields: SearchField[];
  actions?: SearchAction[];
  onSearch?: () => void;
  onReset?: () => void;
}

export default function AdminSearchBar({
  fields,
  actions,
  onSearch,
  onReset,
}: AdminSearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {fields.map((field) => (
        <div key={field.name} className="flex items-center gap-2">
          <label className="text-sm text-[#666] whitespace-nowrap">
            {field.label}
          </label>
          {field.type === "select" ? (
            <select
              className="h-8 rounded-[6px] border border-[#d9d9d9] bg-white px-[11px] text-sm text-[#333] outline-none transition-colors hover:border-[#3658f7] focus:border-[#3658f7] focus:shadow-[0_0_0_2px_rgba(54,88,247,0.2)]"
              value={field.value ?? ""}
              onChange={(e) => field.onChange?.(e.target.value)}
            >
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === "date-range" ? (
            <div className="flex items-center gap-1">
              <Input placeholder="开始日期" className="w-32" />
              <span className="text-[#999]">-</span>
              <Input placeholder="结束日期" className="w-32" />
            </div>
          ) : (
            <Input
              placeholder={field.placeholder}
              className="w-44"
              value={field.value ?? ""}
              onChange={(e) => field.onChange?.(e.target.value)}
            />
          )}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Button variant="primary" size="sm" onClick={onSearch}>
          查询
        </Button>
        <Button variant="default" size="sm" onClick={onReset}>
          重置
        </Button>
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 ml-auto">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant || "default"}
              size="sm"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
