"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const MENU_WIDTH = 142;
const MENU_ITEM_HEIGHT = 38;

export default function PageSizeSelect({
  value = 20,
  total,
  onChange,
  down = false,
}: {
  value?: number;
  total: number;
  onChange?: (value: number) => void;
  down?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !btnRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggle = () => {
    if (!open) {
      const rect = btnRef.current?.getBoundingClientRect();
      if (rect) {
        const menuHeight = MENU_ITEM_HEIGHT * 4;
        const top = down ? rect.bottom + 4 : Math.max(4, rect.top - menuHeight - 4);
        const left = Math.max(4, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 4));
        setStyle({ position: "fixed", top, left, width: MENU_WIDTH });
      }
    }
    setOpen((current) => !current);
  };

  if (total < 10) return null;

  return (
    <div className="page-size-select">
      <button ref={btnRef} type="button" className="page-size" onClick={toggle}>
        {value} 条/页
      </button>
      {open && (
        <div ref={menuRef} className="page-size-menu" style={style}>
          {[10, 20, 50, 100].map((size) => (
            <button
              type="button"
              key={size}
              className={size === value ? "selected" : ""}
              onClick={() => {
                onChange?.(size);
                setOpen(false);
              }}
            >
              {size} 条/页
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
