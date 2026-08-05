"use client";

import { useState, useCallback } from "react";
import { Globe, AlertCircle, CheckCircle } from "lucide-react";

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function isValidUrl(str: string): boolean {
  if (!str) return false;
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function UrlInput({ value, onChange, disabled }: UrlInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const valid = value ? isValidUrl(value) : null;

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-white/80">目标网址</label>
      <div className="relative">
        <Globe className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-white/30" />
        <input
          type="url"
          placeholder="https://example.com"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-10 text-sm text-white placeholder:text-white/20 outline-none backdrop-blur-sm transition-all duration-300 focus:border-indigo-500/50 focus:bg-white/[0.07] focus:ring-2 focus:ring-indigo-500/20"
        />
        {value && !isFocused && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {valid ? (
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400" />
            )}
          </span>
        )}
      </div>
      {value && !valid && (
        <p className="text-xs text-rose-400">
          请输入有效的网址（需包含 https://）
        </p>
      )}
    </div>
  );
}
