"use client";

import { useEffect, useState } from "react";

export default function PageSizeSelect({ value = 20, total, onChange }: { value?: number; total: number; onChange?: (value: number) => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const legacy = Array.from(document.querySelectorAll<HTMLElement>(".admin-pagination > .page-size"));
    const cleanups = legacy.map((element) => {
      const handler = () => {
        const menu = document.createElement("div");
        menu.className = "page-size-menu page-size-legacy-menu";
        [10, 20, 50, 100].forEach((size) => { const option = document.createElement("button"); option.type = "button"; option.textContent = `${size} 条/页`; option.onclick = () => { element.textContent = `${size} 条/页`; menu.remove(); onChange?.(size); }; menu.appendChild(option); });
        element.parentElement?.appendChild(menu);
      };
      element.addEventListener("click", handler);
      return () => element.removeEventListener("click", handler);
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [onChange]);
  if (total < 10) return null;
  return <div className="page-size-select"><button type="button" className="page-size" onClick={() => setOpen((current) => !current)}>{value} 条/页</button>{open && <div className="page-size-menu">{[10, 20, 50, 100].map((size) => <button type="button" key={size} className={size === value ? "selected" : ""} onClick={() => { onChange?.(size); setOpen(false); }}>{size} 条/页</button>)}</div>}</div>;
}
