"use client";

import { useEffect } from "react";

/* 原站为单页内 Tab 切换：本路由重定向到线索管理页的「弃海客源」Tab */
export default function AbandonPage() {
  useEffect(() => {
    window.location.replace("/love-customer-list?tab=abandon");
  }, []);
  return <div className="p-10 text-center text-[#999]">正在跳转到弃海客源…</div>;
}
