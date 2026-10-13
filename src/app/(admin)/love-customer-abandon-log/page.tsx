"use client";

import { useEffect } from "react";

/* 原站为单页内 Tab 切换：本路由重定向到线索管理页的「弃海记录」Tab */
export default function AbandonLogPage() {
  useEffect(() => {
    window.location.replace("/love-customer-list?tab=log");
  }, []);
  return <div className="p-10 text-center text-[#999]">正在跳转到弃海记录…</div>;
}
