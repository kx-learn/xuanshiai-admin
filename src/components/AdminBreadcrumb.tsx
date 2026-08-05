"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  children?: { label: string; href: string }[];
}

interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
}

function BreadcrumbDropdown({
  items,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: {
  items: { label: string; href: string }[];
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <div
      className="absolute top-full left-0 mt-1 bg-white rounded shadow-[0_2px_8px_rgba(0,0,0,0.15)] border border-[#f0f0f0] min-w-[140px] z-50 py-1"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {items.map((child, i) => (
        <Link
          key={i}
          href={child.href}
          onClick={onClose}
          className="block px-3 py-1.5 text-sm text-[#666] hover:bg-[#edf2ff] hover:text-[#3658f7] transition-colors whitespace-nowrap"
        >
          {child.label}
        </Link>
      ))}
    </div>
  );
}

export default function AdminBreadcrumb({ items }: AdminBreadcrumbProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [clickLocked, setClickLocked] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      if (!clickLocked) {
        setOpenIdx(null);
      }
    }, 200);
  }, [clearCloseTimer, clickLocked]);

  const open = useCallback((index: number) => {
    clearCloseTimer();
    setOpenIdx(index);
  }, [clearCloseTimer]);

  const close = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      if (!clickLocked) {
        setOpenIdx(null);
      }
    }, 200);
  }, [clearCloseTimer, clickLocked]);

  const toggleClick = useCallback((index: number) => {
    if (openIdx === index && clickLocked) {
      // clicking the same one again closes it
      setClickLocked(false);
      setOpenIdx(null);
    } else {
      setClickLocked(true);
      setOpenIdx(index);
    }
  }, [openIdx, clickLocked]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setClickLocked(false);
        setOpenIdx(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setClickLocked(false);
        setOpenIdx(null);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  const handleItemMouseEnter = (index: number) => {
    if (!clickLocked) {
      open(index);
    }
  };

  const handleItemMouseLeave = () => {
    if (!clickLocked) {
      scheduleClose();
    }
  };

  const handleDropdownMouseEnter = () => {
    clearCloseTimer();
  };

  const handleDropdownMouseLeave = () => {
    if (!clickLocked) {
      scheduleClose();
    }
  };

  return (
    <div className="flex items-center gap-1 text-sm text-[#999] mb-4" ref={containerRef}>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && <span className="select-none">/</span>}
          {item.href ? (
            item.children ? (
              <span
                className="relative inline-flex items-center"
                onMouseEnter={() => handleItemMouseEnter(index)}
                onMouseLeave={handleItemMouseLeave}
              >
                <span
                  onClick={(e) => { e.preventDefault(); toggleClick(index); }}
                  className="hover:text-[#3658f7] transition-colors inline-flex items-center gap-0.5 cursor-pointer"
                >
                  {item.label}
                  <svg className="w-2.5 h-2.5 text-[#aaa]" viewBox="0 0 1024 1024" fill="currentColor">
                    <path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3 0.1-12.7-6.4-12.7z"/>
                  </svg>
                </span>
                {openIdx === index && (
                  <BreadcrumbDropdown
                    items={item.children}
                    onClose={() => { setClickLocked(false); setOpenIdx(null); }}
                    onMouseEnter={handleDropdownMouseEnter}
                    onMouseLeave={handleDropdownMouseLeave}
                  />
                )}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-[#3658f7] transition-colors">
                {item.label}
              </Link>
            )
          ) : (
            <span className="text-[#333]">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}
