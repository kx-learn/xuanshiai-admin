"use client";

import { useEffect, useState } from "react";

/**
 * 环形图顺时针扫过一整圈的进场动画。
 * progress 从 0 缓动到 1，配合 Pie 的 startAngle=90 / endAngle=90-360*progress
 * 可实现「从无 → 12 点钟位置起扫一圈」的视觉效果。
 */
export function useSweepAngle(active: boolean, duration = 1600) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(1 - Math.pow(1 - t, 3)); // easeOutCubic
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration]);

  return progress;
}
